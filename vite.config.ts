// Copyright © 2026 Jalapeno Labs

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'
import { fileURLToPath } from 'node:url'
import { isAbsolute } from 'node:path'

// Externalize every bare (non-relative) import. React stays external because it
// is a peer dependency; runtime dependencies (lodash-es, pretty-bytes) stay
// external so the consumer's bundler can dedupe and tree-shake them rather than
// us shipping a second copy. Only our own source is bundled into dist/.
function isExternalDependency(id: string): boolean {
  // Bare specifiers (npm packages) are external; relative paths and our own
  // absolute source paths (including Windows drive paths) are bundled.
  return !id.startsWith('.') && !isAbsolute(id)
}

export default defineConfig({
  plugins: [
    react(),
    // Emits a single bundled `dist/index.d.ts` from the build-only tsconfig so
    // tests and stories never leak into the published type surface.
    dts({
      tsconfigPath: './tsconfig.build.json',
      rollupTypes: true,
      include: [ 'src' ],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.stories.ts',
        'src/**/*.stories.tsx',
        'src/test',
      ],
    }),
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'JalapenoLabsUiKit',
      formats: [ 'es', 'cjs' ],
      fileName: (format) => format === 'es'
        ? 'index.js'
        : 'index.cjs',
    },
    rollupOptions: {
      external: isExternalDependency,
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
  },
})
