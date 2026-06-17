// Copyright © 2026 Jalapeno Labs

import { describe, expect, expectTypeOf, it } from 'vitest'
import { getLast } from './getLast'

describe('getLast', () => {
  it('returns the last element', () => {
    expect(getLast([ 10, 20, 30 ])).toBe(30)
  })

  it('returns the same reference for objects', () => {
    const lastValue = { id: 'last' }
    expect(getLast([{ id: 'first' }, lastValue ])).toBe(lastValue)
  })

  it('returns undefined for empty arrays', () => {
    const values: string[] = []
    expect(getLast(values)).toBeUndefined()
  })

  it('returns undefined for nullish inputs', () => {
    expect(getLast(null)).toBeUndefined()
    expect(getLast(undefined)).toBeUndefined()
  })

  it('preserves generic typing', () => {
    const result = getLast([ 'a', 'b' ])
    expectTypeOf(result).toEqualTypeOf<string | undefined>()
    result satisfies string | undefined
  })
})
