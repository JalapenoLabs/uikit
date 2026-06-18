// Copyright © 2026 Jalapeno Labs

// The offset between an uppercase ASCII letter (A-Z) and its matching Unicode
// regional indicator symbol. A flag emoji is simply the two regional indicator
// symbols for the country's ISO 3166-1 alpha-2 code placed next to each other.
const REGIONAL_INDICATOR_OFFSET = 0x1f1e6 - 'A'.charCodeAt(0)

/**
 * Derives a flag emoji from a region or country code.
 *
 * Accepts either a 2-letter ISO 3166-1 country code (e.g. `'US'`) or a BCP-47
 * locale (e.g. `'en-US'`), in which case the region subtag is used. Casing of a
 * true region is normalized, so `'us'`, `'US'`, and `'en-us'` all resolve to
 * the same flag.
 *
 * A bare, lowercase token is treated as a language tag rather than a region
 * (per BCP-47 convention: languages are lowercase, regions are uppercase), so
 * `'de'` yields `''` while `'DE'` yields the German flag. Anything that does
 * not resolve to a 2-letter region (empty or malformed input) returns `''` so
 * callers can fall back gracefully.
 */
export function getFlagEmoji(input: string): string {
  if (!input) {
    console.debug('getFlagEmoji received empty input, returning empty string')
    return ''
  }

  // A BCP-47 locale separates subtags with '-' (or occasionally '_'). When a
  // region subtag is present it is the second token: 'en-US' -> 'US'.
  const subtags = input.split(/[-_]/)
  const hasExplicitRegion = subtags.length > 1

  // For a bare token (no separator) we only treat it as a region when it is
  // written uppercase, matching the BCP-47 convention that distinguishes a
  // country code ('US') from a language code ('de'). An explicit region subtag
  // from a locale is always a region, so its casing is normalized freely.
  const rawRegion = hasExplicitRegion
    ? subtags[1]?.trim()
    : subtags[0]?.trim()

  if (!hasExplicitRegion && rawRegion !== rawRegion?.toUpperCase()) {
    console.debug('getFlagEmoji treated a bare lowercase token as a language, returning empty string', input)
    return ''
  }

  const normalizedRegion = rawRegion?.toUpperCase() || ''

  if (!/^[A-Z]{2}$/.test(normalizedRegion)) {
    console.debug('getFlagEmoji could not derive a 2-letter region, returning empty string', input)
    return ''
  }

  const firstCharCode = normalizedRegion.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET
  const secondCharCode = normalizedRegion.charCodeAt(1) + REGIONAL_INDICATOR_OFFSET

  return String.fromCodePoint(firstCharCode, secondCharCode)
}
