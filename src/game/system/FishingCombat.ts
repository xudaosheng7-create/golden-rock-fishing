// ═══════════════════════════════════════
// 钓鱼战斗计算
// 收线伤害、张力累积、断线判定、耐久损耗
// ═══════════════════════════════════════

import type { FishDef, FightMode, CombatResult } from '../types'

/**
 * 计算收线伤害（减少鱼的体力）
 */
export function calculateReelDamage(
  totalPower: number,
  fightMode: FightMode,
  lineTension: number
): number {
  let baseDamage = totalPower * 0.15

  // 挣扎模式修正
  switch (fightMode) {
    case 'deep_dive':
      baseDamage *= 0.5 // 深潜难收
      break
    case 'long_endurance':
      baseDamage *= 0.8 // 持久战
      break
    case 'scream':
      baseDamage *= 0.7
      break
    case 'drill':
      baseDamage *= 0.75
      break
    case 'spin':
    case 'roll':
      baseDamage *= 0.85
      break
    case 'jump':
      baseDamage *= 1.1 // 跳跃时收线效率略高
      break
    default:
      baseDamage *= 1.0
  }

  // 张力影响：高张力时收线效率下降
  const tensionPenalty = 1 - (lineTension / 100) * 0.3

  return Math.max(1, baseDamage * tensionPenalty)
}

/**
 * 计算张力增加量（收线时）
 */
export function calculateTensionIncrease(
  totalPower: number,
  fightMode: FightMode,
  _currentTension: number
): number {
  const baseIncrease = 3 + totalPower * 0.1

  // 挣扎模式修正
  const modeMultiplier: Record<FightMode, number> = {
    gentle: 0.5,
    jump: 1.2,
    burst: 2.0,
    sprint: 1.8,
    deep_dive: 1.5,
    drill: 1.3,
    roll: 1.4,
    spin: 1.4,
    swing: 1.2,
    long_endurance: 1.0,
    scream: 2.5,
  }

  return baseIncrease * (modeMultiplier[fightMode] ?? 1.0)
}

/**
 * 计算张力自然衰减（松线时）
 */
export function calculateTensionDecay(
  currentTension: number,
  deltaTime: number // 秒
): number {
  const decayRate = 15 // 每秒衰减 15 点
  return Math.max(0, currentTension - decayRate * deltaTime)
}

/**
 * QTE 失败后的张力惩罚
 */
export function calculateQTEPenalty(fightMode: FightMode): number {
  const penalties: Partial<Record<FightMode, number>> = {
    jump: 20,
    burst: 30,
    sprint: 25,
    deep_dive: 25,
    drill: 22,
    roll: 22,
    spin: 22,
    swing: 20,
    scream: 30,
  }
  return penalties[fightMode] ?? 20
}

/**
 * 计算鱼的初始体力
 */
export function calculateFishMaxStamina(fish: FishDef, weight: number): number {
  // 基于鱼的最大重量和当前重量计算体力
  const weightRatio = weight / fish.maxW
  const baseStamina = 50 + fish.rarity * 30
  const weightBonus = weightRatio * 100
  return Math.round(baseStamina + weightBonus)
}

/**
 * 计算收线后的完整战斗结果
 */
export function processReelAction(
  totalPower: number,
  fish: FishDef,
  currentTension: number,
  currentStamina: number
): CombatResult {
  const damage = calculateReelDamage(totalPower, fish.fight, currentTension)
  const tensionIncrease = calculateTensionIncrease(totalPower, fish.fight, currentTension)

  const newTension = currentTension + tensionIncrease
  const newStamina = currentStamina - damage

  const lineSnapped = newTension >= 100
  const fishEscaped = false

  return {
    lineTension: lineSnapped ? 100 : newTension,
    fishStamina: Math.max(0, newStamina),
    equipmentDamage: {
      rod: lineSnapped ? 5 : 1,
      line: lineSnapped ? 10 : 1,
      hook: lineSnapped ? 3 : 1,
      reel: lineSnapped ? 5 : 1,
      net: 0,
    },
    lineSnapped,
    fishEscaped,
  }
}

/**
 * 处理 QTE 失败
 */
export function processQTEFailure(
  fightMode: FightMode,
  currentTension: number
): { newTension: number; lineSnapped: boolean } {
  const penalty = calculateQTEPenalty(fightMode)
  const newTension = currentTension + penalty
  return {
    newTension: Math.min(100, newTension),
    lineSnapped: newTension >= 100,
  }
}

/**
 * 计算装备耐久损耗
 */
export function calculateDurabilityLoss(
  lineTension: number,
  fishRarity: number
): { rod: number; line: number; hook: number; reel: number } {
  const base = 0.5
  const tensionFactor = lineTension / 100
  const rarityFactor = 1 + fishRarity * 0.3

  const loss = base * tensionFactor * rarityFactor

  return {
    rod: Math.ceil(loss * 1.0),
    line: Math.ceil(loss * 1.5),
    hook: Math.ceil(loss * 0.8),
    reel: Math.ceil(loss * 1.2),
  }
}
