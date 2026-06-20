// Copyright © 2026 Jalapeno Labs

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ChangerButton } from './ChangerButton'

describe('ChangerButton', () => {
  it('renders the label and current value when expanded', () => {
    render(<ChangerButton label='Theme' value='Midnight' />)
    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(screen.getByText('Midnight')).toBeInTheDocument()
  })

  it('calls onPress when pressed', async () => {
    const onPress = vi.fn()
    render(<ChangerButton label='Theme' value='Midnight' onPress={onPress} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('is disabled and does not call onPress when isDisabled is set', async () => {
    const onPress = vi.fn()
    render(<ChangerButton label='Theme' value='Midnight' onPress={onPress} isDisabled />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('applies the tooltip as the native title attribute', () => {
    render(<ChangerButton label='Theme' value='Midnight' tooltip='Change the theme' />)
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Change the theme')
  })

  it('renders the collapsed icon and hides the label when collapsed', () => {
    render(
      <ChangerButton
        label='Theme'
        value='Midnight'
        collapsed
        collapsedIcon={<span data-testid='collapsed-glyph'>icon</span>}
      />,
    )
    expect(screen.getByTestId('collapsed-glyph')).toBeInTheDocument()
    expect(screen.queryByText('Theme')).not.toBeInTheDocument()
    expect(screen.queryByText('Midnight')).not.toBeInTheDocument()
  })
})
