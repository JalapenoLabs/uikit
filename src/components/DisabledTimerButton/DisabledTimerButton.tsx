// Copyright © 2026 Jalapeno Labs

import type { CSSProperties } from 'react'
import type { ButtonProps } from '../Button/Button'

// Core
import { forwardRef, useEffect, useState } from 'react'

// UI
import { Button } from '../Button/Button'

export type DisabledTimerButtonProps = ButtonProps & {
  /** How long to keep the button disabled, in seconds (fractional allowed). */
  delaySeconds: number
  /** Overrides the built-in "please wait" tooltip shown while disabled. */
  tooltip?: string
  /** Class applied to the tooltip wrapper span (not the button itself). */
  wrapperClassName?: string
}

// Refresh fast enough that the integer counter looks like it ticks every
// second, without spinning a per-frame animation.
const TICK_INTERVAL_MS = 200

/**
 * A button that stays disabled for `delaySeconds` and then enables itself,
 * showing an integer counter that ticks upward while you wait. Built for
 * confirmation modals where the danger action should be gated so the reader is
 * encouraged to actually read the message first. The tooltip explains the wait
 * and lives on a wrapper span so it still appears while the button is disabled.
 */
export const DisabledTimerButton = forwardRef<HTMLButtonElement, DisabledTimerButtonProps>(
  function DisabledTimerButton(props, ref) {
    const {
      delaySeconds,
      tooltip,
      wrapperClassName,
      children,
      disabled,
      title,
      ...buttonProps
    } = props

    const [ elapsedSeconds, setElapsedSeconds ] = useState<number>(0)

    useEffect(() => {
      const safeDelay = Number.isFinite(delaySeconds)
        ? delaySeconds
        : 0

      if (safeDelay <= 0) {
        setElapsedSeconds(safeDelay)
        return undefined
      }

      const startMs = Date.now()
      setElapsedSeconds(0)

      const interval = setInterval(() => {
        const nextElapsed = (Date.now() - startMs) / 1000
        if (nextElapsed >= safeDelay) {
          setElapsedSeconds(safeDelay)
          clearInterval(interval)
          return
        }
        setElapsedSeconds(nextElapsed)
      }, TICK_INTERVAL_MS)

      return () => {
        clearInterval(interval)
      }
    }, [ delaySeconds ])

    const isWaiting = elapsedSeconds < delaySeconds
    const targetCount = Math.ceil(delaySeconds)
    const displayCount = Math.min(targetCount, Math.round(elapsedSeconds))
    const remainingWhole = Math.max(0, Math.ceil(delaySeconds - elapsedSeconds))

    const tooltipText = isWaiting
      ? (tooltip ?? `Please wait ${remainingWhole}s before continuing`)
      : title

    const wrapperStyle: CSSProperties = {
      display: 'inline-block',
    }

    return <span
      className={wrapperClassName}
      style={wrapperStyle}
      title={tooltipText}
    >
      <Button
        ref={ref}
        disabled={disabled || isWaiting}
        {...buttonProps}
      >
        {children}{isWaiting ? ` (${displayCount})` : ''}
      </Button>
    </span>
  },
)
