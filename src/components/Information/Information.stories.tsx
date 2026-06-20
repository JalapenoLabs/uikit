// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'

import { Information } from './Information'

const meta: Meta<typeof Information> = {
  title: 'Components/Information',
  component: Information,
  tags: [ 'autodocs' ],
  args: {
    title: 'What is this?',
    content: 'This is a small, dependency-free popover that explains a nearby field or control.',
  },
  argTypes: {
    placement: {
      control: 'select',
      options: [ 'top', 'bottom', 'left', 'right' ],
    },
    size: {
      control: { type: 'number' },
    },
  },
}

export default meta

type Story = StoryObj<typeof Information>

export const Default: Story = {}

export const ContentOnly: Story = {
  args: {
    title: undefined,
    content: 'A concise explanation with no heading.',
  },
}

export const PlacedTop: Story = {
  args: {
    placement: 'top',
  },
}

export const PlacedBottom: Story = {
  args: {
    placement: 'bottom',
  },
}

export const PlacedLeft: Story = {
  args: {
    placement: 'left',
  },
}

export const PlacedRight: Story = {
  args: {
    placement: 'right',
  },
}
