// Copyright © 2026 Jalapeno Labs

import type { KeyboardEvent, ReactNode } from 'react'

// Core
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  title: ReactNode
  children: ReactNode
  // The dialog's buttons, laid out along its bottom.
  footer: ReactNode
  onClose: () => void
  // What Enter does, such as saving. A textarea takes Ctrl+Enter instead, so
  // Enter can still start a new line; a focused button presses itself.
  onEnter?: () => void
  className?: string
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function isTextArea(target: EventTarget) {
  return target instanceof HTMLTextAreaElement
}

/**
 * A modal dialog for the table's own flows, such as a cell's full content or
 * a bulk edit. It renders in a portal over a backdrop, keeps keyboard focus
 * inside itself while open, closes on Escape or a backdrop press, and gives
 * focus back to where it was when it closes. Render it only while open.
 */
export function TableDialog(props: Props) {
  const { onClose, onEnter } = props
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const dialog = dialogRef.current
    const firstFocusable = dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
    // Focus lands on the first field or button, or on the dialog itself.
    if (firstFocusable) {
      firstFocusable.focus()
    }
    else {
      dialog?.focus()
    }

    return () => {
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      }
    }
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      // Escape belongs to the dialog, not to the table or page beneath it.
      event.stopPropagation()
      onClose()
      return
    }

    if (event.key === 'Enter' && onEnter) {
      const isButton = event.target instanceof HTMLButtonElement
      const isCommand = event.ctrlKey || event.metaKey
      if (isButton || (isTextArea(event.target) && !isCommand)) {
        return
      }
      event.preventDefault()
      onEnter()
      return
    }

    if (event.key === 'Tab') {
      trapFocus(event)
    }
  }

  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    const focusables = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [])
    if (!focusables.length) {
      event.preventDefault()
      return
    }
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
      return
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div
      className='jala-table-theme jala-table-dialog-backdrop'
      data-no-row-highlight='true'
      onMouseDown={(event) => {
        // Only a press on the backdrop itself, not one that started inside.
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        tabIndex={-1}
        className={[ 'jala-table-dialog', props.className ?? '' ].join(' ').trim()}
        onKeyDown={handleKeyDown}
      >
        <h2 id={titleId} className='jala-table-dialog-title'>{ props.title }</h2>
        <div className='jala-table-dialog-body'>{ props.children }</div>
        <div className='jala-table-dialog-footer'>{ props.footer }</div>
      </div>
    </div>,
    document.body,
  )
}
