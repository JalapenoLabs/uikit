// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'

import { StatusChip } from './StatusChip'

const meta: Meta<typeof StatusChip> = {
  title: 'Components/StatusChip',
  component: StatusChip,
  tags: [ 'autodocs' ],
  args: {
    label: 'Status',
    tone: 'neutral',
    variant: 'bordered',
    size: 'md',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: [ 'success', 'warning', 'danger', 'info', 'neutral', 'primary' ],
    },
    variant: {
      control: 'select',
      options: [ 'solid', 'bordered', 'dot' ],
    },
    size: {
      control: 'select',
      options: [ 'sm', 'md', 'lg' ],
    },
  },
}

export default meta

type Story = StoryObj<typeof StatusChip>

export const Success: Story = {
  args: {
    label: 'Passed',
    tone: 'success',
  },
}

export const Warning: Story = {
  args: {
    label: 'Halted',
    tone: 'warning',
  },
}

export const Danger: Story = {
  args: {
    label: 'Failed',
    tone: 'danger',
  },
}

export const Info: Story = {
  args: {
    label: 'Running',
    tone: 'info',
  },
}

export const Neutral: Story = {
  args: {
    label: 'Not run',
    tone: 'neutral',
  },
}

export const Primary: Story = {
  args: {
    label: 'Generated',
    tone: 'primary',
  },
}

export const SolidVariant: Story = {
  args: {
    label: 'Passed',
    tone: 'success',
    variant: 'solid',
  },
}

export const BorderedVariant: Story = {
  args: {
    label: 'Passed',
    tone: 'success',
    variant: 'bordered',
  },
}

export const DotVariant: Story = {
  args: {
    label: 'Passed',
    tone: 'success',
    variant: 'dot',
  },
}

export const WithTooltip: Story = {
  args: {
    label: 'Failed',
    tone: 'danger',
    tooltip: 'The last run failed with 3 errors',
  },
}

export const WithEndContent: Story = {
  args: {
    label: 'Open issues',
    tone: 'info',
    endContent: <span style={{ fontWeight: 700 }}>12</span>,
  },
}

export const AllTones: Story = {
  render: () => <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
    <StatusChip label='Passed' tone='success' />
    <StatusChip label='Halted' tone='warning' />
    <StatusChip label='Failed' tone='danger' />
    <StatusChip label='Running' tone='info' />
    <StatusChip label='Not run' tone='neutral' />
    <StatusChip label='Generated' tone='primary' />
  </div>,
}

export const AllVariants: Story = {
  render: () => <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
    <StatusChip label='Solid' tone='success' variant='solid' />
    <StatusChip label='Bordered' tone='success' variant='bordered' />
    <StatusChip label='Dot' tone='success' variant='dot' />
  </div>,
}
