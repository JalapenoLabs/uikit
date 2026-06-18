// Copyright © 2026 Jalapeno Labs

import type { CSSProperties, KeyboardEvent } from 'react'

// Core
import { useEffect, useId, useRef, useState } from 'react'

// Utility
import { getFlagEmoji } from './getFlagEmoji'

export type LanguageOption = {
  // The language identifier (an ISO country code or BCP-47 locale, e.g. 'en-US').
  code: string
  // The human-readable, ideally localized, display label (e.g. 'English').
  label: string
  // An explicit flag emoji. When omitted, one is derived from `code`.
  flag?: string
}

export type LanguageSelectorProps = {
  languages: LanguageOption[]
  value: string
  onChange: (code: string) => void
  className?: string
  // Accessible name for the trigger. `label` is an alias kept for ergonomics.
  'aria-label'?: string
  label?: string
  isDisabled?: boolean
}

// Resolve the emoji for an option, honoring an explicit flag before deriving one.
function resolveFlag(option: LanguageOption): string {
  if (option.flag) {
    return option.flag
  }
  return getFlagEmoji(option.code)
}

const triggerStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
  minWidth: '12rem',
  padding: '0.5rem 0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid rgba(0, 0, 0, 0.15)',
  background: '#ffffff',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
}

const listboxStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 20,
  top: 'calc(100% + 0.25rem)',
  left: 0,
  right: 0,
  margin: 0,
  padding: '0.25rem',
  listStyle: 'none',
  borderRadius: '0.5rem',
  border: '1px solid rgba(0, 0, 0, 0.15)',
  background: '#ffffff',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  maxHeight: '16rem',
  overflowY: 'auto',
}

const optionBaseStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.625rem',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  userSelect: 'none',
}

/**
 * A controlled, dependency-free language picker with flag emojis.
 *
 * It renders an accessible custom dropdown (a button trigger paired with a
 * listbox of options) and stays fully decoupled from any state library, i18n
 * framework, or component kit. Selection is driven entirely by `value` and
 * `onChange`, so consumers own the source of truth.
 */
export function LanguageSelector(props: LanguageSelectorProps) {
  const {
    languages,
    value,
    onChange,
    className,
    label,
    isDisabled = false,
  } = props

  const accessibleLabel = props['aria-label'] || label || 'Select language'

  const [ isOpen, setIsOpen ] = useState(false)
  // Tracks which option the keyboard is focused on while the listbox is open.
  const [ activeIndex, setActiveIndex ] = useState(0)

  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  const selectedIndex = languages.findIndex((language) => language.code === value)
  const selectedOption = selectedIndex >= 0
    ? languages[selectedIndex]
    : undefined

  // Close on any click that lands outside the component's root element. The
  // listener is only attached while the listbox is open.
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handleOutsideClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [ isOpen ])

  function openListbox() {
    if (isDisabled) {
      return
    }
    // Start the keyboard cursor on the current selection for an intuitive open.
    setActiveIndex(selectedIndex >= 0
      ? selectedIndex
      : 0)
    setIsOpen(true)
  }

  function selectOptionAtIndex(index: number) {
    const option = languages[index]
    if (!option) {
      console.debug('LanguageSelector tried to select a missing option index', index)
      return
    }
    onChange(option.code)
    setIsOpen(false)
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openListbox()
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (isOpen) {
        selectOptionAtIndex(activeIndex)
      }
      else {
        openListbox()
      }
    }
  }

  function handleListboxKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((previousIndex) => Math.min(previousIndex + 1, languages.length - 1))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((previousIndex) => Math.max(previousIndex - 1, 0))
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectOptionAtIndex(activeIndex)
    }
  }

  return <div
    ref={rootRef}
    className={className}
    style={{ position: 'relative', display: 'inline-block' }}
  >
    <button
      type='button'
      style={{
        ...triggerStyle,
        opacity: isDisabled
          ? 0.6
          : 1,
        cursor: isDisabled
          ? 'not-allowed'
          : 'pointer',
      }}
      aria-label={accessibleLabel}
      aria-haspopup='listbox'
      aria-expanded={isOpen}
      aria-controls={isOpen
        ? listboxId
        : undefined}
      disabled={isDisabled}
      onClick={() => {
        if (isOpen) {
          setIsOpen(false)
        }
        else {
          openListbox()
        }
      }}
      onKeyDown={handleTriggerKeyDown}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <span aria-hidden='true' style={{ fontSize: '1.125rem', lineHeight: 1 }}>{
          selectedOption
            ? resolveFlag(selectedOption)
            : ''
        }</span>
        <span>{
          selectedOption
            ? selectedOption.label
            : accessibleLabel
        }</span>
      </span>
      <span aria-hidden='true' style={{ opacity: 0.6 }}>{
        isOpen
          ? '▴'
          : '▾'
      }</span>
    </button>
    { isOpen
      ? <ul
        id={listboxId}
        role='listbox'
        aria-label={accessibleLabel}
        aria-activedescendant={`${listboxId}-option-${activeIndex}`}
        tabIndex={-1}
        ref={(element) => element?.focus()}
        style={listboxStyle}
        onKeyDown={handleListboxKeyDown}
      >
        { languages.map((language, index) => {
          const isSelected = language.code === value
          const isActive = index === activeIndex

          return <li
            key={language.code}
            id={`${listboxId}-option-${index}`}
            role='option'
            aria-selected={isSelected}
            style={{
              ...optionBaseStyle,
              background: isActive
                ? 'rgba(94, 161, 0, 0.12)'
                : 'transparent',
              fontWeight: isSelected
                ? 600
                : 400,
            }}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => selectOptionAtIndex(index)}
          >
            <span aria-hidden='true' style={{ fontSize: '1.125rem', lineHeight: 1 }}>{
              resolveFlag(language)
            }</span>
            <span>{language.label}</span>
          </li>
        }) }
      </ul>
      : null }
  </div>
}
