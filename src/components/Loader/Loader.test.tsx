// Copyright © 2026 Jalapeno Labs

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Loader } from './Loader'

describe('Loader', () => {
  it('renders an accessible status element', () => {
    render(<Loader />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('uses the default accessible label', () => {
    render(<Loader />)
    expect(screen.getByRole('status', { name: 'Loading...' })).toBeInTheDocument()
  })

  it('respects a custom accessible label', () => {
    render(<Loader label='Fetching data' />)
    expect(screen.getByRole('status', { name: 'Fetching data' })).toBeInTheDocument()
  })

  it('renders an svg spinner inside the status element', () => {
    render(<Loader />)
    const spinner = screen.getByRole('status').querySelector('svg')
    expect(spinner).toBeInTheDocument()
  })

  it('left-aligns by default', () => {
    render(<Loader />)
    expect(screen.getByRole('status')).toHaveStyle({ justifyContent: 'flex-start' })
  })

  it('centers and fills available height when centered is set', () => {
    render(<Loader centered />)
    const status = screen.getByRole('status')
    expect(status).toHaveStyle({ justifyContent: 'center' })
    expect(status).toHaveStyle({ minHeight: '100%' })
  })

  it('fills the viewport height when fullVertical is set', () => {
    render(<Loader fullVertical />)
    // jsdom resolves `100vh` to computed pixels, so assert the raw inline style.
    expect(screen.getByRole('status').style.height).toBe('100vh')
  })

  it('forwards a custom className', () => {
    render(<Loader className='my-loader' />)
    expect(screen.getByRole('status')).toHaveClass('my-loader')
  })
})
