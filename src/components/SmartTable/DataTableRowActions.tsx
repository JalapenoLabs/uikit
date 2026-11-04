// Copyright © 2026 Jalapeno Labs

import type { DataTableAction } from './DataTable.types'
import type { SmartTableLabels } from './labels'
import type { TableMenuItem } from './TableMenu'
import type { Row, RowData } from '@tanstack/react-table'
import type { ReactNode } from 'react'

// Core
import { Children, useState } from 'react'

// User interface
import { TableIcon } from './icons'
import { TableMenu } from './TableMenu'
import { TableTooltip } from './TableTooltip'

// ux.md: no more than three buttons at a time in a row's actions. When there
// are more, the first two stay buttons and the ellipsis menu holds the rest.
export const MAX_VISIBLE_ROW_ACTIONS = 3

type Props<TData extends RowData> = {
  row: Row<TData>
  rowActions?: DataTableAction<TData>[]
  renderRowActions?: (row: Row<TData>) => ReactNode
  // `hover` shows icon buttons while the row is hovered; `menu` shows the
  // ellipsis menu on every row, for screens that cannot hover.
  layout: 'hover' | 'menu'
  labels: SmartTableLabels
}

function resolveActionFlag<TData extends RowData>(
  value: boolean | ((row: Row<TData>) => boolean) | undefined,
  row: Row<TData>,
) {
  if (typeof value === 'function') {
    return value(row)
  }
  return Boolean(value)
}

type ActionButtonProps<TData extends RowData> = {
  action: DataTableAction<TData>
  row: Row<TData>
}

function RowActionButton<TData extends RowData>(props: ActionButtonProps<TData>) {
  const { action, row } = props
  const [ isPending, setIsPending ] = useState(false)
  const isLoading = isPending || resolveActionFlag(action.isLoading, row)
  const isDisabled = isLoading || resolveActionFlag(action.isDisabled, row)

  async function handlePress() {
    const result = action.onPress(row)
    if (!(result instanceof Promise)) {
      return
    }
    setIsPending(true)
    try {
      await result
    }
    finally {
      setIsPending(false)
    }
  }

  const button = <button
    type='button'
    aria-label={action.ariaLabel ?? action.label}
    aria-busy={isLoading || undefined}
    onClick={handlePress}
    className={[
      action.icon ? 'jala-table-icon-button' : 'jala-table-action-button',
      action.isDanger ? 'jala-table-icon-button--danger' : '',
      action.className ?? '',
    ].join(' ').trim()}
    disabled={isDisabled}
    data-no-row-highlight='true'
  >
    { isLoading
      ? <TableIcon name='spinner' size={16} className='jala-table-spin' />
      : action.icon ?? <span>{ action.label }</span>
    }
  </button>

  // Icon-only buttons always name themselves in a tooltip. The wrapper keeps
  // the tooltip working while the button itself is disabled.
  return <TableTooltip content={action.label}>{ button }</TableTooltip>
}

function toMenuItem<TData extends RowData>(action: DataTableAction<TData>, row: Row<TData>): TableMenuItem {
  return {
    id: action.id,
    label: action.label,
    icon: action.icon,
    isDanger: action.isDanger,
    isDisabled: resolveActionFlag(action.isDisabled, row) || resolveActionFlag(action.isLoading, row),
    onPress: () => {
      void action.onPress(row)
    },
  }
}

/**
 * A row's actions, floating over the right of the row: icon-only buttons with
 * tooltips, at most three at once with the rest in an ellipsis menu. On
 * screens that cannot hover, every row shows the ellipsis menu instead.
 *
 * `renderRowActions` content is the consumer's own and shows as given: on
 * hover where the table hovers, and always where it cannot.
 */
export function DataTableRowActions<TData extends RowData>(props: Props<TData>) {
  const {
    row,
    rowActions,
    renderRowActions,
    layout,
    labels,
  } = props

  const [ isMenuOpen, setIsMenuOpen ] = useState(false)

  const trayClassName = [
    'jala-table-actions-tray',
    layout === 'menu' ? 'jala-table-actions-tray--pinned' : '',
    isMenuOpen ? 'jala-table-actions-tray--open' : '',
  ].join(' ').trim()

  if (renderRowActions) {
    const content = renderRowActions(row)
    if (Children.toArray(content).length === 0) {
      return null
    }
    return <div className={trayClassName} data-no-row-highlight='true'>{ content }</div>
  }

  const visibleActions = (rowActions ?? []).filter((action) => {
    return action.isVisible === undefined || resolveActionFlag(action.isVisible, row)
  })
  if (!visibleActions.length) {
    return null
  }

  const fitsAsButtons = layout === 'hover' && visibleActions.length <= MAX_VISIBLE_ROW_ACTIONS
  const buttonCount = layout === 'menu'
    ? 0
    : MAX_VISIBLE_ROW_ACTIONS - 1
  const buttonActions = fitsAsButtons
    ? visibleActions
    : visibleActions.slice(0, buttonCount)
  const menuActions = fitsAsButtons
    ? []
    : visibleActions.slice(buttonCount)

  return <div className={trayClassName} data-no-row-highlight='true'>
    { buttonActions.map((action) => <RowActionButton key={action.id} action={action} row={row} />) }
    { menuActions.length
      ? <TableMenu
        label={labels.moreActions}
        items={menuActions.map((action) => toMenuItem(action, row))}
        onOpenChange={setIsMenuOpen}
      />
      : null
    }
  </div>
}
