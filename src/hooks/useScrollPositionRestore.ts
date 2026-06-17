// Copyright © 2026 Jalapeno Labs

import { useLayoutEffect, useRef } from 'react'

type ScrollPosition = {
  scrollTop: number
  scrollLeft: number
}

const SAVE_DEBOUNCE_MS = 200

/**
 * Persists and restores an element's scroll position across mounts using
 * sessionStorage, keyed by `storageKey`. Attach the returned ref to the
 * scrollable element. Saves are debounced; storage errors are ignored.
 */
export function useScrollPositionRestore(storageKey: string) {
  const ref = useRef<HTMLElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingPositionRef = useRef<ScrollPosition | null>(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element || !storageKey) {
      return undefined
    }

    try {
      const saved = sessionStorage.getItem(storageKey)
      if (saved) {
        const position: ScrollPosition = JSON.parse(saved)
        element.scrollTop = position.scrollTop
        element.scrollLeft = position.scrollLeft
      }
    }
    catch {
      // Ignore storage access errors or malformed data.
    }

    const flushSave = () => {
      const pending = pendingPositionRef.current
      if (!pending) {
        return
      }

      try {
        sessionStorage.setItem(storageKey, JSON.stringify(pending))
      }
      catch {
        // Ignore storage access errors.
      }
      pendingPositionRef.current = null
    }

    const handleScroll = () => {
      pendingPositionRef.current = {
        scrollTop: element.scrollTop,
        scrollLeft: element.scrollLeft,
      }

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        flushSave()
        timerRef.current = null
      }, SAVE_DEBOUNCE_MS)
    }

    element.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      element.removeEventListener('scroll', handleScroll)
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      flushSave()
    }
  }, [ storageKey ])

  return ref
}
