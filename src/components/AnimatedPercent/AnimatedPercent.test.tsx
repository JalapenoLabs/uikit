// Copyright © 2026 Jalapeno Labs

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnimatedPercent } from './AnimatedPercent'

describe('AnimatedPercent', () => {
  it('renders the formatted percentage for a whole value', () => {
    // It mounts with displayValue === value, so the first render shows the
    // formatted current value before any animation frames run.
    render(<AnimatedPercent value={72} />)
    expect(screen.getByText('72%')).toBeInTheDocument()
  })

  it('renders a dash for a null value', () => {
    render(<AnimatedPercent value={null} />)
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('renders the formatted percentage for a normal mid-range value', () => {
    render(<AnimatedPercent value={45} />)
    expect(screen.getByText('45%')).toBeInTheDocument()
  })
})
