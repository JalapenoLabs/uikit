// Copyright © 2026 Jalapeno Labs

import type { SmartTableLabels } from './labels'

// Core
import { useEffect, useRef } from 'react'

// User interface
import { TableIcon } from './icons'

// Utility
import { isTextEntry } from '../../utils/isTextEntry'

type Props = {
  value: string
  onChange: (value: string) => void
  inputId: string
  placeholder: string
  labels: SmartTableLabels
  isDisabled?: boolean
  // Swaps the magnifying glass for a spinner, while a search waits on a server.
  isLoading?: boolean
  // Ctrl+F (Cmd+F) focuses this field instead of opening the browser's find,
  // unless focus is already in a text field.
  focusHotkey?: boolean
}

/**
 * The table's search field: a magnifying glass on the left, a clear button on
 * the right while it holds text. It starts narrow and widens once it holds
 * text, animating the change, and fills the width on phones.
 */
export function DataTableSearch(props: Props) {
  const {
    value,
    onChange,
    inputId,
    placeholder,
    labels,
    isDisabled = false,
    isLoading = false,
    focusHotkey = true,
  } = props

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!focusHotkey || isDisabled) {
      return undefined
    }

    function handleKeyDown(event: KeyboardEvent) {
      const isFind = (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'f'
      if (!isFind || event.defaultPrevented || isTextEntry(event.target)) {
        return
      }
      event.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [ focusHotkey, isDisabled ])

  return <div
    className={[
      'jala-table-search',
      value ? 'jala-table-search--filled' : '',
    ].join(' ').trim()}
  >
    <span className='jala-table-search-icon'>{
      isLoading
        ? <TableIcon name='spinner' size={16} className='jala-table-spin' />
        : <TableIcon name='search' size={16} />
    }</span>
    <input
      ref={inputRef}
      type='search'
      className='jala-table-search-input'
      id={inputId}
      aria-label={placeholder}
      aria-busy={isLoading || undefined}
      placeholder={placeholder}
      autoComplete='off'
      disabled={isDisabled}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
    { value
      ? (
        <button
          type='button'
          className='jala-table-search-clear'
          aria-label={labels.clearSearch}
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
        >
          <TableIcon name='close' size={16} />
        </button>
      )
      : null
    }
  </div>
}
