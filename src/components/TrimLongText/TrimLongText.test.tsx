// Copyright © 2026 Jalapeno Labs

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrimLongText } from './TrimLongText'

describe('TrimLongText', () => {
  it('renders short text in full with no title attribute', () => {
    render(<TrimLongText text='Hello world' maxLength={20} />)

    const paragraph = screen.getByText('Hello world')
    expect(paragraph).toBeInTheDocument()
    expect(paragraph).not.toHaveAttribute('title')
  })

  it('clips long text with an ellipsis and exposes the full text via title', () => {
    const fullText = 'This is a very long string that will be clipped'
    render(<TrimLongText text={fullText} maxLength={20} />)

    // The rendered text is shortened and ends with an ellipsis.
    const paragraph = screen.getByText(/\.\.\.$/)
    expect(paragraph.textContent).not.toBe(fullText)
    expect(paragraph.textContent!.length).toBeLessThanOrEqual(20)

    // The untruncated text remains available on hover through the native title.
    expect(paragraph).toHaveAttribute('title', fullText)
  })

  it('clips from the end when fromEnd is set, keeping the tail and exposing the full text', () => {
    const fullText = '/very/long/file/path/report.txt'
    render(<TrimLongText text={fullText} maxLength={20} fromEnd />)

    const paragraph = screen.getByText(/^\.\.\./)
    expect(paragraph.textContent).toContain('report.txt')
    expect(paragraph).toHaveAttribute('title', fullText)
  })
})
