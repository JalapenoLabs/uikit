// Copyright © 2026 Jalapeno Labs

import { useEffect, useState } from 'react'

/**
 * Returns the milliseconds elapsed since the hook mounted (or since `restart`
 * last changed), updating on the given interval.
 */
export function useTimer(restart?: number, interval: number = 1_000): number {
  const [ elapsedMs, setElapsedMs ] = useState<number>(0)

  useEffect(() => {
    const startTime = Date.now()
    const timer = setInterval(() => setElapsedMs(Date.now() - startTime), interval)

    return () => {
      clearInterval(timer)
    }
  }, [ interval, restart ])

  return elapsedMs
}
