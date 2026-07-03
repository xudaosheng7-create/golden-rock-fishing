// ═══════════════════════════════════════
// 鱼护面板 — 查看/出售鱼获 + 广告倍率
// ═══════════════════════════════════════

import { useEquipmentStore } from '../../store/useEquipmentStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useToastStore } from '../../store/useToastStore'
import { FISH_DB } from '../../db/fish/index'
import { calculateFishPrice, calculateFishExp } from '../../system/Economy'
import { AdManager, AdScene } from '../../system/AdManager'
import { BasePanel } from '../BasePanel'
import { Wallet, Play, Ship } from 'lucide-react'
import type { BasketFish } from '../../types'

interface BasketPanelProps { onClose: () => void }

export function BasketPanel({ onClose }: BasketPanelProps) {
  const basket = useEquipmentStore((s) => s.basket)
  const removeFishFromBasket = useEquipmentStore((s) => s.removeFishFromBasket)
  const clearBasket = useEquipmentStore((s) => s.clearBasket)
  const addGold = usePlayerStore((s) => s.addGold)
  const addExp = usePlayerStore((s) => s.addExp)
  const goldBonus = usePlayerStore((s) => s.getGoldBonus())
  const addToast = useToastStore((s) => s.addToast)

  const totalPrice = basket.reduce((sum, f) => {
    const fd = FISH_DB.find((d) => d.id === f.fishId)
    return fd ? sum + calculateFishPrice(fd, f.weight, goldBonus) : sum
  }, 0)

  const sellOne = (fish: BasketFish) => {
    const fd = FISH_DB.find((d) => d.id === fish.fishId)
    if (!fd) return
    const p = calculateFishPrice(fd, fish.weight, goldBonus)
    addGold(p)
    addExp(calculateFishExp(fd, fish.weight))
    removeFishFromBasket(fish.id)
    addToast(`售出 ${fd.name} +${p}💰`, 'success')
  }

  const sellOne3x = (fish: BasketFish) => {
    const fd = FISH_DB.find((d) => d.id === fish.fishId)
    if (!fd) return
    const p = calculateFishPrice(fd, fish.weight, goldBonus)
    const exp = calculateFishExp(fd, fish.weight)
    AdManager.showRewardedAd(AdScene.SINGLE_SELL_3X, (ok) => {
      if (ok) { addGold(p * 3); addExp(exp); removeFishFromBasket(fish.id); addToast(`3倍! ${fd.name} +${p*3}💰`, 'success') }
    })
  }

  const sellAllNormal = () => {
    if (basket.length === 0) return
    const fish = clearBasket()
    let t = 0; let te = 0
    for (const f of fish) { const fd = FISH_DB.find((d) => d.id === f.fishId); if (fd) { t += calculateFishPrice(fd, f.weight, goldBonus); te += calculateFishExp(fd, f.weight) } }
    if (t > 0) { addGold(t); addExp(te); addToast(`全部出售 +${t}💰`, 'success') }
  }

  const sellAll2x = () => {
    if (basket.length === 0) return
    AdManager.showRewardedAd(AdScene.BATCH_SELL_2X, (ok) => {
      if (ok) {
        const fish = clearBasket()
        let t = 0; let te = 0
        for (const f of fish) { const fd = FISH_DB.find((d) => d.id === f.fishId); if (fd) { t += calculateFishPrice(fd, f.weight, goldBonus); te += calculateFishExp(fd, f.weight) } }
        addGold(t * 2); addExp(te)
        addToast(`2倍批量! +${t * 2}💰`, 'success')
      }
    })
  }

  return (
    <BasePanel title="鱼护" onClose={onClose}>
      {basket.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-white/30">
          <Ship className="w-16 h-16 mb-4 opacity-20" />
          <span className="text-base">鱼护空空</span>
          <span className="text-xs mt-1">去钓几条鱼吧 🎣</span>
        </div>
      ) : (
        <>
          {/* 汇总栏 */}
          <div className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-3 mb-3 border border-white/5">
            <div>
              <span className="text-sm text-white font-bold">{basket.length} 条鱼</span>
              <span className="text-xs text-white/40 ml-2">总价值</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gold-400">{totalPrice.toLocaleString()}</div>
              <div className="text-[10px] text-white/30">金币</div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 mb-4">
            <button onClick={sellAllNormal}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600/20 border border-green-500/30 text-green-300 text-sm font-medium hover:bg-green-600/30 transition-colors">
              <Wallet className="w-4 h-4" />出售全部
            </button>
            <button onClick={sellAll2x}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-sm font-medium hover:bg-yellow-500/30 transition-colors">
              <Play className="w-4 h-4" />2倍批量
            </button>
          </div>

          {/* 鱼获列表 */}
          <div className="space-y-2">
            {basket.map((fish: BasketFish) => {
              const fd = FISH_DB.find((d) => d.id === fish.fishId)
              const price = fd ? calculateFishPrice(fd, fish.weight, goldBonus) : 0
              return (
                <div key={fish.id}
                  className="flex items-center gap-3 bg-gray-800/30 rounded-xl px-3 py-2.5 border border-white/5">
                  {/* 鱼emoji */}
                  <div className="text-2xl shrink-0">{fishIcon(fd?.rarity ?? 1)}</div>
                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium truncate">{fd?.name ?? fish.fishId}</span>
                      <span className="text-[10px] text-yellow-400">{'★'.repeat(fd?.rarity ?? 1)}</span>
                    </div>
                    <div className="text-xs text-white/40">{fish.weight.toFixed(1)}kg · {price}金币</div>
                  </div>
                  {/* 出售按钮 */}
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => sellOne(fish)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-green-600/20 text-green-300 hover:bg-green-600/30 transition-colors">
                      出售
                    </button>
                    <button onClick={() => sellOne3x(fish)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition-colors flex items-center gap-0.5">
                      <Play className="w-2.5 h-2.5" />3倍
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </BasePanel>
  )
}

function fishIcon(rarity: number): string {
  const icons: Record<number, string> = { 1: '🐟', 2: '🐠', 3: '🐡', 4: '🦈', 5: '🐋' }
  return icons[rarity] ?? '🐟'
}
