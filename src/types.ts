// Copyright © 2026 Jalapeno Labs

/**
 * A value that may be returned directly or as a promise. Mirrors type-fest's
 * `Promisable`, inlined here so the library carries no type-only dependency.
 */
export type Promisable<Value> = Value | PromiseLike<Value>

/**
 * A union of known literal strings that still accepts any other string while
 * keeping editor autocomplete for the known members. Mirrors type-fest's
 * `LiteralUnion`.
 */
export type LiteralUnion<LiteralType, BaseType> =
  | LiteralType
  | (BaseType & Record<never, never>)
