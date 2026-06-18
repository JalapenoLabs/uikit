// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'

import { LuminescentText } from './LuminescentText'

const meta: Meta<typeof LuminescentText> = {
  title: 'Components/LuminescentText',
  component: LuminescentText,
  tags: [ 'autodocs' ],
  args: {
    text: 'Luminescent',
  },
  // Render against a contrasting dark surface so the shimmer is clearly visible.
  decorators: [
    (Story) => <div
      style={{
        padding: '2rem',
        background: '#101418',
        fontSize: '2.5rem',
        fontWeight: 700,
      }}
    >
      <Story />
    </div>,
  ],
}

export default meta

type Story = StoryObj<typeof LuminescentText>

export const Default: Story = {
  args: {
    text: 'Brand Shimmer',
  },
}

export const CustomColor: Story = {
  args: {
    text: 'Salmon Shimmer',
    color: '#ed7470',
  },
}

export const Inverted: Story = {
  args: {
    text: 'Inverted Shimmer',
    inverted: true,
  },
}
