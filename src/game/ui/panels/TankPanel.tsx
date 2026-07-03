import { useState } from 'react'
import { useCollectionStore } from '../../store/useCollectionStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useEquipmentStore } from '../../store/useEquipmentStore'
import { useToastStore } from '../../store/useToastStore'
import { FISH_DB } from '../../db/fish/index'
import { calculateFishPrice } from '../../system/Economy'
import { BasePanel } from '../BasePanel'
import { AdManager, AdScene } from '../../system/AdManager'
import { Fish, Clock, Weight, CircleDollarSign, FishSymbol, Play, X, Trash2, Wallet } from 'lucide-react'
import type { TankFish } from '../../types'

interface TankPanelProps { onClose: () => void }

function formatTime(timestamp: number): string {
  const hours = Math.floor((Date.now() - timestamp) / 3600000)
  if (hours < 1) return '不到1小时'
  if (hours < 24) return `${hours}小时`
  const days = Math.floor(hours / 24)
  return `${days}天${hours % 24}小时`
}

export function TankPanel({ onClose }: TankPanelProps) {
  const tank = useCollectionStore((s) => s.tank)
  const tankCapacity = useCollectionStore((s) => s.tankCapacity)
  const tankGoldPool = useCollectionStore((s) => s.tankGoldPool)
  const collectTankGold = useCollectionStore((s) => s.collectTankGold)
  const removeFishFromTank = useCollectionStore((s) => s.removeFishFromTank)
  const addGold = usePlayerStore((s) => s.addGold)
  const goldBonus = usePlayerStore((s) => s.getGoldBonus())
  const addFishToBasket = useEquipmentStore((s) => s.addFishToBasket)
  const addToast = useToastStore((s) => s.addToast)

  const [removeTarget, setRemoveTarget] = useState<TankFish | null>(null)

  const handleCollect = () => {
    const gold = collectTankGold()
    if (gold > 0) { addGold(gold); addToast(`收取 ${gold} 金币`, 'success') }
  }

  const handleSpeedCollect = () => {
    if (tankGoldPool <= 0) return
    AdManager.showRewardedAd(AdScene.SPEED_TANK, (ok) => {
      if (ok) {
        const gold = collectTankGold()
        if (gold > 0) { addGold(gold * 2); addToast(`双倍! +${gold * 2}💰`, 'success') }
      }
    })
  }

  // 卖掉鱼缸里的鱼
  const handleSell = (fish: TankFish) => {
    const fd = FISH_DB.find((d) => d.id === fish.fishId)
    if (!fd) return
    const price = calculateFishPrice(fd, fish.weight, goldBonus)
    addGold(price)
    removeFishFromTank(fish.id)
    addToast(`售出 ${fd.name} +${price}💰`, 'success')
    setRemoveTarget(null)
  }

  // 放生鱼缸里的鱼
  const handleRelease = (fish: TankFish) => {
    removeFishFromTank(fish.id)
    addToast('已放生', 'info')
    setRemoveTarget(null)
  }

  // 移到鱼护
  const handleMoveToBasket = (fish: TankFish) => {
    addFishToBasket({
      id: `basket_${Date.now()}`,
      fishId: fish.fishId,
      weight: fish.weight,
      caughtAt: Date.now(),
    })
    removeFishFromTank(fish.id)
    addToast('已移到鱼护', 'success')
    setRemoveTarget(null)
  }

  return (
    <BasePanel title="鱼缸" onClose={onClose}>
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between mb-4 bg-gray-800/50 rounded-xl px-4 py-3 border border-white/10">
        <div className="flex items-center gap-2">
          <FishSymbol className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-white/60">
            容量: <span className="text-white font-bold">{tank.length}</span>
            <span className="text-white/40">/{tankCapacity}</span>
          </span>
        </div>
        <button
          onClick={handleCollect}
          disabled={tankGoldPool <= 0}
          className={`flex items-center gap-1 text-sm px-4 py-1.5 rounded-lg transition-all ${
            tankGoldPool > 0
              ? 'bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30 border border-yellow-500/30'
              : 'bg-gray-700/50 text-white/30 cursor-not-allowed border border-white/5'
          }`}
        >
          <CircleDollarSign className="w-4 h-4" />
          收取 {tankGoldPool}G
        </button>
        <button
          onClick={handleSpeedCollect}
          disabled={tankGoldPool <= 0}
          className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-all ${
            tankGoldPool > 0
              ? 'bg-green-700/30 text-green-300 hover:bg-green-700/40 border border-green-500/30'
              : 'bg-gray-700/50 text-white/30 cursor-not-allowed border border-white/5'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-green-300" />
          加速收取
        </button>
      </div>

      {/* 鱼缸网格 */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: tankCapacity }, (_, i) => {
          const fish = tank[i]

          if (!fish) {
            return (
              <div
                key={`empty-${i}`}
                className="bg-gray-800/20 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center py-8"
              >
                <Fish className="w-8 h-8 text-white/10 mb-2" />
                <span className="text-xs text-white/20">空闲鱼缸位</span>
              </div>
            )
          }

          const fishDef = FISH_DB.find((d) => d.id === fish.fishId)
          return (
            <div
              key={fish.id}
              className="bg-gray-800/50 rounded-xl border border-white/10 p-3 relative group"
            >
              {/* 移除按钮 */}
              <button
                onClick={() => setRemoveTarget(fish)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-red-300" />
              </button>

              {/* 鱼图标 */}
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">
                {fishRarityIcon(fishDef?.rarity ?? 1)}
              </div>

              <div className="text-center">
                <div className="text-xs font-medium text-white truncate">{fishDef?.name ?? fish.fishId}</div>
                <div className="text-[10px] text-white/50 mt-0.5 flex items-center justify-center gap-1">
                  <Weight className="w-3 h-3" />
                  {fish.weight.toFixed(1)}kg
                </div>
                <div className="text-[10px] text-white/30 mt-0.5 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(fish.caughtAt)}
                </div>
                <div className="text-[10px] text-yellow-400 mt-1">
                  ~{Math.floor(fish.weight * 0.5)}G/h
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 移除确认弹窗 */}
      {removeTarget && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 rounded-2xl" onClick={() => setRemoveTarget(null)}>
          <div className="bg-gray-800 border border-white/10 rounded-xl p-4 w-56 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-white text-center mb-3">
              如何处理 <span className="text-cyan-300">{FISH_DB.find(d => d.id === removeTarget.fishId)?.name}</span>？
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleSell(removeTarget)}
                className="w-full py-2 rounded-lg bg-gold-500/20 text-gold-300 text-sm hover:bg-gold-500/30 flex items-center justify-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />卖掉
              </button>
              <button onClick={() => handleMoveToBasket(removeTarget)}
                className="w-full py-2 rounded-lg bg-blue-500/20 text-blue-300 text-sm hover:bg-blue-500/30 flex items-center justify-center gap-1.5">
                <FishSymbol className="w-3.5 h-3.5" />移到鱼护
              </button>
              <button onClick={() => handleRelease(removeTarget)}
                className="w-full py-2 rounded-lg bg-red-500/20 text-red-300 text-sm hover:bg-red-500/30 flex items-center justify-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />放生
              </button>
            </div>
            <button onClick={() => setRemoveTarget(null)}
              className="w-full mt-2 py-1.5 text-xs text-white/30 hover:text-white/50">取消</button>
          </div>
        </div>
      )}
    </BasePanel>
  )
}

function fishRarityIcon(rarity: number): string {
  const icons: Record<number, string> = { 1: '🐟', 2: '🐠', 3: '🐡', 4: '🦈', 5: '🐋' }
  return icons[rarity] ?? '🐟'
}
