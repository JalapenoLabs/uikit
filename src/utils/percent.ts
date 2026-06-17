// Copyright © 2026 Jalapeno Labs

/**
 * Clamps a value into the 0-100 range, treating null, undefined, and NaN as 0.
 */
export function clampPercent(value: number | null | undefined): number {
  // Double equals intentionally covers both null and undefined.
  if (value == undefined || Number.isNaN(value)) {
    return 0
  }

  return Math.min(100, Math.max(0, value))
}

/**
 * Formats a value as a rounded percentage string. Returns a dash for missing
 * values, and never rounds up to 100% unless the clamped value is exactly 100
 * (so 99.6 stays "99%").
 */
export function formatPercent(value: number | null | undefined): string {
  if (value == undefined || Number.isNaN(value)) {
    return '-'
  }

  const percent = clampPercent(value)

  if (percent === 100) {
    return '100%'
  }

  return `${Math.min(99, Math.round(percent))}%`
}
