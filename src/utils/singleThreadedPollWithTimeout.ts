// Copyright © 2026 Jalapeno Labs

import { singleThreadedInterval } from './singleThreadedInterval'

/**
 * Polls an async `condition` on a fixed interval until it resolves truthy or the
 * timeout elapses. The interval is single-threaded, so a slow condition check
 * never overlaps itself. Resolves `true` when the condition is met, or `false`
 * once `timeoutMs` is reached without success.
 */
export function singleThreadedPollWithTimeout(
  condition: () => Promise<boolean>,
  intervalMs: number,
  timeoutMs: number,
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let elapsedMs = 0

    const interval = singleThreadedInterval(async () => {
      if (await condition()) {
        clearInterval(interval)
        resolve(true)
        return
      }

      elapsedMs += intervalMs
      if (elapsedMs >= timeoutMs) {
        clearInterval(interval)
        resolve(false)
      }
    }, intervalMs)
  })
}
