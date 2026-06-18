// Copyright © 2026 Jalapeno Labs

import { isEqual, isPlainObject } from 'lodash-es'

/**
 * The recursive shape of a deep diff. Every property is optional, since only
 * changed properties appear. Nested plain objects recurse; everything else
 * (primitives, arrays, non-plain objects) is kept as-is.
 *
 * @typeParam Type The shape of the compared objects.
 */
export type Difference<Type extends object> = {
  [Key in keyof Type]?: Type[Key] extends object
    ? Difference<Type[Key]>
    : Type[Key]
}

/**
 * Computes a deep difference between two plain-object-shaped values.
 *
 * Recursively walks `object`, keeping only properties whose values differ from
 * `base`. When both sides of a differing property are plain objects, it recurses
 * into them. Arrays and non-plain objects (e.g. `Date`) are treated as atomic
 * values and kept whole.
 *
 * @typeParam Type The shape of the compared objects.
 * @param object The newer object to compare.
 * @param base The baseline object to diff against.
 * @returns A new object containing only the changed properties of `object`.
 */
export function deepDiff<Type extends object>(object: Type, base: Type): Difference<Type> {
  const result: Difference<Type> = {}

  for (const key of Object.keys(object) as Array<keyof Type>) {
    const updatedValue = object[key]
    const baseValue = base[key]

    if (isEqual(updatedValue, baseValue)) {
      continue
    }

    // Recurse only when both sides are plain objects; otherwise the value
    // (primitive, array, or non-plain object) is treated as atomic.
    if (isPlainObject(updatedValue) && isPlainObject(baseValue)) {
      // Both values are plain objects, so they are safely indexable records.
      const updatedRecord = updatedValue as Record<string, unknown>
      const baseRecord = baseValue as Record<string, unknown>
      result[key] = deepDiff(updatedRecord, baseRecord) as Difference<Type>[keyof Type]
      continue
    }

    result[key] = updatedValue as Difference<Type>[keyof Type]
  }

  return result
}
