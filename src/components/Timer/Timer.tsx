// Copyright © 2026 Jalapeno Labs

import type { ReactNode } from 'react'
import type { Options } from 'humanize-duration'

// Core
import { useMemo } from 'react'
import { useRepeater } from '../../hooks/useRepeater'

// Time
import humanizeDuration from 'humanize-duration'

export type Props = {
  // How often (in milliseconds) the elapsed time should re-render. Defaults to one second.
  interval?: number
  // The timestamp (in milliseconds) the timer started counting from.
  startTimeMs: number
  // An optional timestamp (in milliseconds) to freeze the elapsed time at. When set, the timer stops ticking.
  stopTimeMs?: number
  // An optional custom formatter to wrap or replace the humanized duration string.
  text?: (humanized: string, elapsedMs: number) => string | ReactNode
  // Pass-through options for humanize-duration.
  options?: Options
}

export function Timer(props: Props) {
  // Re-render on the interval so the elapsed time stays current.
  // Once a stop time is provided there is nothing left to update, so the repeater pauses.
  useRepeater(
    props.interval ?? 1_000,
    props.stopTimeMs != undefined,
  )

  const options = useMemo<Options>(() => ({
    round: true,
    ...props.options,
  }), [ props.options ])

  const elapsedMs = (props.stopTimeMs ?? Date.now()) - props.startTimeMs
  const humanized = humanizeDuration(elapsedMs, options)

  return <>{
    props.text?.(humanized, elapsedMs) ?? humanized
  }</>
}
