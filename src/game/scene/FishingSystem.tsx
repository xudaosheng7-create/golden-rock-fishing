// ═══════════════════════════════════════
// 钓鱼系统 3D 组件集合
// 将鱼竿、浮漂、粒子整合到场景中
// ═══════════════════════════════════════

import { Rod } from './Rod'
import { Float } from './Float'
import { Sparkles, ChumEffect } from './Sparkles'
import { useFishingStore } from '../store/useFishingStore'
import { useEquipmentStore } from '../store/useEquipmentStore'

export function FishingSystem() {
  const fishingState = useFishingStore((s) => s.fishingState)
  const lineTension = useFishingStore((s) => s.lineTension)
  const currentFish = useFishingStore((s) => s.currentFish)
  const activeChum = useEquipmentStore((s) => s.activeChum)

  const isCasting = fishingState === 'casting'
  const showFloat =
    fishingState === 'waiting' ||
    fishingState === 'biting' ||
    fishingState === 'fighting' ||
    fishingState === 'netting'

  return (
    <>
      {/* 环境光斑 */}
      <Sparkles count={60} spread={25} speed={0.3} color="#ffe8c0" />

      {/* 鱼竿（始终可见，除 idle 外都有渔线） */}
      <Rod tension={lineTension} fishingState={fishingState} casting={isCasting} />

      {/* 浮漂 */}
      {showFloat && (
        <Float
          fishingState={fishingState}
          fightMode={currentFish?.fight ?? null}
          visible={showFloat}
        />
      )}

      {/* 窝料特效 */}
      {activeChum && (
        <ChumEffect active={activeChum.casts > 0} position={[1.5, 0.5, -15]} />
      )}

      {/* 水面高光 */}
      <Sparkles count={30} spread={15} speed={0.2} size={0.08} color="#ffffff" />
    </>
  )
}
