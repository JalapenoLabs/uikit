// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'

// Core
import { useState } from 'react'

// UI
import { Accordion } from './Accordion'

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: [ 'autodocs' ],
  args: {
    title: 'What is Jalapeno Labs?',
    children: 'Jalapeno Labs builds clean, dependency-free building blocks for React applications.',
  },
}

export default meta

type Story = StoryObj<typeof Accordion>

// Uncontrolled and closed on first render.
export const Default: Story = {}

// Uncontrolled but seeded open via `defaultOpen`.
export const DefaultOpen: Story = {
  args: {
    defaultOpen: true,
  },
}

// Fully controlled: the parent owns the open state and reacts to change requests.
export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [ open, setOpen ] = useState<boolean>(false)

    return <Accordion
      {...args}
      open={open}
      onOpenChange={setOpen}
    />
  },
}
