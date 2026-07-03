import { useState } from 'react'
import { useEquipmentStore } from '../../store/useEquipmentStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { EQUIP_DB } from '../../db/equip/index'
import { BasePanel } from '../BasePanel'
import { ShoppingCart, Star, Wrench } from 'lucide-react'
import type { EquipDef, EquipType } from '../../types'

interface MarketPanelProps {
  onClose: () => void
}

const CATEGORIES: { key: EquipType; label: string }[] = [
  { key: 'rod', label: '渔竿' },
  { key: 'line', label: '渔线' },
  { key: 'hook', label: '渔钩' },
  { key: 'float', label: '浮漂' },
  { key: 'reel', label: '卷线器' },
  { key: 'net', label: '抄网' },
  { key: 'bait', label: '鱼饵' },
  { key: 'chum', label: '窝料' },
  { key: 'tank', label: '鱼缸' },
]

function ItemCard({ item, onBuy }: { item: EquipDef; onBuy: () => void }) {
  const inventory = useEquipmentStore((s) => s.inventory)
  const owned = inventory.filter((i) => i.id === item.id).reduce((sum, i) => sum + i.count, 0)
  const playerLevel = usePlayerStore((s) => s.level)
  const locked = playerLevel < item.unlockLevel

  return (
    <div
      className={`bg-gray-800/50 rounded-xl border p-3 transition-all ${
        locked ? 'border-white/5 opacity-60' : 'border-white/10 hover:border-cyan-500/30'
      }`}
    >
      {/* 名称 + 品牌 */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-sm font-bold text-white">{item.name}</div>
          {item.brand && <div className="text-xs text-white/40">{item.brand}</div>}
        </div>
        {owned > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
            x{owned}
          </span>
        )}
      </div>

      {/* 属性 */}
      <div className="flex gap-2 mb-2">
        {item.power != null && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 flex items-center gap-1">
            <Wrench className="w-3 h-3" />
            拉力 {item.power}
          </span>
        )}
        {item.rareBonus != null && item.rareBonus > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 flex items-center gap-1">
            <Star className="w-3 h-3" />
            稀有 +{item.rareBonus}%
          </span>
        )}
      </div>

      {/* 耐久 */}
      <div className="text-xs text-white/40 mb-3">耐久: {item.maxDurability}</div>

      {/* 价格 + 购买 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-yellow-400">{item.price}G</span>
        {locked ? (
          <span className="text-xs text-red-400">Lv.{item.unlockLevel}解锁</span>
        ) : (
          <button
            onClick={onBuy}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            购买
          </button>
        )}
      </div>
    </div>
  )
}

export function MarketPanel({ onClose }: MarketPanelProps) {
  const [activeCategory, setActiveCategory] = useState<EquipType>('rod')
  const spendGold = usePlayerStore((s) => s.spendGold)
  const addItem = useEquipmentStore((s) => s.addItem)

  const items = EQUIP_DB.filter((d) => d.type === activeCategory)

  const handleBuy = (item: EquipDef) => {
    if (spendGold(item.price)) {
      addItem(item.id, 1, item.maxDurability)
    }
  }

  return (
    <BasePanel title="商城" onClose={onClose}>
      {/* 分类标签 */}
      <div className="flex gap-1 mb-4 flex-wrap bg-gray-800/50 rounded-xl p-1">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex-1 min-w-[60px] py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-cyan-600/30 text-cyan-300 shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* 商品列表 */}
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onBuy={() => handleBuy(item)} />
        ))}
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-white/30">
          <ShoppingCart className="w-12 h-12 mb-3" />
          <span className="text-sm">该分类暂无商品</span>
        </div>
      )}
    </BasePanel>
  )
}
