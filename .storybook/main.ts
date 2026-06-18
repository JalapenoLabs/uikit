// Copyright © 2026 Jalapeno Labs

import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  docs: {
    autodocs: 'tag',
  },
  // The shared vite.config.ts includes vite-plugin-dts for the library build.
  // Storybook merges that config, so strip the dts plugin here: Storybook does
  // not need type declarations, and api-extractor would fail on a clean
  // checkout where dist/index.d.ts does not exist yet.
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = (viteConfig.plugins ?? []).filter((plugin) => {
      return !(plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'vite:dts')
    })
    return viteConfig
  },
}

export default config
