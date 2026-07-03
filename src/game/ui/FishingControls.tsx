// ═══════════════════════════════════════
// 钓鱼操作控件 — 右下角 + QTE中央 + 窝料入口
// ═══════════════════════════════════════

import { useState, useEffect, useCallback } from 'react'
import { Fish, Anchor, ArrowDown, ArrowUp, SprayCan as Spray, Wrench, RotateCcw } from 'lucide-react'
import { useFishingStore } from '../store/useFishingStore'
import { useEquipmentStore } from '../store/useEquipmentStore'
import { usePlayerStore } from '../store/usePlayerStore'
import { useUIStore } from '../store/useUIStore'
import { useToastStore } from '../store/useToastStore'
import { AdManager, AdScene } from '../system/AdManager'
import { AudioManager } from '../audio/AudioManager'
import {
  castLineAction, hookSetAction, reelAction, releaseAction, handleReviveDismiss, cancelFishingAction,
} from '../system/useFishingLoop'
import { EQUIP_DB } from '../db/equip'
import { calculateRepairCost } from '../system/Economy'

export function FishingControls() {
  const fishingState = useFishingStore((s) => s.fishingState)
  const lineTension = useFishingStore((s) => s.lineTension)
  const fishStamina = useFishingStore((s) => s.fishStamina)
  const fishMaxStamina = useFishingStore((s) => s.fishMaxStamina)
  const activeQTEEvent = useFishingStore((s) => s.activeQTEEvent)
  const reviveAvailable = useFishingStore((s) => s.reviveAvailable)
  const currentFish = useFishingStore((s) => s.currentFish)
  const currentFishWeight = useFishingStore((s) => s.currentFishWeight)

  const activeChum = useEquipmentStore((s) => s.activeChum)
  const setActiveChum = useEquipmentStore((s) => s.setActiveChum)
  const inventory = useEquipmentStore((s) => s.inventory)
  const setDurability = useEquipmentStore((s) => s.setDurability)
  const spendGold = usePlayerStore((s) => s.spendGold)

  const openPanel = useUIStore((s) => s.openPanel)
  const addToast = useToastStore((s) => s.addToast)

  const [qteTimeLeft, setQteTimeLeft] = useState(0)
  const [showChumPick, setShowChumPick] = useState(false)

  useEffect(() => {
    if (!activeQTEEvent) { setQteTimeLeft(0); return }
    setQteTimeLeft(Math.max(0, (activeQTEEvent.endTime - Date.now()) / 1000))
    const t = setInterval(() => {
      const left = Math.max(0, (activeQTEEvent.endTime - Date.now()) / 1000)
      setQteTimeLeft(left)
      if (left <= 0) clearInterval(t)
    }, 50)
    return () => clearInterval(t)
  }, [activeQTEEvent])

  const handleCast = useCallback(() => {
    const r = castLineAction()
    if (!r.success && r.error) addToast(r.error, 'warning')
  }, [addToast])

  const handleHookSet = useCallback(() => {
    const r = hookSetAction()
    if (!r.success && r.error) addToast(r.error, 'warning')
  }, [addToast])

  const handleReel = useCallback(() => { reelAction(); AudioManager.play('reel') }, [])
  const handleRelease = useCallback(() => releaseAction(), [])

  // 窝料选择
  const handleChumSelect = (chumId: string) => {
    const chum = EQUIP_DB.find((e) => e.id === chumId)
    const inv = inventory.find((i) => i.id === chumId)
    const casts = (chum as any)?.casts ?? 10
    if (inv && inv.count > 0) {
      setActiveChum({ id: chumId, casts })
      useEquipmentStore.getState().equip('eChum', chumId)
      addToast(`已打窝：${chum?.name}`, 'success')
    }
    setShowChumPick(false)
  }

  // 快速修理
  const handleQuickRepair = () => {
    const equip = useEquipmentStore.getState()
    const slots = ['eRod', 'eLine', 'eHook', 'eReel'] as const
    let repaired = 0
    let totalCost = 0
    for (const slot of slots) {
      const id = equip[slot] as string | null
      if (!id) continue
      const def = EQUIP_DB.find((d) => d.id === id)
      const inv = inventory.find((i) => i.id === id)
      if (!def || !inv || inv.durability === undefined) continue
      if (inv.durability <= def.maxDurability * 0.3) {
        const cost = calculateRepairCost(def.maxDurability, inv.durability, def.price)
        if (spendGold(cost)) {
          setDurability(id, def.maxDurability)
          totalCost += cost
          repaired++
        }
      }
    }
    if (repaired > 0) addToast(`修理 ${repaired} 件装备，花费 ${totalCost} 金币`, 'success')
    else addToast('装备状态良好，无需修理', 'info')
  }

  // 看广告免费修理
  const handleFreeRepair = () => {
    AdManager.showRewardedAd(AdScene.FREE_REPAIR, (success) => {
      if (!success) return
      const equip = useEquipmentStore.getState()
      const slots = ['eRod', 'eLine', 'eHook', 'eReel'] as const
      let repaired = 0
      for (const slot of slots) {
        const id = equip[slot] as string | null
        if (!id) continue
        const def = EQUIP_DB.find((d) => d.id === id)
        const inv = inventory.find((i) => i.id === id)
        if (!def || !inv || inv.durability === undefined) continue
        if (inv.durability < def.maxDurability) {
          setDurability(id, def.maxDurability)
          repaired++
        }
      }
      if (repaired > 0) addToast(`免费修理了 ${repaired} 件装备！`, 'success')
      else addToast('装备状态良好，无需修理', 'info')
    })
  }

  // 看视频复活
  const handleRevive = () => {
    AdManager.showRewardedAd(AdScene.REVIVE_FIGHT, (success) => {
      if (success) {
        const store = useFishingStore.getState()
        store.setReviveAvailable(false)
        store.setLineTension(30)
        store.setFishStamina(store.fishMaxStamina * 0.5)
        store.setFishingState('fighting')
        addToast('鱼回来了！继续战斗！', 'success')
      } else {
        handleReviveDismiss()
      }
    })
  }

  // 检查装备耐久告警
  const brokenSlots = (['eRod', 'eLine', 'eHook', 'eReel'] as const).filter((slot) => {
    const id = useEquipmentStore.getState()[slot] as string | null
    if (!id) return false
    const inv = inventory.find((i) => i.id === id)
    return inv && inv.durability !== undefined && inv.durability <= 0
  })

  const showMain = !reviveAvailable && (fishingState === 'idle' || fishingState === 'waiting' || fishingState === 'biting')
  const showCancel = !reviveAvailable && (fishingState === 'casting' || fishingState === 'waiting')
  const showFight = fishingState === 'fighting'
  const isBiting = fishingState === 'biting'

  const handleCancel = useCallback(() => {
    const r = cancelFishingAction()
    if (!r.success && r.error) addToast(r.error, 'warning')
  }, [addToast])

  return (
    <div className="absolute bottom-28 right-5 z-30 flex flex-col items-end gap-2">
      {/* ── 装备告警 ── */}
      {brokenSlots.length > 0 && (
        <div className="bg-red-900/80 border border-red-500/50 rounded-xl px-3 py-2 text-xs text-red-300 flex items-center gap-2 animate-pulse-alert">
          <Wrench className="w-3 h-3 shrink-0" />
          <span className="whitespace-nowrap">{brokenSlots.length}件装备损坏</span>
          <div className="flex gap-1">
            <button
              onClick={handleQuickRepair}
              className="px-2 py-0.5 rounded bg-yellow-600 text-yellow-200 text-[10px] hover:bg-yellow-500"
            >
              修理
            </button>
            <button
              onClick={handleFreeRepair}
              className="px-2 py-0.5 rounded bg-green-700 text-green-200 text-[10px] hover:bg-green-600"
            >
              看广告免费修
            </button>
          </div>
        </div>
      )}

      {/* ── QTE 提示 ── */}
      {activeQTEEvent && qteTimeLeft > 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="flex flex-col items-center gap-1">
            <div className="text-2xl font-bold text-red-400 animate-pulse-alert drop-shadow-lg">
              {activeQTEEvent.label}！
            </div>
            <span className="text-white/80 text-base">快松线！({qteTimeLeft.toFixed(1)}s)</span>
            <svg width="56" height="56" viewBox="0 0 48 48" className="-rotate-90">
              <circle cx="24" cy="24" r="20" fill="none" stroke="white" strokeWidth="3" opacity="0.15" />
              <circle cx="24" cy="24" r="20" fill="none"
                stroke={qteTimeLeft < 1 ? '#ef4444' : '#f59e0b'}
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={Math.PI * 40}
                strokeDashoffset={Math.PI * 40 * (1 - qteTimeLeft / (activeQTEEvent?.duration || 3))} />
            </svg>
          </div>
        </div>
      )}

      {/* ── 战斗信息 ── */}
      {showFight && (
        <div className="absolute bottom-40 right-5 w-40 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-white/60">
            <span>鱼体力</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full transition-all"
                style={{ width: `${fishMaxStamina > 0 ? (fishStamina / fishMaxStamina) * 100 : 0}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/60">
            <span>线张力</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${lineTension > 80 ? 'bg-red-500' : lineTension > 50 ? 'bg-yellow-500' : 'bg-blue-400'}`}
                style={{ width: `${lineTension}%` }} />
            </div>
            <span className={`w-8 text-right ${lineTension > 80 ? 'text-red-400' : 'text-white/40'}`}>{Math.round(lineTension)}%</span>
          </div>
        </div>
      )}

      {/* ── 窝料按钮 ── */}
      {showMain && !isBiting && (
        <div className="relative">
          <button
            onClick={() => setShowChumPick(!showChumPick)}
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${activeChum ? 'bg-amber-500/40 border-amber-400/60 text-amber-300' : 'bg-black/40 border-white/40 text-white/70'}`}
            title="打窝"
          >
            <Spray className="w-4 h-4" />
          </button>
          {activeChum && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
          )}
          {/* 窝料选择弹窗 */}
          {showChumPick && (
            <div className="absolute bottom-12 right-0 w-36 bg-gray-900/95 border border-white/10 rounded-xl p-2 shadow-xl z-50">
              <div className="text-[10px] text-white/40 mb-1 px-1">选择窝料</div>
              {inventory
                .filter((i) => EQUIP_DB.find((e) => e.id === i.id && e.type === 'chum'))
                .map((i) => {
                  const def = EQUIP_DB.find((e) => e.id === i.id)!
                  return (
                    <button
                      key={i.id}
                      onClick={() => handleChumSelect(i.id)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex justify-between items-center transition-all ${activeChum?.id === i.id ? 'bg-amber-500/20 text-amber-300' : 'text-white/60 hover:bg-white/5'}`}
                    >
                      <span>{def.name}</span>
                      <span className="text-white/30">×{i.count}</span>
                    </button>
                  )
                })}
              {inventory.filter((i) => EQUIP_DB.find((e) => e.id === i.id && e.type === 'chum')).length === 0 && (
                <button
                  onClick={() => { openPanel('market'); setShowChumPick(false) }}
                  className="w-full text-center px-2 py-2 text-xs text-ocean-400 hover:text-ocean-300"
                >
                  去商城购买窝料 →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 断线复活 ── */}
      {reviveAvailable && (
        <div className="w-52 bg-gray-900/95 border border-yellow-500/40 rounded-xl p-3 shadow-xl">
          <div className="text-xs text-yellow-300 mb-1">断线了！鱼还在！</div>
          <div className="text-sm text-white mb-2">
            {currentFish?.name ?? '未知鱼'} · {currentFishWeight?.toFixed(1) ?? '?'}kg
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRevive}
              className="flex-1 py-1.5 rounded-lg bg-yellow-600/30 text-yellow-300 text-xs font-bold hover:bg-yellow-600/50 border border-yellow-500/30 transition-all active:scale-95"
            >
              ▶ 看视频复活
            </button>
            <button
              onClick={() => { handleReviveDismiss(); addToast('鱼跑了...', 'error') }}
              className="py-1.5 px-3 rounded-lg bg-white/5 text-white/40 text-xs hover:bg-white/10 transition-all"
            >
              放弃
            </button>
          </div>
        </div>
      )}

      {/* ── 按钮 ── */}
      <div className="flex flex-col items-end gap-3">
        {showFight && (
          <button onPointerDown={handleRelease}
            className="w-14 h-14 rounded-full bg-red-500/80 active:bg-red-500 active:scale-90 flex flex-col items-center justify-center text-white font-bold shadow-lg transition-all border-2 border-red-300">
            <ArrowUp className="w-4 h-4" /><span className="text-[9px]">松线</span>
          </button>
        )}

        {/* 抛竿/提竿 + 收竿 */}
        {showMain && (
          <div className="relative flex items-center gap-2">
            {/* 收竿（casting/waiting时在抛竿左下方）*/}
            {showCancel && (
              <button onPointerDown={handleCancel}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white/50 active:bg-white/20 flex flex-col items-center justify-center transition-all">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onPointerDown={isBiting ? handleHookSet : handleCast}
              className={`w-[68px] h-[68px] rounded-full flex flex-col items-center justify-center font-bold shadow-lg transition-all border-2 active:scale-90 ${isBiting ? 'bg-red-500 border-red-300 text-white animate-pulse-alert' : 'bg-ocean-500/90 border-ocean-300 text-white'}`}>
              {isBiting ? <><Fish className="w-5 h-5" /><span className="text-[9px]">提竿!</span></> : <><Anchor className="w-5 h-5" /><span className="text-[9px]">抛竿</span></>}
            </button>
          </div>
        )}

        {showFight && (
          <button onPointerDown={handleReel}
            className="w-14 h-14 rounded-full bg-ocean-500/80 active:bg-ocean-500 active:scale-90 flex flex-col items-center justify-center text-white font-bold shadow-lg transition-all border-2 border-ocean-300">
            <ArrowDown className="w-4 h-4" /><span className="text-[9px]">收线</span>
          </button>
        )}
      </div>
    </div>
  )
}
