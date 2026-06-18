// Copyright © 2026 Jalapeno Labs

// Matches an absolute Linux file path. Must start with `/`.
// Trailing slashes, dot segments, and double slashes are all permitted.
// Disallowed characters anywhere in the path: null byte and <>:"\|?*
export const validAbsoluteLinuxFilePathRegex = /^(?:\/[^\0<>:"\\|?*]*|)$/u

// Matches a dotenv entry line by locating at least one `=` that is NOT enclosed
// in single or double quotes, distinguishing `KEY=value` from `KEY: "=value"`.
export const dotEnvEntryRegex = /=(?=(?:[^"']|"[^"]*"|'[^']*')*$)/
