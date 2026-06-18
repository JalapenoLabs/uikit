// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'

import { TrimLongText } from './TrimLongText'

const meta: Meta<typeof TrimLongText> = {
  title: 'Components/TrimLongText',
  component: TrimLongText,
  tags: [ 'autodocs' ],
  args: {
    maxLength: 20,
  },
  argTypes: {
    fromEnd: {
      control: 'boolean',
    },
  },
}

export default meta

type Story = StoryObj<typeof TrimLongText>

// Short text fits within maxLength, so it renders in full with no title tooltip.
export const ShortText: Story = {
  args: {
    text: 'Hello world',
    maxLength: 20,
  },
}

// Long text is clipped with an ellipsis and exposes the full text on hover (native title).
export const LongText: Story = {
  args: {
    text: 'This is a very long string that will be clipped down to the maximum length',
    maxLength: 20,
  },
}

// Clipping from the end keeps the tail of the string, useful for file paths.
export const LongTextFromEnd: Story = {
  args: {
    text: '/very/long/file/path/that/needs/trimming/report.txt',
    maxLength: 20,
    fromEnd: true,
  },
}
