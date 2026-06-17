// Copyright © 2026 Jalapeno Labs

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'
import { fileURLToPath } from 'node:url'

// The library is published as a thin React layer. React (and its JSX runtime)
// are peer dependencies, so they must stay external to avoid bundling a second
// copy of React into every consumer's app.
const externalDependencies = [
  'react',
  'react-dom',
  'react/jsx-runtime',
]

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
      external: externalDependencies,
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
