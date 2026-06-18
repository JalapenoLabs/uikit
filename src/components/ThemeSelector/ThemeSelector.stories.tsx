// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'
import type { ThemePreference } from './ThemeSelector'

// Core
import { useState } from 'react'

// User interface
import { ThemeSelector } from './ThemeSelector'

const meta: Meta<typeof ThemeSelector> = {
  title: 'Components/ThemeSelector',
  component: ThemeSelector,
  tags: [ 'autodocs' ],
}

export default meta

type Story = StoryObj<typeof ThemeSelector>

/**
 * Controlled example: local state is wired to the component so clicking a card
 * (or using the keyboard) switches the highlighted selection live.
 */
export const Controlled: Story = {
  render: () => {
    function ControlledThemeSelector() {
      const [ preference, setPreference ] = useState<ThemePreference>('system')

      return <div style={{ maxWidth: 480 }}>
        <ThemeSelector value={preference} onChange={setPreference} />
        <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
          Selected: <strong>{preference}</strong>
        </p>
      </div>
    }

    return <ControlledThemeSelector />
  },
}

/**
 * Disabled state: the group is muted and non-interactive.
 */
export const Disabled: Story = {
  render: () => {
    return <div style={{ maxWidth: 480 }}>
      <ThemeSelector value='light' onChange={() => {}} isDisabled />
    </div>
  },
}
