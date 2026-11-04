// Copyright © 2026 Jalapeno Labs

// Core
import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadCsv, toCsv } from './csv'

describe('toCsv', () => {
  it('joins fields with commas and lines with CRLF', () => {
    expect(toCsv([[ 'Name', 'Role' ], [ 'Ada', 'Engineer' ]])).toBe('Name,Role\r\nAda,Engineer')
  })

  it('quotes fields holding commas, quotes, or line breaks, doubling inner quotes', () => {
    expect(toCsv([[ 'a,b', 'say "hi"', 'two\nlines', 'plain' ]]))
      .toBe('"a,b","say ""hi""","two\nlines",plain')
  })

  it('writes numbers, booleans, dates, lists, and empty values', () => {
    const date = new Date('2026-01-02T03:04:05.000Z')
    expect(toCsv([[ 42, -1.5, true, date, [ 'x', 'y' ], null, undefined ]]))
      .toBe('42,-1.5,true,2026-01-02T03:04:05.000Z,"x, y",,')
  })

  it('leaves an invalid date empty', () => {
    expect(toCsv([[ new Date('not a date') ]])).toBe('')
  })

  it('defuses text a spreadsheet would run as a formula', () => {
    expect(toCsv([[ '=SUM(A1)', '+1', '-x', '@cmd', 'safe' ]])).toBe('\'=SUM(A1),\'+1,\'-x,\'@cmd,safe')
  })

  it('keeps negative numbers as numbers', () => {
    expect(toCsv([[ -3 ]])).toBe('-3')
  })
})

describe('downloadCsv', () => {
  // The test DOM may not implement object URLs, so each test supplies its own
  // and the originals come back afterwards.
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    vi.restoreAllMocks()
  })

  it('downloads the CSV as a named file through a temporary link', async () => {
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:export')
    const revokeObjectURL = vi.fn()
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
    const clicks: HTMLAnchorElement[] = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function recordClick(this: HTMLAnchorElement) {
      clicks.push(this)
    })

    downloadCsv('people', 'Name\r\nAda')

    expect(clicks).toHaveLength(1)
    expect(clicks[0].download).toBe('people.csv')
    expect(clicks[0].href).toBe('blob:export')
    expect(clicks[0].isConnected).toBe(false)
    const blob = createObjectURL.mock.calls[0][0]
    expect(blob.type).toBe('text/csv;charset=utf-8')
    expect(await blob.text()).toBe('\uFEFFName\r\nAda')

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:export')
  })

  it('keeps a file name that already ends in .csv', () => {
    URL.createObjectURL = () => 'blob:x'
    URL.revokeObjectURL = () => {}
    const clicks: HTMLAnchorElement[] = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function recordClick(this: HTMLAnchorElement) {
      clicks.push(this)
    })

    downloadCsv('Report.CSV', '')
    expect(clicks[0].download).toBe('Report.CSV')
  })
})
