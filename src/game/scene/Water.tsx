// ═══════════════════════════════════════
// 3D 动态水面 — 极薄透明层
// 不改变背景颜色，仅叠加微动波纹高光
// ═══════════════════════════════════════

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface WaterProps {
  opacity?: number  // 波纹高光强度
  width?: number
  depth?: number
  segments?: number
  speed?: number
}

function createNormalMap(size: number = 512): THREE.DataTexture {
  const pixelCount = size * size
  const data = new Uint8ClampedArray(pixelCount * 4)
  const layers = [
    { scale: 3, amp: 0.7, angle: 0 },
    { scale: 7, amp: 0.4, angle: 1.2 },
    { scale: 14, amp: 0.2, angle: -0.7 },
  ]
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size
      let nx = 0, ny = 0
      for (const l of layers) {
        const c = Math.cos(l.angle), s = Math.sin(l.angle)
        const ur = u * c - v * s, vr = u * s + v * c
        nx += Math.cos(ur * Math.PI * 2 * l.scale) * l.scale * l.amp
        ny += -Math.sin(vr * Math.PI * 2 * l.scale) * l.scale * l.amp
      }
      const idx = (y * size + x) * 4
      data[idx] = Math.floor(((nx * 0.3 + 0.5) % 1) * 255)
      data[idx + 1] = Math.floor(((ny * 0.3 + 0.5) % 1) * 255)
      data[idx + 2] = 255
      data[idx + 3] = 255
    }
  }
  const t = new THREE.DataTexture(data, size, size)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  t.needsUpdate = true
  return t
}

export function Water({
  opacity = 0.12,
  width = 30,
  depth = 40,
  segments = 64,
  speed = 0.3,
}: WaterProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const normalMap = useMemo(() => createNormalMap(512), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uSpeed: { value: speed },
      uNormalMap: { value: normalMap },
    }),
    [opacity, speed, normalMap]
  )

  // 顶点：极轻 sin 起伏
  const vert = /* glsl */ `
    uniform float uTime;
    uniform float uSpeed;
    varying vec2 vUv;
    void main() {
      vec3 p = position;
      p.y += sin(p.x * 0.4 + uTime * uSpeed) * cos(p.z * 0.35 + uTime * 0.7) * 0.08;
      p.y += sin(p.x * 0.9 - uTime * 0.5) * sin(p.z * 0.7 + uTime * 0.4) * 0.05;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `

  // 片段：只输出波纹高光白点 + 边缘暗角，不染底色
  const frag = /* glsl */ `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uOpacity;
    uniform sampler2D uNormalMap;
    varying vec2 vUv;

    void main() {
      // 双层法线 → 亮度变化
      vec2 uv1 = vUv * 2.5 + vec2(uTime * uSpeed * 0.02, uTime * uSpeed * 0.015);
      vec3 n1 = normalize(texture2D(uNormalMap, uv1).rgb * 2.0 - 1.0);

      vec2 uv2 = vUv * 6.0 + vec2(-uTime * uSpeed * 0.04, uTime * uSpeed * 0.03);
      vec3 n2 = normalize(texture2D(uNormalMap, uv2).rgb * 2.0 - 1.0);

      // 波纹强度
      float ripple = (n1.x * 0.6 + n2.x * 0.4) * 0.5 + 0.5;

      // 仅输出微亮白光点（高光），其余透明
      float highlight = smoothstep(0.55, 0.75, ripple) * 0.4
                      + smoothstep(0.7, 1.0, ripple) * 0.3;

      // 边缘暗角（无形中融入背景）
      float edge = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
      edge *= smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);

      float alpha = highlight * uOpacity * edge;

      // 白色高光
      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
    }
  `

  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta
    }
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -10]}>
      <planeGeometry args={[width, depth, segments, segments]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vert}
        fragmentShader={frag}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
