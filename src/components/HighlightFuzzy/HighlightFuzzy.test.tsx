// Copyright © 2026 Jalapeno Labs

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HighlightFuzzy } from './HighlightFuzzy'

describe('HighlightFuzzy', () => {
  it('wraps the matched substring in a mark element', () => {
    const { container } = render(<HighlightFuzzy text='hello world' query='wor' />)
    const mark = container.querySelector('mark')
    expect(mark).not.toBeNull()
    expect(mark).toHaveTextContent('wor')
  })

  it('renders the full text with no mark when the query is shorter than minMatchCharLength', () => {
    const { container } = render(<HighlightFuzzy text='hello world' query='w' />)
    expect(container.querySelector('mark')).toBeNull()
    expect(screen.getByText('hello world')).toBeInTheDocument()
  })

  it('renders the full text with no mark when there is no match', () => {
    const { container } = render(<HighlightFuzzy text='hello world' query='zzz' />)
    expect(container.querySelector('mark')).toBeNull()
    expect(screen.getByText('hello world')).toBeInTheDocument()
  })

  it('matches case-insensitively by default', () => {
    const { container } = render(<HighlightFuzzy text='Hello World' query='hello' />)
    const mark = container.querySelector('mark')
    expect(mark).not.toBeNull()
    expect(mark).toHaveTextContent('Hello')
  })

  it('respects caseSensitive by not matching a differently-cased query', () => {
    const { container } = render(
      <HighlightFuzzy text='Hello World' query='hello' caseSensitive />,
    )
    expect(container.querySelector('mark')).toBeNull()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
