// Copyright © 2026 Jalapeno Labs

import type { ResolvedFilter, SmartTableFilterValue, SmartTableFilterValues } from './filters'
import type { SmartTableLabels } from './labels'
import type { RowData } from '@tanstack/react-table'

// Core
import { useId, useState } from 'react'

// User interface
import { TableDialog } from './TableDialog'

type Props<TData extends RowData> = {
  filters: ResolvedFilter<TData>[]
  values: SmartTableFilterValues
  labels: SmartTableLabels
  onApply: (values: SmartTableFilterValues) => void
  onClose: () => void
}

type FieldProps<TData extends RowData> = {
  filter: ResolvedFilter<TData>
  value: SmartTableFilterValue | undefined
  labels: SmartTableLabels
  onChange: (value: SmartTableFilterValue) => void
}

// "Either", "Yes", "No" for a boolean filter, stored as null, true, false.
const booleanChoices = [ null, true, false ] as const

function FilterField<TData extends RowData>(props: FieldProps<TData>) {
  const { filter, value, labels, onChange } = props
  const fieldId = useId()

  if (filter.kind === 'select') {
    return <div className='jala-table-field'>
      <label className='jala-table-field-label' htmlFor={fieldId}>{ filter.label }</label>
      <select
        id={fieldId}
        className='jala-table-native-select'
        value={typeof value === 'string'
          ? value
          : ''}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value=''>{ labels.filterAny }</option>
        { filter.options.map((option) => <option key={option.value} value={option.value}>{ option.label }</option>) }
      </select>
    </div>
  }

  if (filter.kind === 'multiSelect') {
    const chosen = Array.isArray(value)
      ? value
      : []
    return <fieldset className='jala-table-field'>
      <legend className='jala-table-field-label'>{ filter.label }</legend>
      <div className='jala-table-choice-list'>
        { filter.options.map((option) => <label key={option.value} className='jala-table-choice'>
          <input
            type='checkbox'
            className='jala-table-checkbox'
            checked={chosen.includes(option.value)}
            onChange={(event) => onChange(event.target.checked
              ? [ ...chosen, option.value ]
              : chosen.filter((entry) => entry !== option.value))}
          />
          <span>{ option.label }</span>
        </label>) }
      </div>
    </fieldset>
  }

  if (filter.kind === 'boolean') {
    const labelByChoice = new Map([
      [ null, labels.filterAny ],
      [ true, labels.filterYes ],
      [ false, labels.filterNo ],
    ])
    const current = typeof value === 'boolean'
      ? value
      : null
    return <fieldset className='jala-table-field'>
      <legend className='jala-table-field-label'>{ filter.label }</legend>
      <div className='jala-table-segmented' role='radiogroup' aria-label={filter.label}>
        { booleanChoices.map((choice) => <label
          key={String(choice)}
          className={[
            'jala-table-segment',
            current === choice ? 'jala-table-segment--selected' : '',
          ].join(' ').trim()}
        >
          <input
            type='radio'
            name={fieldId}
            className='jala-table-sr-only'
            checked={current === choice}
            onChange={() => onChange(choice)}
          />
          <span>{ labelByChoice.get(choice) }</span>
        </label>) }
      </div>
    </fieldset>
  }

  return <div className='jala-table-field'>
    <label className='jala-table-field-label' htmlFor={fieldId}>{ filter.label }</label>
    <input
      id={fieldId}
      type='text'
      className='jala-table-text-input'
      autoComplete='off'
      value={typeof value === 'string'
        ? value
        : ''}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
}

/**
 * The full-height filters drawer: every filter the table offers, edited as a
 * draft that only reaches the table on Apply (or Enter). Cancel, Escape, and a
 * press outside leave the table's filters as they were.
 */
export function DataTableFilterDrawer<TData extends RowData>(props: Props<TData>) {
  const { filters, labels, onApply, onClose } = props
  const [ draft, setDraft ] = useState<SmartTableFilterValues>(() => ({ ...props.values }))

  function apply() {
    onApply(draft)
    onClose()
  }

  return <TableDialog
    variant='drawer'
    title={labels.filters}
    onClose={onClose}
    onEnter={apply}
    footer={<>
      <button type='button' className='jala-table-button jala-table-button--primary' onClick={apply}>
        <span>{ labels.applyFilters }</span>
      </button>
      <button type='button' className='jala-table-button' onClick={onClose}>
        <span>{ labels.cancel }</span>
      </button>
    </>}
  >
    <div className='jala-table-field-list'>
      { filters.map((filter) => <FilterField
        key={filter.id}
        filter={filter}
        value={draft[filter.id]}
        labels={labels}
        onChange={(value) => setDraft((current) => ({ ...current, [filter.id]: value }))}
      />) }
    </div>
  </TableDialog>
}
