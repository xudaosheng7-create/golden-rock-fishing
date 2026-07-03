import { usePlayerStore } from '../../store/usePlayerStore'
import { BasePanel } from '../BasePanel'
import { Swords, Lock, Star, Trophy, Zap } from 'lucide-react'

interface ExpertPanelProps {
  onClose: () => void
}

export function ExpertPanel({ onClose }: ExpertPanelProps) {
  const level = usePlayerStore((s) => s.level)
  const isExpertMode = false // 占位: 实际应从 playerStore 读取
  const unlocked = isExpertMode || level >= 20

  if (!unlocked) {
    return (
      <BasePanel title="专家模式" onClose={onClose}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {/* 锁定图标 */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-white/10 flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-white/20" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">专家模式</h3>
          <p className="text-sm text-white/40 mb-6 max-w-[240px]">
            为资深钓友准备的高难度挑战模式
          </p>

          <div className="px-6 py-3 rounded-xl bg-gray-800/50 border border-white/10">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-lg font-bold text-white">
                LV.20 解锁专家模式
              </span>
            </div>
            <div className="text-xs text-white/30 mt-1">
              当前等级: Lv.{level}
            </div>
            {/* 经验条 */}
            <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                style={{ width: `${Math.min(100, (level / 20) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-white/20 mt-1">
              {level >= 20 ? '已解锁' : `还需 ${20 - level} 级`}
            </div>
          </div>
        </div>
      </BasePanel>
    )
  }

  return (
    <BasePanel title="专家模式" onClose={onClose}>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-b from-purple-900/40 to-cyan-900/40 border border-purple-500/20 flex items-center justify-center mb-6">
          <Swords className="w-12 h-12 text-purple-400/60" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">专家模式已解锁</h3>
        <p className="text-sm text-white/40 mb-8 max-w-[240px]">
          更高的难度，更丰厚的奖励
        </p>

        {/* 功能列表 */}
        <div className="w-full space-y-3">
          <div className="bg-gray-800/50 rounded-xl border border-white/10 p-4 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />
            <div className="text-left">
              <div className="text-sm text-white font-medium">专家挑战</div>
              <div className="text-xs text-white/40">极限钓法挑战赛</div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-white/10 p-4 flex items-center gap-3">
            <Star className="w-5 h-5 text-purple-400 shrink-0" />
            <div className="text-left">
              <div className="text-sm text-white font-medium">稀有鱼种专区</div>
              <div className="text-xs text-white/40">挑战传说级鱼类</div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-white/10 p-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="text-left">
              <div className="text-sm text-white font-medium">双倍奖励</div>
              <div className="text-xs text-white/40">所有收益翻倍</div>
            </div>
          </div>
        </div>

        <div className="mt-6 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-purple-500/20">
          <span className="text-sm bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent font-bold">
            更多内容开发中
          </span>
        </div>
      </div>
    </BasePanel>
  )
}
