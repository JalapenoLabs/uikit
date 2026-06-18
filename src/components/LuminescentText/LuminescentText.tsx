// Copyright © 2026 Jalapeno Labs

import type { CSSProperties } from 'react'
import type { DomTheme } from '../../hooks/useDomTheme'

// Core
import { useDomTheme } from '../../hooks/useDomTheme'

// Misc
import { brandColors } from '../../theme/tokens'
import {
  LUMINESCENT_KEYFRAME_NAME,
  luminescentKeyframesCss,
  buildLuminescentGradient,
} from './luminescent'

export type LuminescentTextProps = {
  text: string
  // Any CSS color used as the moving accent. Defaults to the brand primary.
  color?: string
  // Overrides the auto-detected DOM theme.
  theme?: DomTheme
  // Swaps the light/dark gradient endpoints while keeping the accent color.
  inverted?: boolean
  // Renders the text plainly, with no gradient or animation.
  isDisabled?: boolean
  className?: string
}

/**
 * Animated "luminescent" text: a linear gradient is clipped to the glyphs and
 * its background position sweeps across, glinting an accent color through the
 * letters. The keyframes are rendered as an inline `<style>` element so the
 * effect needs no CSS build step and remains SSR-safe.
 */
export function LuminescentText(props: LuminescentTextProps) {
  const domTheme = useDomTheme()

  const {
    color = brandColors.primary,
    theme = domTheme,
    inverted = false,
  } = props

  if (props.isDisabled) {
    return <h4 className={props.className} data-type='luminescent-text'>{
      props.text
    }</h4>
  }

  const luminescentStyle: CSSProperties = {
    backgroundImage: buildLuminescentGradient(color, theme, inverted),
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundSize: '500% auto',
    animation: `${LUMINESCENT_KEYFRAME_NAME} 3s ease-in-out infinite forwards`,
  }

  return <h4
    className={props.className}
    data-type='luminescent-text'
    style={luminescentStyle}
  >
    <style>{luminescentKeyframesCss}</style>
    {props.text}
  </h4>
}
