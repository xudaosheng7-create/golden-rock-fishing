import { useState } from 'react'
import { useEquipmentStore } from '../../store/useEquipmentStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useToastStore } from '../../store/useToastStore'
import { EQUIP_DB } from '../../db/equip/index'
import { FISH_DB } from '../../db/fish/index'
import { calculateFishPrice, calculateRepairCost } from '../../system/Economy'
import { AdManager, AdScene } from '../../system/AdManager'
import { BasePanel } from '../BasePanel'
import { Backpack, Fish, Beaker, Wallet, Play } from 'lucide-react'
import type { InventoryItem, BasketFish } from '../../types'

interface BackpackPanelProps {
  onClose: () => void
}

type TabKey = 'equip' | 'basket' | 'consumable'

const TABS: { key: TabKey; label: string; icon: typeof Backpack }[] = [
  { key: 'equip', label: '装备', icon: Backpack },
  { key: 'basket', label: '鱼护', icon: Fish },
  { key: 'consumable', label: '消耗品', icon: Beaker },
]

function EquipTab() {
  const inventory = useEquipmentStore((s) => s.inventory)
  const setDurability = useEquipmentStore((s) => s.setDurability)
  const spendGold = usePlayerStore((s) => s.spendGold)
  const addToast = useToastStore((s) => s.addToast)

  const handleRepair = (item: InventoryItem) => {
    const def = EQUIP_DB.find((d) => d.id === item.id)
    if (!def || item.durability === undefined) return
    if (item.durability >= def.maxDurability) {
      addToast('装备状态完好，无需修理', 'info')
      return
    }
    const cost = calculateRepairCost(def.maxDurability, item.durability, def.price)
    if (spendGold(cost)) {
      setDurability(item.id, def.maxDurability)
      addToast(`${def.name} 已修复，花费 ${cost} 金币`, 'success')
    } else {
      addToast('金币不足！', 'error')
    }
  }

  const equipItems = inventory.filter((item) => {
    const def = EQUIP_DB.find((d) => d.id === item.id)
    return def && item.durability !== undefined
  })

  if (equipItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/30">
        <Backpack className="w-12 h-12 mb-3" />
        <span className="text-sm">暂无装备</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {equipItems.map((item: InventoryItem) => {
        const def = EQUIP_DB.find((d) => d.id === item.id)!
        const durability = item.durability ?? def.maxDurability
        const durPercent = (durability / def.maxDurability) * 100
        const isDamaged = durPercent < 50
        const isBroken = durability <= 0
        const repairCost = calculateRepairCost(def.maxDurability, durability, def.price)

        return (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-gray-800/50 rounded-xl px-3 py-2.5 border border-white/5"
          >
            {/* 类型图标 */}
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isBroken ? 'bg-red-900/50 text-red-400' : 'bg-gray-700/50 text-white/60'}`}>
              {def.type.slice(0, 2).toUpperCase()}
            </div>

            {/* 信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white font-medium truncate">{def.name}</span>
                <span className="text-xs text-white/40 ml-2">x{item.count}</span>
              </div>
              {/* 耐久条 */}
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isBroken ? 'bg-red-500' : isDamaged ? 'bg-yellow-500' : 'bg-cyan-500'}`}
                    style={{ width: `${durPercent}%` }}
                  />
                </div>
                <span className={`text-[10px] ${isBroken ? 'text-red-400' : isDamaged ? 'text-yellow-400' : 'text-white/40'}`}>
                  {durability}/{def.maxDurability}
                </span>
              </div>
            </div>

            {/* 修理按钮 */}
            {durability < def.maxDurability && (
              <button
                onClick={() => handleRepair(item)}
                className="shrink-0 text-xs px-2.5 py-1.5 rounded-lg bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30 border border-yellow-500/30 transition-colors whitespace-nowrap"
              >
                修理 {repairCost > 0 ? `${repairCost}g` : ''}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function BasketTab() {
  const basket = useEquipmentStore((s) => s.basket)
  const removeFishFromBasket = useEquipmentStore((s) => s.removeFishFromBasket)
  const clearBasket = useEquipmentStore((s) => s.clearBasket)
  const addGold = usePlayerStore((s) => s.addGold)
  const goldBonus = usePlayerStore((s) => s.getGoldBonus())
  const addToast = useToastStore((s) => s.addToast)

  // 计算总价
  const totalPrice = basket.reduce((sum, f) => {
    const fishDef = FISH_DB.find((d) => d.id === f.fishId)
    if (!fishDef) return sum
    return sum + calculateFishPrice(fishDef, f.weight, goldBonus)
  }, 0)

  // 普通单条出售
  const sellFish = (fish: BasketFish) => {
    const fishDef = FISH_DB.find((d) => d.id === fish.fishId)
    if (!fishDef) return
    const price = calculateFishPrice(fishDef, fish.weight, goldBonus)
    addGold(price)
    removeFishFromBasket(fish.id)
    addToast(`售出 ${fishDef.name}，+${price} 金币`, 'success')
  }

  // 3倍单条出售（看广告）
  const sellFish3x = (fish: BasketFish) => {
    const fishDef = FISH_DB.find((d) => d.id === fish.fishId)
    if (!fishDef) return
    const basePrice = calculateFishPrice(fishDef, fish.weight, goldBonus)
    AdManager.showRewardedAd(AdScene.SINGLE_SELL_3X, (success) => {
      if (success) {
        addGold(basePrice * 3)
        removeFishFromBasket(fish.id)
        addToast(`3倍售出 ${fishDef.name}，+${basePrice * 3} 金币！`, 'success')
      }
    })
  }

  // 普通全部出售
  const sellAll = () => {
    if (basket.length === 0) return
    const allFish = clearBasket()
    let total = 0
    for (const f of allFish) {
      const fishDef = FISH_DB.find((d) => d.id === f.fishId)
      if (fishDef) total += calculateFishPrice(fishDef, f.weight, goldBonus)
    }
    if (total > 0) { addGold(total); addToast(`全部售出，+${total} 金币`, 'success') }
  }

  // 2倍批量出售（看广告）
  const sellAll2x = () => {
    if (basket.length === 0) return
    AdManager.showRewardedAd(AdScene.BATCH_SELL_2X, (success) => {
      if (success) {
        const allFish = clearBasket()
        let confirmTotal = 0
        for (const f of allFish) {
          const fishDef = FISH_DB.find((d) => d.id === f.fishId)
          if (fishDef) confirmTotal += calculateFishPrice(fishDef, f.weight, goldBonus)
        }
        addGold(confirmTotal * 2)
        addToast(`2倍批量售出，+${confirmTotal * 2} 金币！`, 'success')
      }
    })
  }

  if (basket.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/30">
        <Fish className="w-12 h-12 mb-3" />
        <span className="text-sm">鱼护中没有鱼</span>
        <span className="text-xs mt-1">去钓鱼吧！</span>
      </div>
    )
  }

  return (
    <div>
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/40">共 {basket.length} 条 · 价值 {totalPrice} 金币</span>
        <div className="flex gap-1.5">
          <button onClick={sellAll}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-green-600/20 text-green-300 hover:bg-green-600/30 transition-colors">
            <Wallet className="w-3 h-3" />出售
          </button>
          <button onClick={sellAll2x}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition-colors">
            <Play className="w-3 h-3" />2倍
          </button>
        </div>
      </div>

      {/* 鱼获列表 */}
      <div className="space-y-2">
        {basket.map((fish: BasketFish) => {
          const fishDef = FISH_DB.find((d) => d.id === fish.fishId)
          const price = fishDef ? calculateFishPrice(fishDef, fish.weight, goldBonus) : 0
          return (
            <div key={fish.id}
              className="flex items-center justify-between bg-gray-800/50 rounded-xl px-3 py-2.5 border border-white/5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white truncate">{fishDef?.name ?? fish.fishId}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rare-1/20 text-rare-1">
                    {fishDef ? '★'.repeat(fishDef.rarity) : ''}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                  <span>{fish.weight.toFixed(1)}kg</span>
                  <span className="text-gold-400">{price} 金币</span>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => sellFish(fish)}
                  className="text-xs px-2 py-1 rounded-lg bg-green-600/20 text-green-300 hover:bg-green-600/30 transition-colors">
                  出售
                </button>
                <button onClick={() => sellFish3x(fish)}
                  className="text-xs px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition-colors flex items-center gap-0.5">
                  <Play className="w-2.5 h-2.5" />3倍
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ConsumableTab() {
  const inventory = useEquipmentStore((s) => s.inventory)
  const consumables = inventory.filter((item: InventoryItem) => {
    const def = EQUIP_DB.find((d) => d.id === item.id)
    return def && (def.type === 'bait' || def.type === 'chum' || def.type === 'lure')
  })

  if (consumables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/30">
        <Beaker className="w-12 h-12 mb-3" />
        <span className="text-sm">没有消耗品</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {consumables.map((item: InventoryItem) => {
        const def = EQUIP_DB.find((d) => d.id === item.id)
        if (!def) return null
        const typeLabel = def.type === 'bait' ? '鱼饵' : def.type === 'chum' ? '窝料' : '拟饵'
        return (
          <div
            key={item.id}
            className="bg-gray-800/50 rounded-xl px-3 py-2.5 border border-white/5"
          >
            <div className="text-sm text-white font-medium truncate">{def.name}</div>
            <div className="text-xs text-white/40 mt-1">{typeLabel}</div>
            <div className="text-xs text-cyan-400 mt-1">x{item.count}</div>
          </div>
        )
      })}
    </div>
  )
}

export function BackpackPanel({ onClose }: BackpackPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('equip')

  return (
    <BasePanel title="背包" onClose={onClose}>
      {/* 标签栏 */}
      <div className="flex gap-1 mb-4 bg-gray-800/50 rounded-xl p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-cyan-600/30 text-cyan-300 shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 标签内容 */}
      {activeTab === 'equip' && <EquipTab />}
      {activeTab === 'basket' && <BasketTab />}
      {activeTab === 'consumable' && <ConsumableTab />}
    </BasePanel>
  )
}
