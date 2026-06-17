// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'

import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: [ 'autodocs' ],
  args: {
    children: 'Button',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [ 'primary', 'secondary', 'ghost' ],
    },
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
}
