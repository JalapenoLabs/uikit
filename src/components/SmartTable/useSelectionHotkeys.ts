// Copyright © 2026 Jalapeno Labs

// Core
import { useEffect, useLayoutEffect, useRef } from 'react'

type Handlers = {
  hasSelection: boolean
  canUndo: boolean
  canRedo: boolean
  onClear: () => void
  onUndo: () => void
  onRedo: () => void
  onSelectAll: () => void
}

// Where the keys keep their usual meaning: typing, and the table's own (or
// anyone's) dialogs and menus.
function isOwnedElsewhere(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  if (target.isContentEditable || [ 'INPUT', 'TEXTAREA', 'SELECT' ].includes(target.tagName)) {
    return true
  }
  return Boolean(target.closest('[role="dialog"], [role="menu"], [aria-modal="true"]'))
}

/**
 * The selection hotkeys (ux.md, Table multi-select), ignored while focus is in
 * a text field, a dialog, or a menu, and while a modal is open:
 * - Escape clears the selection.
 * - Ctrl+Z and Ctrl+Shift+Z undo and redo selection changes while there is a
 *   selection; otherwise they are left to the app's own undo.
 * - Ctrl+A selects all, Ctrl+Shift+A deselects all.
 * Cmd stands in for Ctrl on macOS. Shift-click ranges are the rows' own.
 */
export function useSelectionHotkeys(isEnabled: boolean, handlers: Handlers) {
  // The listener reads the latest handlers without subscribing again on
  // every render.
  const handlersRef = useRef(handlers)
  useLayoutEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    if (!isEnabled) {
      return undefined
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || isOwnedElsewhere(event.target)) {
        return
      }
      if (document.querySelector('[aria-modal="true"]')) {
        return
      }

      const current = handlersRef.current
      const isCommand = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()

      if (key === 'escape' && !isCommand && current.hasSelection) {
        event.preventDefault()
        current.onClear()
        return
      }
      if (!isCommand) {
        return
      }
      if (key === 'a') {
        event.preventDefault()
        if (event.shiftKey) {
          current.onClear()
          return
        }
        current.onSelectAll()
        return
      }
      if (key === 'z' && current.hasSelection) {
        const canStep = event.shiftKey
          ? current.canRedo
          : current.canUndo
        if (!canStep) {
          return
        }
        event.preventDefault()
        if (event.shiftKey) {
          current.onRedo()
          return
        }
        current.onUndo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [ isEnabled ])
}
