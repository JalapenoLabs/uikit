// Copyright © 2026 Jalapeno Labs

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { singleThreadedPollWithTimeout } from './singleThreadedPollWithTimeout'

describe('singleThreadedPollWithTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves true as soon as the condition becomes truthy', async () => {
    let callCount = 0
    const condition = vi.fn(async () => {
      callCount += 1
      return callCount >= 3
    })

    const pollPromise = singleThreadedPollWithTimeout(condition, 100, 10000)

    // The interval runs an async callback, so we must flush both timers and
    // microtasks repeatedly for the awaited condition to settle.
    await vi.advanceTimersByTimeAsync(300)

    await expect(pollPromise).resolves.toBe(true)
    expect(condition).toHaveBeenCalledTimes(3)
  })

  it('resolves false once the timeout elapses without success', async () => {
    const condition = vi.fn(async () => false)

    const pollPromise = singleThreadedPollWithTimeout(condition, 100, 300)

    await vi.advanceTimersByTimeAsync(300)

    await expect(pollPromise).resolves.toBe(false)
    // 100ms, 200ms, 300ms -> three checks, the last one trips the timeout.
    expect(condition).toHaveBeenCalledTimes(3)
  })

  it('stops polling after the condition succeeds', async () => {
    const condition = vi.fn(async () => true)

    const pollPromise = singleThreadedPollWithTimeout(condition, 50, 1000)

    await vi.advanceTimersByTimeAsync(50)
    await expect(pollPromise).resolves.toBe(true)

    // Advancing further must not invoke the condition again.
    await vi.advanceTimersByTimeAsync(500)
    expect(condition).toHaveBeenCalledTimes(1)
  })
})
