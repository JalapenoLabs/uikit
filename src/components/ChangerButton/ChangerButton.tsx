// Copyright © 2026 Jalapeno Labs

import type { CSSProperties, ReactNode } from 'react'

// Misc
import { brandColors } from '../../theme/tokens'

export type ChangerButtonProps = {
  // The setting's name. The caller passes already-translated text.
  label: ReactNode
  // The currently selected value, shown stacked beneath the label.
  value: ReactNode
  onPress?: () => void
  // When true, the button shrinks to a single centered icon.
  collapsed?: boolean
  // Glyph shown while collapsed. Defaults to a sensible inline-SVG sliders icon.
  collapsedIcon?: ReactNode
  // Any CSS color for the indicator dot. Defaults to the brand primary.
  indicatorColor?: string
  // Native title attribute used as a lightweight tooltip.
  tooltip?: string
  isDisabled?: boolean
  className?: string
}

// A small filled circle that mirrors the legacy `circleDot` icon. The color is
// driven by `indicatorColor` so callers can signal which setting this controls.
function IndicatorDot(props: { color: string }) {
  return <svg
    width='10'
    height='10'
    viewBox='0 0 10 10'
    aria-hidden='true'
    focusable='false'
  >
    <circle cx='5' cy='5' r='5' fill={props.color} />
  </svg>
}

// A stacked up/down chevron that mirrors the legacy `selectUpDown` icon, hinting
// that pressing the button cycles or opens a selection.
function UpDownChevron() {
  return <svg
    width='14'
    height='14'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    focusable='false'
  >
    <polyline points='8 9 12 5 16 9' />
    <polyline points='8 15 12 19 16 15' />
  </svg>
}

// The default collapsed glyph: a sliders/settings icon, since this button is a
// generic "settings changer" trigger.
function DefaultCollapsedIcon() {
  return <svg
    width='18'
    height='18'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    focusable='false'
  >
    <line x1='4' y1='21' x2='4' y2='14' />
    <line x1='4' y1='10' x2='4' y2='3' />
    <line x1='12' y1='21' x2='12' y2='12' />
    <line x1='12' y1='8' x2='12' y2='3' />
    <line x1='20' y1='21' x2='20' y2='16' />
    <line x1='20' y1='12' x2='20' y2='3' />
    <line x1='1' y1='14' x2='7' y2='14' />
    <line x1='9' y1='8' x2='15' y2='8' />
    <line x1='17' y1='16' x2='23' y2='16' />
  </svg>
}

/**
 * A full-width "settings changer" trigger. Expanded, it shows a colored
 * indicator dot, the setting label and its current value (stacked), and an
 * up/down chevron on the right. Collapsed, it shows a single centered icon.
 *
 * It is intentionally dependency-free: layout and color live in inline styles so
 * the button looks correct without any external CSS, and the optional tooltip is
 * the button's native `title` attribute.
 */
export function ChangerButton(props: ChangerButtonProps) {
  const {
    label,
    value,
    onPress,
    collapsed,
    collapsedIcon = <DefaultCollapsedIcon />,
    indicatorColor = brandColors.primary,
    tooltip,
    isDisabled,
    className,
  } = props

  const buttonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed
      ? 'center'
      : 'space-between',
    width: '100%',
    gap: '0.75rem',
    padding: '0.5rem 0.75rem',
    border: 'none',
    borderRadius: '0.375rem',
    background: 'transparent',
    color: 'inherit',
    textAlign: 'left',
    cursor: isDisabled
      ? 'not-allowed'
      : 'pointer',
    opacity: isDisabled
      ? 0.6
      : 1,
    transition: 'background-color 120ms ease-in-out, opacity 120ms ease-in-out',
  }

  // Hover affordance only when enabled. Inline styles cannot express `:hover`, so
  // we toggle the background on pointer enter/leave for a CSS-free hover effect.
  function applyHoverBackground(background: string) {
    return (event: { currentTarget: HTMLButtonElement }) => {
      if (isDisabled) {
        return
      }
      event.currentTarget.style.backgroundColor = background
    }
  }

  return <button
    type='button'
    title={tooltip}
    disabled={isDisabled}
    onClick={onPress}
    onMouseEnter={applyHoverBackground('rgba(127, 127, 127, 0.16)')}
    onMouseLeave={applyHoverBackground('transparent')}
    className={className}
    style={buttonStyle}
  >{
      collapsed
        ? <span style={{ display: 'inline-flex', alignItems: 'center' }}>{
          collapsedIcon
        }</span>
        : <>
          <span style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', marginTop: '0.35rem' }}>
              <IndicatorDot color={indicatorColor} />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value}</span>
            </span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', opacity: 0.7 }}>
            <UpDownChevron />
          </span>
        </>
    }</button>
}
