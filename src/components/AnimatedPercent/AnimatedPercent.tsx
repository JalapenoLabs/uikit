// Copyright © 2026 Jalapeno Labs

// Core
import { useEffect, useRef, useState } from 'react'

// Utility
import { formatPercent } from '../../utils/percent'

type Props = {
  value: number | null
  animationDurationMs?: number
}

/**
 * A percentage label that smoothly counts toward new values with an ease-out
 * cubic animation. Null and NaN values render immediately without animating.
 */
export function AnimatedPercent(props: Props) {
  const {
    value,
    animationDurationMs = 1200,
  } = props

  const [ displayValue, setDisplayValue ] = useState(value)
  const previousValue = useRef<number | null>(value)

  useEffect(() => {
    // Render missing values immediately, with no animation.
    if (value == null || Number.isNaN(value)) {
      setDisplayValue(value)
      previousValue.current = value
      return
    }

    const startValue = previousValue.current ?? 0
    const endValue = value
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / animationDurationMs, 1)

      // Ease-out cubic: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(startValue + (endValue - startValue) * eased)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
      else {
        previousValue.current = endValue
      }
    }

    requestAnimationFrame(animate)
  }, [ value, animationDurationMs ])

  return <>{
    formatPercent(displayValue)
  }</>
}
