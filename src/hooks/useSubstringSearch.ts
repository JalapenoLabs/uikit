// Copyright © 2026 Jalapeno Labs

import type { LiteralUnion } from '../types'

import { useMemo, useRef, useState } from 'react'

function normalizeSearchValue(value: unknown): string | null {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeSearchValue(entry))
      .filter((entry): entry is string => Boolean(entry))
      .join(' ')
  }

  if (value == undefined) {
    return null
  }

  return String(value)
}

/**
 * Filters a list of objects by a case-insensitive substring search across the
 * given keys. Returns the search state, a setter, an input ref to wire to a
 * search field, and the filtered results.
 */
export function useSubstringSearch<Shape extends object>(
  items: Shape[],
  searchKeys: LiteralUnion<keyof Shape, string>[],
) {
  const [ search, setSearch ] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const results: Shape[] = useMemo(() => {
    const trimmedSearch = search.trim()
    if (!trimmedSearch || !searchKeys?.length) {
      return items
    }

    const normalizedSearch = trimmedSearch.toLowerCase()

    return items.filter((item) => {
      return searchKeys.some((key) => {
        const value = normalizeSearchValue((item as Record<string, unknown>)[key as string])
        return value?.toLowerCase().includes(normalizedSearch)
      })
    })
  }, [ items, search, searchKeys ])

  return {
    inputRef,
    search,
    setSearch,
    results,
  } as const
}
