// Copyright © 2026 Jalapeno Labs

/**
 * Returns a new array with one item moved from `currentIndex` to `newIndex`.
 * Indices are clamped to valid bounds; an out-of-range `currentIndex` yields a
 * shallow copy (no-op). The input `list` is never mutated.
 */
export function reorderArray<Shape>(list: Shape[], currentIndex: number, newIndex: number): Shape[] {
  const length = list.length
  if (length === 0) {
    return []
  }

  // An invalid source index is a no-op (return a shallow copy).
  if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= length) {
    return Array.from(list)
  }

  const clampedNewIndex = Math.max(0, Math.min(length - 1, Number.isInteger(newIndex) ? newIndex : 0))

  const result = Array.from(list)
  const [ removed ] = result.splice(currentIndex, 1)
  result.splice(clampedNewIndex, 0, removed)
  return result
}
