// Copyright © 2026 Jalapeno Labs

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { StatusChip } from './StatusChip'

describe('StatusChip', () => {
  it('renders its label text', () => {
    render(<StatusChip label='Passed' />)
    expect(screen.getByText('Passed')).toBeInTheDocument()
  })

  it('applies the tone color as the border for the bordered variant', () => {
    render(<StatusChip label='Failed' tone='danger' />)
    // The danger tone maps to #dc2626, which getComputedStyle reports as rgb(220, 38, 38).
    const chip = screen.getByText('Failed').parentElement
    expect(chip).toHaveStyle({ borderColor: '#dc2626' })
  })

  it('fills the background with the tone color for the solid variant', () => {
    render(<StatusChip label='Passed' tone='success' variant='solid' />)
    const chip = screen.getByText('Passed').parentElement
    expect(chip).toHaveStyle({ backgroundColor: '#16a34a' })
    expect(chip).toHaveStyle({ color: '#ffffff' })
  })

  it('uses the brand primary color for the primary tone', () => {
    render(<StatusChip label='Generated' tone='primary' />)
    const chip = screen.getByText('Generated').parentElement
    expect(chip).toHaveStyle({ borderColor: '#5ea100' })
  })

  it('renders the tooltip via the native title attribute', () => {
    render(<StatusChip label='Failed' tone='danger' tooltip='Last run failed' />)
    const chip = screen.getByText('Failed').parentElement
    expect(chip).toHaveAttribute('title', 'Last run failed')
  })

  it('renders end content', () => {
    render(<StatusChip label='Open issues' endContent={<span>12</span>} />)
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('omits the leading dot when icon is null', () => {
    const { container } = render(<StatusChip label='No icon' icon={null} />)
    // The default dot is the only aria-hidden span; with icon={null} it should be gone.
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('fires onClick when pressed', async () => {
    const onClick = vi.fn()
    render(<StatusChip label='Press' onClick={onClick} />)
    await userEvent.click(screen.getByText('Press'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
