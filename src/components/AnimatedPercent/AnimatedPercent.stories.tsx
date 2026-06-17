// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'

import { AnimatedPercent } from './AnimatedPercent'

const meta: Meta<typeof AnimatedPercent> = {
  title: 'Components/AnimatedPercent',
  component: AnimatedPercent,
  args: {
    value: 72,
    animationDurationMs: 1200,
  },
}

export default meta

type Story = StoryObj<typeof AnimatedPercent>

export const Default: Story = {}

export const Missing: Story = {
  args: {
    value: null,
  },
}
