// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'

import { DisabledTimerButton } from './DisabledTimerButton'

const meta: Meta<typeof DisabledTimerButton> = {
  title: 'Components/DisabledTimerButton',
  component: DisabledTimerButton,
  args: {
    delaySeconds: 5,
    children: 'Delete forever',
    variant: 'primary',
  },
  argTypes: {
    delaySeconds: {
      control: { type: 'number', min: 0, max: 30, step: 1 },
    },
  },
}

export default meta

type Story = StoryObj<typeof DisabledTimerButton>

export const Default: Story = {}

export const ShortGate: Story = {
  args: {
    delaySeconds: 3,
    children: 'I have read this',
  },
}

export const CustomTooltip: Story = {
  args: {
    delaySeconds: 5,
    tooltip: 'Take a moment to read the warning above.',
    children: 'Proceed',
  },
}
