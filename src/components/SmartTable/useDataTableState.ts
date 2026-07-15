// Copyright © 2026 Jalapeno Labs

import type { ColumnOrderState, ColumnSizingState, SortingState, VisibilityState } from '@tanstack/react-table'

// Core
import { useEffect, useMemo, useRef, useState } from 'react'

// Utility
import { isEqual } from 'lodash-es'

// Misc
import { mergeColumnOrder } from './columnOrderUtils'

type StorageKeys = {
  columnVisibility: string
  columnOrder: string
  columnSizing: string
}

type Options = {
  tableLocalStorageId: string
  managedColumnIds: string[]
  storageVersion?: string
  defaultHiddenColumnIds?: string[]
  sorting?: SortingState
  onSortingChange?: (next: SortingState) => void
}

const DEFAULT_STORAGE_VERSION = 'v1'
const COLUMN_SIZING_PERSIST_DEBOUNCE_MS = 150

function buildStorageKeys(tableId: string, version: string): StorageKeys {
  return {
    columnVisibility: `${tableId}.columnVisibility.${version}`,
    columnOrder: `${tableId}.columnOrder.${version}`,
    columnSizing: `${tableId}.columnSizing.${version}`,
  }
}

function areRecordsEqual(a: Record<string, boolean | number>, b: Record<string, boolean | number>) {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) {
    return false
  }
  return aKeys.every((key) => a[key] === b[key])
}

function readColumnVisibility(storageKey: string): VisibilityState {
  if (typeof window === 'undefined') {
    return {}
  }
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return {}
    }
    const parsed = JSON.parse(raw) as Record<string, boolean>
    return Object.fromEntries(
      Object.entries(parsed).filter((entry) => typeof entry[1] === 'boolean'),
    )
  }
  catch (error) {
    console.warn('Failed to read column visibility state:', error)
    return {}
  }
}

function readColumnOrder(storageKey: string): ColumnOrderState {
  if (typeof window === 'undefined') {
    return []
  }
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((value) => typeof value === 'string')
  }
  catch (error) {
    console.warn('Failed to read column order state:', error)
    return []
  }
}

function readColumnSizing(storageKey: string): ColumnSizingState {
  if (typeof window === 'undefined') {
    return {}
  }
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return {}
    }
    const parsed = JSON.parse(raw) as Record<string, number>
    return Object.fromEntries(
      Object.entries(parsed).filter((entry) => typeof entry[1] === 'number'),
    )
  }
  catch (error) {
    console.warn('Failed to read column sizing state:', error)
    return {}
  }
}

function writeStoredState(storageKey: string, state: unknown) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state))
  }
  catch (error) {
    console.warn('Failed to persist table state:', error)
  }
}

/**
 * Manages column visibility, order, and sizing with localStorage persistence,
 * namespaced by `tableLocalStorageId` and `storageVersion`. Stored state is
 * always reconciled against the current `managedColumnIds` so renamed or
 * removed columns cannot leave stale entries behind.
 */
export function useDataTableState(options: Options) {
  const {
    tableLocalStorageId,
    managedColumnIds,
    storageVersion = DEFAULT_STORAGE_VERSION,
    defaultHiddenColumnIds = [],
    sorting,
    onSortingChange,
  } = options

  const storageKeys = useMemo(
    () => buildStorageKeys(tableLocalStorageId, storageVersion),
    [ tableLocalStorageId, storageVersion ],
  )
  const hasStoredColumnVisibility = useMemo(() => {
    if (typeof window === 'undefined') {
      return false
    }
    try {
      return Boolean(window.localStorage.getItem(storageKeys.columnVisibility))
    }
    catch (error) {
      console.warn('Failed to read table state key:', error)
      return false
    }
  }, [ storageKeys.columnVisibility ])

  const [ columnVisibility, setColumnVisibility ] = useState<VisibilityState>({})
  const [ columnOrder, setColumnOrder ] = useState<ColumnOrderState>([])
  const [ columnSizing, setColumnSizing ] = useState<ColumnSizingState>({})
  const hasInitialized = useRef(false)
  const autoProcessedDefaultHiddenColumnIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (hasInitialized.current || managedColumnIds.length === 0) {
      return
    }

    const storedVisibility = readColumnVisibility(storageKeys.columnVisibility)
    const filteredVisibility: VisibilityState = {}
    managedColumnIds.forEach((id) => {
      if (storedVisibility[id] === false) {
        filteredVisibility[id] = false
      }
    })
    setColumnVisibility(filteredVisibility)

    const storedOrder = readColumnOrder(storageKeys.columnOrder)
    setColumnOrder(mergeColumnOrder(storedOrder, managedColumnIds))

    const storedSizing = readColumnSizing(storageKeys.columnSizing)
    const filteredSizing = Object.fromEntries(
      Object.entries(storedSizing).filter(([ key ]) => managedColumnIds.includes(key)),
    )
    setColumnSizing(filteredSizing)

    hasInitialized.current = true
  }, [ managedColumnIds, storageKeys ])

  useEffect(() => {
    autoProcessedDefaultHiddenColumnIds.current = new Set()
  }, [ storageKeys.columnVisibility ])

  // Apply `defaultHiddenColumnIds` only for tables with no stored visibility
  // yet (first visit), and only once per column id so the user's subsequent
  // "show column" choice is not fought by this effect.
  useEffect(() => {
    if (!hasInitialized.current) {
      return
    }
    if (hasStoredColumnVisibility || defaultHiddenColumnIds.length === 0) {
      return
    }
    setColumnVisibility((current) => {
      let changed = false
      const next = { ...current }
      defaultHiddenColumnIds.forEach((columnId) => {
        if (!managedColumnIds.includes(columnId)) {
          return
        }
        if (autoProcessedDefaultHiddenColumnIds.current.has(columnId)) {
          return
        }
        autoProcessedDefaultHiddenColumnIds.current.add(columnId)
        if (next[columnId] === undefined) {
          next[columnId] = false
          changed = true
        }
      })
      return changed
        ? next
        : current
    })
  }, [ managedColumnIds, defaultHiddenColumnIds, hasStoredColumnVisibility ])

  // Reconcile state whenever the managed column set changes.
  useEffect(() => {
    if (!hasInitialized.current) {
      return
    }
    setColumnOrder((current) => {
      const next = mergeColumnOrder(current, managedColumnIds)
      return isEqual(current, next)
        ? current
        : next
    })
    setColumnVisibility((current) => {
      const next: VisibilityState = {}
      managedColumnIds.forEach((id) => {
        if (current[id] === false) {
          next[id] = false
        }
      })
      return areRecordsEqual(current, next)
        ? current
        : next
    })
    setColumnSizing((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([ key ]) => managedColumnIds.includes(key)),
      )
      return areRecordsEqual(current, next)
        ? current
        : next
    })
  }, [ managedColumnIds ])

  useEffect(() => {
    if (!hasInitialized.current) {
      return
    }
    writeStoredState(storageKeys.columnVisibility, columnVisibility)
  }, [ columnVisibility, storageKeys ])

  useEffect(() => {
    if (!hasInitialized.current) {
      return
    }
    writeStoredState(storageKeys.columnOrder, columnOrder)
  }, [ columnOrder, storageKeys ])

  // Column sizing changes continuously while dragging a resize handle, so its
  // persistence is debounced to avoid hammering localStorage.
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    if (hasInitialized.current) {
      timeoutId = setTimeout(() => {
        writeStoredState(storageKeys.columnSizing, columnSizing)
      }, COLUMN_SIZING_PERSIST_DEBOUNCE_MS)
    }

    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
    }
  }, [ columnSizing, storageKeys.columnSizing ])

  // Clear sorting when the sorted column is removed or hidden, since a table
  // silently sorted by an invisible column reads as randomly ordered.
  useEffect(() => {
    if (!sorting?.length || !onSortingChange) {
      return
    }
    const active = sorting[0]
    if (!managedColumnIds.includes(active.id) || columnVisibility[active.id] === false) {
      onSortingChange([])
    }
  }, [ sorting, onSortingChange, columnVisibility, managedColumnIds ])

  const orderedColumnIds = useMemo(
    () => mergeColumnOrder(columnOrder, managedColumnIds),
    [ columnOrder, managedColumnIds ],
  )

  return {
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
    columnSizing,
    setColumnSizing,
    orderedColumnIds,
  } as const
}
