import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FishingState, FishingMethod, FishDef, CombatResult } from '../types'

interface FishingStateData {
  // 状态机
  fishingState: FishingState
  fishingMethod: FishingMethod | null
  isExpertMode: boolean

  // 当前鱼
  currentFish: FishDef | null
  currentFishWeight: number | null

  // 战斗实时数据（不持久化）
  lineTension: number
  fishStamina: number
  fishMaxStamina: number

  // QTE 事件
  activeQTEEvent: {
    mode: string
    label: string
    duration: number
    endTime: number
  } | null

  // 咬钩计时
  biteTimer: number | null
  biteDeadline: number | null

  // 复活状态（断线后看广告复活）
  reviveAvailable: boolean

  // ── Actions ──
  setFishingState: (state: FishingState) => void
  setFishingMethod: (method: FishingMethod | null) => void
  toggleExpertMode: () => void
  setCurrentFish: (fish: FishDef | null, weight: number | null) => void
  setLineTension: (tension: number) => void
  setFishStamina: (stamina: number) => void
  setFishMaxStamina: (stamina: number) => void
  setActiveQTEEvent: (event: FishingStateData['activeQTEEvent']) => void
  setBiteTimer: (deadline: number | null) => void
  setReviveAvailable: (available: boolean) => void
  applyCombatResult: (result: CombatResult) => void
  resetFightState: () => void
  resetAll: () => void
}

export const useFishingStore = create<FishingStateData>()(
  persist(
    (set) => ({
      fishingState: 'idle',
      fishingMethod: null,
      isExpertMode: false,

      currentFish: null,
      currentFishWeight: null,

      lineTension: 0,
      fishStamina: 0,
      fishMaxStamina: 0,

      activeQTEEvent: null,
      biteTimer: null,
      biteDeadline: null,
      reviveAvailable: false,

      setFishingState: (state) => set({ fishingState: state }),
      setFishingMethod: (method) => set({ fishingMethod: method }),
      toggleExpertMode: () => set((s) => ({ isExpertMode: !s.isExpertMode })),
      setCurrentFish: (fish, weight) =>
        set({ currentFish: fish, currentFishWeight: weight }),
      setLineTension: (tension) => set({ lineTension: Math.max(0, Math.min(100, tension)) }),
      setFishStamina: (stamina) => set({ fishStamina: Math.max(0, stamina) }),
      setFishMaxStamina: (stamina) => set({ fishMaxStamina: stamina }),
      setActiveQTEEvent: (event) => set({ activeQTEEvent: event }),
      setBiteTimer: (deadline) => set({ biteDeadline: deadline, biteTimer: deadline }),
      setReviveAvailable: (available) => set({ reviveAvailable: available }),
      applyCombatResult: (result) =>
        set((s) => ({
          lineTension: result.lineTension,
          fishStamina: result.fishStamina,
          fishingState: result.lineSnapped ? 'idle' : s.fishingState,
          currentFish: result.fishEscaped || result.lineSnapped ? null : s.currentFish,
          currentFishWeight:
            result.fishEscaped || result.lineSnapped ? null : s.currentFishWeight,
        })),
      resetFightState: () =>
        set({
          lineTension: 0,
          fishStamina: 0,
          fishMaxStamina: 0,
          activeQTEEvent: null,
          biteTimer: null,
          biteDeadline: null,
          currentFish: null,
          currentFishWeight: null,
          reviveAvailable: false,
        }),
      resetAll: () =>
        set({
          fishingState: 'idle',
          fishingMethod: null,
          isExpertMode: false,
          currentFish: null,
          currentFishWeight: null,
          lineTension: 0,
          fishStamina: 0,
          fishMaxStamina: 0,
          activeQTEEvent: null,
          biteTimer: null,
          biteDeadline: null,
          reviveAvailable: false,
        }),
    }),
    {
      name: 'ocean-fishing',
      version: 1,
      // 仅持久化玩法偏好，不持久化战斗瞬态数据
      partialize: (state) => ({
        fishingMethod: state.fishingMethod,
        isExpertMode: state.isExpertMode,
      }),
    }
  )
)
