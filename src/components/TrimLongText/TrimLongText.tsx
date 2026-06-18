// Copyright © 2026 Jalapeno Labs

import type { ComponentProps, ReactNode } from 'react'

// Core
import { createElement } from 'react'

// Utility
import { clipText } from '../../utils/clipText'
import { clipTextFromEnd } from '../../utils/clipText'

export type TrimLongTextProps = {
  text: string
  maxLength: number
  fromEnd?: boolean
  className?: string
  onClick?: ComponentProps<'p'>['onClick']
  as?: string
}

/**
 * Renders `text` clipped to `maxLength`. When clipping actually occurs the full,
 * untruncated text is exposed on hover via the native `title` attribute, which
 * keeps the component dependency-free while staying accessible.
 */
export function TrimLongText(props: TrimLongTextProps): ReactNode {
  const {
    as = 'p',
    className = '',
    text = '',
    maxLength,
    fromEnd = false,
    onClick,
  } = props

  const isClipped = text.length >= maxLength

  let displayText = text
  if (isClipped) {
    displayText = fromEnd
      ? clipTextFromEnd(text, maxLength)
      : clipText(text, maxLength)
  }

  return createElement(
    as,
    {
      className,
      onClick,
      // Only surface the full text on hover when something was actually trimmed.
      title: isClipped
        ? text
        : undefined,
    },
    displayText,
  )
}
