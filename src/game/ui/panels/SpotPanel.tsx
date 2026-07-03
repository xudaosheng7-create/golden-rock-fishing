import { SPOTS } from '../../db/spots'
import { useWorldStore } from '../../store/useWorldStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { BasePanel } from '../BasePanel'
import { Lock, MapPin, DollarSign, Shield } from 'lucide-react'

interface SpotPanelProps {
  onClose: () => void
}

export function SpotPanel({ onClose }: SpotPanelProps) {
  const unlockedSpots = useWorldStore((s) => s.unlockedSpots)
  const currentSpot = useWorldStore((s) => s.currentSpot)
  const setCurrentSpot = useWorldStore((s) => s.setCurrentSpot)
  const playerLevel = usePlayerStore((s) => s.level)
  const spendGold = usePlayerStore((s) => s.spendGold)

  const handleSelect = (spot: (typeof SPOTS)[number]) => {
    if (unlockedSpots.includes(spot.id)) {
      if (spot.entryFee > 0) {
        const canPay = spendGold(spot.entryFee)
        if (!canPay) return
      }
      setCurrentSpot(spot.id)
      onClose()
    }
  }

  return (
    <BasePanel title="钓场选择" onClose={onClose}>
      <div className="space-y-3">
        {SPOTS.map((spot) => {
          const unlocked = unlockedSpots.includes(spot.id)
          const isCurrent = currentSpot === spot.id
          const locked = !unlocked

          return (
            <button
              key={spot.id}
              onClick={() => unlocked && handleSelect(spot)}
              disabled={locked}
              className={`w-full text-left rounded-xl p-4 transition-all duration-200 border ${
                isCurrent
                  ? 'border-cyan-400/60 bg-cyan-900/30 shadow-lg shadow-cyan-900/20'
                  : locked
                    ? 'border-white/5 bg-gray-800/30 opacity-50 cursor-not-allowed'
                    : 'border-white/10 bg-gray-800/50 hover:bg-gray-700/50 hover:border-cyan-500/30'
              }`}
            >
              {/* 顶部行：名称 + 区域 + 状态 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-base font-bold ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
                    {spot.name}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                    {spot.region}
                  </span>
                  <span className="text-xs text-white/40">{spot.province}</span>
                </div>
                <div className="flex items-center gap-1">
                  {locked && <Lock className="w-4 h-4 text-red-400" />}
                  {isCurrent && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      当前
                    </span>
                  )}
                </div>
              </div>

              {/* 描述 */}
              <p className="text-xs text-white/50 mb-3 line-clamp-2">{spot.description}</p>

              {/* 底部信息 */}
              <div className="flex items-center gap-4 text-xs text-white/60">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  入场费: {spot.entryFee > 0 ? `${spot.entryFee}G` : '免费'}
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  需求等级: {spot.unlockLevel}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {spot.depthRange[0]}m-{spot.depthRange[1]}m
                </span>
              </div>

              {/* 锁定提示 */}
              {locked && (
                <div className="mt-2 text-xs text-red-400">
                  {playerLevel >= spot.unlockLevel
                    ? '需要完成前置条件解锁'
                    : `需要 Lv.${spot.unlockLevel} 解锁 (当前 Lv.${playerLevel})`}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </BasePanel>
  )
}
