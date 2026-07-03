// ═══════════════════════════════════════
// HUD — 顶栏 + 设置入口 + 广告入口
// ═══════════════════════════════════════

import { Coins, Gem, Zap, Settings, Play } from 'lucide-react'
import { usePlayerStore } from '../store/usePlayerStore'
import { useWorldStore } from '../store/useWorldStore'
import { useEquipmentStore } from '../store/useEquipmentStore'
import { useUIStore } from '../store/useUIStore'
import { useToastStore } from '../store/useToastStore'
import { AdManager, AdScene } from '../system/AdManager'
import { EQUIP_DB } from '../db/equip'

export function HUD() {
  const userProfile = usePlayerStore((s) => s.userProfile)
  const gold = usePlayerStore((s) => s.gold)
  const diamond = usePlayerStore((s) => s.diamond)
  const level = usePlayerStore((s) => s.level)
  const exp = usePlayerStore((s) => s.exp)
  const vitality = usePlayerStore((s) => s.vitality)
  const maxVitality = usePlayerStore((s) => s.maxVitality)
  const addGold = usePlayerStore((s) => s.addGold)

  const weather = useWorldStore((s) => s.weather)
  const tide = useWorldStore((s) => s.tide)
  const time = useWorldStore((s) => s.time)

  const eBait = useEquipmentStore((s) => s.eBait)
  const eChum = useEquipmentStore((s) => s.eChum)

  const openPanel = useUIStore((s) => s.openPanel)
  const addToast = useToastStore((s) => s.addToast)

  const expForLevel = level * 50 + 100
  const baitName = eBait ? EQUIP_DB.find((e) => e.id === eBait)?.name : '无鱼饵'
  const chumName = eChum ? EQUIP_DB.find((e) => e.id === eChum)?.name : '无窝料'

  // 看广告领金币
  const handleAdGold = () => {
    AdManager.showRewardedAd(AdScene.FREE_BAIT, (success) => {
      if (success) {
        addGold(200)
        addToast('观看广告 +200 金币', 'success')
      }
    })
  }

  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-[env(safe-area-inset-top,8px)]">
      {/* 顶部暗色渐变底 — 防白底天空看不清文字 */}
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }} />
      <div className="relative flex items-center justify-between gap-2">
        {/* 左：头像 + 等级 + 体力 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-ocean-700 flex items-center justify-center text-xl border-2 border-ocean-400 shrink-0">
            {userProfile?.avatarUrl || '🎣'}
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-medium leading-tight truncate">
              {userProfile?.nickname || '钓友'}
            </div>
            <div className="flex items-center gap-1 text-xs text-ocean-300">
              <span>Lv.{level}</span>
              <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-ocean-400 rounded-full transition-all"
                  style={{ width: `${(exp / expForLevel) * 100}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Zap className="w-3 h-3 text-yellow-400" />
              <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${(vitality / maxVitality) * 100}%` }} />
              </div>
              <span className="text-[10px] text-white/50">{vitality}/{maxVitality}</span>
            </div>
          </div>
        </div>

        {/* 中：天气 */}
        <div className="flex flex-col items-center gap-0.5 text-[10px] text-white/70 shrink-0">
          <span>{weather} · {tide}</span>
          <span className="text-white/50">{time}</span>
        </div>

        {/* 右：货币 + 广告入口 */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-0.5 text-gold-400">
              <Coins className="w-3 h-3" />
              {gold.toLocaleString()}
            </span>
            <span className="flex items-center gap-0.5 text-diamond-400">
              <Gem className="w-3 h-3" />
              {diamond}
            </span>
          </div>
          <div className="text-[10px] text-white/40">
            <span>{baitName}</span>
            <span className="mx-1">|</span>
            <span>{chumName}</span>
          </div>
        </div>
      </div>

      {/* 右上角：设置 */}
      <div className="absolute right-3 top-[88px] z-30">
        <button
          onClick={() => openPanel('settings')}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-white/20 transition-colors border border-white/20"
        >
          <Settings className="w-4 h-4 text-white/80" />
        </button>
      </div>

      {/* 左上角头像下方：领金币 */}
      <div className="absolute left-3 top-[96px] z-30">
        <button
          onClick={handleAdGold}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/25 active:scale-95 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-yellow-400" />
          <span className="text-xs font-medium">领金币</span>
        </button>
      </div>
    </div>
  )
}
