// ═══════════════════════════════════════
// 启动/登录屏 — 微信授权 + 游客模式
// ═══════════════════════════════════════

import { useState, useEffect } from 'react'
import { usePlayerStore } from '../store/usePlayerStore'
import { isWechat, requestWechatLogin } from '../system/WechatBridge'
import { AudioManager } from '../audio/AudioManager'
import type { UserProfile } from '../types'

interface LoginScreenProps {
  onEnter: () => void
}

const DEFAULT_AVATARS = ['🎣','🐟','🦈','🐠','🎏','🐡','🦑','🐙','⚓','🏴‍☠️']

export function LoginScreen({ onEnter }: LoginScreenProps) {
  const [nickname, setNickname] = useState('')
  const [avatarIndex, setAvatarIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showGuest, setShowGuest] = useState(false)
  const setUserProfile = usePlayerStore((s) => s.setUserProfile)

  const inWechat = isWechat()

  // 登录页开始播 BGM + 海浪环境音
  useEffect(() => {
    AudioManager.playBGM('/bgm.mp3')
    AudioManager.startAmbient()
  }, [])

  // 微信登录
  const handleWechatLogin = async () => {
    setLoading(true)
    try {
      const profile = await requestWechatLogin()
      setUserProfile(profile)
      onEnter()
    } catch {
      setLoading(false)
      // 失败则展示游客模式
      setShowGuest(true)
    }
  }

  // 游客登录
  const handleGuestEnter = () => {
    const name = nickname.trim() || `钓友${Math.floor(Math.random() * 9000) + 1000}`
    const profile: UserProfile = {
      nickname: name,
      avatarUrl: DEFAULT_AVATARS[avatarIndex],
    }
    setUserProfile(profile)
    onEnter()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-ocean-800 via-ocean-900 to-black">
      {/* Logo */}
      <div className="mb-8 text-center">
        <img src="/logo.svg" alt="金岩石海钓" className="w-32 h-32 mb-4" />
        <h1 className="text-3xl font-bold text-gold-400 mb-2" style={{letterSpacing: 6}}>金岩石海钓</h1>
        <p className="text-ocean-300 text-sm">3D 沉浸式海钓模拟</p>
      </div>

      {!showGuest ? (
        <>
          {/* 微信登录按钮 */}
          {inWechat && (
            <button
              onClick={handleWechatLogin}
              disabled={loading}
              className="w-64 mb-4 py-3.5 rounded-xl bg-[#07C160] hover:bg-[#06AD56] text-white font-bold text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                  <path d="M8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-8.45 4.05c-.7-.5-1.55-.2-1.95.55-.35.65-.1 1.45.55 1.85 1.6 1 3.45 1.55 5.35 1.55 1.9 0 3.75-.55 5.35-1.55.65-.4.9-1.2.55-1.85-.4-.75-1.25-1.05-1.95-.55C13.7 16.2 11.9 16.7 10 16.7s-3.7-.5-4.95-1.65z"/>
                </svg>
              )}
              {loading ? '授权中...' : '微信授权登录'}
            </button>
          )}

          {/* 游客入口 */}
          <button
            onClick={() => setShowGuest(true)}
            className="text-white/40 hover:text-white/60 text-sm transition-colors"
          >
            {inWechat ? '游客模式进入' : '进入游戏'}
          </button>

          {/* 浏览器提示 */}
          {!inWechat && (
            <p className="text-white/20 text-xs mt-2">浏览器开发模式</p>
          )}
        </>
      ) : (
        <>
          {/* 游客模式 — 头像选择 */}
          <div className="mb-4">
            <p className="text-white/50 text-sm mb-2 text-center">选择头像</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-[280px]">
              {DEFAULT_AVATARS.map((a, i) => (
                <button key={i}
                  onClick={() => setAvatarIndex(i)}
                  className={`w-11 h-11 text-xl flex items-center justify-center rounded-full transition-all ${
                    i === avatarIndex ? 'bg-ocean-500 ring-2 ring-white scale-110' : 'bg-white/10 hover:bg-white/20'
                  }`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* 昵称 */}
          <input
            type="text" value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="输入昵称（选填）" maxLength={12}
            className="w-56 mb-5 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-center placeholder-white/30 focus:outline-none focus:border-ocean-400 transition-colors"
          />

          {/* 进入按钮 */}
          <button onClick={handleGuestEnter}
            className="px-12 py-3 rounded-full bg-gradient-to-r from-ocean-500 to-blue-500 text-white font-bold text-lg shadow-lg hover:from-ocean-400 hover:to-blue-400 active:scale-95 transition-all">
            进入游戏
          </button>

          {/* 返回微信登录 */}
          {inWechat && (
            <button onClick={() => setShowGuest(false)}
              className="mt-3 text-white/30 hover:text-white/50 text-xs transition-colors">
              返回微信登录
            </button>
          )}
        </>
      )}

      <p className="mt-8 text-white/20 text-xs">version 1.0</p>
    </div>
  )
}
