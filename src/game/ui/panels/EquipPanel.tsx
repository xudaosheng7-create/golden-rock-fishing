import { useState } from 'react'
import { useEquipmentStore } from '../../store/useEquipmentStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { EQUIP_DB } from '../../db/equip/index'
import { calculateRepairCost } from '../../system/Economy'
import { BasePanel } from '../BasePanel'
import { Wrench, Star, RotateCcw, Crosshair, Swords, Gauge, Shield } from 'lucide-react'
import type { EquipType } from '../../types'
import { EQUIP_TYPE_LABEL } from '../../types'

interface EquipPanelProps {
  onClose: () => void
}

// 装备槽位配置：slot key -> 类型
const EQUIP_SLOTS: { key: string; label: string; type: EquipType; icon: typeof Wrench }[] = [
  { key: 'eRod', label: '渔竿', type: 'rod', icon: Swords },
  { key: 'eLine', label: '渔线', type: 'line', icon: Gauge },
  { key: 'eHook', label: '渔钩', type: 'hook', icon: Crosshair },
  { key: 'eFloat', label: '浮漂', type: 'float', icon: Crosshair },
  { key: 'eReel', label: '卷线器', type: 'reel', icon: RotateCcw },
  { key: 'eNet', label: '抄网', type: 'net', icon: Shield },
  { key: 'eBait', label: '鱼饵', type: 'bait', icon: Star },
  { key: 'eChum', label: '窝料', type: 'chum', icon: Star },
]

function EquipSlot({
  slotKey,
  label,
  Icon,
  onSelect,
}: {
  slotKey: string
  label: string
  Icon: typeof Wrench
  onSelect: () => void
}) {
  const equippedId = useEquipmentStore(
    (s) => (s as unknown as Record<string, string | null>)[slotKey] as string | null
  )
  const inventory = useEquipmentStore((s) => s.inventory)
  const equippedItem = equippedId ? EQUIP_DB.find((d) => d.id === equippedId) : null
  const equipInv = equippedId ? inventory.find((i) => i.id === equippedId) : null
  const durability = equipInv?.durability ?? equippedItem?.maxDurability ?? 0
  const maxDur = equippedItem?.maxDurability ?? 0
  const durPercent = maxDur > 0 ? (durability / maxDur) * 100 : 0

  return (
    <button
      onClick={onSelect}
      className="w-full bg-gray-800/50 rounded-xl border border-white/10 p-3 hover:bg-gray-700/50 transition-all text-left"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-700/50 flex items-center justify-center shrink-0">
          <Icon className={`w-4 h-4 ${equippedItem ? 'text-cyan-400' : 'text-white/20'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">{label}</span>
            {equippedItem && (
              <span className="text-xs text-cyan-400">
                {equippedItem.power != null ? `+${equippedItem.power}` : ''}
              </span>
            )}
          </div>
          <div className="text-sm text-white font-medium truncate">
            {equippedItem?.name ?? <span className="text-white/30">未装备</span>}
          </div>
          {equippedItem && maxDur > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    durPercent < 30 ? 'bg-red-500' : durPercent < 60 ? 'bg-yellow-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${durPercent}%` }}
                />
              </div>
              <span className="text-xs text-white/40">
                {durability}/{maxDur}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function SelectionPanel({
  equipType,
  onSelect,
  onBack,
}: {
  equipType: EquipType
  onSelect: (id: string) => void
  onBack: () => void
}) {
  const inventory = useEquipmentStore((s) => s.inventory)
  const equipDefs = EQUIP_DB.filter((d) => d.type === equipType)

  const availableItems = equipDefs.filter((def) =>
    inventory.some((inv) => inv.id === def.id && inv.count > 0)
  )

  return (
    <div>
      <button onClick={onBack} className="text-xs text-cyan-400 hover:text-cyan-300 mb-4">
        &larr; 返回装备管理
      </button>

      <div className="text-sm font-bold text-white mb-3">
        选择 {EQUIP_TYPE_LABEL[equipType]}
      </div>

      {availableItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-white/30">
          <Wrench className="w-12 h-12 mb-3" />
          <span className="text-sm">没有可用的{EQUIP_TYPE_LABEL[equipType]}</span>
          <span className="text-xs mt-2">请在商城中购买</span>
        </div>
      ) : (
        <div className="space-y-2">
          {availableItems.map((item) => {
            const inv = inventory.find((i) => i.id === item.id)
            const dur = inv?.durability ?? item.maxDurability
            const durPercent = (dur / item.maxDurability) * 100
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="w-full bg-gray-800/50 rounded-xl border border-white/10 p-3 hover:bg-gray-700/50 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white font-medium">{item.name}</div>
                    <div className="flex gap-2 mt-1">
                      {item.power != null && (
                        <span className="text-xs text-blue-400">拉力 {item.power}</span>
                      )}
                      {item.rareBonus != null && item.rareBonus > 0 && (
                        <span className="text-xs text-purple-400">稀有 +{item.rareBonus}%</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-white/40">x{inv?.count ?? 1}</span>
                </div>
                {item.maxDurability > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          durPercent < 30 ? 'bg-red-500' : durPercent < 60 ? 'bg-yellow-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${durPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/40">{dur}/{item.maxDurability}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function EquipPanel({ onClose }: EquipPanelProps) {
  const [selectedSlot, setSelectedSlot] = useState<EquipType | null>(null)
  const equip = useEquipmentStore((s) => s.equip)
  const inventory = useEquipmentStore((s) => s.inventory)
  const spendGold = usePlayerStore((s) => s.spendGold)

  // 在选择面板中选择装备
  const handleSelect = (id: string) => {
    if (!selectedSlot) return
    // 找到 slot key
    const slotConfig = EQUIP_SLOTS.find((s) => s.type === selectedSlot)
    if (slotConfig) {
      equip(slotConfig.key as any, id)
    }
    setSelectedSlot(null)
  }

  if (selectedSlot) {
    return (
      <BasePanel title="装备管理" onClose={onClose}>
        <SelectionPanel
          equipType={selectedSlot}
          onSelect={handleSelect}
          onBack={() => setSelectedSlot(null)}
        />
      </BasePanel>
    )
  }

  // 计算总属性
  const getEquippedItem = (slotKey: string) => {
    const store = useEquipmentStore.getState()
    const id = (store as unknown as Record<string, string | null>)[slotKey] as string | null
    return id ? EQUIP_DB.find((d) => d.id === id) : null
  }

  const totalPower = EQUIP_SLOTS.reduce((sum, slot) => {
    const item = getEquippedItem(slot.key)
    return sum + (item?.power ?? 0)
  }, 0)

  const totalRareBonus = EQUIP_SLOTS.reduce((sum, slot) => {
    const item = getEquippedItem(slot.key)
    return sum + (item?.rareBonus ?? 0)
  }, 0)

  // 修理
  const handleRepairAll = () => {
    for (const slot of EQUIP_SLOTS) {
      const store = useEquipmentStore.getState()
      const equippedId = (store as unknown as Record<string, string | null>)[slot.key] as string | null
      if (!equippedId) continue
      const def = EQUIP_DB.find((d) => d.id === equippedId)
      const inv = inventory.find((i) => i.id === equippedId)
      if (!def || !inv || inv.durability === undefined) continue
      if (inv.durability >= def.maxDurability) continue

      const cost = calculateRepairCost(def.maxDurability, inv.durability, def.price)
      if (cost > 0 && spendGold(cost)) {
        useEquipmentStore.getState().setDurability(equippedId, def.maxDurability)
      }
    }
  }

  return (
    <BasePanel title="装备管理" onClose={onClose}>
      {/* 总属性 */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-gray-800/50 rounded-xl px-3 py-2.5 border border-white/5 text-center">
          <div className="text-xs text-white/40">总拉力</div>
          <div className="text-sm font-bold text-blue-400">{totalPower}</div>
        </div>
        <div className="flex-1 bg-gray-800/50 rounded-xl px-3 py-2.5 border border-white/5 text-center">
          <div className="text-xs text-white/40">稀有加成</div>
          <div className="text-sm font-bold text-purple-400">+{totalRareBonus}%</div>
        </div>
      </div>

      {/* 修理按钮 */}
      <button
        onClick={handleRepairAll}
        className="w-full mb-4 py-2 rounded-lg bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30 border border-yellow-500/30 text-sm font-medium transition-all flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        全部修理
      </button>

      {/* 装备槽位 */}
      <div className="space-y-2">
        {EQUIP_SLOTS.map((slot) => (
          <EquipSlot
            key={slot.key}
            slotKey={slot.key}
            label={slot.label}
            Icon={slot.icon}
            onSelect={() => setSelectedSlot(slot.type)}
          />
        ))}
      </div>
    </BasePanel>
  )
}
