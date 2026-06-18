// Copyright © 2026 Jalapeno Labs

/**
 * Sanitizes a test case name to match the Python backend convention.
 * Replicates: re.sub(r"[^0-9a-z]+", "_", name.lower()).strip("_")
 *
 * Lowercases the input, collapses every run of non-alphanumeric characters into
 * a single underscore, and strips leading/trailing underscores.
 */
export function sanitizeTestName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^0-9a-z]+/g, '_')
    .replace(/^_+|_+$/g, '')
}
