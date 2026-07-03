// ═══════════════════════════════════════
// App.tsx — 根组件
// 启动屏 → 主游戏循环
// ═══════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import { LoginScreen } from './game/ui/LoginScreen'
import { GameScene } from './game/scene/GameScene'
import { HUD } from './game/ui/HUD'
import { FishingControls } from './game/ui/FishingControls'
import { BottomDock } from './game/ui/BottomDock'
import { PanelManager } from './game/ui/PanelManager'
import { ToastContainer } from './game/ui/ToastContainer'
import { FloatScope } from './game/scene/FloatScope'
import { AdManager, AdScene } from './game/system/AdManager'
import { AudioManager } from './game/audio/AudioManager'
import { FISH_IMAGES } from './game/real_fish_assets'
import { Play } from 'lucide-react'
import { usePlayerStore } from './game/store/usePlayerStore'
import { useWorldStore } from './game/store/useWorldStore'
import { useFishingStore } from './game/store/useFishingStore'
import { useCollectionStore } from './game/store/useCollectionStore'
import { useEquipmentStore } from './game/store/useEquipmentStore'
import { keepFish, releaseFish } from './game/system/FishingStateMachine'
import { calculateFishPrice, calculateFishExp } from './game/system/Economy'
import { useFishingLoop } from './game/system/useFishingLoop'
import { useGyroscope } from './game/system/useGyroscope'
import type { BasketFish, TankFish } from './game/types'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const userProfile = usePlayerStore((s) => s.userProfile)

  // 挂载钓鱼主循环（概率引擎 + 状态机驱动）
  useFishingLoop()
  useGyroscope()

  const fishingState = useFishingStore((s) => s.fishingState)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 待机横幅：idle 超过 15 秒显示 banner，开始钓鱼时隐藏
  useEffect(() => {
    // 清除之前的计时器
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }

    // 非 idle 状态（开始钓鱼）时隐藏 banner
    if (fishingState !== 'idle') {
      AdManager.hideBanner()
    }

    // idle 状态启动 15 秒计时器显示 banner
    if (fishingState === 'idle') {
      idleTimerRef.current = setTimeout(() => {
        AdManager.showBanner(AdScene.IDLE_BANNER)
      }, 15000)
    }

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [fishingState])

  // 自动登录（如果有存档）
  useEffect(() => {
    if (userProfile) {
      setLoggedIn(true)
    }
  }, [])

  const handleEnter = () => {
    setLoggedIn(true)
    useWorldStore.getState().updateEnvironment()
    AudioManager.startAmbient()
  }

  if (!loggedIn) {
    return <LoginScreen onEnter={handleEnter} />
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* 3D 场景层 */}
      <GameScene />

      {/* HUD 顶栏 */}
      <HUD />

      {/* 阿波特写 PIP 视窗（左侧圆形放大镜） */}
      <FloatScope />

      {/* Toast 通知 */}
      <ToastContainer />

      {/* 鱼获展示弹窗 */}
      <CaughtFishModal />

      {/* 钓鱼操作控件 */}
      <FishingControls />

      {/* 底部菜单栏 */}
      <BottomDock />

      {/* 弹出面板 */}
      <PanelManager />
    </div>
  )
}

/**
 * 鱼获展示弹窗
 * 当 fishingState === 'caught' 时显示
 */
function CaughtFishModal() {
  const fishingState = useFishingStore((s) => s.fishingState)
  const currentFish = useFishingStore((s) => s.currentFish)
  const currentFishWeight = useFishingStore((s) => s.currentFishWeight)
  const setFishingState = useFishingStore((s) => s.setFishingState)
  const resetFightState = useFishingStore((s) => s.resetFightState)
  const addGold = usePlayerStore((s) => s.addGold)
  const addExp = usePlayerStore((s) => s.addExp)
  const goldBonus = usePlayerStore((s) => s.getGoldBonus())
  const addFishToBasket = useEquipmentStore((s) => s.addFishToBasket)
  const recordCatch = useCollectionStore((s) => s.recordCatch)
  const addFishToTank = useCollectionStore((s) => s.addFishToTank)
  const tankCapacity = useCollectionStore((s) => s.tankCapacity)
  const tank = useCollectionStore((s) => s.tank)
  const updateStats = usePlayerStore((s) => s.updateStats)
  const totalWeight = usePlayerStore((s) => s.stats.totalWeight)

  if (fishingState !== 'caught' || !currentFish || !currentFishWeight) return null

  const price = calculateFishPrice(currentFish, currentFishWeight, goldBonus)
  const exp = calculateFishExp(currentFish, currentFishWeight)

  const handleKeep = () => {
    const fishId = `catch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const basketFish: BasketFish = {
      id: fishId,
      fishId: currentFish.id,
      weight: currentFishWeight,
      caughtAt: Date.now(),
    }
    addFishToBasket(basketFish)
    addExp(exp)  // 钓到鱼就给经验
    recordCatch(currentFish.id, currentFishWeight)
    updateStats({ totalWeight: totalWeight + currentFishWeight })
    resetFightState()
    setFishingState('idle')
    keepFish()
  }

  const handleSell = (multiplier: number = 1) => {
    addGold(price * multiplier)
    addExp(exp * multiplier)
    recordCatch(currentFish.id, currentFishWeight!)
    updateStats({ totalWeight: totalWeight + currentFishWeight! })
    resetFightState()
    setFishingState('idle')
    import('./game/store/useToastStore').then(({ useToastStore }) => {
      const label = multiplier > 1 ? `${multiplier}倍售出` : '售出'
      useToastStore.getState().addToast(
        `${label} ${currentFish?.name} ${currentFishWeight}kg，获得 ${price * multiplier} 金币！`,
        'success'
      )
    })
  }

  const handleSell3x = () => {
    AdManager.showRewardedAd(AdScene.SINGLE_SELL_3X, (success) => {
      if (success) handleSell(3)
    })
  }

  const handleTank = () => {
    if (tank.length >= tankCapacity) {
      import('./game/store/useToastStore').then(({ useToastStore }) => {
        useToastStore.getState().addToast('鱼缸已满！请扩展容量或移除鱼', 'warning')
      })
      return
    }

    const tankFish: TankFish = {
      id: `tank_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fishId: currentFish.id,
      weight: currentFishWeight!,
      caughtAt: Date.now(),
      lastCollectedAt: Date.now(),
    }

    if (addFishToTank(tankFish)) {
      addExp(exp)
      recordCatch(currentFish.id, currentFishWeight!)
      updateStats({ totalWeight: totalWeight + currentFishWeight! })
      resetFightState()
      setFishingState('idle')
      import('./game/store/useToastStore').then(({ useToastStore }) => {
        useToastStore.getState().addToast(`${currentFish?.name} 已放入鱼缸`, 'success')
      })
    }
  }

  const handleRelease = () => {
    resetFightState()
    setFishingState('idle')
    releaseFish()
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="w-[90%] max-w-[350px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden panel-enter shadow-2xl border border-white/10">
        {/* 鱼获卡片头部 */}
        <div className="p-4 text-center">
          <img
            src={FISH_IMAGES[currentFish.id]}
            alt={currentFish.name}
            className="w-32 h-32 mx-auto mb-3 object-contain rounded-xl"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <h2 className="text-xl font-bold text-white">{currentFish.name}</h2>
          <p className="text-white/40 text-xs italic">{currentFish.scientificName}</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-2xl font-bold text-gold-400">
              {currentFishWeight} kg
            </span>
            <span className="text-sm text-white/50">
              {currentFish.family}
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-sm">
            <span className="text-gold-400">💰 {price} 金币</span>
            <span className="text-ocean-300">⭐ {exp} 经验</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="p-4 pt-0 grid grid-cols-2 gap-2">
          <button
            onClick={handleKeep}
            className="col-span-2 py-3 rounded-xl bg-ocean-600 hover:bg-ocean-500 text-white font-bold transition-colors active:scale-[0.98]"
          >
            收入鱼护
          </button>
          <button
            onClick={() => handleSell(1)}
            className="py-3 rounded-xl bg-gold-500/80 hover:bg-gold-500 text-black font-bold transition-colors active:scale-[0.98]"
          >
            出售 (+{price})
          </button>
          <button
            onClick={handleSell3x}
            className="py-3 rounded-xl bg-yellow-500/80 hover:bg-yellow-500 text-black font-bold transition-colors active:scale-[0.98] flex items-center justify-center gap-1"
          >
            <Play className="w-3.5 h-3.5 fill-black" />3倍 (+{price * 3})
          </button>
          <button
            onClick={handleTank}
            className="py-3 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-bold transition-colors active:scale-[0.98]"
            disabled={tank.length >= tankCapacity}
          >
            放入鱼缸 {tank.length >= tankCapacity ? '(已满)' : ''}
          </button>
          <button
            onClick={handleRelease}
            className="col-span-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-sm transition-colors active:scale-[0.98]"
          >
            放生
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
