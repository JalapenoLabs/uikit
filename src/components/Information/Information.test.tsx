// Copyright © 2026 Jalapeno Labs

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Information } from './Information'

describe('Information', () => {
  it('hides the panel and reports collapsed state initially', () => {
    render(<Information title='Heading' content='Body copy' />)

    const trigger = screen.getByRole('button', { name: 'More information' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Body copy')).not.toBeInTheDocument()
  })

  it('shows the title and content when the trigger is clicked', async () => {
    render(<Information title='Heading' content='Body copy' />)

    const trigger = screen.getByRole('button', { name: 'More information' })
    await userEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Heading')).toBeInTheDocument()
    expect(screen.getByText('Body copy')).toBeInTheDocument()
  })

  it('wires aria-controls to the rendered panel id', async () => {
    render(<Information content='Body copy' />)

    const trigger = screen.getByRole('button', { name: 'More information' })
    await userEvent.click(trigger)

    const panel = screen.getByRole('dialog')
    expect(trigger).toHaveAttribute('aria-controls', panel.id)
  })

  it('closes the panel when Escape is pressed', async () => {
    render(<Information content='Body copy' />)

    const trigger = screen.getByRole('button', { name: 'More information' })
    await userEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the panel when clicking outside of it', async () => {
    render(<div>
      <Information content='Body copy' />
      <button type='button'>Outside</button>
    </div>)

    const trigger = screen.getByRole('button', { name: 'More information' })
    await userEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Outside' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('omits the title element when no title is provided', async () => {
    render(<Information content='Body copy' />)

    await userEvent.click(screen.getByRole('button', { name: 'More information' }))

    const panel = screen.getByRole('dialog')
    expect(panel).toHaveTextContent('Body copy')
    expect(panel.childElementCount).toBe(1)
  })
})
