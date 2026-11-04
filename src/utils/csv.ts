// Copyright © 2026 Jalapeno Labs

export type CsvValue = string | number | boolean | Date | null | undefined | readonly (string | number)[]

// A spreadsheet runs a cell that starts with one of these as a formula, so a
// value such as `=HYPERLINK(...)` typed by a user could act when the export
// is opened (OWASP, CSV injection). Such text gets a leading apostrophe,
// which spreadsheets show as plain text.
const FORMULA_TRIGGER = /^[=+\-@\t\r]/
const NEEDS_QUOTES = /[",\r\n]/

function toCsvText(value: CsvValue): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? ''
      : value.toISOString()
  }
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  if (typeof value === 'string') {
    return FORMULA_TRIGGER.test(value)
      ? `'${value}`
      : value
  }
  return String(value)
}

function toCsvField(value: CsvValue): string {
  const text = toCsvText(value)
  if (!NEEDS_QUOTES.test(text)) {
    return text
  }
  return `"${text.replace(/"/g, '""')}"`
}

/**
 * Writes rows as CSV (RFC 4180): fields holding a comma, quote, or line break
 * are quoted with inner quotes doubled, and lines end with CRLF. Dates become
 * ISO 8601, lists join with ", ", and empty values stay empty.
 */
export function toCsv(rows: readonly (readonly CsvValue[])[]): string {
  return rows
    .map((row) => row.map(toCsvField).join(','))
    .join('\r\n')
}

/**
 * Starts the browser's download of `csv` as `fileName` (".csv" is added when
 * missing). A byte order mark leads the file so spreadsheet apps read it as
 * UTF-8 rather than guessing a legacy encoding.
 */
export function downloadCsv(fileName: string, csv: string) {
  if (typeof document === 'undefined') {
    console.warn('downloadCsv needs a browser document; nothing was downloaded', { fileName })
    return
  }

  const blob = new Blob([ `\uFEFF${csv}` ], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName.toLowerCase().endsWith('.csv')
    ? fileName
    : `${fileName}.csv`
  anchor.style.display = 'none'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  // Revoking in the same task can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
