// ═══════════════════════════════════════
// 鱼类图鉴 — FISH_DB 真实数据 + 真实图片
// ═══════════════════════════════════════

import { useState, useRef, useEffect } from 'react'
import { useCollectionStore } from '../../store/useCollectionStore'
import { FISH_DB } from '../../db/fish/index'
import { FISH_IMAGES } from '../../real_fish_assets'
import { BasePanel } from '../BasePanel'
import { ArrowLeft } from 'lucide-react'
import { RARITY_STAR, RARITY_LABEL } from '../../types'
import type { Rarity, FishDef } from '../../types'

interface BookPanelProps { onClose: () => void }

export function BookPanel({ onClose }: BookPanelProps) {
  const collection = useCollectionStore((s) => s.collection)
  const [detailFish, setDetailFish] = useState<FishDef | null>(null)

  // 详情视图
  if (detailFish) {
    const record = collection[detailFish.id]
    return (
      <BasePanel title={detailFish.name} onClose={onClose}>
        <button onClick={() => setDetailFish(null)}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white mb-3">
          <ArrowLeft className="w-3 h-3" />返回图鉴
        </button>

        {/* 鱼图 */}
        <div className="rounded-xl overflow-hidden mb-3 bg-black flex items-center justify-center" style={{ minHeight: 200 }}>
          <img
            src={FISH_IMAGES[detailFish.id]}
            alt={detailFish.name}
            className="w-full max-h-64 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>

        {/* 基本信息 */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl font-bold text-white">{detailFish.name}</span>
          <span className="text-sm text-yellow-400">{RARITY_STAR[detailFish.rarity]}</span>
          <span className="text-xs text-white/40">{RARITY_LABEL[detailFish.rarity]}</span>
        </div>

        <p className="text-xs text-white/30 italic mb-3">{detailFish.scientificName}</p>

        {/* 信息卡片 */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <InfoCard label="科属" value={detailFish.family} />
          <InfoCard label="体重" value={`${detailFish.minW}-${detailFish.maxW} kg`} />
          <InfoCard label="习性" value={detailFish.habit} />
          <InfoCard label="分布" value={detailFish.distribution} />
        </div>

        {/* 描述 */}
        <p className="text-xs text-white/60 leading-relaxed mb-3">{detailFish.desc}</p>

        {/* 收集记录 */}
        {record && (
          <div className="bg-gray-800/50 rounded-xl p-3 border border-white/5">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">捕获次数</span>
              <span className="text-white">{record.count} 次</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-white/40">最大记录</span>
              <span className="text-gold-400">{record.maxWeight.toFixed(1)} kg</span>
            </div>
          </div>
        )}

        {/* 世界纪录 */}
        {detailFish.worldRecord && (
          <div className="bg-yellow-900/20 rounded-xl p-3 border border-yellow-500/20 mt-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">世界纪录</span>
              <span className="text-yellow-400">{detailFish.worldRecord} kg</span>
            </div>
          </div>
        )}
      </BasePanel>
    )
  }

  // 图鉴网格视图
  const collectedCount = Object.keys(collection).length

  return (
    <BasePanel title={`鱼类图鉴 (${collectedCount}/100)`} onClose={onClose}>
      <div className="grid grid-cols-5 gap-1 bg-black">
        {FISH_DB.map((fish) => {
          const record = collection[fish.id]
          return (
            <FishCard
              key={fish.id}
              fish={fish}
              collected={!!record}
              record={record}
              onClick={() => setDetailFish(fish)}
            />
          )
        })}
      </div>
    </BasePanel>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-2">
      <div className="text-white/30 text-[10px]">{label}</div>
      <div className="text-white/70 text-xs mt-0.5 truncate">{value}</div>
    </div>
  )
}

// ── 鱼卡（带真实图片）──
function FishCard({
  fish,
  collected,
  record,
  onClick,
}: {
  fish: FishDef
  collected: boolean
  record?: { count: number; maxWeight: number }
  onClick: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { rootMargin: '200px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const rarityBorders: Record<Rarity, string> = {
    1: 'border-gray-500/30', 2: 'border-green-500/30', 3: 'border-blue-500/30',
    4: 'border-purple-500/30', 5: 'border-yellow-500/30',
  }

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`rounded-md transition-all text-center min-h-[80px] overflow-hidden ${
        collected ? `${rarityBorders[fish.rarity]} border bg-black hover:border-cyan-500/50` : 'border border-white/5 bg-black/80 opacity-45'
      }`}
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 80px' }}
    >
      {visible ? (
        collected ? (
          <>
            <div className="w-full h-14 bg-black flex items-center justify-center overflow-hidden">
              <img
                src={FISH_IMAGES[fish.id]}
                alt={fish.name}
                className="w-full h-full object-contain"
                                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
            <div className="px-1 pb-1">
              <div className="text-[10px] font-medium text-white truncate">{fish.name}</div>
              <div className="text-[9px] text-yellow-400">{RARITY_STAR[fish.rarity]}</div>
            </div>
          </>
        ) : (
          <>
            <div className="w-full h-14 flex items-center justify-center bg-gray-800/60">
              <span className="text-2xl opacity-15">?</span>
            </div>
            <div className="text-[10px] text-gray-500 py-1">???</div>
          </>
        )
      ) : (
        <div className="h-[80px]" />
      )}
    </button>
  )
}
