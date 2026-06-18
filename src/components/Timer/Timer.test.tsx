// Copyright © 2026 Jalapeno Labs

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Timer } from './Timer'

const ONE_MINUTE_MS = 60 * 1_000
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS

describe('Timer', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the humanized elapsed time between a start and stop timestamp', () => {
    const startTimeMs = 0
    const stopTimeMs = ONE_HOUR_MS + (30 * ONE_MINUTE_MS)

    render(
      <Timer
        startTimeMs={startTimeMs}
        stopTimeMs={stopTimeMs}
      />,
    )

    expect(screen.getByText('1 hour, 30 minutes')).toBeInTheDocument()
  })

  it('measures elapsed time against the current clock when no stop time is given', () => {
    // Freeze the wall clock so the elapsed duration is deterministic.
    const now = 2 * ONE_HOUR_MS
    vi.useFakeTimers()
    vi.setSystemTime(now)

    render(
      <Timer
        startTimeMs={now - (15 * ONE_MINUTE_MS)}
      />,
    )

    expect(screen.getByText('15 minutes')).toBeInTheDocument()
  })

  it('passes the humanized string and elapsed milliseconds to a custom formatter', () => {
    const startTimeMs = 0
    const stopTimeMs = 45 * ONE_MINUTE_MS

    render(
      <Timer
        startTimeMs={startTimeMs}
        stopTimeMs={stopTimeMs}
        text={(humanized, elapsedMs) => `${humanized} (${elapsedMs}ms)`}
      />,
    )

    expect(screen.getByText(`45 minutes (${stopTimeMs}ms)`)).toBeInTheDocument()
  })
})
