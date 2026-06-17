// Copyright © 2026 Jalapeno Labs

import { describe, expect, it } from 'vitest'
import { getCoverageColor } from './coverageColor'

describe('getCoverageColor', () => {
  it('returns red for null, NaN, or zero', () => {
    expect(getCoverageColor(null)).toBe('crimson')
    expect(getCoverageColor(Number.NaN)).toBe('crimson')
    expect(getCoverageColor(0)).toBe('crimson')
  })

  it('interpolates red to yellow for values up to 50%', () => {
    expect(getCoverageColor(1)).toBe('color-mix(in srgb, gold 2%, crimson)')
    expect(getCoverageColor(25)).toBe('color-mix(in srgb, gold 50%, crimson)')
    expect(getCoverageColor(50)).toBe('color-mix(in srgb, gold 100%, crimson)')
  })

  it('interpolates yellow to green for values above 50%', () => {
    expect(getCoverageColor(75)).toBe('color-mix(in srgb, limegreen 50%, gold)')
    expect(getCoverageColor(100)).toBe('color-mix(in srgb, limegreen 100%, gold)')
  })

  it('clamps out-of-range values before interpolating', () => {
    expect(getCoverageColor(150)).toBe('color-mix(in srgb, limegreen 100%, gold)')
    expect(getCoverageColor(-10)).toBe('color-mix(in srgb, gold 0%, crimson)')
  })
})
