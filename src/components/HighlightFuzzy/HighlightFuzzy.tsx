// Copyright © 2026 Jalapeno Labs

import type { ReactNode, MouseEvent, FocusEvent } from 'react'

// Core
import { useMemo } from 'react'

type MatchRange = {
  start: number
  end: number
}

type Props = {
  /** The full text to render. */
  text: string
  /** The search query to highlight. */
  query?: string
  /** When true, matching is case-sensitive. */
  caseSensitive?: boolean
  /** Minimum query length before any highlighting happens. */
  minMatchCharLength?: number

  id?: string
  className?: string
  onClick?: (event: MouseEvent<HTMLParagraphElement>) => void
  onBlur?: (event: FocusEvent<HTMLParagraphElement>) => void
}

/**
 * Renders text with every occurrence of `query` wrapped in a `<mark>`. Useful
 * for search result lists. Matching is plain substring (not subsequence); for
 * ranked subsequence matching see the `fuzzyMatch` utility.
 */
export function HighlightFuzzy(props: Props) {
  const {
    text,
    query = '',
    caseSensitive = false,
    minMatchCharLength = 2,
    ...rest
  } = props

  const matchRanges = useMemo<MatchRange[]>(() => {
    if (!query || query.length < minMatchCharLength) {
      return []
    }

    const haystack = caseSensitive
      ? text
      : text.toLowerCase()
    const needle = caseSensitive
      ? query
      : query.toLowerCase()
    const ranges: MatchRange[] = []

    let startIndex = 0
    while (startIndex <= haystack.length - needle.length) {
      const index = haystack.indexOf(needle, startIndex)
      if (index === -1) {
        break
      }
      ranges.push({ start: index, end: index + needle.length })
      startIndex = index + needle.length
    }

    return ranges
  }, [ text, query, caseSensitive, minMatchCharLength ])

  if (matchRanges.length === 0) {
    return <p {...rest}>{
      text
    }</p>
  }

  const parts: ReactNode[] = []
  let cursor = 0
  matchRanges.forEach((range, index) => {
    if (range.start > cursor) {
      parts.push(text.slice(cursor, range.start))
    }
    parts.push(<mark key={index}>{
      text.slice(range.start, range.end)
    }</mark>)
    cursor = range.end
  })
  if (cursor < text.length) {
    parts.push(text.slice(cursor))
  }

  return <p {...rest}>{
    parts
  }</p>
}
