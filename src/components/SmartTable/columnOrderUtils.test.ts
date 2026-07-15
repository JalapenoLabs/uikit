// Copyright © 2026 Jalapeno Labs

import { describe, expect, it } from 'vitest'
import { mergeColumnOrder } from './columnOrderUtils'

describe('mergeColumnOrder', () => {
  it('keeps a stored order that matches the column list', () => {
    expect(mergeColumnOrder([ 'b', 'a', 'c' ], [ 'a', 'b', 'c' ])).toEqual([ 'b', 'a', 'c' ])
  })

  it('drops stored ids that no longer exist', () => {
    expect(mergeColumnOrder([ 'b', 'legacy', 'a' ], [ 'a', 'b' ])).toEqual([ 'b', 'a' ])
  })

  it('appends columns missing from the stored order', () => {
    expect(mergeColumnOrder([ 'c' ], [ 'a', 'b', 'c' ])).toEqual([ 'c', 'a', 'b' ])
  })

  it('returns the natural order when nothing is stored', () => {
    expect(mergeColumnOrder([], [ 'a', 'b' ])).toEqual([ 'a', 'b' ])
  })
})
