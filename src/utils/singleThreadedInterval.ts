// Copyright © 2026 Jalapeno Labs

/**
 * Creates an interval whose async callback never overlaps itself. If a tick is
 * still running when the next one is due, that tick is skipped rather than
 * queued. Returns the timer id from `setInterval`, browser-safe (a `number`
 * under the DOM, a `Timeout` under Node).
 */
export function singleThreadedInterval(
  callback: () => Promise<void>,
  intervalMs: number,
): ReturnType<typeof setInterval> {
  let loopIsBusy = false

  return setInterval(async () => {
    if (loopIsBusy) {
      return
    }
    loopIsBusy = true

    try {
      await callback()
    }
    finally {
      loopIsBusy = false
    }
  }, intervalMs)
}
