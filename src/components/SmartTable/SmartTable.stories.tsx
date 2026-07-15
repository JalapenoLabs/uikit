// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'
import type { DataTableRowReorderPayload } from './DataTable.types'

// Core
import { useState } from 'react'

// User interface
import { SmartTable } from './SmartTable'
import { TableTipContent } from './TableTipContent'
import { createManagedColumns } from './createManagedColumns'

type Person = {
  id: string
  name: string
  role: string
  team: string
  joined: string
  bio: string
}

const people: Person[] = [
  {
    id: '1',
    name: 'Ada Lovelace',
    role: 'Engineer',
    team: 'Compilers',
    joined: '2024-01-15',
    bio: 'Wrote the first algorithm intended to be carried out by a machine.',
  },
  {
    id: '2',
    name: 'Grace Hopper',
    role: 'Admiral',
    team: 'Languages',
    joined: '2023-11-02',
    bio: 'Invented one of the first linkers and popularized machine-independent programming languages.',
  },
  {
    id: '3',
    name: 'Katherine Johnson',
    role: 'Mathematician',
    team: 'Trajectories',
    joined: '2024-03-20',
    bio: 'Calculated orbital mechanics critical to the success of the first crewed spaceflights.',
  },
  {
    id: '4',
    name: 'Margaret Hamilton',
    role: 'Engineer',
    team: 'Flight Software',
    joined: '2023-08-11',
    bio: 'Led the team that wrote the on-board flight software for the Apollo missions.',
  },
  {
    id: '5',
    name: 'Annie Easley',
    role: 'Rocket Scientist',
    team: 'Propulsion',
    joined: '2024-06-05',
    bio: 'Developed software for the Centaur rocket stage at NASA.',
  },
]

const columns = createManagedColumns<Person, 'name' | 'role' | 'team' | 'joined'>({
  columnKeys: [ 'name', 'role', 'team', 'joined' ],
  getColumnLabel: (columnKey) => {
    const labelByKey = {
      name: 'Name',
      role: 'Role',
      team: 'Team',
      joined: 'Date joined',
    }
    return labelByKey[columnKey]
  },
  createColumnDef: ({ columnKey, columnLabel }) => ({
    accessorKey: columnKey,
    header: columnLabel,
  }),
})

function SmartTableStory(props: Partial<Parameters<typeof SmartTable<Person>>[0]>) {
  const [ search, setSearch ] = useState('')

  return <SmartTable
    ids={{
      tableElementId: 'story-people-table',
      tableLocalStorageId: 'story-people-table',
    }}
    tableAriaLabel='People'
    data={people}
    managedColumns={columns}
    getRowId={(row) => row.id}
    search={{ value: search, onChange: setSearch }}
    {...props}
  />
}

const meta: Meta<typeof SmartTable<Person>> = {
  title: 'Components/SmartTable',
  component: SmartTable,
  tags: [ 'autodocs' ],
}

export default meta

type Story = StoryObj<typeof SmartTable<Person>>

export const Basic: Story = {
  render: () => <SmartTableStory />,
}

export const WithSelection: Story = {
  render: function WithSelectionStory() {
    const [ search, setSearch ] = useState('')
    const [ rowSelection, setRowSelection ] = useState({})

    return <SmartTable
      ids={{
        tableElementId: 'story-selectable-table',
        tableLocalStorageId: 'story-selectable-table',
      }}
      tableAriaLabel='People'
      data={people}
      managedColumns={columns}
      getRowId={(row) => row.id}
      search={{ value: search, onChange: setSearch }}
      enableSelection
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
    />
  },
}

export const WithPagination: Story = {
  render: function WithPaginationStory() {
    const [ search, setSearch ] = useState('')
    const manyPeople = Array.from({ length: 60 }, (_unused, index) => ({
      ...people[index % people.length],
      id: String(index + 1),
      name: `${people[index % people.length].name} ${index + 1}`,
    }))

    return <SmartTable
      ids={{
        tableElementId: 'story-paginated-table',
        tableLocalStorageId: 'story-paginated-table',
      }}
      tableAriaLabel='People'
      data={manyPeople}
      managedColumns={columns}
      getRowId={(row) => row.id}
      search={{ value: search, onChange: setSearch }}
      pagination={{ show: true, initialPageSize: 10 }}
    />
  },
}

export const WithRowActions: Story = {
  render: () => <SmartTableStory
    rowActions={[
      {
        id: 'edit',
        label: 'Edit',
        onPress: (row) => console.log('Edit', row.original),
      },
      {
        id: 'delete',
        label: 'Delete',
        onPress: (row) => console.log('Delete', row.original),
      },
    ]}
  />,
}

export const WithRowReorder: Story = {
  render: function WithRowReorderStory() {
    const [ rows, setRows ] = useState(people)

    return <SmartTable
      ids={{
        tableElementId: 'story-reorderable-table',
        tableLocalStorageId: 'story-reorderable-table',
      }}
      tableAriaLabel='People'
      data={rows}
      managedColumns={columns}
      getRowId={(row) => row.id}
      enableSorting={false}
      enableRowReorder
      onRowReorder={(payload: DataTableRowReorderPayload<Person>) => setRows(payload.nextRows)}
    />
  },
}

export const WithTooltips: Story = {
  render: function WithTooltipsStory() {
    const [ search, setSearch ] = useState('')
    const tooltipColumns = columns.map((column) => {
      if (column.columnId !== 'name') {
        return column
      }
      return {
        ...column,
        headerTooltip: 'The person\'s full name',
        cellTooltip: (row: Person) => <TableTipContent label={row.name}>{row.bio}</TableTipContent>,
      }
    })

    return <SmartTable
      ids={{
        tableElementId: 'story-tooltip-table',
        tableLocalStorageId: 'story-tooltip-table',
      }}
      tableAriaLabel='People'
      data={people}
      managedColumns={tooltipColumns}
      getRowId={(row) => row.id}
      search={{ value: search, onChange: setSearch }}
    />
  },
}

export const Localized: Story = {
  render: () => <SmartTableStory
    labels={{
      searchPlaceholder: 'Buscar...',
      columns: 'Columnas',
      results: (count) => `${count} resultados`,
    }}
  />,
}
