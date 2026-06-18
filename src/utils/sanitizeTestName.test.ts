// Copyright © 2026 Jalapeno Labs

import { describe, it, expect } from 'vitest'
import { sanitizeTestName } from './sanitizeTestName'

describe('sanitizeTestName', () => {
  it('should lowercase and replace spaces with underscores', () => {
    expect(sanitizeTestName('My Test Case')).toBe('my_test_case')
  })

  it('should replace consecutive non-alphanumeric characters with a single underscore', () => {
    expect(sanitizeTestName('test--case!!name')).toBe('test_case_name')
  })

  it('should strip leading and trailing underscores', () => {
    expect(sanitizeTestName('__test_name__')).toBe('test_name')
  })

  it('should strip leading/trailing special characters', () => {
    expect(sanitizeTestName('---hello---')).toBe('hello')
  })

  it('should handle already sanitized names', () => {
    expect(sanitizeTestName('simple_test')).toBe('simple_test')
  })

  it('should handle mixed case with numbers', () => {
    expect(sanitizeTestName('Test123 Case456')).toBe('test123_case456')
  })

  it('should handle empty string', () => {
    expect(sanitizeTestName('')).toBe('')
  })

  it('should handle string with only special characters', () => {
    expect(sanitizeTestName('!!@@##')).toBe('')
  })

  it('should match Python re.sub(r"[^0-9a-z]+", "_", name.lower()).strip("_")', () => {
    // Exact parity with the Python backend sanitization.
    expect(sanitizeTestName('APB Write Read Test')).toBe('apb_write_read_test')
    expect(sanitizeTestName('reset_sequence_test')).toBe('reset_sequence_test')
    expect(sanitizeTestName('FIFO-Overflow_Check')).toBe('fifo_overflow_check')
  })
})
