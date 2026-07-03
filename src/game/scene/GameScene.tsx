// ═══════════════════════════════════════
// 3D 场景主入口
// 分层：2D 背景图(CSS) + 3D 水面(无反射Shader) + 鱼竿浮漂
// ═══════════════════════════════════════

import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Water } from './Water'
import { FishingSystem } from './FishingSystem'
import { useWorldStore } from '../store/useWorldStore'
import { SPOTS } from '../db/spots'

function lightenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.min(255, Math.round(r + (255 - r) * factor))},${Math.min(255, Math.round(g + (255 - g) * factor))},${Math.min(255, Math.round(b + (255 - b) * factor))})`
}

function darkenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.round(r * (1 - factor))},${Math.round(g * (1 - factor))},${Math.round(b * (1 - factor))})`
}

function getHorizonRatio(): number {
  const ratio = window.innerHeight / window.innerWidth
  if (ratio > 2.0) return 0.28
  if (ratio > 1.7) return 0.31
  return 0.35
}

// 根据天气时间微调水色
function adjustWaterColor(baseHex: string, weather: string, time: string): string {
  const r = parseInt(baseHex.slice(1,3), 16)
  const g = parseInt(baseHex.slice(3,5), 16)
  const b = parseInt(baseHex.slice(5,7), 16)
  const hour = parseInt(time.split(':')[0], 10)

  // 时间因子：正午亮，黄昏暖
  let tr = 1.0, tg = 1.0, tb = 1.0
  if (hour < 6 || hour > 18) { tr=0.6; tg=0.7; tb=0.8 } // 夜间暗蓝
  else if (hour < 8 || hour > 16) { tr=1.1; tg=1.0; tb=0.9 } // 早晚暖

  // 天气因子
  switch(weather) {
    case '雨': tg*=1.1; tb*=0.9; break
    case '大风': tr*=0.8; tg*=0.85; tb*=0.9; break
    case '雾': tr*=0.9; tg*=0.9; tb*=0.95; break
    case '台风': tr*=0.5; tg*=0.55; tb*=0.6; break
    case '多云': tr*=0.95; tg*=0.95; tb*=1.0; break
  }

  const nr = Math.min(255, Math.max(0, Math.round(r * tr) || 0))
  const ng = Math.min(255, Math.max(0, Math.round(g * tg) || 0))
  const nb = Math.min(255, Math.max(0, Math.round(b * tb) || 0))
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`
}

export function GameScene() {
  const [horizonRatio, setHorizonRatio] = useState(getHorizonRatio)
  const currentSpotId = useWorldStore((s) => s.currentSpot)
  const weather = useWorldStore((s) => s.weather)
  const time = useWorldStore((s) => s.time)
  const currentSpot = SPOTS.find((s) => s.id === currentSpotId) ?? SPOTS[0]
  const waterColor = adjustWaterColor(currentSpot.waterColor, weather, time)

  useEffect(() => {
    const handleResize = () => setHorizonRatio(getHorizonRatio())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maskStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
    maskImage: `linear-gradient(to bottom, transparent ${horizonRatio * 100 - 1}%, black ${horizonRatio * 100 + 15}%)`,
    WebkitMaskImage: `linear-gradient(to bottom, transparent ${horizonRatio * 100 - 1}%, black ${horizonRatio * 100 + 15}%)`,
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      {/* CSS 渐变兜底（WebGL 不可用时）*/}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: -2,
          background: `linear-gradient(
            to bottom,
            ${lightenColor(waterColor, 0.5)} 0%,
            ${lightenColor(waterColor, 0.3)} 28%,
            ${waterColor} 60%,
            ${darkenColor(waterColor, 0.4)} 100%
          )`,
        }}
      />

      {/* 2D 背景图 */}
      <img
        src={currentSpot.bgUrl}
        alt={currentSpot.name}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: -1,
          // 原图直出，不调色
        }}
      />

      {/* 3D Canvas：水面 + 钓鱼系统 */}
      <div style={maskStyle}>
        <Canvas
          gl={{ alpha: true, antialias: false }}
          camera={{ position: [0, 0, 5], fov: 55, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 3]} intensity={0.8} color="#fff5e6" />

            {/* 3D 动态水面（纯 Shader，无反射，不会过曝）*/}
            <Water opacity={0.12} />

            {/* 钓鱼系统 */}
            <FishingSystem />

            {/* 后处理 */}
            <EffectComposer>
              <Bloom intensity={0.35} luminanceThreshold={0.7} luminanceSmoothing={0.9} />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}
