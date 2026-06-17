// Copyright © 2026 Jalapeno Labs

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

// Core
import { forwardRef } from 'react'

// Misc
import { brandColors } from '../../theme/tokens'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  children?: ReactNode
}

// Variant lookup tables keep the styling declarative and make a missing variant
// a compile-time error rather than a silent fallthrough.
const backgroundByVariant = {
  primary: brandColors.primary,
  secondary: brandColors.secondary,
  ghost: 'transparent',
} as const satisfies Record<ButtonVariant, string>

const textColorByVariant = {
  primary: '#ffffff',
  secondary: '#ffffff',
  ghost: brandColors.primary,
} as const satisfies Record<ButtonVariant, string>

/**
 * The library's foundational button. It is intentionally style-light and
 * unopinionated: brand colors come from the design tokens, and every native
 * button attribute (onClick, type, disabled, aria-*, ...) passes straight
 * through so consumers keep full control.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const {
      variant = 'primary',
      style,
      children,
      ...nativeButtonProps
    } = props

    const composedStyle: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: variant === 'ghost'
        ? `1px solid ${brandColors.primary}`
        : 'none',
      backgroundColor: backgroundByVariant[variant],
      color: textColorByVariant[variant],
      fontWeight: 600,
      cursor: 'pointer',
      ...style,
    }

    return <button
      ref={ref}
      style={composedStyle}
      {...nativeButtonProps}
    >
      {children}
    </button>
  },
)
