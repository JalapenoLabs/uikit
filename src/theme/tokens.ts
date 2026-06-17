// Copyright © 2026 Jalapeno Labs

/**
 * Brand color palette.
 *
 * These values mirror `brand/theme.json` from the JalapenoLabs/brand submodule,
 * which is the single source of truth for the design system. They are inlined
 * here (rather than imported from the submodule) so the package builds without
 * requiring access to the private brand repository. Keep them in sync whenever
 * the brand palette changes.
 */
export const brandColors = {
  primary: '#5ea100',
  secondary: '#9bcb3c',
  salmon: '#ed7470',
  sunset: '#ecbd40',
  sky: '#7ca7e4',
  ocean: '#3f5f99',
  dream: '#45aaf2',
  cyan: '#48cfae',
} as const

export type BrandColorName = keyof typeof brandColors
