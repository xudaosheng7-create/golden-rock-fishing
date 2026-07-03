/**
 * 游钓天下 — 鱼竿 3D 模型加载 + 弯曲动画
 * ============================================
 * 技术栈：Three.js + React Three Fiber (R3F)
 * 模型：fishing_rod.glb（由 Blender build_fishing_rod.py 导出）
 *
 * 性能注意：
 * - 模型 ≤ 3000 tris，单材质集合，移动端 60fps 友好
 * - 弯曲用骨骼 bone_tip.rotation.z 控制（0~30°）
 * - 鱼上钩动画：lerp 平滑过渡
 */

import { useRef, useMemo, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Group, SkinnedMesh, Bone } from 'three'

interface FishingRodProps {
  /** 弯曲角度（度），0 = 自然下垂，30 = 鱼上钩全力拉 */
  bendAngle?: number
  /** 初始位置（默认第一人称右下角） */
  position?: [number, number, number]
  /** 初始旋转（指向画面中央偏上） */
  rotation?: [number, number, number]
}

export default function FishingRod({
  bendAngle = 0,
  position = [0.25, -3.0, -3.5],
  rotation = [-0.35, 0.12, 0],
}: FishingRodProps) {
  const groupRef = useRef<Group>(null)
  // 加载 GLB 模型
  const gltf = useGLTF('/models/fishing_rod.glb')
  const { scene, animations } = gltf
  const { actions } = useAnimations(animations, groupRef)

  // 缓存骨骼引用（用于弯曲控制）
  const bonesRef = useRef<{
    root?: Bone
    lower?: Bone
    mid?: Bone
    tip?: Bone
  }>({})

  // 缓存 SkinnedMesh 引用
  const skinnedMeshRef = useRef<SkinnedMesh>()

  useEffect(() => {
    if (!scene) return

    // 找到骨骼
    scene.traverse((obj) => {
      if (obj instanceof Bone) {
        if (obj.name === 'bone_root') bonesRef.current.root = obj
        if (obj.name === 'bone_lower') bonesRef.current.lower = obj
        if (obj.name === 'bone_mid') bonesRef.current.mid = obj
        if (obj.name === 'bone_tip') bonesRef.current.tip = obj
      }
      if (obj instanceof SkinnedMesh) {
        skinnedMeshRef.current = obj
      }
    })

    console.log('[FishingRod] 模型加载完成')
    console.log('[FishingRod] 骨骼:', bonesRef.current)
    console.log('[FishingRod] SkinnedMesh:', skinnedMeshRef.current)
  }, [scene])

  // 帧循环：根据 bendAngle 平滑更新骨骼旋转
  useFrame((_, delta) => {
    const bones = bonesRef.current
    if (!bones.tip) return

    // 转换：0~30° → bone_tip.rotation.z
    // 4 根骨骼按累积角度分配（弯曲沿竿身递增）
    const targetZ = (bendAngle * Math.PI) / 180
    const damp = Math.min(delta * 8, 1) // 平滑系数

    // 握把 (bone_root) 不动
    // bone_lower: 30% 弯曲
    // bone_mid: 60% 弯曲
    // bone_tip: 100% 弯曲
    if (bones.lower) {
      bones.lower.rotation.z += (targetZ * 0.3 - bones.lower.rotation.z) * damp
    }
    if (bones.mid) {
      bones.mid.rotation.z += (targetZ * 0.6 - bones.mid.rotation.z) * damp
    }
    if (bones.tip) {
      bones.tip.rotation.z += (targetZ * 1.0 - bones.tip.rotation.z) * damp
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      dispose={null}
    >
      <primitive object={scene} />
    </group>
  )
}

// 预加载（首屏体验优化）
useGLTF.preload('/models/fishing_rod.glb')

/**
 * ====== 在游戏场景中使用示例 ======
 *
 * import FishingRod from './components/FishingRod'
 *
 * function GameScene() {
 *   // 鱼上钩强度（0~1，由游戏逻辑控制）
 *   const [fishPull, setFishPull] = useState(0)
 *
 *   // 模拟鱼上钩动画
 *   useEffect(() => {
 *     let frame: number
 *     const animate = () => {
 *       setFishPull(prev => {
 *         const target = Math.random() > 0.95 ? 1 : 0
 *         return prev + (target - prev) * 0.1
 *       })
 *       frame = requestAnimationFrame(animate)
 *     }
 *     animate()
 *     return () => cancelAnimationFrame(frame)
 *   }, [])
 *
 *   return (
 *     <>
 *       <FishingRod bendAngle={fishPull * 30} />
 *       {/* 其他场景元素 */}
 *     </>
 *   )
 * }
 */