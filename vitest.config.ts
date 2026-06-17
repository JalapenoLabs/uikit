// Copyright © 2026 Jalapeno Labs

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [ react() ],
  test: {
    environment: 'happy-dom',
    globals: false,
    setupFiles: [ './src/test/setup.ts' ],
    include: [ 'src/**/*.test.{ts,tsx}' ],
    coverage: {
      provider: 'v8',
      include: [ 'src/**/*.{ts,tsx}' ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/test/**',
        'src/index.ts',
      ],
    },
  },
})
