// Copyright © 2026 Jalapeno Labs

/**
 * Safely extracts a human-readable message from an unknown thrown value.
 * Returns null when the value is neither an Error nor a string.
 */
export function getErrorMessage(error: unknown): string | null {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return null
}
