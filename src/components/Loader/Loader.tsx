// Copyright © 2026 Jalapeno Labs

import type { CSSProperties } from 'react'

// Misc
import { brandColors } from '../../theme/tokens'

export type Props = {
  // Diameter of the spinner in pixels.
  size?: number
  // Horizontally centers the spinner and stretches the wrapper to a tall,
  // full-height area so it sits in the middle of the available space.
  centered?: boolean
  // Stretches the wrapper to the full viewport height (mirrors the original
  // HeroUI-based loader's `fullVertical` behavior).
  fullVertical?: boolean
  // Accessible label announced by screen readers and used as the test handle.
  label?: string
  className?: string
}

// The arc sweeps three quarters of the circle so the gap reads as motion.
const ARC_GAP_FRACTION = 0.25
const STROKE_WIDTH = 4
const DEFAULT_SIZE = 40

/**
 * A dependency-free loading spinner.
 *
 * The animation is pure SVG SMIL (`<animateTransform>`), so there is no
 * external CSS file, no keyframes, and no third-party spinner component. The
 * arc is a stroked circle whose `stroke-dasharray` leaves a gap, and the whole
 * group rotates forever around its center.
 */
export function Loader(props: Props) {
  const size = props.size ?? DEFAULT_SIZE
  const label = props.label ?? 'Loading...'

  const wrapperStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: props.centered ? 'center' : 'flex-start',
    minHeight: props.centered ? '100%' : undefined,
    height: props.fullVertical ? '100vh' : undefined,
  }

  // SVG geometry: keep the stroke fully inside the viewBox.
  const center = size / 2
  const radius = center - STROKE_WIDTH
  const circumference = 2 * Math.PI * radius
  const dashLength = circumference * (1 - ARC_GAP_FRACTION)

  return <div
    role='status'
    aria-label={label}
    className={props.className}
    style={wrapperStyle}
  >
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden='true'
    >
      {/* Faint track so the spinning arc always reads against a full ring. */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill='none'
        stroke={brandColors.primary}
        strokeWidth={STROKE_WIDTH}
        strokeOpacity={0.2}
      />
      {/* The moving arc. */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill='none'
        stroke={brandColors.primary}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap='round'
        strokeDasharray={`${dashLength} ${circumference}`}
      >
        <animateTransform
          attributeName='transform'
          type='rotate'
          from={`0 ${center} ${center}`}
          to={`360 ${center} ${center}`}
          dur='0.8s'
          repeatCount='indefinite'
        />
      </circle>
    </svg>
  </div>
}
