import { useState } from 'react'
import { BasePanel } from '../BasePanel'
import { Volume2, VolumeX, Bell, BellOff, Trash2, Info, Shield } from 'lucide-react'
import { AudioManager } from '../../audio/AudioManager'

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const audio = AudioManager
  const [bgmVolume, setBgmVolume] = useState(Math.round(audio['bgmVol'] * 100))
  const [sfxVolume, setSfxVolume] = useState(Math.round(audio['sfxVol'] * 100))
  const [musicOn, setMusicOn] = useState(audio.isMusicOn())
  const [notifyOn, setNotifyOn] = useState(true)

  const toggleMusic = () => {
    const next = audio.toggleMusic()
    setMusicOn(next)
  }

  const handleBgmChange = (v: number) => {
    setBgmVolume(v)
    audio.setBgmVolume(v / 100)
  }

  const handleSfxChange = (v: number) => {
    setSfxVolume(v)
    audio.setSfxVolume(v / 100)
  }

  const toggleNotify = () => {
    setNotifyOn(!notifyOn)
    // 系统通知开关（浏览器 Notification API）
    if (!notifyOn && 'Notification' in window) {
      Notification.requestPermission()
    }
  }

  const handleClearData = () => {
    if (window.confirm('确定要清除所有游戏数据吗？此操作不可恢复！')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <BasePanel title="设置" onClose={onClose}>
      {/* 音量 + 开关 */}
      <div className="bg-gray-800/50 rounded-xl border border-white/10 p-4 mb-4">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          声音设置
        </h3>

        {/* 音乐开关 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {musicOn ? <Volume2 className="w-4 h-4 text-white/60" /> : <VolumeX className="w-4 h-4 text-white/30" />}
            <span className="text-xs text-white/70">背景音乐</span>
          </div>
          <button
            onClick={toggleMusic}
            className={`w-12 h-6 rounded-full transition-colors ${musicOn ? 'bg-cyan-500' : 'bg-gray-600'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${musicOn ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* BGM 音量滑块 */}
        <div className="mb-4 ml-4">
          <div className="flex items-center justify-between text-xs text-white/40 mb-1">
            <span>音量</span>
            <span>{bgmVolume}%</span>
          </div>
          <input
            type="range" min={0} max={100} value={bgmVolume}
            onChange={(e) => { setBgmVolume(Number(e.target.value)); handleBgmChange(Number(e.target.value)) }}
            className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* 音效 */}
        <div className="mb-2 ml-4">
          <div className="flex items-center justify-between text-xs text-white/40 mb-1">
            <span>音效</span>
            <span>{sfxVolume}%</span>
          </div>
          <input
            type="range" min={0} max={100} value={sfxVolume}
            onChange={(e) => { setSfxVolume(Number(e.target.value)); handleSfxChange(Number(e.target.value)) }}
            className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      </div>

      {/* 通知开关 */}
      <div className="bg-gray-800/50 rounded-xl border border-white/10 p-4 mb-4">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-yellow-400" />
          通知设置
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {notifyOn ? <Bell className="w-4 h-4 text-white/60" /> : <BellOff className="w-4 h-4 text-white/30" />}
            <div>
              <span className="text-xs text-white/70">系统通知</span>
              <p className="text-[10px] text-white/30">鱼缸收金币、任务完成提醒</p>
            </div>
          </div>
          <button
            onClick={toggleNotify}
            className={`w-12 h-6 rounded-full transition-colors ${notifyOn ? 'bg-yellow-500' : 'bg-gray-600'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifyOn ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="bg-gray-800/50 rounded-xl border border-white/10 p-4 mb-4">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-orange-400" />
          数据管理
        </h3>

        <button
          onClick={handleClearData}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30 text-sm font-medium transition-all"
        >
          <Trash2 className="w-4 h-4" />
          清除所有数据
        </button>
        <p className="text-xs text-white/30 mt-2 text-center">此操作将清除所有游戏进度，无法恢复</p>
      </div>

      {/* 关于 */}
      <div className="bg-gray-800/50 rounded-xl border border-white/10 p-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400" />
          关于
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-white/40">游戏名称</span>
            <span className="text-white/70">游钓天下 OceanV41</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">版本</span>
            <span className="text-white/70">v1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">引擎</span>
            <span className="text-white/70">React + TypeScript</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">状态管理</span>
            <span className="text-white/70">Zustand</span>
          </div>
        </div>
      </div>
    </BasePanel>
  )
}
