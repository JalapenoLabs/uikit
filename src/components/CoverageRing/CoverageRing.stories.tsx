// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'

import { CoverageRing } from './CoverageRing'

const meta: Meta<typeof CoverageRing> = {
  title: 'Components/CoverageRing',
  component: CoverageRing,
  args: {
    value: 72,
    showCenter: true,
    label: 'coverage',
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
}

export default meta

type Story = StoryObj<typeof CoverageRing>

export const Default: Story = {}

export const Low: Story = {
  args: {
    value: 18,
  },
}

export const Full: Story = {
  args: {
    value: 100,
  },
}

export const SolidTrack: Story = {
  args: {
    solidTrack: true,
    value: 64,
  },
}
