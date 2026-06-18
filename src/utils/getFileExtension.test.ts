// Copyright © 2026 Jalapeno Labs

import { describe, it, expect } from 'vitest'
import { getFileExtension } from './getFileExtension'

describe('getFileExtension', () => {
  it('returns the lowercase extension for simple filenames', () => {
    expect(getFileExtension('file.csv')).toBe('csv')
    expect(getFileExtension('file.JSON')).toBe('json')
    expect(getFileExtension('archive.tar.gz')).toBe('gz')
  })

  it('extracts the extension from the last path segment', () => {
    expect(getFileExtension('/tmp/data/REPORT.CSV')).toBe('csv')
    expect(getFileExtension('path/to/file.txt')).toBe('txt')
  })

  it('treats dotfiles as having an extension', () => {
    expect(getFileExtension('.gitignore')).toBe('gitignore')
    expect(getFileExtension('.hiddenfile')).toBe('hiddenfile')
  })

  it('returns an empty string when there is no extension', () => {
    expect(getFileExtension('filename')).toBe('')
    expect(getFileExtension('/tmp/data/filename')).toBe('')
  })

  it('ignores trailing slashes and directory-like paths', () => {
    expect(getFileExtension('path/to/directory/')).toBe('')
    expect(getFileExtension('/usr/local/bin/')).toBe('')
  })

  it('handles empty, null, and undefined inputs', () => {
    expect(getFileExtension('')).toBe('')
    expect(getFileExtension(null)).toBe('')
    expect(getFileExtension(undefined)).toBe('')
  })
})
