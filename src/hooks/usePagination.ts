// Copyright © 2026 Jalapeno Labs

import { useEffect, useState } from 'react'

type Options = {
  initialPage?: number
  maxPerPage: number
}

/**
 * Slices an array into pages and tracks the active page. Automatically clamps
 * the active page back into range when the list shrinks.
 */
export function usePagination<Item>(allItems: Item[], options: Options) {
  const {
    initialPage = 1,
    maxPerPage,
  } = options

  const [ activePage, setActivePage ] = useState<number>(initialPage)

  const totalPages = Math.max(1, Math.ceil(allItems.length / maxPerPage))
  const startIndex = (activePage - 1) * maxPerPage
  const items = allItems.slice(startIndex, startIndex + maxPerPage)

  useEffect(() => {
    if (activePage > totalPages) {
      setActivePage(totalPages)
    }
  }, [ activePage, totalPages ])

  function reset() {
    setActivePage(initialPage)
  }

  return {
    activePage,
    setActivePage,
    items,
    totalItems: allItems.length,
    visibleItemCount: items.length,
    totalPages,
    startIndex,
    reset,
  } as const
}
