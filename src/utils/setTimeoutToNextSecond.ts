// Copyright © 2026 Jalapeno Labs

/**
 * Schedules a callback to fire at the start of the next wall-clock second.
 * Useful for synchronizing multiple timers so they all tick together.
 */
export function setTimeoutToNextSecond(callback: () => void): ReturnType<typeof setTimeout> {
  const now = Date.now()
  const msUntilNextSecond = 1000 - (now % 1000)

  return setTimeout(callback, msUntilNextSecond)
}
