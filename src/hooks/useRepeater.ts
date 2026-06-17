// Copyright © 2026 Jalapeno Labs

import { useEffect, useState } from 'react'

import { setTimeoutToNextSecond } from '../utils/setTimeoutToNextSecond'

/**
 * Increments a counter at a regular interval, synchronized to the nearest
 * wall-clock second boundary so multiple repeaters tick together. Returns the
 * current count and its setter.
 */
export function useRepeater(interval: number = 1_000, stop: boolean = false) {
  const [ count, setCount ] = useState<number>(0)

  useEffect(() => {
    if (stop) {
      return undefined
    }

    let timer: ReturnType<typeof setInterval>
    const synchronizeTimeout = setTimeoutToNextSecond(() => {
      timer = setInterval(() => {
        setCount((previous) => previous + 1)
      }, interval)
    })

    return () => {
      clearTimeout(synchronizeTimeout)
      clearInterval(timer)
    }
  }, [ interval, stop ])

  return [ count, setCount ] as const
}
