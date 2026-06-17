// Copyright © 2026 Jalapeno Labs

/**
 * Returns the last element of an array, or undefined when the array is empty or
 * nullish.
 */
export function getLast<Type>(array: Type[] | null | undefined): Type | undefined {
  if (!array?.length) {
    return undefined
  }

  return array[array.length - 1]
}
