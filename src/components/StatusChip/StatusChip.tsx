// Copyright © 2026 Jalapeno Labs

import type { CSSProperties, MouseEventHandler, ReactNode } from 'react'

// Misc
import { brandColors } from '../../theme/tokens'

export type StatusTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'primary'

export type StatusChipVariant = 'solid' | 'bordered' | 'dot'

export type StatusChipSize = 'sm' | 'md' | 'lg'

export type StatusChipProps = {
  // The chip text. Callers pass already-translated content; the component never translates.
  label: ReactNode
  tone?: StatusTone
  variant?: StatusChipVariant
  size?: StatusChipSize
  // Leading icon. Defaults to a small filled dot in the tone color. Pass `null` to omit it.
  icon?: ReactNode
  endContent?: ReactNode
  // Rendered as the native `title` attribute on the chip element.
  tooltip?: string
  className?: string
  onClick?: MouseEventHandler<HTMLSpanElement>
}

// One source of truth for tone colors. `satisfies Record<StatusTone, string>` keeps the
// mapping exhaustive so a new tone cannot be added without giving it a color.
const colorByTone = {
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#2563eb',
  neutral: '#6b7280',
  primary: brandColors.primary,
} as const satisfies Record<StatusTone, string>

// Padding and font-size per size. Kept declarative so sizes are easy to scan and tune.
const paddingBySize = {
  sm: '0.0625rem 0.5rem',
  md: '0.125rem 0.625rem',
  lg: '0.25rem 0.875rem',
} as const satisfies Record<StatusChipSize, string>

const fontSizeBySize = {
  sm: '0.75rem',
  md: '0.8125rem',
  lg: '0.9375rem',
} as const satisfies Record<StatusChipSize, string>

const dotSizeBySize = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.625rem',
} as const satisfies Record<StatusChipSize, string>

/**
 * A standalone, controlled status chip. It carries no data dependencies: the caller
 * decides the tone and supplies already-translated label text, so the component stays
 * a pure presentational primitive that styles itself entirely with inline styles.
 *
 * - `solid` fills the background with the tone color and uses readable white text.
 * - `bordered` is transparent with a tone-colored border and tone-colored text.
 * - `dot` is bordered with an emphasized (larger, ringed) leading dot.
 */
export function StatusChip(props: StatusChipProps) {
  const {
    label,
    tone = 'neutral',
    variant = 'bordered',
    size = 'md',
    icon,
    endContent,
    tooltip,
    className,
    onClick,
  } = props

  const toneColor = colorByTone[tone]
  const isSolid = variant === 'solid'
  const isDot = variant === 'dot'

  const chipStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: paddingBySize[size],
    borderRadius: '9999px',
    border: isSolid
      ? '1px solid transparent'
      : `1px solid ${toneColor}`,
    backgroundColor: isSolid
      ? toneColor
      : 'transparent',
    color: isSolid
      ? '#ffffff'
      : toneColor,
    fontSize: fontSizeBySize[size],
    fontWeight: 600,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    cursor: onClick
      ? 'pointer'
      : 'default',
  }

  // The default leading dot. `icon={null}` removes it; a supplied icon replaces it.
  const dotDiameter = dotSizeBySize[size]
  const defaultIcon = <span
    aria-hidden='true'
    style={{
      display: 'inline-block',
      width: dotDiameter,
      height: dotDiameter,
      borderRadius: '9999px',
      backgroundColor: isSolid
        ? '#ffffff'
        : toneColor,
      // The dot variant emphasizes the leading dot with a soft surrounding ring.
      boxShadow: isDot
        ? `0 0 0 0.1875rem ${toneColor}33`
        : undefined,
    }}
  />

  const leadingIcon = icon === undefined
    ? defaultIcon
    : icon

  return <span
    className={className}
    style={chipStyle}
    title={tooltip}
    onClick={onClick}
  >
    {leadingIcon}
    <span>{label}</span>
    {endContent}
  </span>
}
