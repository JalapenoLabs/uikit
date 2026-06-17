// Copyright © 2026 Jalapeno Labs

import { useState, useCallback } from 'react'

/**
 * Returns a monotonically increasing value and a function that forces a
 * re-render when called. Useful for imperatively refreshing components that
 * read from mutable external sources.
 */
export function useRerender() {
  const [ value, setValue ] = useState<number>(0)

  const rerender = useCallback(() => setValue((previous) => previous + 1), [])

  return [ value, rerender ] as const
}
