// Copyright © 2026 Jalapeno Labs

/**
 * Clips a string to a maximum visible length, appending an ellipsis when needed.
 * Newlines are converted to spaces and leading/trailing whitespace is trimmed.
 * For very small `maxLength` values (<= 3), the function returns a hard slice
 * without an ellipsis so the returned string never exceeds `maxLength`.
 */
export function clipText(text: string, maxLength: number = 50): string {
  const normalized = text.trim().replaceAll('\n', ' ')

  if (normalized.length <= maxLength) {
    return normalized
  }

  // For tiny limits, skip the ellipsis to keep the length bounded.
  if (maxLength <= 3) {
    return normalized.slice(0, Math.max(0, maxLength))
  }

  // Reserve three characters for the ellipsis.
  const clippedText = normalized.slice(0, maxLength - 3)
  return `${clippedText}...`
}

/**
 * Clips a string from the end, prepending an ellipsis when needed. Useful for
 * file paths where the tail (filename) matters more than the head.
 */
export function clipTextFromEnd(text: string, maxLength: number = 50): string {
  const normalized = text.trim().replaceAll('\n', ' ')

  if (normalized.length <= maxLength) {
    return normalized
  }

  if (maxLength <= 3) {
    if (maxLength <= 0) {
      return ''
    }
    return normalized.slice(-maxLength)
  }

  const clippedText = normalized.slice(-maxLength + 3)
  return `...${clippedText}`
}
