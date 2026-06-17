// Copyright © 2026 Jalapeno Labs

import type { Preview } from '@storybook/react'

import { brandColors } from '../src/theme/tokens'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'brand', value: brandColors.primary },
      ],
    },
  },
}

export default preview
