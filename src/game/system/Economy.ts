// ═══════════════════════════════════════
// 经济系统
// 卖鱼价格、鱼缸产出、修理费用、经验计算
// ═══════════════════════════════════════

import type { FishDef, Rarity } from '../types'

/**
 * 稀有度价格系数
 */
const RARITY_PRICE_MULTIPLIER: Record<Rarity, number> = {
  1: 1.0,
  2: 1.8,
  3: 3.5,
  4: 7.0,
  5: 15.0,
}

/**
 * 稀有度经验系数
 */
const RARITY_EXP_MULTIPLIER: Record<Rarity, number> = {
  1: 10,
  2: 25,
  3: 60,
  4: 150,
  5: 400,
}

/**
 * 计算卖鱼价格
 */
export function calculateFishPrice(
  fish: FishDef,
  weight: number,
  goldBonus: number = 0
): number {
  const basePrice = fish.value * weight
  const rarityBonus = RARITY_PRICE_MULTIPLIER[fish.rarity]
  const goldModifier = 1 + goldBonus / 100

  // 重量溢价：越接近 maxW 越值钱
  const weightRatio = weight / fish.maxW
  const weightPremium = 1 + weightRatio * 0.5

  return Math.floor(basePrice * rarityBonus * goldModifier * weightPremium)
}

/**
 * 计算钓鱼获得的经验值
 */
export function calculateFishExp(fish: FishDef, weight: number): number {
  const base = RARITY_EXP_MULTIPLIER[fish.rarity]
  const weightBonus = (weight / fish.maxW) * base * 0.5
  return Math.floor(base + weightBonus)
}

/**
 * 计算鱼缸每小时金币产出
 */
export function calculateTankHourlyGold(fish: FishDef, weight: number): number {
  const baseOutput = weight * fish.value * RARITY_PRICE_MULTIPLIER[fish.rarity] * 0.01
  return Math.max(1, Math.floor(baseOutput))
}

/**
 * 计算鱼缸鱼的增值（随时间提升出售价）
 */
export function calculateAppreciation(
  fish: FishDef,
  weight: number,
  hoursInTank: number
): number {
  const basePrice = calculateFishPrice(fish, weight, 0)
  const appreciationRate = 0.05 // 每小时增值 5%
  const capped = Math.min(hoursInTank, 72) // 最多 72 小时增值
  return Math.floor(basePrice * (1 + capped * appreciationRate))
}

/**
 * 计算修理费用
 */
export function calculateRepairCost(
  maxDurability: number,
  currentDurability: number,
  itemPrice: number
): number {
  const damageRatio = 1 - currentDurability / maxDurability
  if (damageRatio <= 0) return 0
  // 修理费用 = 装备价格 × 损耗比例 × 0.2
  return Math.ceil(itemPrice * damageRatio * 0.2)
}

/**
 * 计算升级所需经验
 */
export function expForLevel(level: number): number {
  return level * 50 + 100
}

/**
 * 计算入场费
 */
export function calculateEntryFee(
  baseFee: number,
  level: number
): number {
  // 高等级玩家入场费折扣
  const discount = Math.min(0.5, level * 0.01)
  return Math.floor(baseFee * (1 - discount))
}

/**
 * 计算签到奖励
 */
export function getSignInReward(day: number): { gold: number; diamond?: number; exp?: number } {
  const rewards = [
    { gold: 100 },
    { gold: 200, exp: 50 },
    { gold: 300, diamond: 5 },
    { gold: 500, exp: 100 },
    { gold: 800, diamond: 10 },
    { gold: 1200, exp: 200 },
    { gold: 2000, diamond: 30, exp: 500 },
  ]
  return rewards[(day - 1) % 7]
}
