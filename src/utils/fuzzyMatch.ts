// Copyright © 2026 Jalapeno Labs

// Subsequence-based fuzzy matcher: every query character must appear in the
// target in order (case-insensitive). The score rewards consecutive runs and
// matches at word boundaries (start of string, after a separator, or at a
// camelCase transition). Lower score = better, so callers sort ascending.
//
// Deliberately hand-rolled to avoid pulling in fuse.js or fzf: ranking a few
// thousand candidates per keystroke does not need a heavy dependency.

export type FuzzyMatch = {
  score: number
  // Indices into the target that matched the query, useful for highlighting.
  indices: number[]
}

const SEPARATOR_CHARS = new Set([ '/', '\\', '.', '_', '-', ' ' ])

export function fuzzyMatch(query: string, target: string): FuzzyMatch | null {
  if (!query) {
    return {
      score: 0,
      indices: [],
    }
  }

  // Normalize path separators so either slash matches the same target.
  const normalizedQuery = query.toLowerCase().replace(/\\/g, '/')
  const normalizedTarget = target.toLowerCase().replace(/\\/g, '/')

  const indices: number[] = []
  let queryIndex = 0
  let targetIndex = 0
  let lastMatchedIndex = -2
  let score = 0

  while (targetIndex < normalizedTarget.length && queryIndex < normalizedQuery.length) {
    if (normalizedTarget[targetIndex] !== normalizedQuery[queryIndex]) {
      targetIndex++
      continue
    }

    indices.push(targetIndex)

    const isConsecutive = targetIndex === lastMatchedIndex + 1
    const previousChar = targetIndex === 0
      ? ''
      : target[targetIndex - 1]
    const isCamelBoundary = previousChar >= 'a' && previousChar <= 'z'
      && target[targetIndex] >= 'A' && target[targetIndex] <= 'Z'
    const isAtBoundary = targetIndex === 0 || SEPARATOR_CHARS.has(previousChar) || isCamelBoundary

    if (isConsecutive) {
      score -= 5
    }
    if (isAtBoundary) {
      score -= 8
    }
    // Penalize gaps between matched characters.
    score += targetIndex - lastMatchedIndex

    lastMatchedIndex = targetIndex
    targetIndex++
    queryIndex++
  }

  if (queryIndex < normalizedQuery.length) {
    return null
  }

  // Slight bonus for shorter targets so "a" ranks "ab" above "abcdefg".
  score += target.length * 0.1

  return {
    score,
    indices,
  }
}
