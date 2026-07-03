import { useState, useMemo } from 'react'
import { usePlayerStore } from '../../store/usePlayerStore'
import { BasePanel } from '../BasePanel'
import { Target, Gift, Clock } from 'lucide-react'
import type { QuestDef } from '../../types'

interface QuestPanelProps {
  onClose: () => void
}

type QuestTab = 'daily' | 'weekly'

const TABS: { key: QuestTab; label: string }[] = [
  { key: 'daily', label: '日常' },
  { key: 'weekly', label: '周常' },
]

// ── Seeded random number generator (mulberry32) ──
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Quest type ──
interface DailyQuest extends QuestDef {
  seedIndex: number
}

// ── Quest generators ──
const QUEST_TEMPLATES: Array<{
  type: 'catch_count' | 'catch_weight'
  title: string
  description: (t: number) => string
  targetCount?: number
  targetWeight?: number
  rewardGold: number
  rewardExp: number
  rewardDiamond?: number
}> = [
  {
    type: 'catch_count',
    title: '初试身手',
    description: (t) => `在任意钓场钓到 ${t} 条鱼`,
    targetCount: 5,
    rewardGold: 200,
    rewardExp: 100,
  },
  {
    type: 'catch_weight',
    title: '重量级挑战',
    description: (t) => `钓获总重量达到 ${t}kg`,
    targetWeight: 10,
    rewardGold: 500,
    rewardExp: 200,
    rewardDiamond: 5,
  },
  {
    type: 'catch_count',
    title: '抛竿达人',
    description: (t) => `抛竿 ${t} 次`,
    targetCount: 20,
    rewardGold: 300,
    rewardExp: 150,
  },
  {
    type: 'catch_count',
    title: '稀有猎手',
    description: (t) => `钓到 ${t} 条稀有或以上品质的鱼`,
    targetCount: 3,
    rewardGold: 800,
    rewardExp: 300,
    rewardDiamond: 10,
  },
  {
    type: 'catch_weight',
    title: '大力渔夫',
    description: (t) => `钓获总重量达到 ${t}kg`,
    targetWeight: 25,
    rewardGold: 1000,
    rewardExp: 400,
    rewardDiamond: 10,
  },
  {
    type: 'catch_count',
    title: '鱼获满满',
    description: (t) => `钓到 ${t} 条鱼`,
    targetCount: 10,
    rewardGold: 500,
    rewardExp: 250,
  },
  {
    type: 'catch_count',
    title: '超级猎手',
    description: (t) => `钓到 ${t} 条史诗或以上品质的鱼`,
    targetCount: 1,
    rewardGold: 1200,
    rewardExp: 500,
    rewardDiamond: 15,
  },
  {
    type: 'catch_weight',
    title: '巨物猎人',
    description: (t) => `钓获总重量达到 ${t}kg`,
    targetWeight: 50,
    rewardGold: 2000,
    rewardExp: 800,
    rewardDiamond: 20,
  },
]

const WEEKLY_TEMPLATES: Array<{
  type: 'catch_count' | 'catch_weight'
  title: string
  description: (t: number) => string
  targetCount?: number
  targetWeight?: number
  rewardGold: number
  rewardExp: number
  rewardDiamond?: number
}> = [
  {
    type: 'catch_count',
    title: '渔获丰收',
    description: (t) => `本周钓到 ${t} 条鱼`,
    targetCount: 50,
    rewardGold: 3000,
    rewardExp: 1000,
    rewardDiamond: 30,
  },
  {
    type: 'catch_weight',
    title: '重量级大师',
    description: (t) => `本周钓获总重量达到 ${t}kg`,
    targetWeight: 100,
    rewardGold: 5000,
    rewardExp: 2000,
    rewardDiamond: 50,
  },
  {
    type: 'catch_count',
    title: '百鱼斩',
    description: (t) => `本周钓到 ${t} 条鱼`,
    targetCount: 100,
    rewardGold: 8000,
    rewardExp: 3000,
    rewardDiamond: 80,
  },
  {
    type: 'catch_weight',
    title: '深海霸王',
    description: (t) => `本周钓获总重量达到 ${t}kg`,
    targetWeight: 200,
    rewardGold: 10000,
    rewardExp: 4000,
    rewardDiamond: 100,
  },
  {
    type: 'catch_count',
    title: '传说猎人',
    description: (t) => `本周钓到 ${t} 条传说品质的鱼`,
    targetCount: 3,
    rewardGold: 15000,
    rewardExp: 5000,
    rewardDiamond: 150,
  },
]

function generateQuests(
  templates: typeof QUEST_TEMPLATES,
  count: number,
  seed: number,
  prefix: string,
): DailyQuest[] {
  const rng = mulberry32(seed)
  // Shuffle templates with seeded random
  const shuffled = [...templates].sort(() => rng() - 0.5)
  return shuffled.slice(0, count).map((t, i) => {
    const target =
      t.type === 'catch_count'
        ? (t.targetCount ?? 5)
        : (t.targetWeight ?? 10)
    // Scale rewards slightly based on difficulty
    const scale = 1 + (target / 50)
    return {
      id: `${prefix}_${i}_${seed}`,
      type: t.type,
      title: t.title,
      description: t.description(target),
      targetCount: t.type === 'catch_count' ? target : undefined,
      targetWeight: t.type === 'catch_weight' ? target : undefined,
      reward: {
        gold: Math.floor(t.rewardGold * scale),
        exp: Math.floor(t.rewardExp * scale),
        diamond: t.rewardDiamond ? Math.floor(t.rewardDiamond * scale) : undefined,
      },
      progress: 0,
      completed: false,
      claimed: false,
      seedIndex: i,
    }
  })
}

function getDaySeed(): number {
  const now = Date.now()
  const day = Math.floor(now / 86400000)
  return day
}

function getWeekSeed(): number {
  const now = Date.now()
  // Use ISO week number as seed
  const d = new Date(now)
  const startOfYear = new Date(d.getFullYear(), 0, 1)
  const diff = d.getTime() - startOfYear.getTime()
  const week = Math.floor(diff / 604800000)
  return d.getFullYear() * 100 + week
}

function QuestCard({ quest }: { quest: DailyQuest }) {
  const addGold = usePlayerStore((s) => s.addGold)
  const addExp = usePlayerStore((s) => s.addExp)
  const addDiamond = usePlayerStore((s) => s.addDiamond)
  const [claimed, setClaimed] = useState(false)

  const progress = quest.type === 'catch_count'
    ? ((quest.progress ?? 0) / (quest.targetCount ?? 1)) * 100
    : ((quest.progress ?? 0) / (quest.targetWeight ?? 1)) * 100
  const cappedProgress = Math.min(progress, 100)
  const canClaim = cappedProgress >= 100 && !claimed

  const handleClaim = () => {
    if (!canClaim) return
    addGold(quest.reward.gold)
    addExp(quest.reward.exp)
    if (quest.reward.diamond) addDiamond(quest.reward.diamond)
    setClaimed(true)
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-white/10 p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-white">{quest.title}</h3>
          <p className="text-xs text-white/50 mt-0.5">{quest.description}</p>
        </div>
        {claimed && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 shrink-0">
            已领取
          </span>
        )}
      </div>

      {/* 进度条 */}
      <div className="mt-3 mb-3">
        <div className="flex items-center justify-between text-xs text-white/50 mb-1">
          <span>
            {quest.type === 'catch_count'
              ? `${quest.progress ?? 0}/${quest.targetCount}`
              : `${(quest.progress ?? 0).toFixed(1)}kg/${quest.targetWeight}kg`}
          </span>
          <span>{Math.floor(cappedProgress)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              cappedProgress >= 100 ? 'bg-green-500' : 'bg-cyan-500'
            }`}
            style={{ width: `${cappedProgress}%` }}
          />
        </div>
      </div>

      {/* 奖励 */}
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 text-yellow-400">
          <Gift className="w-3 h-3" />
          {quest.reward.gold}G
        </span>
        <span className="flex items-center gap-1 text-blue-400">
          <Target className="w-3 h-3" />
          {quest.reward.exp}EXP
        </span>
        {quest.reward.diamond && (
          <span className="flex items-center gap-1 text-purple-400">
            <Clock className="w-3 h-3" />
            {quest.reward.diamond}钻
          </span>
        )}
      </div>

      {/* 领取按钮 */}
      {!claimed && (
        <button
          onClick={handleClaim}
          disabled={!canClaim}
          className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-all ${
            canClaim
              ? 'bg-cyan-600/30 text-cyan-300 hover:bg-cyan-600/40 border border-cyan-500/30'
              : 'bg-gray-700/50 text-white/30 cursor-not-allowed border border-white/5'
          }`}
        >
          {canClaim ? '领取奖励' : '进行中'}
        </button>
      )}
    </div>
  )
}

export function QuestPanel({ onClose }: QuestPanelProps) {
  const [activeTab, setActiveTab] = useState<QuestTab>('daily')

  const quests = useMemo(() => {
    if (activeTab === 'daily') {
      const seed = getDaySeed()
      // Generate 3-5 quests: depends on day seed
      const rng = mulberry32(seed)
      const count = 3 + Math.floor(rng() * 3) // 3..5
      return generateQuests(QUEST_TEMPLATES, count, seed, 'daily')
    } else {
      const seed = getWeekSeed()
      const rng = mulberry32(seed)
      const count = 2 + Math.floor(rng() * 2) // 2..3
      return generateQuests(WEEKLY_TEMPLATES, count, seed, 'weekly')
    }
  }, [activeTab])

  return (
    <BasePanel title="每日委托" onClose={onClose}>
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

      {/* 任务列表 */}
      <div className="space-y-3">
        {quests.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </div>
    </BasePanel>
  )
}
