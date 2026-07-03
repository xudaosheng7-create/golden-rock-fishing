// ═══════════════════════════════════════
// 阿波浮漂指示器 — 屏幕左侧缩略视图
// ═══════════════════════════════════════

import { useFishingStore } from '../store/useFishingStore'

export function FloatIndicator() {
  const fishingState = useFishingStore((s) => s.fishingState)
  const currentFish = useFishingStore((s) => s.currentFish)
  const fishStamina = useFishingStore((s) => s.fishStamina)
  const fishMaxStamina = useFishingStore((s) => s.fishMaxStamina)
  const lineTension = useFishingStore((s) => s.lineTension)

  const showFloat = fishingState === 'waiting' || fishingState === 'biting' || fishingState === 'fighting'
  if (!showFloat && fishingState !== 'caught') return null

  const isBiting = fishingState === 'biting'
  const isFighting = fishingState === 'fighting'

  return (
    <div className="absolute left-3 top-1/3 z-30 flex flex-col items-center gap-2">
      {/* 阿波迷你图 */}
      <div className={`
        w-14 h-14 rounded-full flex items-center justify-center
        border-2 transition-all duration-200
        ${isBiting ? 'border-red-400 bg-red-500/20 animate-pulse-alert scale-110' : ''}
        ${isFighting ? 'border-yellow-400 bg-yellow-500/10' : ''}
        ${!isBiting && !isFighting ? 'border-white/20 bg-white/5' : ''}
      `}>
        {/* 简化的阿波图 */}
        <svg viewBox="0 0 40 60" className="w-8 h-10">
          {/* 天线 */}
          <line x1="20" y1="5" x2="20" y2="20" stroke="#333" strokeWidth="1" />
          <circle cx="20" cy="4" r="2.5" fill="#ff0000" />
          {/* 漂身 */}
          <ellipse cx="20" cy="30" rx="8" ry="12" fill="#ff3300" />
          <ellipse cx="20" cy="32" rx="7" ry="3" fill="#ccff00" opacity="0.8" />
          {/* 底部 */}
          <circle cx="20" cy="48" r="1.5" fill="none" stroke="#999" strokeWidth="0.8" />
        </svg>
      </div>

      {/* 状态文字 */}
      {isBiting && (
        <span className="text-[10px] text-red-400 font-bold animate-pulse-alert">咬钩!</span>
      )}
      {isFighting && currentFish && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] text-yellow-300 font-bold">{currentFish.name}</span>
          <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 rounded-full transition-all"
              style={{ width: `${fishMaxStamina > 0 ? (fishStamina / fishMaxStamina) * 100 : 0}%` }} />
          </div>
          <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${lineTension > 80 ? 'bg-red-500' : 'bg-blue-400'}`}
              style={{ width: `${lineTension}%` }} />
          </div>
        </div>
      )}
      {fishingState === 'caught' && (
        <span className="text-[10px] text-green-400 font-bold">鱼获!</span>
      )}
    </div>
  )
}
