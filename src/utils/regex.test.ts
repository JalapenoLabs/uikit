// Copyright © 2026 Jalapeno Labs

import { describe, it, expect } from 'vitest'
import { validAbsoluteLinuxFilePathRegex, dotEnvEntryRegex } from './regex'

// We list these statically so if one of them fails we can see the exact line that failed.

describe('validAbsoluteLinuxFilePathRegex', () => {
  it('accepts valid absolute Linux file paths', () => {
    expect(validAbsoluteLinuxFilePathRegex.test('/')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('/foo')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('/foo/')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('//foo//bar')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('/a b/c#d')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('/var/log/syslog')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('/tmp/.hidden')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('/usr/local/bin/')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('/./foo/../bar')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('///multiple////slashes')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('/.')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('/..')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('/...')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('/.config//app')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('/тест/文件')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('/emoji/🚀')).toBe(true)
    expect(validAbsoluteLinuxFilePathRegex.test('/foo ')).toBe(true)
  })

  it('rejects non-absolute or invalid Linux file paths', () => {
    const nullChar = '\0'

    expect(validAbsoluteLinuxFilePathRegex.test('foo/bar')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('./foo')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('../foo')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('C:/foo')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('C\\foo')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('C:\\foo')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test(`/foo${nullChar}bar`)).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test(nullChar)).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test(`/contains-null-${nullChar}-char`)).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('   ')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test(' /foo')).toBe(false)
  })

  it('rejects paths containing disallowed characters', () => {
    // Disallow: <>:"\|?*
    expect(validAbsoluteLinuxFilePathRegex.test('/foo<bar')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('/foo>bar')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('/foo:bar')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('/foo"bar')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('/foo\\bar')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('/foo|bar')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('/foo?bar')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('/foo*bar')).toBe(false)

    // Also validate they are disallowed anywhere in the path (not just first segment).
    expect(validAbsoluteLinuxFilePathRegex.test('/a/b<c')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('/a/b>c')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('/a/b:c')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('/a/b"c')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('/a/b\\c')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('/a/b|c')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('/a/b?c')).toBe(false)
    expect(validAbsoluteLinuxFilePathRegex.test('/a/b*c')).toBe(false)
  })

  it('should be fine on an empty string', () => {
    expect(validAbsoluteLinuxFilePathRegex.test('')).toBe(true)
  })
})

describe('dotEnvEntryRegex', () => {
  it('matches at least one "=" that is NOT inside single or double quotes', () => {
    expect(dotEnvEntryRegex.test('KEY=value')).toBe(true)
    expect(dotEnvEntryRegex.test('KEY="value"')).toBe(true)
    expect(dotEnvEntryRegex.test('KEY=\'value\'')).toBe(true)
    expect(dotEnvEntryRegex.test('KEY="="')).toBe(true)
    expect(dotEnvEntryRegex.test('KEY=\'=\'')).toBe(true)
    expect(dotEnvEntryRegex.test('KEY:"="')).toBe(false)
    expect(dotEnvEntryRegex.test('KEY:\'=\'')).toBe(false)
    expect(dotEnvEntryRegex.test('KEY: "="')).toBe(false)
    expect(dotEnvEntryRegex.test('KEY: \'=\'')).toBe(false)
    expect(dotEnvEntryRegex.test('"="')).toBe(false)
    expect(dotEnvEntryRegex.test('\'=\'')).toBe(false)
    expect(dotEnvEntryRegex.test('=')).toBe(true)
    expect(dotEnvEntryRegex.test('==')).toBe(true)
    expect(dotEnvEntryRegex.test('===')).toBe(true)
    expect(dotEnvEntryRegex.test('')).toBe(false)
  })
})
