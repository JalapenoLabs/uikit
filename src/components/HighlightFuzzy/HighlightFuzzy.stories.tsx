// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'

import { HighlightFuzzy } from './HighlightFuzzy'

const meta: Meta<typeof HighlightFuzzy> = {
  title: 'Components/HighlightFuzzy',
  component: HighlightFuzzy,
  args: {
    text: 'The quick brown fox jumps over the lazy dog.',
    query: 'o',
  },
}

export default meta

type Story = StoryObj<typeof HighlightFuzzy>

export const Default: Story = {}

export const CaseSensitive: Story = {
  args: {
    text: 'Mix of UPPER and lower case Letters.',
    query: 'L',
    caseSensitive: true,
    minMatchCharLength: 1,
  },
}

export const NoMatch: Story = {
  args: {
    query: 'zzz',
  },
}
