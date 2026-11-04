// Copyright © 2026 Jalapeno Labs

// Core
import { useCallback, useSyncExternalStore } from 'react'

// Environments without `matchMedia` (server rendering, some test DOMs) answer
// every query with `false`, so the desktop layout is the safe default.
function canMatchMedia() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
}

/**
 * Whether a CSS media query currently matches, kept current as the viewport
 * or input device changes. Uses `useSyncExternalStore`, so every component
 * reading the same query agrees within a render.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    if (!canMatchMedia()) {
      return () => {}
    }
    const mediaQueryList = window.matchMedia(query)
    mediaQueryList.addEventListener('change', onChange)
    return () => mediaQueryList.removeEventListener('change', onChange)
  }, [ query ])

  const getSnapshot = useCallback(() => {
    if (!canMatchMedia()) {
      return false
    }
    return window.matchMedia(query).matches
  }, [ query ])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
