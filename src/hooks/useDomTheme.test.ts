// Copyright © 2026 Jalapeno Labs

import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDomTheme } from './useDomTheme'

describe('useDomTheme', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
    vi.restoreAllMocks()
  })

  it('defaults to light when the root element has no dark class', () => {
    const { result } = renderHook(() => useDomTheme())
    expect(result.current).toBe('light')
  })

  it('reports dark when the root element already has the dark class on mount', () => {
    document.documentElement.classList.add('dark')

    const { result } = renderHook(() => useDomTheme())
    expect(result.current).toBe('dark')
  })

  it('switches to dark when the documentElement gains the dark class', async () => {
    const { result } = renderHook(() => useDomTheme())
    expect(result.current).toBe('light')

    // MutationObserver callbacks are delivered asynchronously, so wait for the
    // observer to flush and the hook state to settle. waitFor wraps the polled
    // assertions in act for us.
    document.documentElement.classList.add('dark')
    await waitFor(() => {
      expect(result.current).toBe('dark')
    })

    document.documentElement.classList.remove('dark')
    await waitFor(() => {
      expect(result.current).toBe('light')
    })
  })

  it('disconnects the observer on unmount', () => {
    const disconnectSpy = vi.spyOn(MutationObserver.prototype, 'disconnect')

    const { unmount } = renderHook(() => useDomTheme())
    unmount()

    expect(disconnectSpy).toHaveBeenCalledTimes(1)
  })
})
