import { useState } from 'react'
import { BasePanel } from '../BasePanel'
import { getSignInReward } from '../../system/Economy'
import { AdManager, AdScene } from '../../system/AdManager'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useToastStore } from '../../store/useToastStore'
import { Calendar, Check, Target, Star } from 'lucide-react'
import type { ActiveReward } from '../../types'

interface ActivePanelProps {
  onClose: () => void
}

// 占位签到状态
const MAX_SIGN_IN_DAY = 7
const PLACEHOLDER_SIGNED_DAYS = [1, 3] // 第 1、3 天已签到（第 2 天漏签可补签）

// 占位活跃奖励
const MOCK_ACTIVE_REWARDS: ActiveReward[] = [
  { threshold: 50, reward: { gold: 500, exp: 200 }, claimed: false },
  { threshold: 100, reward: { gold: 1000, diamond: 10 }, claimed: false },
  { threshold: 200, reward: { gold: 2000, exp: 500, diamond: 20 }, claimed: false },
  { threshold: 500, reward: { gold: 5000, diamond: 50 }, claimed: false },
]

function SignInSection() {
  const [signedDays, setSignedDays] = useState(PLACEHOLDER_SIGNED_DAYS)
  const addGold = usePlayerStore((s) => s.addGold)
  const addDiamond = usePlayerStore((s) => s.addDiamond)
  const addExp = usePlayerStore((s) => s.addExp)
  const addToast = useToastStore((s) => s.addToast)
  const currentDay = signedDays.length + 1
  const canSignIn = currentDay <= MAX_SIGN_IN_DAY
  // 计算漏签天数：小于 currentDay 且未签到的
  const missedDays = Array.from({ length: currentDay - 1 }, (_, i) => i + 1)
    .filter(day => !signedDays.includes(day))

  const handleSignIn = () => {
    if (!canSignIn) return
    setSignedDays((prev) => [...prev, currentDay])
  }

  // 看广告补签
  const handleMakeupSignIn = (day: number) => {
    AdManager.showRewardedAd(AdScene.EXTRA_SIGNIN, (success) => {
      if (!success) return
      setSignedDays((prev) => [...prev, day])
      const reward = getSignInReward(day)
      if (reward.gold) addGold(reward.gold)
      if (reward.diamond) addDiamond(reward.diamond)
      if (reward.exp) addExp(reward.exp)
      addToast(`补签 Day ${day} 成功！`, 'success')
    })
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-white/10 p-4 mb-4">
      <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-cyan-400" />
        每日签到
      </h3>

      {/* 7天签到网格 */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {Array.from({ length: MAX_SIGN_IN_DAY }, (_, i) => {
          const day = i + 1
          const isSigned = signedDays.includes(day)
          const isToday = day === currentDay
          const isFuture = day > currentDay
          const isMissed = missedDays.includes(day)
          const reward = getSignInReward(day)

          return (
            <div
              key={day}
              className={`rounded-lg p-2 text-center border transition-all ${
                isSigned
                  ? 'bg-cyan-900/40 border-cyan-500/30'
                  : isMissed
                    ? 'bg-red-900/30 border-red-500/30'
                    : isToday
                      ? 'bg-yellow-900/30 border-yellow-500/40 animate-pulse'
                      : 'bg-gray-800/30 border-white/5'
              } ${isFuture ? 'opacity-40' : ''} ${isMissed ? 'relative' : ''}`}
            >
              <div className="text-xs font-medium text-white mb-1">Day {day}</div>
              <div className="text-[10px] text-yellow-400">{reward.gold}G</div>
              {reward.exp && <div className="text-[10px] text-blue-400">{reward.exp}EXP</div>}
              {reward.diamond && <div className="text-[10px] text-purple-400">◆{reward.diamond}</div>}
              {isSigned && (
                <div className="mt-1">
                  <Check className="w-3 h-3 text-green-400 mx-auto" />
                </div>
              )}
              {isMissed && (
                <button
                  onClick={() => handleMakeupSignIn(day)}
                  className="mt-1 text-[8px] px-1 py-0.5 rounded bg-yellow-600/40 text-yellow-300 hover:bg-yellow-600/60 leading-none"
                >
                  广告补签
                </button>
              )}
              {isToday && !isSigned && (
                <div className="mt-1">
                  <Star className="w-3 h-3 text-yellow-400 mx-auto" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={handleSignIn}
        disabled={!canSignIn}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
          canSignIn
            ? 'bg-gradient-to-r from-cyan-600/40 to-blue-600/40 text-cyan-300 hover:from-cyan-600/50 hover:to-blue-600/50 border border-cyan-500/30'
            : 'bg-gray-700/50 text-white/30 cursor-not-allowed border border-white/5'
        }`}
      >
        {canSignIn ? `签到 Day ${currentDay}` : '本月已签到满'}
      </button>
    </div>
  )
}

function ActiveRewardSection() {
  const [rewards, setRewards] = useState(MOCK_ACTIVE_REWARDS)
  const currentActivity = 150 // 占位活跃度

  const handleClaim = (index: number) => {
    setRewards((prev) =>
      prev.map((r, i) => (i === index ? { ...r, claimed: true } : r))
    )
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-white/10 p-4">
      <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
        <Target className="w-4 h-4 text-orange-400" />
        活跃奖励
      </h3>

      {/* 活跃度进度 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-white/50 mb-1">
          <span>当前活跃度: {currentActivity}</span>
          <span>{rewards[rewards.length - 1]?.threshold ?? 500}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all"
            style={{
              width: `${Math.min(100, (currentActivity / (rewards[rewards.length - 1]?.threshold ?? 500)) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* 奖励列表 */}
      <div className="space-y-2">
        {rewards.map((reward, index) => {
          const unlocked = currentActivity >= reward.threshold
          return (
            <div
              key={index}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${
                reward.claimed
                  ? 'bg-gray-800/30 border-white/5 opacity-50'
                  : unlocked
                    ? 'bg-gray-800/50 border-cyan-500/30'
                    : 'bg-gray-800/30 border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="text-xs text-white/40 w-12">{reward.threshold}分</div>
                <div className="flex gap-1.5">
                  <span className="text-xs text-yellow-400">{reward.reward.gold}G</span>
                  {reward.reward.exp && (
                    <span className="text-xs text-blue-400">{reward.reward.exp}EXP</span>
                  )}
                  {reward.reward.diamond && (
                    <span className="text-xs text-purple-400">◆{reward.reward.diamond}</span>
                  )}
                </div>
              </div>

              {reward.claimed ? (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  已领取
                </span>
              ) : unlocked ? (
                <button
                  onClick={() => handleClaim(index)}
                  className="text-xs px-3 py-1 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 transition-colors"
                >
                  领取
                </button>
              ) : (
                <span className="text-xs text-white/30">未解锁</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ActivePanel({ onClose }: ActivePanelProps) {
  return (
    <BasePanel title="活跃奖励" onClose={onClose}>
      <SignInSection />
      <ActiveRewardSection />
    </BasePanel>
  )
}
