// Copyright © 2026 Jalapeno Labs

import { describe, it, expect } from 'vitest'
import { getFlagEmoji } from './getFlagEmoji'

// The expected flag emojis, built independently of the implementation so the
// test verifies the actual Unicode output rather than echoing the source.
const UNITED_STATES_FLAG = '\u{1F1FA}\u{1F1F8}'
const GERMANY_FLAG = '\u{1F1E9}\u{1F1EA}'

describe('getFlagEmoji', () => {
  it('converts a 2-letter uppercase country code to its flag', () => {
    expect(getFlagEmoji('US')).toBe(UNITED_STATES_FLAG)
  })

  it('extracts the region from a BCP-47 locale', () => {
    expect(getFlagEmoji('en-US')).toBe(UNITED_STATES_FLAG)
  })

  it('normalizes the casing of a region subtag in a locale', () => {
    expect(getFlagEmoji('en-us')).toBe(UNITED_STATES_FLAG)
  })

  it('normalizes a bare lowercase region only when written as uppercase', () => {
    expect(getFlagEmoji('us')).toBe('')
    expect(getFlagEmoji('US')).toBe(UNITED_STATES_FLAG)
  })

  it('treats a bare lowercase language tag as a language, not a region', () => {
    expect(getFlagEmoji('de')).toBe('')
  })

  it('still resolves an explicit region from a language-region locale', () => {
    expect(getFlagEmoji('de-DE')).toBe(GERMANY_FLAG)
  })

  it('supports underscore-separated locales', () => {
    expect(getFlagEmoji('en_US')).toBe(UNITED_STATES_FLAG)
  })

  it('returns an empty string for empty input', () => {
    expect(getFlagEmoji('')).toBe('')
  })

  it('returns an empty string for malformed or non-2-letter regions', () => {
    expect(getFlagEmoji('123')).toBe('')
    expect(getFlagEmoji('en-USA')).toBe('')
    expect(getFlagEmoji('e')).toBe('')
    expect(getFlagEmoji('!!')).toBe('')
  })
})
