// Copyright © 2026 Jalapeno Labs

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LuminescentText } from './LuminescentText'
import { LUMINESCENT_KEYFRAME_NAME } from './luminescent'

describe('LuminescentText', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('renders the provided text', () => {
    render(<LuminescentText text='Glowing' />)
    expect(screen.getByText('Glowing')).toBeInTheDocument()
  })

  it('animates by default via the inline keyframe', () => {
    render(<LuminescentText text='Animated' />)
    const element = screen.getByText('Animated')
    expect(element.style.animation).toContain(LUMINESCENT_KEYFRAME_NAME)
    expect(element.style.backgroundImage).toContain('linear-gradient')
  })

  it('renders plain text with no animation when disabled', () => {
    render(<LuminescentText text='Plain' isDisabled />)
    const element = screen.getByText('Plain')
    expect(element.style.animation).toBe('')
    expect(element.style.backgroundImage).toBe('')
  })

  it('keeps the data-type marker for both enabled and disabled states', () => {
    const { rerender } = render(<LuminescentText text='Marker' />)
    expect(screen.getByText('Marker')).toHaveAttribute('data-type', 'luminescent-text')

    rerender(<LuminescentText text='Marker' isDisabled />)
    expect(screen.getByText('Marker')).toHaveAttribute('data-type', 'luminescent-text')
  })

  it('respects an explicit theme prop with dark endpoints in the light theme', () => {
    render(<LuminescentText text='Light' theme='light' color='#ff0000' />)
    const element = screen.getByText('Light')
    // A light theme frames the red accent with dark (black) endpoints.
    expect(element.style.backgroundImage).toContain('#000000')
    expect(element.style.backgroundImage).toContain('#ff0000')
  })

  it('uses light endpoints when the explicit theme is dark', () => {
    render(<LuminescentText text='Dark' theme='dark' color='#ff0000' />)
    const element = screen.getByText('Dark')
    // A dark theme frames the accent with light (white) endpoints.
    expect(element.style.backgroundImage).toContain('#ffffff')
  })

  it('swaps the endpoints when inverted', () => {
    render(<LuminescentText text='Swapped' theme='light' inverted color='#ff0000' />)
    const element = screen.getByText('Swapped')
    // Inverting a light theme borrows the dark theme's light endpoints.
    expect(element.style.backgroundImage).toContain('#ffffff')
  })
})
