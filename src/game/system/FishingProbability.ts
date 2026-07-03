// ═══════════════════════════════════════
// 钓鱼概率计算引擎
// 纯函数模块，输入环境参数，输出鱼种咬钩权重
// ═══════════════════════════════════════

import type { FishDef, SpotDef, Weather, Tide, ProbabilityInput, ProbabilityOutput } from '../types'

/**
 * 计算单条鱼在当前环境下的咬钩权重
 * 返回未归一化的权重值和分解明细
 */
export function calculateFishWeight(input: ProbabilityInput): ProbabilityOutput {
  const { fish, baitId, chumTargets, tide, weather, time, depth, rareBonus } = input

  // 1. 基础权重：稀有度越高，基础权重越低
  const base = 1 / Math.pow(fish.rarity + 1, 2)

  // 2. 鱼饵匹配加成
  const baitMatch = baitId && fish.bait.includes(baitId) ? 3.0 : 1.0

  // 3. 窝料匹配加成
  const chumMatch = chumTargets.includes(fish.id) ? 2.0 : 1.0

  // 4. 稀有加成修正
  const rareModifier = 1 + rareBonus / 100

  // 5. 环境修正
  const environment = getEnvironmentModifier(fish, tide, weather, time, depth)

  const weight = base * baitMatch * chumMatch * rareModifier * environment

  return {
    weight,
    breakdown: {
      base,
      baitMatch,
      chumMatch,
      rareBonus: rareModifier,
      environment,
    },
  }
}

/**
 * 从钓场鱼种列表中随机抽取一条鱼
 * 返回选中的鱼 ID 和重量
 */
export function pickFish(
  spot: SpotDef,
  fishDb: FishDef[],
  baitId: string | null,
  chumTargets: string[],
  tide: Tide,
  weather: Weather,
  time: string,
  depth: number,
  rareBonus: number
): { fish: FishDef; weight: number } | null {
  const spotFish = fishDb.filter((f) => spot.fish.includes(f.id))

  if (spotFish.length === 0) return null

  // 计算每条鱼的权重
  const weighted: { fish: FishDef; weight: number }[] = spotFish.map((fish) => {
    const result = calculateFishWeight({
      spot,
      fish,
      baitId,
      chumId: null,
      chumTargets,
      tide,
      weather,
      time,
      depth,
      rareBonus,
    })
    return { fish, weight: result.weight }
  })

  // 归一化
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0)
  if (totalWeight <= 0) return null

  // 轮盘赌选择
  let roll = Math.random() * totalWeight
  for (const entry of weighted) {
    roll -= entry.weight
    if (roll <= 0) {
      // 随机重量（额外大鱼/巨物加成）
      const weight = rollFishWeight(entry.fish, rareBonus)
      return { fish: entry.fish, weight }
    }
  }

  // 兜底：返回最后一条鱼
  const last = weighted[weighted.length - 1]
  return { fish: last.fish, weight: rollFishWeight(last.fish, rareBonus) }
}

/**
 * 随机生成鱼的重量
 */
function rollFishWeight(fish: FishDef, rareBonus: number): number {
  const range = fish.maxW - fish.minW

  // 基础随机：偏正态分布（两次均匀分布取平均）
  const base = (Math.random() + Math.random()) / 2

  // 大鱼加成：rareBonus × 0.8 概率向大体重偏移
  const bigBonus = (rareBonus / 100) * 0.8
  // 巨物加成：rareBonus × 0.5 概率向极大体重偏移
  const giantBonus = (rareBonus / 100) * 0.5

  const adjusted = Math.min(1, base + bigBonus * 0.3 + giantBonus * 0.15)

  const weight = fish.minW + range * adjusted

  return Math.round(weight * 100) / 100
}

/**
 * 环境修正系数
 * 综合考虑时间、潮汐、天气、水深对特定鱼种的影响
 */
function getEnvironmentModifier(
  fish: FishDef,
  tide: Tide,
  weather: Weather,
  time: string,
  depth: number
): number {
  let modifier = 1.0

  // 时间修正（日行/夜行）
  const hour = parseInt(time.split(':')[0], 10)
  const isDaytime = hour >= 6 && hour < 18
  if (isDaytime && !fish.dayActive) modifier *= 0.4
  if (!isDaytime && !fish.nightActive) modifier *= 0.4
  if (isDaytime && fish.dayActive) modifier *= 1.2
  if (!isDaytime && fish.nightActive) modifier *= 1.2

  // 潮汐修正
  switch (tide) {
    case '大潮':
      modifier *= 1.3 // 大潮鱼群活跃
      break
    case '涨潮':
    case '退潮':
      modifier *= 1.1 // 潮汐变化时鱼口较好
      break
    case '小潮':
      modifier *= 0.9
      break
    case '平潮':
      modifier *= 0.8 // 平潮鱼口较差
      break
  }

  // 天气修正
  switch (weather) {
    case '晴':
      modifier *= 1.0
      break
    case '多云':
      modifier *= 1.1
      break
    case '雨':
      modifier *= 1.15 // 雨天溶氧高，鱼口好
      break
    case '大风':
      modifier *= 0.7
      break
    case '雾':
      modifier *= 0.85
      break
    case '台风':
      modifier *= 0.3 // 台风天几乎没法钓
      break
  }

  // 水深修正
  if (depth < fish.depthMin || depth > fish.depthMax) {
    modifier *= 0.2 // 水深完全不对，大幅降低概率
  } else {
    // 在活动深度范围内的中间位置最优
    const midDepth = (fish.depthMin + fish.depthMax) / 2
    const depthDeviation = Math.abs(depth - midDepth) / ((fish.depthMax - fish.depthMin) / 2)
    modifier *= 1 + (1 - Math.min(1, depthDeviation)) * 0.3
  }

  return Math.max(0.05, modifier)
}

/**
 * 计算咬钩等待时间（秒）
 */
export function calculateWaitTime(
  weather: Weather,
  tide: Tide
): number {
  const base = 3 + Math.random() * 5 // 3-8 秒

  let modifier = 1.0
  if (weather === '台风') modifier *= 2.5
  if (weather === '大风') modifier *= 1.8
  if (weather === '雨') modifier *= 0.7
  if (tide === '大潮') modifier *= 0.8
  if (tide === '平潮') modifier *= 1.5

  return base * modifier
}
