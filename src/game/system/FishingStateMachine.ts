// ═══════════════════════════════════════
// 钓鱼状态机 — 管理 7 个状态转换
// ═══════════════════════════════════════

import type { FishingState } from '../types'
import { useFishingStore } from '../store/useFishingStore'
import { usePlayerStore } from '../store/usePlayerStore'
import { useToastStore } from '../store/useToastStore'

export type StateTransition =
  | 'cast'        // 抛竿
  | 'hook_set'    // 提竿（咬钩 → 搏鱼）
  | 'line_snap'   // 断线（搏鱼 → idle）
  | 'fish_escape' // 鱼逃跑（咬钩超时 / 搏鱼失败）
  | 'fish_caught' // 鱼获（搏鱼胜利 → caught）
  | 'keep_fish'   // 收入鱼护
  | 'release_fish'// 放生
  | 'reset'       // 重置到 idle

// 有效的状态转换映射
const VALID_TRANSITIONS: Record<FishingState, StateTransition[]> = {
  idle: ['cast'],
  casting: [], // 自动进入 waiting
  waiting: ['hook_set', 'fish_escape'],
  biting: ['hook_set', 'fish_escape'],
  fighting: ['line_snap', 'fish_escape', 'fish_caught'],
  netting: ['fish_caught', 'fish_escape'],
  caught: ['keep_fish', 'release_fish'],
}

/**
 * 检查状态转换是否合法
 */
export function canTransition(from: FishingState, transition: StateTransition): boolean {
  return VALID_TRANSITIONS[from]?.includes(transition) ?? false
}

/**
 * 执行状态转换
 */
export function transitionTo(state: FishingState): boolean {
  const store = useFishingStore.getState()

  // 构建隐式转换映射
  const implicit: Partial<Record<FishingState, FishingState>> = {
    casting: 'waiting', // casting 动画结束自动进入 waiting
  }

  const target = implicit[store.fishingState] || state

  if (target === store.fishingState) return true

  store.setFishingState(target)
  return true
}

/**
 * 抛竿操作
 * 要求：当前状态为 idle，有装备鱼竿，有鱼饵
 */
export function castLine(): { success: boolean; error?: string } {
  const fishingState = useFishingStore.getState()
  const player = usePlayerStore.getState()

  if (fishingState.fishingState !== 'idle') {
    return { success: false, error: '当前无法抛竿' }
  }

  if (player.vitality < 5) {
    return { success: false, error: '体力不足' }
  }

  // TODO: 检查装备是否齐全

  // 消耗体力
  usePlayerStore.getState().updateStats({ totalCasts: player.stats.totalCasts + 1 })

  // 进入 casting 状态（自动进入 waiting）
  fishingState.setFishingState('casting')

  // 模拟抛竿动画后自动进入 waiting
  setTimeout(() => {
    const current = useFishingStore.getState()
    if (current.fishingState === 'casting') {
      current.setFishingState('waiting')
    }
  }, 1500)

  return { success: true }
}

/**
 * 提竿操作（咬钩时触发）
 */
export function hookSet(): { success: boolean; error?: string } {
  const fishingState = useFishingStore.getState()

  if (fishingState.fishingState !== 'biting') {
    return { success: false, error: '没有鱼咬钩' }
  }

  if (fishingState.biteDeadline && Date.now() > fishingState.biteDeadline) {
    // 已超时，鱼逃跑
    handleFishEscape()
    return { success: false, error: '太晚了，鱼已经跑了' }
  }

  fishingState.setFishingState('fighting')
  return { success: true }
}

/**
 * 鱼逃跑处理
 */
export function handleFishEscape(): void {
  const player = usePlayerStore.getState()
  const fishing = useFishingStore.getState()
  const toast = useToastStore.getState()

  player.updateStats({ totalEscapes: player.stats.totalEscapes + 1 })
  fishing.resetFightState()
  fishing.setFishingState('idle')

  toast.addToast('鱼逃跑了！', 'warning')
}

/**
 * 断线处理
 */
export function handleLineSnap(): void {
  const player = usePlayerStore.getState()
  const fishing = useFishingStore.getState()
  const toast = useToastStore.getState()

  player.updateStats({ totalEscapes: player.stats.totalEscapes + 1 })
  fishing.resetFightState()
  fishing.setFishingState('idle')

  toast.addToast('断线了！鱼跑了！', 'error')
}

/**
 * 鱼获成功
 */
export function handleFishCaught(): void {
  const fishing = useFishingStore.getState()
  fishing.setFishingState('caught')
}

/**
 * 收入鱼护
 */
export function keepFish(): void {
  const fishing = useFishingStore.getState()
  fishing.setFishingState('idle')
  // 实际存入 basket 的逻辑在 UI 层处理
}

/**
 * 放生
 */
export function releaseFish(): void {
  const fishing = useFishingStore.getState()
  fishing.resetFightState()
  fishing.setFishingState('idle')

  useToastStore.getState().addToast('已将鱼放生', 'info')
}
