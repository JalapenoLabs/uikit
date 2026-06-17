// Copyright © 2026 Jalapeno Labs

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders its children as the accessible name', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('uses the brand primary color for the default variant', () => {
    render(<Button>Primary</Button>)
    const button = screen.getByRole('button', { name: 'Primary' })
    // The component sets the brand primary hex directly as an inline style.
    expect(button).toHaveStyle({ backgroundColor: '#5ea100' })
  })

  it('renders a transparent, outlined button for the ghost variant', () => {
    render(<Button variant='ghost'>Ghost</Button>)
    const button = screen.getByRole('button', { name: 'Ghost' })
    expect(button).toHaveStyle({ backgroundColor: 'transparent' })
  })

  it('forwards native button attributes', () => {
    render(<Button type='submit' disabled>Submit</Button>)
    const button = screen.getByRole('button', { name: 'Submit' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('fires onClick when pressed', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Press</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Press' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
