// Copyright © 2026 Jalapeno Labs

// Core
import { describe, expect, it } from 'vitest'
import { isTextEntry } from './isTextEntry'

function input(type: string) {
  const element = document.createElement('input')
  element.type = type
  return element
}

describe('isTextEntry', () => {
  it('counts text-like inputs, textareas, selects, and editable content', () => {
    const editable = document.createElement('div')
    // The test DOM does not compute isContentEditable, so report it as a
    // browser would for contenteditable="true".
    Object.defineProperty(editable, 'isContentEditable', { value: true })
    const targets = [
      input('text'),
      input('search'),
      input('email'),
      input('number'),
      document.createElement('textarea'),
      document.createElement('select'),
      editable,
    ]
    expect(targets.map(isTextEntry)).toEqual(targets.map(() => true))
  })

  it('leaves out inputs that take no typing, and everything else', () => {
    const targets = [
      input('checkbox'),
      input('radio'),
      input('button'),
      document.createElement('button'),
      document.body,
      null,
    ]
    expect(targets.map(isTextEntry)).toEqual(targets.map(() => false))
  })
})
