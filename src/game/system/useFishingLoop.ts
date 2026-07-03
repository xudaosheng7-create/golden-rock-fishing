// ═══════════════════════════════════════
// 钓鱼主循环 Hook
// 驱动完整状态机：idle→casting→waiting→biting→fighting→caught→idle
// ═══════════════════════════════════════

import { useEffect, useRef } from 'react'
import { useFishingStore } from '../store/useFishingStore'
import { usePlayerStore } from '../store/usePlayerStore'
import { useEquipmentStore } from '../store/useEquipmentStore'
import { useWorldStore } from '../store/useWorldStore'
import { useToastStore } from '../store/useToastStore'
import { AudioManager } from '../audio/AudioManager'
import { FISH_DB } from '../db/fish'
import { SPOTS } from '../db/spots'
import { EQUIP_DB } from '../db/equip'
import { pickFish, calculateWaitTime } from './FishingProbability'
import {
  calculateFishMaxStamina,
  calculateQTEPenalty,
  processReelAction,
  calculateDurabilityLoss,
} from './FishingCombat'
import type { FishDef, QTEEvent } from '../types'

// 装备槽位键
type EquipSlotKey = 'eRod' | 'eLine' | 'eHook' | 'eReel'
type EquipSlot = { slot: EquipSlotKey; damage: number }

/**
 * 获取当前钓场
 */
function getCurrentSpot() {
  const spotId = useWorldStore.getState().currentSpot
  return SPOTS.find((s) => s.id === spotId) ?? SPOTS[0]
}

/**
 * 获取装备总属性
 */
function getEquipStats() {
  const equip = useEquipmentStore.getState()
  const ids = [equip.eRod, equip.eLine, equip.eHook, equip.eReel].filter(Boolean) as string[]
  let totalPower = 0
  let totalRareBonus = 0
  for (const id of ids) {
    const def = EQUIP_DB.find((e) => e.id === id)
    if (def) {
      totalPower += def.power ?? 0
      totalRareBonus += def.rareBonus ?? 0
    }
  }
  return { totalPower, totalRareBonus }
}

/**
 * 获取窝料目标鱼种
 */
function getChumTargets(): string[] {
  const equip = useEquipmentStore.getState()
  if (!equip.activeChum || equip.activeChum.casts <= 0) return []
  const chumDef = EQUIP_DB.find((e) => e.id === equip.activeChum!.id)
  return (chumDef as any)?.fishTargets ?? []
}

/**
 * 消耗装备耐久
 */
function consumeDurability(damage: { rod: number; line: number; hook: number; reel: number }) {
  const equip = useEquipmentStore.getState()
  const slots: EquipSlot[] = [
    { slot: 'eRod', damage: damage.rod },
    { slot: 'eLine', damage: damage.line },
    { slot: 'eHook', damage: damage.hook },
    { slot: 'eReel', damage: damage.reel },
  ]
  for (const { slot, damage: d } of slots) {
    const id = equip[slot] as string | null
    if (!id) continue
    const item = equip.inventory.find((i) => i.id === id)
    if (item && item.durability !== undefined) {
      const newDurability = Math.max(0, item.durability - d)
      equip.setDurability(id, newDurability)
      if (newDurability <= 0) {
        useToastStore.getState().addToast(
          `${EQUIP_DB.find((e) => e.id === id)?.name ?? '装备'} 耐久耗尽！`,
          'warning'
        )
      }
    }
  }
}

/**
 * 生成 QTE 事件
 */
function generateQTEEvent(fish: FishDef): QTEEvent | null {
  const mode = fish.fight
  // gentle 和 long_endurance 不触发 QTE
  if (mode === 'gentle' || mode === 'long_endurance') return null

  const labelMap: Record<string, string> = {
    jump: '跳跃',
    burst: '冲刺',
    sprint: '冲刺',
    deep_dive: '深潜',
    drill: '钻底',
    roll: '翻滚',
    spin: '翻滚',
    swing: '摇摆',
    scream: '尖叫冲刺',
  }

  const durationMap: Record<string, number> = {
    jump: 3,
    burst: 2,
    sprint: 2,
    deep_dive: 4,
    drill: 4,
    roll: 2.5,
    spin: 2.5,
    swing: 2,
    scream: 2,
  }

  return {
    mode: mode as QTEEvent['mode'],
    label: labelMap[mode] ?? mode,
    duration: durationMap[mode] ?? 3,
    action: 'release',
  }
}

// ── QTE 定时触发间隔（秒）──
const QTE_INTERVAL_MIN = 3
const QTE_INTERVAL_MAX = 8

export function useFishingLoop() {
  const fishingState = useFishingStore((s) => s.fishingState)
  const lineTension = useFishingStore((s) => s.lineTension)
  const fishStamina = useFishingStore((s) => s.fishStamina)
  const fishMaxStamina = useFishingStore((s) => s.fishMaxStamina)
  const currentFish = useFishingStore((s) => s.currentFish)
  const currentFishWeight = useFishingStore((s) => s.currentFishWeight)

  // Refs for timers
  const biteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const escapeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const qteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nextQTETimeRef = useRef<number>(0)

  // ── casting → waiting 转换 ──
  useEffect(() => {
    if (fishingState !== 'casting') return

    const timer = setTimeout(() => {
      const store = useFishingStore.getState()
      if (store.fishingState !== 'casting') return

      // 计算等待时间
      const world = useWorldStore.getState()
      const waitTime = calculateWaitTime(world.weather, world.tide) * 1000
      const biteDeadline = Date.now() + waitTime

      store.setBiteTimer(biteDeadline)
      store.setFishingState('waiting')
      AudioManager.play('splash')

      // 预设咬钩定时器
      biteTimerRef.current = setTimeout(() => {
        triggerBite()
      }, waitTime)
    }, 2800) // casting 动画时长（匹配阿波飞行弧线）

    return () => clearTimeout(timer)
  }, [fishingState === 'casting'])

  // ── 清理 waiting 状态 ──
  useEffect(() => {
    return () => {
      if (biteTimerRef.current) clearTimeout(biteTimerRef.current)
      if (escapeTimerRef.current) clearTimeout(escapeTimerRef.current)
      if (qteTimerRef.current) clearTimeout(qteTimerRef.current)
    }
  }, [])

  // ── fighting 状态：QTE 事件定时生成 ──
  useEffect(() => {
    if (fishingState !== 'fighting' || !currentFish) return

    // 初始化鱼体力
    const store = useFishingStore.getState()
    if (store.fishMaxStamina <= 0 && currentFishWeight) {
      const maxStamina = calculateFishMaxStamina(currentFish, currentFishWeight)
      store.setFishMaxStamina(maxStamina)
      store.setFishStamina(maxStamina)
    }

    // QTE 定时器
    nextQTETimeRef.current = Date.now() + (QTE_INTERVAL_MIN + Math.random() * (QTE_INTERVAL_MAX - QTE_INTERVAL_MIN)) * 1000

    const checkQTE = () => {
      const s = useFishingStore.getState()
      if (s.fishingState !== 'fighting') return

      const now = Date.now()
      if (now >= nextQTETimeRef.current && !s.activeQTEEvent) {
        const fish = s.currentFish
        if (fish && fish.fight !== 'gentle' && fish.fight !== 'long_endurance') {
          const event = generateQTEEvent(fish)
          if (event) {
            s.setActiveQTEEvent({
              ...event,
              endTime: now + event.duration * 1000,
            })

            // QTE 超时惩罚
            qteTimerRef.current = setTimeout(() => {
              handleQTETimeout()
            }, event.duration * 1000)
          }
        }
        // 设置下一个 QTE
        nextQTETimeRef.current = now + (QTE_INTERVAL_MIN + Math.random() * (QTE_INTERVAL_MAX - QTE_INTERVAL_MIN)) * 1000
      }

      if (s.fishingState === 'fighting') {
        requestAnimationFrame(checkQTE)
      }
    }

    // 对于 long_endurance，每隔一段时间自动消耗一些鱼体力
    let enduranceTick: ReturnType<typeof setInterval> | null = null
    if (currentFish.fight === 'long_endurance') {
      enduranceTick = setInterval(() => {
        const s = useFishingStore.getState()
        if (s.fishingState !== 'fighting') {
          if (enduranceTick) clearInterval(enduranceTick)
          return
        }
        // 极慢的自动消耗
        s.setFishStamina(s.fishStamina - 0.3)
      }, 500)
    }

    requestAnimationFrame(checkQTE)

    return () => {
      if (qteTimerRef.current) clearTimeout(qteTimerRef.current)
      if (enduranceTick) clearInterval(enduranceTick)
    }
  }, [fishingState === 'fighting', currentFish?.id])

  // ── gentle 模式自动消耗体力 ──
  useEffect(() => {
    if (fishingState !== 'fighting' || !currentFish || currentFish.fight !== 'gentle') return

    const tick = setInterval(() => {
      const s = useFishingStore.getState()
      if (s.fishingState !== 'fighting' || s.currentFish?.fight !== 'gentle') {
        clearInterval(tick)
        return
      }
      // 温顺鱼自动快速消耗
      s.setFishStamina(s.fishStamina - 1.5)
      s.setLineTension(s.lineTension + 0.5)
    }, 300)

    return () => clearInterval(tick)
  }, [fishingState === 'fighting', currentFish?.fight === 'gentle'])

  // ── 断线检测 ──
  useEffect(() => {
    if (lineTension >= 100 && fishingState === 'fighting') {
      handleLineSnap()
    }
  }, [lineTension, fishingState])

  // ── 鱼获检测 ──
  useEffect(() => {
    if (fishStamina <= 0 && fishingState === 'fighting' && fishMaxStamina > 0) {
      handleFishCaught()
    }
  }, [fishStamina, fishingState])
}

// ── 内部函数 ──

function triggerBite() {
  const world = useWorldStore.getState()
  const equip = useEquipmentStore.getState()
  const spot = getCurrentSpot()
  const { totalRareBonus } = getEquipStats()
  const chumTargets = getChumTargets()

  const result = pickFish(
    spot,
    FISH_DB,
    equip.eBait,
    chumTargets,
    world.tide,
    world.weather,
    world.time,
    world.depth,
    totalRareBonus
  )

  if (!result) {
    // 没鱼咬钩，重置
    useFishingStore.getState().setFishingState('idle')
    useToastStore.getState().addToast('没有鱼咬钩...', 'info')
    return
  }

  const fishingStore = useFishingStore.getState()
  fishingStore.setCurrentFish(result.fish, result.weight)
  fishingStore.setFishingState('biting')
  AudioManager.play('bite')

  // 咬钩超时（5秒内必须提竿）
  const biteDeadline = Date.now() + 5000
  fishingStore.setBiteTimer(biteDeadline)

  // 超时逃跑
  setTimeout(() => {
    const s = useFishingStore.getState()
    if (s.fishingState === 'biting') {
      handleFishEscape()
    }
  }, 5000)
}

function handleFishEscape() {
  const player = usePlayerStore.getState()
  const fishing = useFishingStore.getState()
  player.updateStats({ totalEscapes: player.stats.totalEscapes + 1 })
  fishing.resetFightState()
  fishing.setFishingState('idle')
  useToastStore.getState().addToast('鱼逃跑了！', 'warning')
}

function handleLineSnap() {
  AudioManager.play('snap')
  const fishing = useFishingStore.getState()
  const player = usePlayerStore.getState()

  // 断线耐久损耗
  const fish = fishing.currentFish
  if (fish) {
    const loss = calculateDurabilityLoss(100, fish.rarity)
    // 断线额外损耗
    loss.line += 10
    loss.rod += 5
    consumeDurability(loss)
  }

  // 不立即重置战斗状态，提供看广告复活机会
  fishing.setReviveAvailable(true)
  fishing.setLineTension(0) // 重置张力避免循环触发
  fishing.setFishingState('idle')
  useToastStore.getState().addToast('断线了！可以看视频复活鱼！', 'warning')
}

/**
 * 放弃复活，正式计入逃跑
 */
export function handleReviveDismiss() {
  const fishing = useFishingStore.getState()
  const player = usePlayerStore.getState()
  player.updateStats({ totalEscapes: player.stats.totalEscapes + 1 })
  fishing.resetFightState()
  fishing.setFishingState('idle')
  useToastStore.getState().addToast('鱼跑了！', 'error')
}

function handleQTETimeout() {
  const fishing = useFishingStore.getState()
  if (!fishing.activeQTEEvent || fishing.fishingState !== 'fighting') return

  const fish = fishing.currentFish
  const penalty = fish ? calculateQTEPenalty(fish.fight) : 25
  const newTension = fishing.lineTension + penalty
  fishing.setLineTension(newTension)
  fishing.setActiveQTEEvent(null)

  useToastStore.getState().addToast('QTE 失败！线张力增加！', 'warning')

  if (newTension >= 100) {
    handleLineSnap()
  }
}

function handleFishCaught() {
  const fishing = useFishingStore.getState()
  fishing.setFishingState('caught')
  AudioManager.play('caught')

  // 战斗结束，消耗耐久
  const fish = fishing.currentFish
  if (fish) {
    const loss = calculateDurabilityLoss(fishing.lineTension, fish.rarity)
    consumeDurability(loss)
  }
}

// 暴露手动操作
export function castLineAction(): { success: boolean; error?: string } {
  const fishing = useFishingStore.getState()
  const player = usePlayerStore.getState()
  const equip = useEquipmentStore.getState()

  if (fishing.fishingState !== 'idle') {
    return { success: false, error: '当前无法抛竿' }
  }
  if (fishing.reviveAvailable) {
    return { success: false, error: '请先处理断线' }
  }
  if (player.vitality < 5) {
    return { success: false, error: '体力不足' }
  }
  if (!equip.eRod) {
    return { success: false, error: '请先装备渔竿' }
  }
  if (!equip.eBait) {
    return { success: false, error: '请先装备鱼饵' }
  }

  // 消耗鱼饵
  equip.removeItem(equip.eBait, 1)

  // 消耗窝料
  if (equip.activeChum && equip.activeChum.casts > 0) {
    equip.useChum()
  }

  // 抛竿耐久消耗
  consumeDurability({ rod: 0.5, line: 0.3, hook: 0.2, reel: 0.3 })

  // 消耗体力
  player.updateStats({ totalCasts: player.stats.totalCasts + 1 })

  fishing.setFishingState('casting')
  AudioManager.play('cast')
  return { success: true }
}

export function hookSetAction(): { success: boolean; error?: string } {
  const fishing = useFishingStore.getState()

  if (fishing.fishingState !== 'biting') {
    return { success: false, error: '没有鱼咬钩' }
  }

  if (fishing.biteDeadline && Date.now() > fishing.biteDeadline) {
    handleFishEscape()
    return { success: false, error: '太晚了，鱼已经跑了' }
  }

  fishing.setFishingState('fighting')
  return { success: true }
}

export function reelAction(): void {
  const fishing = useFishingStore.getState()
  if (fishing.fishingState !== 'fighting' || !fishing.currentFish) return

  const { totalPower } = getEquipStats()
  const result = processReelAction(
    Math.max(10, totalPower), // 最低 10 点拉力
    fishing.currentFish,
    fishing.lineTension,
    fishing.fishStamina
  )

  fishing.setLineTension(result.lineTension)
  fishing.setFishStamina(result.fishStamina)

  if (result.lineSnapped) {
    handleLineSnap()
  } else if (result.fishStamina <= 0) {
    handleFishCaught()
  }
}

export function releaseAction(): void {
  const fishing = useFishingStore.getState()
  if (fishing.fishingState !== 'fighting') return

  // 降低张力
  fishing.setLineTension(fishing.lineTension - 15)

  // 完成当前 QTE
  if (fishing.activeQTEEvent) {
    fishing.setActiveQTEEvent(null)
  }
}

// 收竿：casting/waiting/biting 时主动收回
export function cancelFishingAction(): { success: boolean; error?: string } {
  const fishing = useFishingStore.getState()
  if (fishing.fishingState !== 'casting' && fishing.fishingState !== 'waiting' && fishing.fishingState !== 'biting') {
    return { success: false, error: '当前无法收竿' }
  }

  fishing.resetFightState()
  fishing.setFishingState('idle')
  useToastStore.getState().addToast('已收竿', 'info')
  return { success: true }
}
