// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'

import { FlattenErrors } from './FlattenErrors'

const meta: Meta<typeof FlattenErrors> = {
  title: 'Components/FlattenErrors',
  component: FlattenErrors,
}

export default meta

type Story = StoryObj<typeof FlattenErrors>

export const SingleMessage: Story = {
  args: {
    errors: 'This field is required.',
  },
}

export const ManyMessages: Story = {
  args: {
    errors: [
      'Name is required.',
      'Email must be valid.',
      'Password is too short.',
    ],
  },
}

export const Empty: Story = {
  args: {
    errors: undefined,
  },
}
