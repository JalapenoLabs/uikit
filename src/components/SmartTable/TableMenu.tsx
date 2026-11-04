// Copyright © 2026 Jalapeno Labs

import type { FloatingPlacement } from './floatingPosition'
import type { KeyboardEvent, ReactNode } from 'react'

// Core
import { useEffect, useId, useState } from 'react'

// User interface
import { FloatingLayer } from './FloatingLayer'
import { TableIcon } from './icons'
import { TableTooltip } from './TableTooltip'

export type TableMenuItem = {
  id: string
  label: string
  icon?: ReactNode
  isDisabled?: boolean
  // Dangerous items are listed last, below a divider, in red.
  isDanger?: boolean
  onPress: () => void
}

type Props = {
  items: TableMenuItem[]
  // The trigger's accessible name. An icon-only trigger also shows it as a tooltip.
  label: string
  // Text for the trigger. Without it the trigger is an icon-only ellipsis button.
  triggerContent?: ReactNode
  triggerClassName?: string
  placement?: FloatingPlacement
  isDisabled?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

const DEFAULT_PLACEMENT: FloatingPlacement = { side: 'bottom', align: 'end' }

function focusItem(menuElement: HTMLElement | null, pick: (items: HTMLElement[], current: number) => number) {
  if (!menuElement) {
    return
  }
  const items = Array.from(menuElement.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)'))
  if (!items.length) {
    return
  }
  const current = items.findIndex((item) => item === document.activeElement)
  items[pick(items, current)]?.focus()
}

/**
 * A menu button: the ellipsis trigger for a row's extra actions, or a text
 * trigger such as a drop-up of choices. The list floats in a portal so a
 * scroll container never clips it, and behaves like a menu: arrow keys move
 * between items, Escape and outside clicks close it, and focus returns to the
 * trigger.
 */
export function TableMenu(props: Props) {
  const {
    items,
    label,
    triggerContent,
    placement = DEFAULT_PLACEMENT,
    isDisabled = false,
    onOpenChange,
  } = props

  const [ isOpen, setIsOpen ] = useState(false)
  const [ triggerElement, setTriggerElement ] = useState<HTMLButtonElement | null>(null)
  const menuId = useId()

  // Safe items first, dangerous ones last below a divider.
  const safeItems: TableMenuItem[] = []
  const dangerItems: TableMenuItem[] = []
  for (const item of items) {
    if (item.isDanger) {
      dangerItems.push(item)
      continue
    }
    safeItems.push(item)
  }

  function setOpen(nextIsOpen: boolean) {
    setIsOpen(nextIsOpen)
    onOpenChange?.(nextIsOpen)
  }

  function close(shouldRestoreFocus: boolean) {
    setOpen(false)
    if (shouldRestoreFocus) {
      triggerElement?.focus()
    }
  }

  // Opening moves focus to the first item, as a menu does.
  useEffect(() => {
    if (isOpen) {
      focusItem(document.getElementById(menuId), () => 0)
    }
  }, [ isOpen, menuId ])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }
      const menuElement = document.getElementById(menuId)
      if (triggerElement?.contains(target) || menuElement?.contains(target)) {
        return
      }
      setIsOpen(false)
      onOpenChange?.(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [ isOpen, menuId, triggerElement, onOpenChange ])

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const menuElement = event.currentTarget
    const moveByKey: Record<string, (items: HTMLElement[], current: number) => number> = {
      ArrowDown: (menuItems, current) => (current + 1) % menuItems.length,
      ArrowUp: (menuItems, current) => (current - 1 + menuItems.length) % menuItems.length,
      Home: () => 0,
      End: (menuItems) => menuItems.length - 1,
    }

    const move = moveByKey[event.key]
    if (move) {
      event.preventDefault()
      focusItem(menuElement, move)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      // Escape belongs to the menu, not to whatever page or table listens for it.
      event.stopPropagation()
      close(true)
      return
    }
    if (event.key === 'Tab') {
      close(false)
    }
  }

  function renderItem(item: TableMenuItem) {
    return <button
      key={item.id}
      type='button'
      role='menuitem'
      className={[
        'jala-table-menu-item',
        item.isDanger ? 'jala-table-menu-item--danger' : '',
      ].join(' ').trim()}
      disabled={item.isDisabled}
      onClick={() => {
        close(true)
        item.onPress()
      }}
    >
      { item.icon
        ? <span className='jala-table-menu-item-icon' aria-hidden='true'>{ item.icon }</span>
        : null
      }
      <span>{ item.label }</span>
    </button>
  }

  const trigger = <button
    ref={setTriggerElement}
    type='button'
    className={[
      triggerContent ? 'jala-table-menu-trigger' : 'jala-table-icon-button',
      props.triggerClassName ?? '',
    ].join(' ').trim()}
    aria-label={triggerContent
      ? undefined
      : label}
    aria-haspopup='menu'
    aria-expanded={isOpen}
    aria-controls={isOpen
      ? menuId
      : undefined}
    disabled={isDisabled}
    data-no-row-highlight='true'
    onClick={() => setOpen(!isOpen)}
  >
    { triggerContent ?? <TableIcon name='more' size={18} /> }
  </button>

  return <>
    { triggerContent
      ? trigger
      : <TableTooltip content={label}>{ trigger }</TableTooltip>
    }
    { isOpen
      ? <FloatingLayer
        anchor={triggerElement}
        placement={placement}
        id={menuId}
        role='menu'
        aria-label={label}
        className='jala-table-menu'
        onKeyDown={handleMenuKeyDown}
      >
        { safeItems.map(renderItem) }
        { safeItems.length && dangerItems.length
          ? <div role='separator' className='jala-table-menu-divider' />
          : null
        }
        { dangerItems.map(renderItem) }
      </FloatingLayer>
      : null
    }
  </>
}
