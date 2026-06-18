// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'

import { Timer } from './Timer'

const FIVE_MINUTES_MS = 5 * 60 * 1_000

const meta: Meta<typeof Timer> = {
  title: 'Components/Timer',
  component: Timer,
  tags: [ 'autodocs' ],
  args: {
    // Start a few minutes in the past so the timer renders a meaningful duration immediately.
    startTimeMs: Date.now() - FIVE_MINUTES_MS,
  },
}

export default meta

type Story = StoryObj<typeof Timer>

export const Default: Story = {}

export const Stopped: Story = {
  args: {
    startTimeMs: Date.now() - FIVE_MINUTES_MS,
    stopTimeMs: Date.now(),
  },
}

export const CustomFormat: Story = {
  args: {
    startTimeMs: Date.now() - FIVE_MINUTES_MS,
    text: (humanized) => `Elapsed: ${humanized}`,
  },
}
