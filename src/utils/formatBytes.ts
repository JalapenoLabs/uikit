// Copyright © 2026 Jalapeno Labs

import prettyBytes from 'pretty-bytes'

/**
 * Formats a byte count as SI units with exactly one decimal place
 * (e.g. "184.2 GB").
 */
export function formatBytes(bytes: number): string {
  return prettyBytes(bytes, {
    locale: 'en',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}
