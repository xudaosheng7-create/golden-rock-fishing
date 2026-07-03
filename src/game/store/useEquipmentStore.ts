import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InventoryItem, BasketFish } from '../types'

// ── 新手初始装备 ──
const STARTER_INVENTORY: InventoryItem[] = [
  { id: 'rod_001', count: 1, durability: 150 },   // 基础渔竿
  { id: 'line_001', count: 1, durability: 100 },   // 基础渔线
  { id: 'hook_001', count: 1, durability: 80 },    // 基础渔钩
  { id: 'float_001', count: 1, durability: 80 },   // 基础浮漂
  { id: 'reel_001', count: 1, durability: 120 },   // 基础卷线器
  { id: 'bait_001', count: 50 },                   // 沙蚕 ×50
]

const STARTER_EQUIP = {
  eRod: 'rod_001',
  eLine: 'line_001',
  eHook: 'hook_001',
  eFloat: 'float_001',
  eReel: 'reel_001',
  eNet: null as string | null,
  eBait: 'bait_001',
  eChum: null as string | null,
}

interface EquipmentState {
  // 当前装备槽位（ID 引用）
  eRod: string | null
  eLine: string | null
  eHook: string | null
  eFloat: string | null
  eReel: string | null
  eNet: string | null
  eBait: string | null
  eChum: string | null
  activeChum: { id: string; casts: number } | null

  // 背包（所有装备/消耗品实例）
  inventory: InventoryItem[]

  // 鱼护（钓到的鱼，未出售）
  basket: BasketFish[]

  // ── Actions ──
  equip: (slot: keyof EquipmentState, id: string | null) => void
  addItem: (id: string, count: number, durability?: number) => void
  removeItem: (id: string, count: number) => boolean
  setDurability: (id: string, durability: number) => void
  useChum: () => void
  setActiveChum: (chum: { id: string; casts: number } | null) => void
  addFishToBasket: (fish: BasketFish) => void
  removeFishFromBasket: (fishId: string) => void
  clearBasket: () => BasketFish[]
  getEquippedIds: () => string[]
  getTotalPower: () => number
  getTotalRareBonus: () => number
}

export const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set, get) => ({
      ...STARTER_EQUIP,
      activeChum: null,

      inventory: [...STARTER_INVENTORY],
      basket: [],

      equip: (slot, id) => set({ [slot]: id } as Partial<EquipmentState>),

      addItem: (id, count, durability) =>
        set((s) => {
          const existing = s.inventory.find((i) => i.id === id)
          if (existing) {
            return {
              inventory: s.inventory.map((i) =>
                i.id === id
                  ? { ...i, count: i.count + count, durability: durability ?? i.durability }
                  : i
              ),
            }
          }
          return {
            inventory: [...s.inventory, { id, count, durability }],
          }
        }),

      removeItem: (id, count) => {
        const state = get()
        const item = state.inventory.find((i) => i.id === id)
        if (!item || item.count < count) return false
        set((s) => ({
          inventory: s.inventory
            .map((i) =>
              i.id === id ? { ...i, count: i.count - count } : i
            )
            .filter((i) => i.count > 0),
        }))
        return true
      },

      setDurability: (id, durability) =>
        set((s) => ({
          inventory: s.inventory.map((i) =>
            i.id === id ? { ...i, durability: Math.max(0, durability) } : i
          ),
        })),

      useChum: () =>
        set((s) => {
          if (!s.activeChum || s.activeChum.casts <= 0) return s
          const newCasts = s.activeChum.casts - 1
          return {
            activeChum: newCasts > 0 ? { ...s.activeChum, casts: newCasts } : null,
          }
        }),

      setActiveChum: (chum) => set({ activeChum: chum }),

      addFishToBasket: (fish) =>
        set((s) => ({ basket: [...s.basket, fish] })),

      removeFishFromBasket: (fishId) =>
        set((s) => ({
          basket: s.basket.filter((f) => f.id !== fishId),
        })),

      clearBasket: () => {
        const basket = get().basket
        set({ basket: [] })
        return basket
      },

      getEquippedIds: () => {
        const s = get()
        return [s.eRod, s.eLine, s.eHook, s.eFloat, s.eReel, s.eNet, s.eBait, s.eChum].filter(
          Boolean
        ) as string[]
      },

      getTotalPower: () => 0, // 需要读取 EQUIP_DB 计算，在 system 层实现
      getTotalRareBonus: () => 0, // 同上
    }),
    {
      name: 'ocean-equipment',
      version: 1,
    }
  )
)
