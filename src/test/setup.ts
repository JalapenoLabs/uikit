// Copyright © 2026 Jalapeno Labs

// Registers @testing-library/jest-dom matchers (toBeInTheDocument, toHaveStyle,
// ...) with Vitest's expect and cleans up the DOM between tests.
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
