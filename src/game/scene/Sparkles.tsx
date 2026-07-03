// ═══════════════════════════════════════
// 环境粒子特效
// 水面光斑 + 粉尘粒子
// ═══════════════════════════════════════

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SparklesProps {
  count?: number
  spread?: number
  speed?: number
  size?: number
  color?: string
}

export function Sparkles({
  count = 80,
  spread = 20,
  speed = 0.3,
  size = 0.05,
  color = '#ffffff',
}: SparklesProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread * 2
      pos[i * 3 + 1] = Math.random() * 5 - 1
      pos[i * 3 + 2] = -Math.random() * spread * 1.5 - 5
    }
    return pos
  }, [count, spread])

  const velocities = useMemo(() => {
    const vel = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      vel[i] = (Math.random() - 0.5) * speed * 2
    }
    return vel
  }, [count, speed])

  useFrame((_, delta) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      // 垂直浮动
      pos[i * 3 + 1] += velocities[i] * delta
      // 超过边界时重置
      if (pos[i * 3 + 1] > 4) pos[i * 3 + 1] = -1
      if (pos[i * 3 + 1] < -1) pos[i * 3 + 1] = 4

      // 水平漂移
      pos[i * 3] += Math.sin(Date.now() * 0.001 + i) * delta * 0.2
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true

    // 整体闪烁
    const opacity = 0.4 + Math.sin(Date.now() * 0.002) * 0.2
    if (pointsRef.current.material instanceof THREE.PointsMaterial) {
      pointsRef.current.material.opacity = opacity
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/**
 * 窝料扩散粒子特效
 */
interface ChumEffectProps {
  active: boolean
  position?: [number, number, number]
}

export function ChumEffect({ active, position = [1.5, 0, -15] }: ChumEffectProps) {
  const particlesRef = useRef<THREE.Points>(null)
  const count = 40

  const initialPositions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = position[0] + (Math.random() - 0.5) * 0.5
      pos[i * 3 + 1] = position[1] + Math.random() * 0.3
      pos[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.5
    }
    return pos
  }, [])

  useFrame((_, delta) => {
    if (!particlesRef.current || !active) return
    const pos = particlesRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      // 向外扩散
      pos[i * 3 + 1] -= delta * 0.5 // 下沉
      pos[i * 3] += (Math.random() - 0.5) * delta * 0.8
      pos[i * 3 + 2] += (Math.random() - 0.5) * delta * 0.8

      // 重置位置
      if (pos[i * 3 + 1] < -5) {
        pos[i * 3] = position[0] + (Math.random() - 0.5) * 0.3
        pos[i * 3 + 1] = position[1]
        pos[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.3
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })

  if (!active) return null

  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPositions, 3]}
          count={count}
          array={initialPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#c8a96e"
        size={0.06}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
