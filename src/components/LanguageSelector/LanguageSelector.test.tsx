// Copyright © 2026 Jalapeno Labs

import type { LanguageOption } from './LanguageSelector'

import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { LanguageSelector } from './LanguageSelector'

const languages: LanguageOption[] = [
  { code: 'en-US', label: 'English' },
  { code: 'es-ES', label: 'Español' },
  { code: 'ja-JP', label: '日本語' },
]

// Built independently so the assertions verify the real Unicode, not the source.
const UNITED_STATES_FLAG = '\u{1F1FA}\u{1F1F8}'

describe('LanguageSelector', () => {
  it('renders the selected language flag and label on the trigger', () => {
    render(
      <LanguageSelector
        languages={languages}
        value='en-US'
        onChange={vi.fn()}
      />,
    )

    const trigger = screen.getByRole('button')
    expect(trigger).toHaveTextContent('English')
    expect(trigger).toHaveTextContent(UNITED_STATES_FLAG)
  })

  it('opens the listbox of options when the trigger is clicked', async () => {
    const user = userEvent.setup()
    render(
      <LanguageSelector
        languages={languages}
        value='en-US'
        onChange={vi.fn()}
      />,
    )

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button'))

    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()
    expect(within(listbox).getAllByRole('option')).toHaveLength(languages.length)
    expect(within(listbox).getByText('Español')).toBeInTheDocument()
  })

  it('calls onChange with the selected code when an option is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <LanguageSelector
        languages={languages}
        value='en-US'
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('日本語'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('ja-JP')
    // The listbox should close after a selection.
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('marks the active option as aria-selected', async () => {
    const user = userEvent.setup()
    render(
      <LanguageSelector
        languages={languages}
        value='es-ES'
        onChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button'))

    const selectedOption = screen.getByRole('option', { selected: true })
    expect(selectedOption).toHaveTextContent('Español')
  })

  it('closes the listbox when Escape is pressed', async () => {
    const user = userEvent.setup()
    render(
      <LanguageSelector
        languages={languages}
        value='en-US'
        onChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes the listbox when clicking outside the component', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <button type='button'>outside</button>
        <LanguageSelector
          languages={languages}
          value='en-US'
          onChange={vi.fn()}
        />
      </div>,
    )

    await user.click(screen.getByRole('button', { name: /select language/i }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'outside' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('does not open when disabled', async () => {
    const user = userEvent.setup()
    render(
      <LanguageSelector
        languages={languages}
        value='en-US'
        onChange={vi.fn()}
        isDisabled
      />,
    )

    await user.click(screen.getByRole('button'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('derives the trigger flag from the code when no explicit flag is given', () => {
    render(
      <LanguageSelector
        languages={[{ code: 'en-US', label: 'English' }]}
        value='en-US'
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button')).toHaveTextContent(UNITED_STATES_FLAG)
  })

  it('honors an explicit flag over the derived one', () => {
    render(
      <LanguageSelector
        languages={[{ code: 'en-US', label: 'English', flag: '🏴' }]}
        value='en-US'
        onChange={vi.fn()}
      />,
    )

    const trigger = screen.getByRole('button')
    expect(trigger).toHaveTextContent('🏴')
    expect(trigger).not.toHaveTextContent(UNITED_STATES_FLAG)
  })
})
