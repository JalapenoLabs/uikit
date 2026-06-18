// Copyright © 2026 Jalapeno Labs

import type { ParseError } from 'jsonc-parser'

import { parse } from 'jsonc-parser'

/**
 * A minimal validator contract. Any object exposing a `parse` method that
 * accepts unknown data and returns a typed value satisfies this shape,
 * including Zod schemas. This keeps the parser decoupled from any specific
 * validation library.
 *
 * @typeParam Shape The validated, parsed value's type.
 */
export type Validator<Shape> = {
  parse: (data: unknown) => Shape
}

/**
 * Safely parses a JSON or JSONC string, returning `null` on syntax errors.
 *
 * Uses the JSONC parser, which tolerates comments and trailing commas in
 * addition to standard JSON. When a validator is provided, the parsed value is
 * run through it. If validation throws and `failOnBadValidation` is true, the
 * function logs the error and returns `null`; otherwise it warns and returns
 * the un-validated parsed value.
 *
 * @typeParam Shape The expected shape of the parsed value.
 * @param text The JSON string to parse.
 * @param validator Optional validator (e.g. a Zod schema) used to validate
 *   and/or transform the parsed value.
 * @param failOnBadValidation When true, a validation failure returns `null`.
 * @returns The parsed (and optionally validated) value, or `null` if invalid.
 */
export function parseJsonSafe<Shape = Record<string, unknown>>(
  text?: string,
  validator?: Validator<Shape>,
  failOnBadValidation: boolean = false,
): Shape | null {
  if (!text) {
    return null
  }

  // The JSONC parser is more tolerant than JSON.parse and handles comments
  // and trailing commas, while still parsing plain JSON correctly. Rather than
  // throwing, it collects syntax problems into the supplied errors array.
  const errors: ParseError[] = []
  const parsed = parse(text, errors, { allowTrailingComma: true }) as Shape

  if (errors.length > 0) {
    console.debug('parseJsonSafe encountered parse errors, returning null', errors)
    return null
  }

  if (!validator) {
    return parsed
  }

  try {
    // The validator may coerce or transform the value, so prefer its result.
    return validator.parse(parsed)
  }
  catch (validationError) {
    if (failOnBadValidation) {
      console.error('parseJsonSafe validation failed, returning null', validationError)
      return null
    }

    console.warn('parseJsonSafe validation failed, continuing with parsed value', validationError)
    return parsed
  }
}

/**
 * Safely stringifies a value to JSON, tolerating circular references by
 * replacing repeated object references with the string `'[Circular]'`.
 *
 * @param value The value to serialize.
 * @param indent Optional indentation passed through to `JSON.stringify`.
 * @returns The JSON string, or `null` if serialization is impossible.
 */
export function stringifyJsonSafe(value: unknown, indent?: number): string | null {
  const seen = new WeakSet<object>()

  try {
    const serialized = JSON.stringify(
      value,
      (_key, currentValue) => {
        if (typeof currentValue === 'object' && currentValue !== null) {
          if (seen.has(currentValue)) {
            return '[Circular]'
          }
          seen.add(currentValue)
        }
        return currentValue
      },
      indent,
    )

    // JSON.stringify returns undefined for values it cannot represent
    // (a bare undefined, a function, a symbol). Normalize that to null.
    if (serialized === undefined) {
      return null
    }
    return serialized
  }
  catch (error) {
    console.debug('stringifyJsonSafe failed to serialize value, returning null', error)
    return null
  }
}
