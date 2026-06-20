// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'

import { ChangerButton } from './ChangerButton'

const meta: Meta<typeof ChangerButton> = {
  title: 'Components/ChangerButton',
  component: ChangerButton,
  tags: [ 'autodocs' ],
  args: {
    label: 'Theme',
    value: 'Midnight',
  },
}

export default meta

type Story = StoryObj<typeof ChangerButton>

export const Expanded: Story = {
  args: {
    label: 'Theme',
    value: 'Midnight',
  },
}

export const Collapsed: Story = {
  args: {
    collapsed: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Theme',
    value: 'Midnight',
    isDisabled: true,
  },
}

export const WithTooltip: Story = {
  args: {
    label: 'Language',
    value: 'English',
    tooltip: 'Change the interface language',
  },
}
