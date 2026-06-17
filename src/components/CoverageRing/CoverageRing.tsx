// Copyright © 2026 Jalapeno Labs

import type { CSSProperties } from 'react'

// UI
import { AnimatedPercent } from '../AnimatedPercent/AnimatedPercent'

// Utility
import { clampPercent } from '../../utils/percent'
import { getCoverageColor } from './coverageColor'

type Props = {
  value: number | null
  size?: number
  stroke?: number
  trackStroke?: number
  showShadow?: boolean
  solidTrack?: boolean
  solidTrackInset?: number
  label?: string
  showCenter?: boolean
  animationDurationMs?: number
  /** Color of the unfilled track ring. */
  trackColor?: string
  /** Background of the inner circle when `showCenter` is true. */
  centerBackground?: string
}

/**
 * An animated SVG progress ring whose color shifts red -> yellow -> green with
 * coverage. Styling is inline so it renders without Tailwind or any CSS
 * framework.
 */
export function CoverageRing(props: Props) {
  const {
    value,
    size = 140,
    stroke = 25,
    trackStroke = 16,
    showShadow = true,
    solidTrack = false,
    solidTrackInset = 0,
    label,
    showCenter = false,
    animationDurationMs = 1200,
    trackColor = 'rgba(127, 127, 127, 0.2)',
    centerBackground = '#ffffff',
  } = props

  const animationDurationCss = `${animationDurationMs / 1000}s`

  const percent = clampPercent(value)
  const strokeColor = getCoverageColor(value)

  // Both rings share the same inner edge diameter.
  const trackRadius = (size - stroke) / 2
  const colorRadius = (size - trackStroke) / 2

  const circumference = 2 * Math.PI * colorRadius
  const dashOffset = circumference * (1 - percent / 100)

  // The SVG must be large enough for the colored ring plus its drop shadow.
  const shadowPadding = showShadow
    ? 12
    : 0
  const svgSize = size - trackStroke + stroke + shadowPadding * 2
  const center = svgSize / 2

  const innerSize = size - stroke - trackStroke

  // Filled disk behind the colored arc, slightly inset so it does not meet the
  // arc's outer edge.
  const outerRadius = Math.max(0, Math.min(center, colorRadius + stroke / 2 - solidTrackInset))

  const centerWrapperStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const innerCircleStyle: CSSProperties = {
    width: innerSize,
    height: innerSize,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: centerBackground,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  }

  return <div style={{ position: 'relative', width: svgSize, height: svgSize }}>
    <svg width={svgSize} height={svgSize} style={{ transform: 'rotate(-90deg)' }}>
      {showShadow && (
        <defs>
          <filter id='coverage-ring-shadow' x='-50%' y='-50%' width='200%' height='200%'>
            <feDropShadow dx='0' dy='2' stdDeviation='3' floodOpacity='0.25' />
          </filter>
        </defs>
      )}

      {solidTrack
        ? <circle
          fill={trackColor}
          cx={center}
          cy={center}
          r={outerRadius}
        />
        : <circle
          stroke={trackColor}
          strokeWidth={trackStroke}
          strokeLinecap='round'
          fill='transparent'
          cx={center}
          cy={center}
          r={trackRadius}
        />}

      <circle
        stroke={strokeColor}
        strokeWidth={stroke}
        strokeLinecap='round'
        fill='transparent'
        cx={center}
        cy={center}
        r={colorRadius}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        filter={showShadow ? 'url(#coverage-ring-shadow)' : undefined}
        style={{
          transition: `stroke-dashoffset ${animationDurationCss} ease-out, stroke ${animationDurationCss} ease-out`,
        }}
      />
    </svg>

    {showCenter && (
      <div style={centerWrapperStyle}>
        <div style={innerCircleStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              <AnimatedPercent value={value} animationDurationMs={animationDurationMs} />
            </div>
            {label && <div style={{ fontSize: '0.875rem', opacity: 0.6 }}>{
              label
            }</div>}
          </div>
        </div>
      </div>
    )}
  </div>
}
