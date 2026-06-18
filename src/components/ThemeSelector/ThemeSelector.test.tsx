// Copyright © 2026 Jalapeno Labs

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ThemeSelector } from './ThemeSelector'

describe('ThemeSelector', () => {
  it('renders all three options with the correct one selected', () => {
    render(<ThemeSelector value='dark' onChange={() => {}} />)

    const light = screen.getByRole('radio', { name: 'Light' })
    const dark = screen.getByRole('radio', { name: 'Dark' })
    const system = screen.getByRole('radio', { name: 'System' })

    expect(light).toBeInTheDocument()
    expect(dark).toBeInTheDocument()
    expect(system).toBeInTheDocument()

    expect(light).toHaveAttribute('aria-checked', 'false')
    expect(dark).toHaveAttribute('aria-checked', 'true')
    expect(system).toHaveAttribute('aria-checked', 'false')
  })

  it('honours custom labels', () => {
    render(
      <ThemeSelector
        value='light'
        onChange={() => {}}
        labels={{ system: 'Auto' }}
      />,
    )

    expect(screen.getByRole('radio', { name: 'Auto' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Light' })).toBeInTheDocument()
  })

  it('calls onChange with the clicked preference', async () => {
    const onChange = vi.fn()
    render(<ThemeSelector value='light' onChange={onChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'System' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('system')
  })

  it('moves selection with the arrow keys', async () => {
    const onChange = vi.fn()
    render(<ThemeSelector value='light' onChange={onChange} />)

    const light = screen.getByRole('radio', { name: 'Light' })
    light.focus()
    await userEvent.keyboard('{ArrowRight}')

    // Light is index 0, so ArrowRight should advance to Dark.
    expect(onChange).toHaveBeenCalledWith('dark')
  })

  it('selects the focused option with Space', async () => {
    const onChange = vi.fn()
    render(<ThemeSelector value='dark' onChange={onChange} />)

    const system = screen.getByRole('radio', { name: 'System' })
    system.focus()
    await userEvent.keyboard(' ')

    expect(onChange).toHaveBeenCalledWith('system')
  })

  it('does not call onChange when disabled', async () => {
    const onChange = vi.fn()
    render(<ThemeSelector value='light' onChange={onChange} isDisabled />)

    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }))

    expect(onChange).not.toHaveBeenCalled()
  })
})
