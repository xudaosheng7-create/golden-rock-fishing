// ═══════════════════════════════════════
// 3D 鱼竿 — quaternius CC0 模型
// ═══════════════════════════════════════

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_URL = '/models/fishing-rodnew.glb'

interface RodProps {
  tension: number
  fishingState: string
  casting?: boolean
}

export function Rod({ tension, fishingState, casting }: RodProps) {
  const { scene } = useGLTF(MODEL_URL)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const g = groupRef.current

    if (casting) {
      const p = (t % 2.8) / 2.8
      g.rotation.x = p < 0.3
        ? Math.sin(p / 0.3 * Math.PI) * 0.7 - 0.3
        : Math.sin((p - 0.3) / 0.7 * Math.PI) * 0.5 - 0.5
      return
    }

    const bend = (tension / 100) * 0.4
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.45 - bend, 4 * delta)

    if (fishingState === 'fighting' && tension > 20) {
      const s = (tension / 100) * 0.04
      g.rotation.z = Math.sin(t * 15) * s + Math.sin(t * 22) * s * 0.5
    } else {
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, 3 * delta)
    }
  })

  return (
    <>
      <primitive ref={groupRef} object={scene} position={[0.25, -3.0, -3.5]} rotation={[-0.45, 0.35, 0]} />

      {/* 渔线 */}
      {fishingState !== 'idle' && (
        <group>
          <mesh position={[0.33, -1.2, -6]} rotation={[0.6, -0.08, 0]}>
            <cylinderGeometry args={[0.001, 0.001, 6, 4]} />
            <meshBasicMaterial color="#cceeff" transparent opacity={0.25} depthTest={false} />
          </mesh>
          <mesh position={[0.45, -2.8, -10]} rotation={[0.9, -0.12, 0]}>
            <cylinderGeometry args={[0.0008, 0.0008, 5, 4]} />
            <meshBasicMaterial color="#cceeff" transparent opacity={0.18} depthTest={false} />
          </mesh>
        </group>
      )}
    </>
  )
}

useGLTF.preload(MODEL_URL)
