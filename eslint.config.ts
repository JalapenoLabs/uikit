// Copyright © 2026 Jalapeno Labs

import { defineConfig, globalIgnores } from 'eslint/config'
import cliBaseConfig from '@jalapenolabs/cli/eslint'

export default defineConfig([
  {
    extends: [ cliBaseConfig ],
  },
  globalIgnores([
    '.yarn/**',
    'dist/**',
    'storybook-static/**',
    'coverage/**',
    // The brand submodule is its own repository with its own tooling and
    // license conventions. Linting it from here would be wrong.
    'brand/**',
    '**/*.d.ts',
  ]),
  {
    // The license-header plugin is registered by the base config for TypeScript
    // only, so scope the rule to match (applying it to plain .mjs/.js would
    // reference a plugin that is not in scope for those files).
    files: [ '**/*.{ts,tsx}' ],
    rules: {
      'license-header/header': [
        'error',
        [
          `// Copyright © ${new Date().getFullYear()} Jalapeno Labs`,
        ],
      ],
    },
  },
  // Storybook CSF (`export default meta`) and tooling configs (`export default
  // defineConfig(...)`) legitimately rely on default exports. The repo bans
  // default exports everywhere else, so the exception is scoped tightly.
  {
    files: [
      '**/*.stories.ts',
      '**/*.stories.tsx',
      '.storybook/**/*.ts',
      '*.config.ts',
      'eslint.config.ts',
    ],
    rules: {
      'import/no-default-export': 'off',
      'no-restricted-exports': 'off',
    },
  },
])
