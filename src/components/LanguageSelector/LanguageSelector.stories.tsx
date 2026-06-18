// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'

// Core
import { useState } from 'react'

// UI
import { LanguageSelector } from './LanguageSelector'

const sampleLanguages = [
  { code: 'en-US', label: 'English' },
  { code: 'es-ES', label: 'Español' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'ja-JP', label: '日本語' },
]

const meta: Meta<typeof LanguageSelector> = {
  title: 'Components/LanguageSelector',
  component: LanguageSelector,
  tags: [ 'autodocs' ],
  args: {
    languages: sampleLanguages,
    value: 'en-US',
  },
}

export default meta

type Story = StoryObj<typeof LanguageSelector>

// A controlled story so the dropdown actually toggles and updates the selection
// as a real consumer would wire it up.
export const Controlled: Story = {
  render: (args) => {
    const [ selectedCode, setSelectedCode ] = useState(args.value)

    return <LanguageSelector
      {...args}
      value={selectedCode}
      onChange={setSelectedCode}
    />
  },
}

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
}
