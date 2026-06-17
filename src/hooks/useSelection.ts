// Copyright © 2026 Jalapeno Labs

// Core
import { useState, useCallback, useMemo } from 'react'
import { isEqual } from 'lodash-es'

/**
 * Selection payload shape compatible with table components such as HeroUI's:
 * either the literal `'all'` or a Set of row keys.
 */
export type SelectionInput = 'all' | Set<string | number>

/**
 * Manages a multi-select list of rows with add/remove/toggle/clear helpers and
 * deep-equality membership checks. When a `keyName` is provided it also exposes
 * `selectedKeys` and an `onSelectionChange` handler that plugs directly into a
 * table's selection API.
 */
export function useSelection<
  Selection extends Record<string, unknown>,
  KeyName extends keyof Selection = keyof Selection,
>(
  fullList: Selection[] = [],
  keyName?: KeyName,
) {
  const [ current, setSelection ] = useState<Selection[]>([])

  const allChecked = current.length === fullList.length
  const length = current.length

  const set = useCallback((newSelection: Selection[]) => {
    setSelection(newSelection)
  }, [])

  const add = useCallback((selection: Selection) => {
    setSelection((previous) => [ ...previous, selection ])
  }, [])

  const remove = useCallback((selection: Selection) => {
    setSelection((previous) => previous.filter((item) => !isEqual(item, selection)))
  }, [])

  const has = useCallback((selection: Selection): boolean => {
    return current.some((item) => isEqual(item, selection))
  }, [ current ])

  const toggle = useCallback((selection: Selection, force?: 'add' | 'remove') => {
    if (force === 'add') {
      add(selection)
      return
    }

    if (force === 'remove') {
      remove(selection)
      return
    }

    if (has(selection)) {
      remove(selection)
      return
    }

    add(selection)
  }, [ add, remove, has ])

  const clear = useCallback(() => {
    setSelection([])
  }, [])

  const addAll = useCallback((items: Selection[]) => {
    setSelection(items)
  }, [])

  const toggleAll = useCallback(() => {
    if (allChecked) {
      clear()
      return
    }

    addAll(fullList)
  }, [ fullList, addAll, clear, allChecked ])

  const selectedKeys: string[] = useMemo(() => {
    if (!keyName) {
      return []
    }

    return current.reduce<string[]>((accumulator, row) => {
      const value = row[keyName]
      if (typeof value === 'string' || typeof value === 'number') {
        accumulator.push(String(value))
      }
      return accumulator
    }, [])
  }, [ current, keyName ])

  const onSelectionChange = useCallback((inboundSelection: SelectionInput) => {
    if (!keyName) {
      setSelection([])
      return
    }

    if (inboundSelection === 'all') {
      addAll(fullList)
      return
    }

    const inboundKeys = Array.from(inboundSelection).map(String)
    const newSelection = inboundKeys
      .map((key) => fullList.find((row) => {
        const value = row[keyName]
        if (typeof value !== 'string' && typeof value !== 'number') {
          return false
        }
        return String(value) === key
      }))
      .filter((row): row is Selection => Boolean(row))

    setSelection(newSelection)
  }, [ addAll, fullList, keyName ])

  return {
    current,
    set,
    add,
    remove,
    has,
    toggle,
    toggleAll,
    addAll,
    clear,
    allChecked,
    onSelectionChange,
    selectedKeys,
    length,
  } as const
}
