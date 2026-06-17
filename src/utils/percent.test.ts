// Copyright © 2026 Jalapeno Labs

import { describe, expect, expectTypeOf, it } from 'vitest'
import { clampPercent, formatPercent } from './percent'

describe('clampPercent', () => {
  it('returns 0 when value is null, undefined, or NaN', () => {
    expect(clampPercent(null)).toBe(0)
    expect(clampPercent(undefined)).toBe(0)
    expect(clampPercent(Number.NaN)).toBe(0)
  })

  it('clamps values outside of 0-100', () => {
    expect(clampPercent(-5)).toBe(0)
    expect(clampPercent(150)).toBe(100)
    expect(clampPercent(Number.NEGATIVE_INFINITY)).toBe(0)
    expect(clampPercent(Number.POSITIVE_INFINITY)).toBe(100)
  })

  it('returns the original value within range', () => {
    expect(clampPercent(0)).toBe(0)
    expect(clampPercent(35.5)).toBe(35.5)
    expect(clampPercent(100)).toBe(100)
  })

  it('provides a stable numeric return type', () => {
    const clampedValue = clampPercent(12.34)
    expectTypeOf(clampedValue).toEqualTypeOf<number>()
    clampedValue satisfies number
  })
})

describe('formatPercent', () => {
  it('returns a dash for null or NaN', () => {
    expect(formatPercent(null)).toBe('-')
    expect(formatPercent(Number.NaN)).toBe('-')
  })

  it('clamps values below 0 to 0%', () => {
    expect(formatPercent(-5)).toBe('0%')
    expect(formatPercent(Number.NEGATIVE_INFINITY)).toBe('0%')
  })

  it('rounds within 0-99 without reaching 100%', () => {
    expect(formatPercent(0)).toBe('0%')
    expect(formatPercent(0.6)).toBe('1%')
    expect(formatPercent(49.5)).toBe('50%')
    expect(formatPercent(99.4)).toBe('99%')
    expect(formatPercent(99.6)).toBe('99%')
  })

  it('returns 100% only when the clamped value is exactly 100', () => {
    expect(formatPercent(100)).toBe('100%')
    expect(formatPercent(100.2)).toBe('100%')
    expect(formatPercent(Number.POSITIVE_INFINITY)).toBe('100%')
  })
})
