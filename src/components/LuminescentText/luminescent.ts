// Copyright © 2026 Jalapeno Labs

import type { DomTheme } from '../../hooks/useDomTheme'

// This CSS animation is based on:
// https://www.amitmerchant.com/animated-gradient-effect-in-css/

// A unique keyframe name keeps the inline <style> from colliding with any
// other animation a consumer might have defined globally.
export const LUMINESCENT_KEYFRAME_NAME = 'jalapenoLuminescentShine'

// The keyframes are emitted as an inline <style> element from the component so
// the effect works without a CSS build step and stays SSR-safe.
export const luminescentKeyframesCss = `
@keyframes ${LUMINESCENT_KEYFRAME_NAME} {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
`

// Endpoint colors that frame the accent sweep. Light themes use dark endpoints
// so the text reads against a light surface, and dark themes use light endpoints.
const LIGHT_ENDPOINT = '#ffffff'
const DARK_ENDPOINT = '#000000'

// Gradient color stops, matching the original 20/30/50/60% distribution so the
// accent glints across the middle of the text as the background position sweeps.
const STOP_ONE = '20%'
const STOP_TWO = '30%'
const STOP_THREE = '50%'
const STOP_FOUR = '60%'

/**
 * Builds the `linear-gradient(...)` used as the clipped background image. The
 * endpoints frame the moving accent sweep: a `light` theme frames the accent
 * with dark endpoints, a `dark` theme frames it with light endpoints, and
 * `inverted` swaps those endpoints while keeping the same accent color.
 */
export function buildLuminescentGradient(
  accentColor: string,
  theme: DomTheme,
  inverted: boolean,
): string {
  const usesLightEndpoints = inverted
    ? theme === 'light'
    : theme === 'dark'

  const endpoint = usesLightEndpoints
    ? LIGHT_ENDPOINT
    : DARK_ENDPOINT

  return [
    'linear-gradient(',
    'to right,',
    `${endpoint} ${STOP_ONE},`,
    `${accentColor} ${STOP_TWO},`,
    `${accentColor} ${STOP_THREE},`,
    `${endpoint} ${STOP_FOUR}`,
    ')',
  ].join(' ')
}
