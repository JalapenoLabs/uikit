// Copyright © 2026 Jalapeno Labs

import type { Validator } from './json'

import { describe, it, expect, vi } from 'vitest'
import { parseJsonSafe, stringifyJsonSafe } from './json'

describe('parseJsonSafe', () => {
  it('parses valid JSON', () => {
    expect(parseJsonSafe<{ a: number }>(' { "a": 1 } ')).toEqual({ a: 1 })
  })

  it('parses JSONC with comments and trailing commas', () => {
    const jsonc = `{
      // a leading comment
      "name": "jalapeno",
      "count": 3,
    }`
    expect(parseJsonSafe(jsonc)).toEqual({ name: 'jalapeno', count: 3 })
  })

  it('returns null for invalid JSON or empty input', () => {
    expect(parseJsonSafe('not json')).toBeNull()
    expect(parseJsonSafe('')).toBeNull()
    expect(parseJsonSafe(undefined)).toBeNull()
  })

  it('warns but returns parsed data when validation fails and failOnBadValidation is false', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const validator: Validator<{ name: string }> = {
      parse: (data) => {
        const record = data as { name?: string }
        if (!record.name || record.name.length < 5) {
          throw new Error('name too short')
        }
        return { name: record.name }
      },
    }

    const result = parseJsonSafe('{ "name": "bad" }', validator)

    expect(result).toEqual({ name: 'bad' })
    expect(warnSpy.mock.calls.length).toBeGreaterThan(0)

    warnSpy.mockRestore()
  })

  it('logs errors and returns null when validation fails and failOnBadValidation is true', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const validator: Validator<{ name: string }> = {
      parse: (data) => {
        const record = data as { name?: string }
        if (!record.name || record.name.length < 5) {
          throw new Error('name too short')
        }
        return { name: record.name }
      },
    }

    const result = parseJsonSafe('{ "name": "bad" }', validator, true)

    expect(result).toBeNull()
    expect(errorSpy.mock.calls.length).toBeGreaterThan(0)

    errorSpy.mockRestore()
  })

  it('returns the validator result so transforms are applied', () => {
    const validator: Validator<{ name: string }> = {
      // Coerce the value to upper case to prove the validator output is used.
      parse: (data) => {
        const record = data as { name: string }
        return { name: record.name.toUpperCase() }
      },
    }

    const result = parseJsonSafe('{ "name": "jalapeno" }', validator)

    expect(result).toEqual({ name: 'JALAPENO' })
  })
})

describe('stringifyJsonSafe', () => {
  it('stringifies a plain object', () => {
    expect(stringifyJsonSafe({ a: 1, b: 'two' })).toBe('{"a":1,"b":"two"}')
  })

  it('honors the indent argument', () => {
    expect(stringifyJsonSafe({ a: 1 }, 2)).toBe('{\n  "a": 1\n}')
  })

  it('replaces circular references instead of throwing', () => {
    const circular: Record<string, unknown> = { name: 'root' }
    circular.self = circular

    const serialized = stringifyJsonSafe(circular)

    expect(serialized).toContain('"name":"root"')
    expect(serialized).toContain('[Circular]')
  })

  it('returns null for values JSON cannot represent', () => {
    expect(stringifyJsonSafe(undefined)).toBeNull()
    expect(stringifyJsonSafe(() => {})).toBeNull()
  })
})
