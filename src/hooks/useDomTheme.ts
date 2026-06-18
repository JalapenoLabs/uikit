// Copyright © 2026 Jalapeno Labs

import { useEffect, useState } from 'react'

export type DomTheme = 'dark' | 'light'

/**
 * Watches the root `<html>` element's class list for `dark` or `light`
 * and returns the current theme. This is the default mechanism used by
 * TailwindCSS class-based dark mode (`darkMode: 'class'`).
 *
 * Falls back to `'light'` if neither class is present, and is SSR-safe
 * (returns `'light'` when there is no `document`).
 */
export function useDomTheme(): DomTheme {
  const [ theme, setTheme ] = useState<DomTheme>(() => resolveTheme())

  useEffect(() => {
    const htmlElement = document.documentElement

    const observer = new MutationObserver(() => {
      setTheme(resolveTheme())
    })

    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: [ 'class' ],
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return theme
}

function resolveTheme(): DomTheme {
  if (typeof document === 'undefined') {
    return 'light'
  }

  if (document.documentElement.classList.contains('dark')) {
    return 'dark'
  }

  return 'light'
}
