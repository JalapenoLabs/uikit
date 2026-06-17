// Copyright © 2026 Jalapeno Labs

import { describe, it, expect } from 'vitest'
import { fuzzyMatch } from './fuzzyMatch'

describe('fuzzyMatch', () => {
  it('returns a zero score and no indices for an empty query', () => {
    expect(fuzzyMatch('', 'anything')).toEqual({ score: 0, indices: []})
  })

  it('returns null when the query is not a subsequence', () => {
    expect(fuzzyMatch('xyz', 'abc')).toBeNull()
    expect(fuzzyMatch('cba', 'abc')).toBeNull()
  })

  it('matches a subsequence in order and records the indices', () => {
    const match = fuzzyMatch('ac', 'abc')
    expect(match).not.toBeNull()
    expect(match?.indices).toEqual([ 0, 2 ])
  })

  it('is case-insensitive and normalizes path separators', () => {
    expect(fuzzyMatch('SRC/IDX', 'src\\idx')).not.toBeNull()
  })

  it('ranks a contiguous match better (lower) than a gappy one', () => {
    const contiguous = fuzzyMatch('abc', 'abcdef')
    const gappy = fuzzyMatch('abc', 'axbxc')
    expect(contiguous).not.toBeNull()
    expect(gappy).not.toBeNull()
    expect(contiguous!.score).toBeLessThan(gappy!.score)
  })
})
