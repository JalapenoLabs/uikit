// Copyright © 2026 Jalapeno Labs

import { describe, it, expect } from 'vitest'
import { reorderArray } from './reorderArray'

describe('reorderArray', () => {
  it('moves an element within bounds', () => {
    expect(reorderArray([ 'a', 'b', 'c', 'd' ], 1, 3)).toEqual([ 'a', 'c', 'd', 'b' ])
  })

  it('is non-mutating to the input array', () => {
    const input = [ 1, 2, 3 ]
    reorderArray(input, 0, 2)
    expect(input).toEqual([ 1, 2, 3 ])
  })

  it('clamps newIndex and ignores invalid currentIndex', () => {
    const input = [ 'x', 'y', 'z' ]
    expect(reorderArray(input, -1, 5)).toEqual([ 'x', 'y', 'z' ])
    expect(reorderArray(input, 0, 99)).toEqual([ 'y', 'z', 'x' ])
    expect(reorderArray(input, 2, -3)).toEqual([ 'z', 'x', 'y' ])
  })

  it('handles empty arrays', () => {
    expect(reorderArray([], 0, 1)).toEqual([])
  })
})
