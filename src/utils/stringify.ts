// Copyright © 2026 Jalapeno Labs

/**
 * Stringifies any number of values into a single string, similar to how
 * `console.log` assembles its arguments:
 * - skips `undefined` and `null`
 * - expands `Error` with its name, message, and stack
 * - pretty-prints plain objects as indented JSON
 * - falls back to `String(value)` for everything else
 */
export function stringify(...values: unknown[]): string {
  if (values.length === 0) {
    return ''
  }

  const parts: string[] = []
  for (const value of values) {
    if (value === undefined || value === null) {
      continue
    }

    if (value instanceof Error) {
      parts.push(`Error: ${value.name} - ${value.message}`)
      if (value.stack) {
        parts.push(`Stack: ${value.stack}`)
      }
      continue
    }

    if (typeof value === 'object') {
      try {
        parts.push(JSON.stringify(value, null, 2))
      }
      catch (error) {
        console.debug('stringify could not serialize a value', error)
        parts.push(String(error))
      }
      continue
    }

    parts.push(String(value))
  }

  return parts.join(' ').trim()
}
