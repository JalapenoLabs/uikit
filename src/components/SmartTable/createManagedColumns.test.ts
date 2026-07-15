// Copyright © 2026 Jalapeno Labs

import type { ColumnDef } from '@tanstack/react-table'

import { describe, expect, it, vi } from 'vitest'
import { createManagedColumns } from './createManagedColumns'

type TestRow = {
  name: string
  role: string
}

describe('createManagedColumns', () => {
  it('builds one managed column per key with derived ids, labels, and search keys', () => {
    const columns = createManagedColumns<TestRow, 'name' | 'role'>({
      columnKeys: [ 'name', 'role' ],
      createColumnDef: ({ columnKey, columnLabel }) => ({
        accessorKey: columnKey,
        header: columnLabel,
      }),
    })

    expect(columns).toHaveLength(2)
    expect(columns[0].columnId).toBe('name')
    expect(columns[0].columnLabel).toBe('name')
    expect(columns[0].searchKey).toBe('name')
    expect(columns[0].columnDef.id).toBe('name')
  })

  it('applies the id, label, and search key resolvers', () => {
    const columns = createManagedColumns<TestRow, 'name'>({
      columnKeys: [ 'name' ],
      getColumnId: (columnKey, columnIndex) => `${columnKey}-${columnIndex}`,
      getColumnLabel: () => 'Full name',
      getSearchKey: () => null,
      createColumnDef: () => ({ header: 'Header' }),
    })

    expect(columns[0].columnId).toBe('name-0')
    expect(columns[0].columnLabel).toBe('Full name')
    expect(columns[0].searchKey).toBeNull()
  })

  it('prefers getSearchValue resolvers over search keys', () => {
    const resolver = (row: TestRow) => `${row.name} ${row.role}`
    const columns = createManagedColumns<TestRow, 'name'>({
      columnKeys: [ 'name' ],
      getSearchValue: () => resolver,
      createColumnDef: () => ({ header: 'Header' }),
    })

    expect(columns[0].getSearchValue).toBe(resolver)
  })

  it('uses a static columnDefOverride instead of the factory', () => {
    const createColumnDef = vi.fn((): ColumnDef<TestRow, unknown> => ({ header: 'Factory' }))
    const override: ColumnDef<TestRow, unknown> = { header: 'Overridden' }

    const columns = createManagedColumns<TestRow, 'name' | 'role'>({
      columnKeys: [ 'name', 'role' ],
      createColumnDef,
      columnDefOverrides: {
        name: override,
      },
    })

    expect(columns[0].columnDef.header).toBe('Overridden')
    // The factory only runs for columns without an override.
    expect(createColumnDef).toHaveBeenCalledTimes(1)
  })

  it('passes the column params to a function override', () => {
    const columns = createManagedColumns<TestRow, 'name'>({
      columnKeys: [ 'name' ],
      createColumnDef: () => ({ header: 'Header' }),
      columnDefOverrides: {
        name: (params) => ({ header: `Header for ${params.columnKey}` }),
      },
    })

    expect(columns[0].columnDef.header).toBe('Header for name')
  })

  it('always stamps the resolved column id onto the columnDef', () => {
    const columns = createManagedColumns<TestRow, 'name'>({
      columnKeys: [ 'name' ],
      createColumnDef: () => ({ id: 'something-else' }),
    })

    expect(columns[0].columnDef.id).toBe('name')
  })
})
