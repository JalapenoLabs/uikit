// Copyright © 2026 Jalapeno Labs

// Core
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useMediaQuery } from './useMediaQuery'

type Listener = () => void

// A controllable stand-in for `window.matchMedia`: every query shares one
// `matches` flag, and `setMatches` notifies the subscribed listeners.
function stubMatchMedia(initialMatches: boolean) {
  let matches = initialMatches
  const listeners = new Set<Listener>()

  vi.stubGlobal('matchMedia', (query: string) => ({
    media: query,
    get matches() {
      return matches
    },
    addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
    removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
  }))

  return {
    listeners,
    setMatches(next: boolean) {
      matches = next
      listeners.forEach((listener) => listener())
    },
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useMediaQuery', () => {
  it('reports whether the query matches', () => {
    stubMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(hover: none)'))
    expect(result.current).toBe(true)
  })

  it('follows the query as it starts and stops matching', () => {
    const media = stubMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(max-width: 640px)'))
    expect(result.current).toBe(false)

    act(() => media.setMatches(true))
    expect(result.current).toBe(true)

    act(() => media.setMatches(false))
    expect(result.current).toBe(false)
  })

  it('stops listening once unmounted', () => {
    const media = stubMatchMedia(false)
    const { unmount } = renderHook(() => useMediaQuery('(hover: none)'))
    expect(media.listeners.size).toBe(1)

    unmount()
    expect(media.listeners.size).toBe(0)
  })

  it('answers false where matchMedia does not exist', () => {
    vi.stubGlobal('matchMedia', undefined)
    const { result } = renderHook(() => useMediaQuery('(hover: none)'))
    expect(result.current).toBe(false)
  })
})
