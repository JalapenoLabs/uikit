// Copyright © 2026 Jalapeno Labs

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, fireEvent } from '@testing-library/react'
import { DisabledTimerButton } from './DisabledTimerButton'

describe('DisabledTimerButton', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts disabled and ticks the counter upward while waiting', () => {
    render(<DisabledTimerButton delaySeconds={3}>Confirm</DisabledTimerButton>)
    const button = screen.getByRole('button')

    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Confirm (0)')

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(button).toHaveTextContent('Confirm (1)')
    expect(button).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(button).toHaveTextContent('Confirm (2)')
  })

  it('enables itself after the delay and only then fires onClick', () => {
    const onClick = vi.fn()
    render(<DisabledTimerButton delaySeconds={3} onClick={onClick}>Go</DisabledTimerButton>)
    const button = screen.getByRole('button')

    // A click while still disabled is ignored by the browser.
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(button).toBeEnabled()
    expect(button).toHaveTextContent('Go')
    expect(button).not.toHaveTextContent('(')

    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('shows the built-in tooltip while waiting and allows an override', () => {
    const { rerender } = render(<DisabledTimerButton delaySeconds={5}>X</DisabledTimerButton>)
    const wrapper = screen.getByRole('button').parentElement

    expect(wrapper).toHaveAttribute('title', expect.stringContaining('Please wait'))

    rerender(<DisabledTimerButton delaySeconds={5} tooltip='Read first'>X</DisabledTimerButton>)
    expect(screen.getByRole('button').parentElement).toHaveAttribute('title', 'Read first')
  })

  it('is enabled immediately when delaySeconds is zero', () => {
    render(<DisabledTimerButton delaySeconds={0}>Now</DisabledTimerButton>)

    act(() => {
      vi.advanceTimersByTime(0)
    })

    const button = screen.getByRole('button')
    expect(button).toBeEnabled()
    expect(button).toHaveTextContent('Now')
    expect(button).not.toHaveTextContent('(')
  })
})
