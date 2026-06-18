// Copyright © 2026 Jalapeno Labs

import { describe, it, expect } from 'vitest'
import { deepDiff } from './deepDiff'

describe('deepDiff', () => {
  it('returns an empty object for identical objects', () => {
    const subject = { x: 1, y: { z: 2 }, arr: [ 1, 2 ]}
    expect(deepDiff(subject, subject)).toEqual({})
  })

  it('detects primitive changes', () => {
    const left = { a: 1, b: 2 }
    const right = { a: 1, b: 3 }
    expect(deepDiff(right, left)).toEqual({ b: 3 })
  })

  it('detects nested object changes and only returns the changed leaf', () => {
    const base = { a: { b: { c: 1, d: 9 }}}
    const updated = { a: { b: { c: 2, d: 9 }}}
    expect(deepDiff(updated, base)).toEqual({ a: { b: { c: 2 }}})
  })

  it('treats arrays as atomic values', () => {
    const base = { a: [ 1, 2 ]}
    const updated = { a: [ 2, 3 ]}
    expect(deepDiff(updated, base)).toEqual({ a: [ 2, 3 ]})
  })

  it('includes new keys present only in the updated object', () => {
    const base = { a: 1 }
    const updated = { a: 1, b: 2 }
    expect(deepDiff(updated, base)).toEqual({ b: 2 })
  })

  it('treats non-plain objects such as Date as atomic', () => {
    const base = { when: new Date(0) }
    const updated = { when: new Date(1_000) }
    const difference = deepDiff(updated, base)
    expect(difference.when).toBeInstanceOf(Date)
    expect(difference.when).toEqual(new Date(1_000))
  })

  it('does not mutate the inputs', () => {
    const base = { a: { b: 1 }}
    const updated = { a: { b: 2 }}
    deepDiff(updated, base)
    expect(base).toEqual({ a: { b: 1 }})
    expect(updated).toEqual({ a: { b: 2 }})
  })
})
