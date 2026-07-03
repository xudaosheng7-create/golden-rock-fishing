import { useEffect, useRef } from 'react'
import { castLineAction } from './useFishingLoop'

// Detect quick downward flip of phone to trigger casting
export function useGyroscope(enabled: boolean = true) {
  const lastGamma = useRef<number>(0)
  const lastFlipTime = useRef<number>(0)

  useEffect(() => {
    if (!enabled) return

    // Use devicemotion for broader compatibility
    const handleMotion = (event: DeviceMotionEvent) => {
      const gamma = event.rotationRate?.gamma ?? 0 // x-axis rotation rate

      // Detect quick downward flip: gamma rate exceeds threshold
      if (gamma > 200 && Date.now() - lastFlipTime.current > 2000) {
        lastFlipTime.current = Date.now()
        castLineAction()
      }

      lastGamma.current = gamma
    }

    window.addEventListener('devicemotion', handleMotion)
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [enabled])
}
