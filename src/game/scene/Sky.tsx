// ═══════════════════════════════════════
// 3D 天空球 — Three.js 官方 Sky 类
// 参考：three/examples/jsm/objects/Sky.js
// 参数说明：
//   turbidity  → 浑浊度（0-100），越小太阳轮廓越清晰
//   rayleigh   → 锐利值（0-100），越大越有"日落"感
//   mieCoefficient   → 米氏散射系数（0-0.1），影响光晕大小
//   mieDirectionalG   → 米氏方向性（0-1），影响散射方向
// ═══════════════════════════════════════

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Sky as SkyImpl } from 'three/examples/jsm/objects/Sky.js'

interface SkyProps {
  sunPosition: THREE.Vector3     // 太阳原始位置（不归一化）
  turbidity?: number             // 浑浊度，默认 1
  rayleigh?: number              // 锐利值，默认 1.5
  mieCoefficient?: number        // 米氏系数，默认 0.005
  mieDirectionalG?: number       // 米氏方向，默认 0.8
}

export function Sky({
  sunPosition,
  turbidity = 1,
  rayleigh = 1.5,
  mieCoefficient = 0.005,
  mieDirectionalG = 0.8,
}: SkyProps) {
  const skyRef = useRef<SkyImpl | null>(null)
  const { scene } = useThree()

  // 创建 Sky 实例
  useEffect(() => {
    const sky = new SkyImpl()
    sky.scale.setScalar(10000) // 足够大以覆盖整个场景

    sky.material.uniforms['sunPosition'].value.copy(sunPosition)
    sky.material.uniforms['turbidity'].value = turbidity
    sky.material.uniforms['rayleigh'].value = rayleigh
    sky.material.uniforms['mieCoefficient'].value = mieCoefficient
    sky.material.uniforms['mieDirectionalG'].value = mieDirectionalG

    skyRef.current = sky
    scene.add(sky)

    return () => {
      scene.remove(sky)
    }
  }, [])

  // 太阳位置更新
  useEffect(() => {
    if (skyRef.current) {
      skyRef.current.material.uniforms['sunPosition'].value.copy(sunPosition)
    }
  }, [sunPosition])

  // 天空参数更新
  useEffect(() => {
    if (skyRef.current) {
      skyRef.current.material.uniforms['turbidity'].value = turbidity
      skyRef.current.material.uniforms['rayleigh'].value = rayleigh
      skyRef.current.material.uniforms['mieCoefficient'].value = mieCoefficient
      skyRef.current.material.uniforms['mieDirectionalG'].value = mieDirectionalG
    }
  }, [turbidity, rayleigh, mieCoefficient, mieDirectionalG])

  return null
}
