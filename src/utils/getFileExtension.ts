// Copyright © 2026 Jalapeno Labs

/**
 * Extracts the lowercase file extension from a filename or path string.
 *
 * Edge-case behavior:
 * - Trailing slashes are ignored, so directory-like paths return `''`.
 * - Dotfiles such as `.gitignore` are treated as having the extension `gitignore`.
 * - Names without a dot return `''`.
 */
export function getFileExtension(filename: string | null | undefined): string {
  if (!filename) {
    return ''
  }

  // Remove trailing forward slashes to avoid treating directories as extensions.
  let cleaned = filename
  while (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1)
  }

  if (!cleaned) {
    return ''
  }

  // Work with just the last path segment.
  const segments = cleaned.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1] ?? ''
  if (!lastSegment) {
    return ''
  }

  const dotSeparatedParts = lastSegment.split('.')
  if (dotSeparatedParts.length === 1) {
    // No dot in the filename, so there is no extension.
    return ''
  }

  if (dotSeparatedParts[0] === '' && dotSeparatedParts.length === 2) {
    // Dotfile like ".gitignore" resolves to "gitignore".
    return dotSeparatedParts[1].toLowerCase()
  }

  const extension = dotSeparatedParts.pop() ?? ''
  return extension.toLowerCase()
}
