import { usePlayerStore } from '../../store/usePlayerStore'
import { BasePanel } from '../BasePanel'
import { User, Star, Clock, Crosshair, Weight, Target, Trophy } from 'lucide-react'

interface ProfilePanelProps {
  onClose: () => void
}

export function ProfilePanel({ onClose }: ProfilePanelProps) {
  const level = usePlayerStore((s) => s.level)
  const exp = usePlayerStore((s) => s.exp)
  const gold = usePlayerStore((s) => s.gold)
  const diamond = usePlayerStore((s) => s.diamond)
  const stats = usePlayerStore((s) => s.stats)
  const userProfile = usePlayerStore((s) => s.userProfile)
  const vitality = usePlayerStore((s) => s.vitality)
  const maxVitality = usePlayerStore((s) => s.maxVitality)

  // 计算升级进度
  const expPerLevel = level * 100 + 200
  const expPercent = (exp / expPerLevel) * 100

  // 计算命中率
  const hitRate =
    stats.totalCasts > 0
      ? (((stats.totalCasts - stats.totalEscapes) / stats.totalCasts) * 100).toFixed(1)
      : '0.0'

  // 格式化游戏时长
  const hoursPlayed = Math.floor(stats.playTime / 3600)

  const statCards = [
    { icon: Clock, label: '游戏时长', value: `${hoursPlayed} 小时` },
    { icon: Crosshair, label: '抛竿次数', value: stats.totalCasts.toLocaleString() },
    { icon: Weight, label: '总钓获', value: `${stats.totalWeight.toFixed(1)}kg` },
    { icon: Target, label: '命中率', value: `${hitRate}%` },
    { icon: Trophy, label: '脱钩次数', value: stats.totalEscapes.toLocaleString() },
  ]

  return (
    <BasePanel title="个人信息" onClose={onClose}>
      {/* 头像 + 昵称 */}
      <div className="flex items-center gap-4 mb-6 bg-gray-800/50 rounded-xl p-4 border border-white/10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {userProfile?.avatarUrl ? (
            <img
              src={userProfile.avatarUrl}
              alt="avatar"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-8 h-8" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate">
            {userProfile?.nickname ?? '无名钓客'}
          </h2>

          {/* 等级 + 经验 */}
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-600/30 text-cyan-300 font-bold">
              Lv.{level}
            </span>
            <span className="text-xs text-white/40">{exp}/{expPerLevel} EXP</span>
          </div>
          <div className="mt-1.5 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
              style={{ width: `${expPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 资源统计 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-800/50 rounded-xl px-3 py-2.5 border border-white/5 text-center">
          <div className="text-xs text-white/40">金币</div>
          <div className="text-sm font-bold text-yellow-400">{gold.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl px-3 py-2.5 border border-white/5 text-center">
          <div className="text-xs text-white/40">钻石</div>
          <div className="text-sm font-bold text-purple-400">{diamond}</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl px-3 py-2.5 border border-white/5 text-center">
          <div className="text-xs text-white/40">体力</div>
          <div className="text-sm font-bold text-green-400">
            {vitality}/{maxVitality}
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <h3 className="text-sm font-bold text-white/60 mb-2 flex items-center gap-1">
        <Star className="w-3.5 h-3.5" />
        钓鱼统计
      </h3>
      <div className="space-y-1.5">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2.5 border border-white/5"
            >
              <span className="flex items-center gap-2 text-sm text-white/60">
                <Icon className="w-3.5 h-3.5 text-white/30" />
                {stat.label}
              </span>
              <span className="text-sm font-medium text-white">{stat.value}</span>
            </div>
          )
        })}
      </div>
    </BasePanel>
  )
}
