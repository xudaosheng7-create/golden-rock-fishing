import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, GameStats } from '../types'

interface PlayerState {
  // 基础属性
  gold: number
  diamond: number
  level: number
  exp: number
  vitality: number
  maxVitality: number

  // 档案
  userProfile: UserProfile | null

  // 统计
  stats: GameStats

  // ── Actions ──
  addGold: (amount: number) => void
  spendGold: (amount: number) => boolean
  addDiamond: (amount: number) => void
  spendDiamond: (amount: number) => boolean
  addExp: (amount: number) => void
  setUserProfile: (profile: UserProfile) => void
  updateStats: (partial: Partial<GameStats>) => void
  getGoldBonus: () => number
}

const INITIAL_STATS: GameStats = {
  playTime: 0,
  totalCasts: 0,
  totalEscapes: 0,
  totalWeight: 0,
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      gold: 2000,
      diamond: 50,
      level: 1,
      exp: 0,
      vitality: 100,
      maxVitality: 100,
      userProfile: null,
      stats: { ...INITIAL_STATS },

      addGold: (amount) => set((s) => ({ gold: s.gold + amount })),
      spendGold: (amount) => {
        const state = get()
        if (state.gold < amount) return false
        set({ gold: state.gold - amount })
        return true
      },
      addDiamond: (amount) => set((s) => ({ diamond: s.diamond + amount })),
      spendDiamond: (amount) => {
        const state = get()
        if (state.diamond < amount) return false
        set({ diamond: state.diamond - amount })
        return true
      },
      addExp: (amount) => {
        const state = get()
        const newExp = state.exp + amount
        const expPerLevel = state.level * 50 + 100
        if (newExp >= expPerLevel) {
          set({
            exp: newExp - expPerLevel,
            level: state.level + 1,
            maxVitality: state.maxVitality + 5,
            vitality: state.maxVitality + 5, // 升级满体力
          })
        } else {
          set({ exp: newExp })
        }
      },
      setUserProfile: (profile) => set({ userProfile: profile }),
      updateStats: (partial) =>
        set((s) => ({ stats: { ...s.stats, ...partial } })),
      getGoldBonus: () => {
        return get().level * 0.2
      },
    }),
    {
      name: 'ocean-player',
      version: 1,
    }
  )
)
