// Copyright © 2026 Jalapeno Labs

import { clampPercent } from '../../utils/percent'

export const COVERAGE_RED = 'crimson'
export const COVERAGE_YELLOW = 'gold'
export const COVERAGE_GREEN = 'limegreen'

/**
 * Maps a 0-100 coverage value to a color, interpolating red -> yellow -> green
 * with CSS `color-mix`. Null, NaN, and zero map to red.
 */
export function getCoverageColor(value: number | null): string {
  if (value === null || Number.isNaN(value) || value === 0) {
    return COVERAGE_RED
  }

  const percent = clampPercent(value)

  if (percent <= 50) {
    // Interpolate red -> yellow across 0-50%.
    const yellowPercent = percent * 2
    return `color-mix(in srgb, ${COVERAGE_YELLOW} ${yellowPercent}%, ${COVERAGE_RED})`
  }

  // Interpolate yellow -> green across 50-100%.
  const greenPercent = (percent - 50) * 2
  return `color-mix(in srgb, ${COVERAGE_GREEN} ${greenPercent}%, ${COVERAGE_YELLOW})`
}
