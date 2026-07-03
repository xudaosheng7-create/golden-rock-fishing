import { useState, useMemo } from 'react'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useCollectionStore } from '../../store/useCollectionStore'
import { BasePanel } from '../BasePanel'
import { Medal, User } from 'lucide-react'

interface RankPanelProps {
  onClose: () => void
}

type RankTab = 'level' | 'gold' | 'book' | 'maxweight'

const TABS: { key: RankTab; label: string }[] = [
  { key: 'level', label: '等级' },
  { key: 'gold', label: '金币' },
  { key: 'book', label: '图鉴' },
  { key: 'maxweight', label: '最大单尾' },
]

interface RankEntry {
  rank: number
  name: string
  value: number
}

const MEDAL_COLORS = [
  'text-yellow-400',
  'text-gray-300',
  'text-amber-700',
]

// 模拟 NPC 排行榜数据（基于玩家数值上下浮动）
function generateNPCRanks(
  tab: RankTab,
  playerValue: number,
): RankEntry[] {
  switch (tab) {
    case 'level': {
      const base = Math.max(playerValue, 1)
      return [
        { rank: 1, name: '海钓王', value: base + 12 },
        { rank: 2, name: '深海猎手', value: base + 9 },
        { rank: 3, name: '浪里白条', value: base + 6 },
        { rank: 4, name: '钓鱼大师', value: base + 4 },
        { rank: 5, name: '渔人码头', value: base + 2 },
        { rank: 6, name: '大鱼终结者', value: base - 1 },
        { rank: 7, name: '海角钓客', value: base - 2 },
        { rank: 8, name: '碧波钓叟', value: base - 4 },
        { rank: 9, name: '潮汐猎人', value: base - 6 },
        { rank: 10, name: '渔乐无穷', value: base - 8 },
      ]
    }
    case 'gold': {
      const base = Math.max(playerValue, 1000)
      return [
        { rank: 1, name: '金币大王', value: base * 3 },
        { rank: 2, name: '财源广进', value: base * 2 },
        { rank: 3, name: '富甲一方', value: Math.floor(base * 1.5) },
        { rank: 4, name: '日进斗金', value: Math.floor(base * 1.2) },
        { rank: 5, name: '金玉满堂', value: Math.floor(base * 1.05) },
        { rank: 6, name: '招财进宝', value: Math.floor(base * 0.9) },
        { rank: 7, name: '黄金渔夫', value: Math.floor(base * 0.7) },
        { rank: 8, name: '富贵有余', value: Math.floor(base * 0.5) },
        { rank: 9, name: '财富猎人', value: Math.floor(base * 0.3) },
        { rank: 10, name: '小有积蓄', value: Math.floor(base * 0.15) },
      ]
    }
    case 'book': {
      const base = Math.max(playerValue, 1)
      return [
        { rank: 1, name: '百科全书', value: Math.min(100, base + 30) },
        { rank: 2, name: '鱼类博士', value: Math.min(100, base + 20) },
        { rank: 3, name: '博物学家', value: Math.min(100, base + 12) },
        { rank: 4, name: '收集达人', value: Math.min(100, base + 6) },
        { rank: 5, name: '图鉴猎人', value: Math.min(100, base + 2) },
        { rank: 6, name: '物种记录者', value: Math.min(100, base - 1) },
        { rank: 7, name: '鱼类爱好者', value: Math.min(100, base - 3) },
        { rank: 8, name: '探索先锋', value: Math.min(100, base - 6) },
        { rank: 9, name: '初出茅庐', value: Math.min(100, base - 10) },
        { rank: 10, name: '好奇钓手', value: Math.min(100, base - 15) },
      ]
    }
    case 'maxweight': {
      const base = Math.max(playerValue, 1)
      return [
        { rank: 1, name: '巨物猎手', value: Math.round((base * 3.5) * 10) / 10 },
        { rank: 2, name: '深海巨人', value: Math.round((base * 2.5) * 10) / 10 },
        { rank: 3, name: '大鱼征服者', value: Math.round((base * 1.8) * 10) / 10 },
        { rank: 4, name: '磅秤终结者', value: Math.round((base * 1.4) * 10) / 10 },
        { rank: 5, name: '重量级选手', value: Math.round((base * 1.1) * 10) / 10 },
        { rank: 6, name: '大力渔夫', value: Math.round((base * 0.9) * 10) / 10 },
        { rank: 7, name: '海洋力士', value: Math.round((base * 0.7) * 10) / 10 },
        { rank: 8, name: '潜力钓手', value: Math.round((base * 0.5) * 10) / 10 },
        { rank: 9, name: '稳步提升', value: Math.round((base * 0.3) * 10) / 10 },
        { rank: 10, name: '新人上路', value: Math.round((base * 0.15) * 10) / 10 },
      ]
    }
  }
}

function getPlayerRank(
  data: RankEntry[],
  playerValue: number,
): number {
  // Find where the player would rank
  const allValues = [...data.map((e) => e.value), playerValue].sort((a, b) => b - a)
  return allValues.indexOf(playerValue) + 1
}

function RankList({
  tab,
  playerValue,
  valueSuffix,
  playerLabel,
}: {
  tab: RankTab
  playerValue: number
  valueSuffix: string
  playerLabel: string
}) {
  const data = useMemo(() => generateNPCRanks(tab, playerValue), [tab, playerValue])
  const playerRank = getPlayerRank(data, playerValue)

  // Determine display format
  const formatValue = (v: number, suffix: string) => {
    if (suffix === 'G' && v >= 10000) {
      return `${(v / 10000).toFixed(1)}万G`
    }
    if (suffix === 'kg') return `${v.toFixed(1)}kg`
    return `${v}${suffix}`
  }

  return (
    <div>
      <div className="space-y-2">
        {data.map((entry) => {
          const isMedal = entry.rank <= 3
          return (
            <div
              key={entry.rank}
              className="flex items-center gap-3 bg-gray-800/50 rounded-xl px-4 py-3 border border-white/5"
            >
              <div className="w-7 text-center">
                {isMedal ? (
                  <Medal className={`w-5 h-5 ${MEDAL_COLORS[entry.rank - 1]} mx-auto`} />
                ) : (
                  <span className="text-sm text-white/40">{entry.rank}</span>
                )}
              </div>
              <User className="w-4 h-4 text-white/40 shrink-0" />
              <span className="flex-1 text-sm text-white">{entry.name}</span>
              <span className="text-sm font-bold text-cyan-300">
                {formatValue(entry.value, valueSuffix)}
              </span>
            </div>
          )
        })}
      </div>

      {/* 当前玩家高亮行 */}
      <div className="mt-4 bg-cyan-900/30 rounded-xl px-4 py-3 border border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="w-7 text-center">
            <span className="text-sm text-cyan-300">#{playerRank}</span>
          </div>
          <User className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="flex-1 text-sm text-white">
            {playerLabel} <span className="text-white/40 text-xs">(我)</span>
          </span>
          <span className="text-sm font-bold text-cyan-300">
            {formatValue(playerValue, valueSuffix)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function RankPanel({ onClose }: RankPanelProps) {
  const [activeTab, setActiveTab] = useState<RankTab>('level')

  const playerGold = usePlayerStore((s) => s.gold)
  const playerLevel = usePlayerStore((s) => s.level)
  const playerProfile = usePlayerStore((s) => s.userProfile)
  const collection = useCollectionStore((s) => s.collection)
  const collectedCount = useCollectionStore((s) => s.getCollectionCount)

  const playerName = playerProfile?.nickname ?? '玩家'

  // 计算最大单尾重量
  const maxWeight = useMemo(() => {
    let max = 0
    for (const record of Object.values(collection)) {
      if (record.maxWeight > max) max = record.maxWeight
    }
    return max
  }, [collection])

  const getSuffix = (tab: RankTab): string => {
    switch (tab) {
      case 'level': return '级'
      case 'gold': return 'G'
      case 'book': return '种'
      case 'maxweight': return 'kg'
    }
  }

  const getPlayerValue = (tab: RankTab): number => {
    switch (tab) {
      case 'level': return playerLevel
      case 'gold': return playerGold
      case 'book': return collectedCount()
      case 'maxweight': return maxWeight
    }
  }

  return (
    <BasePanel title="排行榜" onClose={onClose}>
      {/* 标签栏 */}
      <div className="flex gap-1 mb-4 bg-gray-800/50 rounded-xl p-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-cyan-600/30 text-cyan-300 shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <RankList
        tab={activeTab}
        playerValue={getPlayerValue(activeTab)}
        valueSuffix={getSuffix(activeTab)}
        playerLabel={playerName}
      />
    </BasePanel>
  )
}
