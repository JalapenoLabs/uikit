// Copyright © 2026 Jalapeno Labs

import { describe, it, expect } from 'vitest'
import { clipText, clipTextFromEnd } from './clipText'

describe('clipText', () => {
  it('returns the original when length is within the max', () => {
    expect(clipText('hello', 5)).toBe('hello')
    expect(clipText('hi', 10)).toBe('hi')
  })

  it('normalizes newlines and trims before clipping', () => {
    const result = clipText('  line1\nline2  ', 10)
    expect(result.endsWith('...')).toBe(true)
    expect(result.length).toBeLessThanOrEqual(10)
  })

  it('appends an ellipsis and respects the max length', () => {
    const result = clipText('abcdefghijklmnopqrstuvwxyz', 10)
    expect(result).toHaveLength(10)
    expect(result.endsWith('...')).toBe(true)
  })

  it('never exceeds a very small max length', () => {
    expect(clipText('abcdef', 0)).toBe('')
    expect(clipText('abcdef', 1)).toBe('a')
    expect(clipText('abcdef', 2)).toBe('ab')
    expect(clipText('abcdef', 3)).toBe('abc')
  })

  it('handles empty input', () => {
    expect(clipText('', 5)).toBe('')
  })
})

describe('clipTextFromEnd', () => {
  it('returns the original when length is within the max', () => {
    expect(clipTextFromEnd('hello', 5)).toBe('hello')
    expect(clipTextFromEnd('hi', 10)).toBe('hi')
  })

  it('prepends an ellipsis and respects the max length', () => {
    const result = clipTextFromEnd('abcdefghijklmnopqrstuvwxyz', 10)
    expect(result).toHaveLength(10)
    expect(result.startsWith('...')).toBe(true)
  })

  it('never exceeds a very small max length', () => {
    expect(clipTextFromEnd('abcdef', 0)).toBe('')
    expect(clipTextFromEnd('abcdef', 1)).toBe('f')
    expect(clipTextFromEnd('abcdef', 2)).toBe('ef')
    expect(clipTextFromEnd('abcdef', 3)).toBe('def')
  })

  it('handles empty input', () => {
    expect(clipTextFromEnd('', 5)).toBe('')
  })
})
