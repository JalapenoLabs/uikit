// Copyright © 2026 Jalapeno Labs

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FlattenErrors } from './FlattenErrors'

describe('FlattenErrors', () => {
  it('renders a single string error as text', () => {
    render(<FlattenErrors errors='Something went wrong' />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders one paragraph per message for an array of errors', () => {
    const errorMessages = [ 'First error', 'Second error', 'Third error' ]
    const { container } = render(<FlattenErrors errors={errorMessages} />)

    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs).toHaveLength(errorMessages.length)
    expect(paragraphs[0]).toHaveTextContent('First error')
    expect(paragraphs[1]).toHaveTextContent('Second error')
    expect(paragraphs[2]).toHaveTextContent('Third error')
  })

  it('renders nothing when errors is undefined', () => {
    const { container } = render(<FlattenErrors errors={undefined} />)
    expect(container).toBeEmptyDOMElement()
  })
})
