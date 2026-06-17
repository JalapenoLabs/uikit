// Copyright © 2026 Jalapeno Labs

import type { DependencyList } from 'react'

import { useEffect, useRef } from 'react'

/**
 * Scrolls a referenced element to its bottom whenever the dependency list
 * changes (and on mount). Handy for chat logs and consoles that should stick to
 * the newest entry. Attach the returned `listRef` to the scrollable element.
 */
export function useScrollOnMount<Element extends HTMLElement>(dependencyArray: DependencyList = []) {
  const listRef = useRef<Element | null>(null)

  useEffect(() => {
    const listElement = listRef.current
    if (!listElement) {
      console.debug('useScrollOnMount: list element ref is missing; skipping scroll')
      return
    }

    listElement.scrollTop = listElement.scrollHeight
    // The dependency list is intentionally caller-provided.
  }, dependencyArray)

  return {
    listRef,
  } as const
}
