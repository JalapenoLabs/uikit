// Copyright © 2026 Jalapeno Labs

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'
import { Accordion } from './Accordion'

describe('Accordion', () => {
  it('starts closed by default with the body hidden', () => {
    render(
      <Accordion title='Section title'>
        Body content
      </Accordion>,
    )

    const header = screen.getByRole('button', { name: 'Section title' })
    expect(header).toHaveAttribute('aria-expanded', 'false')
    // A `hidden` region is excluded from the accessibility tree.
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
  })

  it('opens when the header is clicked', async () => {
    render(
      <Accordion title='Section title'>
        Body content
      </Accordion>,
    )

    const header = screen.getByRole('button', { name: 'Section title' })
    await userEvent.click(header)

    expect(header).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('region')).toBeVisible()
    expect(screen.getByText('Body content')).toBeVisible()
  })

  it('respects defaultOpen by starting open', () => {
    render(
      <Accordion title='Section title' defaultOpen>
        Body content
      </Accordion>,
    )

    expect(screen.getByRole('button', { name: 'Section title' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('region')).toBeVisible()
  })

  it('respects the controlled open prop and does not self-toggle', async () => {
    const onOpenChange = vi.fn()

    const { rerender } = render(
      <Accordion title='Section title' open={false} onOpenChange={onOpenChange}>
        Body content
      </Accordion>,
    )

    const header = screen.getByRole('button', { name: 'Section title' })
    await userEvent.click(header)

    // Controlled: state is owned by the parent, so the prop wins and onOpenChange is requested.
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(header).toHaveAttribute('aria-expanded', 'false')

    rerender(
      <Accordion title='Section title' open={true} onOpenChange={onOpenChange}>
        Body content
      </Accordion>,
    )

    expect(header).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('region')).toBeVisible()
  })

  it('drives a controlled parent that updates its own state', async () => {
    function ControlledHarness() {
      const [ open, setOpen ] = useState<boolean>(false)

      return <Accordion title='Section title' open={open} onOpenChange={setOpen}>
        Body content
      </Accordion>
    }

    render(<ControlledHarness />)

    const header = screen.getByRole('button', { name: 'Section title' })
    await userEvent.click(header)

    expect(header).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Body content')).toBeVisible()
  })

  it('does not toggle when disabled', async () => {
    const onOpenChange = vi.fn()

    render(
      <Accordion title='Section title' disabled onOpenChange={onOpenChange}>
        Body content
      </Accordion>,
    )

    const header = screen.getByRole('button', { name: 'Section title' })
    expect(header).toBeDisabled()

    await userEvent.click(header)

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(header).toHaveAttribute('aria-expanded', 'false')
  })

  it('seeds and persists uncontrolled state via persistKey', async () => {
    const persistKey = 'accordion-test-persist'
    window.localStorage.setItem(persistKey, 'true')

    render(
      <Accordion title='Section title' persistKey={persistKey}>
        Body content
      </Accordion>,
    )

    const header = screen.getByRole('button', { name: 'Section title' })
    // Seeded open from localStorage over the default closed state.
    expect(header).toHaveAttribute('aria-expanded', 'true')

    await userEvent.click(header)

    expect(header).toHaveAttribute('aria-expanded', 'false')
    expect(window.localStorage.getItem(persistKey)).toBe('false')
  })
})
