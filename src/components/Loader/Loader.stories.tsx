// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'

import { Loader } from './Loader'

const meta: Meta<typeof Loader> = {
  title: 'Components/Loader',
  component: Loader,
  tags: [ 'autodocs' ],
  argTypes: {
    size: {
      control: 'number',
    },
    centered: {
      control: 'boolean',
    },
    fullVertical: {
      control: 'boolean',
    },
  },
}

export default meta

type Story = StoryObj<typeof Loader>

export const Default: Story = {
  args: {
    size: 40,
  },
}

export const Centered: Story = {
  args: {
    size: 48,
    centered: true,
    className: 'min-h-[50vh]',
  },
}
