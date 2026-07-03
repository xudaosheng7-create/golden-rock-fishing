import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Weather, Tide } from '../types'

interface WorldState {
  // 当前位置
  currentSpot: string | null
  unlockedSpots: string[]

  // 环境
  tide: Tide
  weather: Weather
  time: string

  // 水深调节
  depth: number

  // ── Actions ──
  setCurrentSpot: (spotId: string) => void
  unlockSpot: (spotId: string) => void
  setTide: (tide: Tide) => void
  setWeather: (weather: Weather) => void
  setTime: (time: string) => void
  setDepth: (depth: number) => void
  updateEnvironment: () => void
}

// 潮汐循环（基于真实潮汐周期简化）
function getTideFromTime(hour: number): Tide {
  // 简化：6小时周期
  const cycle = hour % 12
  if (cycle < 3) return '涨潮'
  if (cycle < 5) return '大潮'
  if (cycle < 7) return '退潮'
  if (cycle < 9) return '平潮'
  if (cycle < 11) return '小潮'
  return '平潮'
}

// 天气随机（带权重）
function getRandomWeather(): Weather {
  const roll = Math.random() * 100
  if (roll < 40) return '晴'
  if (roll < 65) return '多云'
  if (roll < 80) return '雨'
  if (roll < 90) return '大风'
  if (roll < 97) return '雾'
  return '台风'
}

export const useWorldStore = create<WorldState>()(
  persist(
    (set) => ({
      currentSpot: 'spot_001',
      unlockedSpots: ['spot_001','spot_002','spot_003','spot_004','spot_005','spot_006','spot_007','spot_008'], // 全部解锁

      tide: '涨潮',
      weather: '晴',
      time: '08:00',

      depth: 5, // 默认 5m

      setCurrentSpot: (spotId) => set({ currentSpot: spotId }),
      unlockSpot: (spotId) =>
        set((s) => ({
          unlockedSpots: s.unlockedSpots.includes(spotId)
            ? s.unlockedSpots
            : [...s.unlockedSpots, spotId],
        })),
      setTide: (tide) => set({ tide }),
      setWeather: (weather) => set({ weather }),
      setTime: (time) => set({ time }),
      setDepth: (depth) => set({ depth }),

      // 每次进入钓场或每隔一段时间调用
      updateEnvironment: () => {
        const now = new Date()
        const hours = now.getHours()
        const minutes = now.getMinutes()
        const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        set({
          tide: getTideFromTime(hours),
          weather: getRandomWeather(),
          time,
        })
      },
    }),
    {
      name: 'ocean-world',
      version: 2,
      migrate: () => ({
        currentSpot: 'spot_001',
        unlockedSpots: ['spot_001','spot_002','spot_003','spot_004','spot_005','spot_006','spot_007','spot_008'],
        tide: '涨潮' as const,
        weather: '晴' as const,
        time: '08:00',
        depth: 5,
      }),
    }
  )
)
