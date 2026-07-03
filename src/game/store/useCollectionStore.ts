import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CollectRecord, TankFish } from '../types'

interface CollectionState {
  // 图鉴收集 (fishId → 收集记录)
  collection: Record<string, CollectRecord>

  // 鱼缸
  tank: TankFish[]
  tankCapacity: number

  // 鱼缸累计金币
  tankGoldPool: number
  lastTankCollectTime: number | null

  // ── Actions ──
  recordCatch: (fishId: string, weight: number) => void
  addFishToTank: (fish: TankFish) => boolean
  removeFishFromTank: (instanceId: string) => void
  expandTank: (slots: number) => void
  collectTankGold: () => number
  calculateTankGold: () => number
  getCollectionCount: () => number
  isCollected: (fishId: string) => boolean
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      collection: {},
      tank: [],
      tankCapacity: 5,
      tankGoldPool: 0,
      lastTankCollectTime: null,

      recordCatch: (fishId, weight) =>
        set((s) => {
          const existing = s.collection[fishId]
          return {
            collection: {
              ...s.collection,
              [fishId]: {
                count: (existing?.count ?? 0) + 1,
                maxWeight: Math.max(existing?.maxWeight ?? 0, weight),
              },
            },
          }
        }),

      addFishToTank: (fish) => {
        const state = get()
        if (state.tank.length >= state.tankCapacity) return false
        set((s) => ({ tank: [...s.tank, fish] }))
        return true
      },

      removeFishFromTank: (instanceId) =>
        set((s) => ({
          tank: s.tank.filter((f) => f.id !== instanceId),
        })),

      expandTank: (slots) =>
        set((s) => ({ tankCapacity: s.tankCapacity + slots })),

      collectTankGold: () => {
        const gold = get().calculateTankGold()
        const now = Date.now()
        set({ tankGoldPool: 0, lastTankCollectTime: now })
        return gold
      },

      calculateTankGold: () => {
        // 简化计算：鱼的稀有度 × 重量 × 时间系数
        // 实际需要在 system 层结合 FISH_DB 精确计算
        const state = get()
        const now = Date.now()
        if (!state.lastTankCollectTime) return state.tankGoldPool
        const hours = (now - state.lastTankCollectTime) / 3600000
        let total = state.tankGoldPool
        // 每条鱼每小时产出金币（粗略）
        for (const fish of state.tank) {
          total += fish.weight * hours * 0.5
        }
        return Math.floor(total)
      },

      getCollectionCount: () => Object.keys(get().collection).length,

      isCollected: (fishId) => fishId in get().collection,
    }),
    {
      name: 'ocean-collection',
      version: 1,
    }
  )
)
