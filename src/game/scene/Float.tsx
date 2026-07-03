// ═══════════════════════════════════════
// 3D 阿波浮漂
// 上半橘色椭圆 + 下半黄色椭圆 + 天线
// 常态：黄体入水，橘体露出
// 箭沉：中鱼瞬间急速沉入水中
// ═══════════════════════════════════════

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { FishingState, FightMode } from '../types'

interface FloatProps {
  fishingState: FishingState
  fightMode?: FightMode | null
  visible?: boolean
}

// 上半橘色椭圆轮廓
function upperProfile(): THREE.Vector2[] {
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= 16; i++) {
    const t = i / 16
    const angle = t * Math.PI * 0.5  // 0 to 90 degrees (top to equator)
    const r = Math.sin(angle) * 0.07
    const y = Math.cos(angle) * 0.16
    pts.push(new THREE.Vector2(r, y))
  }
  return pts
}

// 下半黄色椭圆轮廓
function lowerProfile(): THREE.Vector2[] {
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= 16; i++) {
    const t = i / 16
    const angle = Math.PI * 0.5 + t * Math.PI * 0.5  // 90 to 180 degrees (equator to bottom)
    const r = Math.sin(angle) * 0.07
    const y = Math.cos(angle) * 0.14
    pts.push(new THREE.Vector2(r, y))
  }
  return pts
}

export function Float({ fishingState, fightMode, visible = true }: FloatProps) {
  const groupRef = useRef<THREE.Group>(null)
  const upperP = useMemo(() => upperProfile(), [])
  const lowerP = useMemo(() => lowerProfile(), [])

  // 状态追踪
  const sinkingRef = useRef(false)
  const sinkStartRef = useRef(0)
  const castStartRef = useRef(0)

  if (!visible) return null

  useFrame(() => {
    if (!groupRef.current) return
    const t = Date.now() * 0.001
    const g = groupRef.current
    const waterY = -1.6  // 水面高度

    switch (fishingState) {
      case 'idle':
        g.position.set(-2.2, -10, -16)
        sinkingRef.current = false
        break

      case 'casting': {
        // 抛竿飞行弧线：从竿尖附近 → 抛物线 → 入水
        if (castStartRef.current === 0) castStartRef.current = t
        const elapsed = t - castStartRef.current
        const duration = 2.5  // 飞行时长 2.5 秒
        const progress = Math.min(elapsed / duration, 1.0)

        // 起点(竿尖方向) → 终点(入水点)，加抛物线高度
        const startX = -0.3, startY = 1.2, startZ = -5
        const endX = -2.2, endY = waterY + 0.06, endZ = -16

        const x = startX + (endX - startX) * progress
        const z = startZ + (endZ - startZ) * progress
        // 抛物线：先升后降
        const arc = Math.sin(progress * Math.PI) * 1.8
        const y = startY + (endY - startY) * progress + arc * (1 - progress)

        g.position.set(x, y, z)
        // 飞行中微微旋转
        g.rotation.z = Math.sin(elapsed * 8) * 0.1
        sinkingRef.current = false
        break
      }

      case 'waiting': {
        castStartRef.current = 0
        // 橘体露出水面，黄体入水
        // 浮漂中心在水面上方约 0.06（橘色部分中心露出）
        const baseY = waterY + 0.06
        g.position.set(
          -2.0 + Math.cos(t * 1.1) * 0.05,
          baseY + Math.sin(t * 1.5) * 0.03,
          -16
        )
        g.rotation.z = Math.sin(t * 1.3) * 0.01
        sinkingRef.current = false
        break
      }

      case 'biting': {
        // 箭沉！快速下沉
        if (!sinkingRef.current) {
          sinkingRef.current = true
          sinkStartRef.current = t
        }
        const elapsed = t - sinkStartRef.current
        // 0.5 秒内沉入水下 0.8m
        const sinkDepth = Math.min(elapsed / 0.5, 1.0) * 0.8
        const shake = Math.sin(t * 12) * 0.04 * (1 - elapsed / 0.5)
        g.position.set(
          -2.0 + Math.sin(t * 8) * shake,
          waterY - 0.1 - sinkDepth,
          -16
        )
        g.rotation.z = Math.sin(t * 15) * 0.08
        break
      }

      case 'fighting': {
        // 水下搏斗
        sinkingRef.current = false
        if (fightMode) fightAnim(g, fightMode, t, waterY)
        else g.position.set(-2.0 + Math.sin(t * 2.5) * 0.4, waterY - 0.5 + Math.sin(t * 3) * 0.3, -16)
        break
      }

      case 'netting':
        // 拉回水面
        sinkingRef.current = false
        g.position.set(-2.2, waterY + 0.06, -11)
        g.rotation.z = 0
        break

      case 'caught':
        // 完全出水
        sinkingRef.current = false
        g.position.set(-2.2, waterY + 0.5, -16)
        g.rotation.z = 0
        break
    }
  })

  return (
    <group ref={groupRef} position={[-2.2, -1.54, -16]}>
      {/* ── 上半橘色椭圆 ── */}
      <mesh>
        <latheGeometry args={[upperP, 20]} />
        <meshStandardMaterial
          color="#ff4400"
          roughness={0.15}
          emissive="#330000"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* ── 下半黄色椭圆 ── */}
      <mesh>
        <latheGeometry args={[lowerP, 20]} />
        <meshStandardMaterial
          color="#ffcc00"
          roughness={0.2}
          emissive="#331100"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* ── 底部线环 ── */}
      <mesh position={[0, -0.16, 0]}>
        <torusGeometry args={[0.01, 0.002, 6, 8]} />
        <meshStandardMaterial color="#999" roughness={0.1} metalness={0.95} />
      </mesh>
    </group>
  )
}

function fightAnim(g: THREE.Group, mode: FightMode, t: number, wy: number) {
  switch (mode) {
    case 'gentle':
      g.position.set(-2.0 + Math.sin(t * 1.2) * 0.15, wy - 0.3 + Math.sin(t * 1.5) * 0.2, -16); break
    case 'jump': {
      const jc = t % 2
      g.position.set(-2.2, jc < 0.3 ? wy + jc * 4 : wy + 1.0 - jc * 0.3, -16 + Math.sin(t * 3) * 1.5); break
    }
    case 'burst': case 'sprint': case 'scream':
      g.position.set(-2.0 + Math.sin(t * 5) * 1.5, wy - 0.5 + Math.sin(t * 6) * 0.3, -16 - Math.abs(Math.sin(t * 3)) * 2); break
    case 'deep_dive':
      g.position.set(-2.2, wy - 1.0 + Math.sin(t * 4) * 0.6, -16 + Math.cos(t * 2) * 0.8); break
    case 'drill':
      g.position.set(-2.0 + Math.sin(t * 8) * 0.2, wy - Math.abs(Math.sin(t * 3)) * 0.6, -16); g.rotation.z += 0.04; break
    case 'roll': case 'spin':
      g.position.set(-2.0 + Math.sin(t * 6) * 0.5, wy - 0.2 + Math.cos(t * 5) * 0.4, -16); break
    case 'swing':
      g.position.set(-2.0 + Math.sin(t * 4) * 0.8, wy - 0.1 + Math.sin(t * 3) * 0.25, -16); break
    case 'long_endurance':
      g.position.set(-2.0 + Math.sin(t * 2) * 1.2, wy - 0.3 + Math.sin(t * 2.5) * 0.4, -16 + Math.sin(t * 1.5) * 1.5); break
  }
}
