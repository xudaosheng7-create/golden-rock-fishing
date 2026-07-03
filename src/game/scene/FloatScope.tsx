// ═══════════════════════════════════════
// 浮漂特写视窗 — 左侧圆形 PIP 放大镜
// 第二摄像机锁定阿波位置，近距离渲染
// ═══════════════════════════════════════

import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFishingStore } from '../store/useFishingStore'

// 上半橘色椭圆
function upperP(): THREE.Vector2[] {
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= 16; i++) {
    const a = i / 16 * Math.PI * 0.5
    pts.push(new THREE.Vector2(Math.sin(a) * 0.07, Math.cos(a) * 0.16))
  }
  return pts
}
// 下半黄色椭圆
function lowerP(): THREE.Vector2[] {
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI * 0.5 + i / 16 * Math.PI * 0.5
    pts.push(new THREE.Vector2(Math.sin(a) * 0.07, Math.cos(a) * 0.14))
  }
  return pts
}

function ScopeFloat({ fishingState }: { fishingState: string; fightMode?: string | null }) {
  const groupRef = useRef<THREE.Group>(null)
  const up = useMemo(() => upperP(), [])
  const lp = useMemo(() => lowerP(), [])

  useFrame(() => {
    if (!groupRef.current) return
    const t = Date.now() * 0.001
    const g = groupRef.current
    switch (fishingState) {
      case 'waiting':
        g.position.y = Math.sin(t * 1.5) * 0.02; g.rotation.z = Math.sin(t * 1.3) * 0.01; break
      case 'biting':
        g.position.y = -0.25 + Math.sin(t * 10) * 0.03; g.rotation.z = Math.sin(t * 12) * 0.05; break
      case 'fighting':
        g.position.y = -0.3 + Math.sin(t * 3) * 0.1; g.rotation.z = Math.sin(t * 5) * 0.08; break
      default: g.position.y = 0; break
    }
  })

  return (
    <group ref={groupRef}>
      <mesh><latheGeometry args={[up, 20]} /><meshStandardMaterial color="#ff4400" roughness={0.15} emissive="#330000" emissiveIntensity={0.4} /></mesh>
      <mesh><latheGeometry args={[lp, 20]} /><meshStandardMaterial color="#ffcc00" roughness={0.2} emissive="#331100" emissiveIntensity={0.3} /></mesh>
      <mesh position={[0, -0.16, 0]}><torusGeometry args={[0.01, 0.002, 6, 8]} /><meshStandardMaterial color="#999" roughness={0.1} metalness={0.95} /></mesh>
    </group>
  )
}

// ── 特写场景内容 ──
function ScopeScene() {
  const fishingState = useFishingStore((s) => s.fishingState)
  const currentFish = useFishingStore((s) => s.currentFish)

  return (
    <group>
      {/* 水面背景 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -0.3]}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <meshBasicMaterial color="#1a3a5a" transparent opacity={0.4} depthWrite={false} />
      </mesh>

      {/* 阿波 */}
      <group position={[0, 0.02, 0]} scale={[0.65, 0.65, 0.65]}>
        <ScopeFloat
          fishingState={fishingState}
          fightMode={currentFish?.fight ?? null}
        />
      </group>
    </group>
  )
}

export function FloatScope() {
  const fishingState = useFishingStore((s) => s.fishingState)
  const show = fishingState === 'waiting' || fishingState === 'biting' || fishingState === 'fighting'

  if (!show) return null

  return (
    <div className="absolute left-4 top-[28%] z-30 pointer-events-none">
      {/* 圆形遮罩 */}
      <div className={`
        w-[90px] h-[90px] rounded-full overflow-hidden border-2
        shadow-lg shadow-black/50
        ${fishingState === 'biting' ? 'border-red-500 animate-pulse' : 'border-white/30'}
        transition-all duration-300
      `}>
        <Canvas
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 0.05, 0.9], fov: 35 }}
          style={{ width: 90, height: 90 }}
          dpr={1}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <pointLight position={[2, 1, 3]} intensity={1} color="#fff" />
            <ScopeScene />
          </Suspense>
        </Canvas>
      </div>

      {/* 标签 */}
      <div className="text-center mt-1">
        <span className={`
          text-[9px] font-bold
          ${fishingState === 'biting' ? 'text-red-400' : 'text-white/50'}
        `}>
          {fishingState === 'biting' ? '咬钩!' : fishingState === 'fighting' ? '搏鱼' : '等待'}
        </span>
      </div>
    </div>
  )
}
