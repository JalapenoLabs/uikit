// Copyright © 2026 Jalapeno Labs

import type { ReactNode } from 'react'

type Props = {
  errors: string | string[] | undefined
}

/**
 * Renders one or many error messages. A single string renders inline; an array
 * renders one paragraph per message. Nothing renders when there are no errors.
 */
export function FlattenErrors(props: Props): ReactNode {
  const { errors } = props

  if (!errors) {
    return null
  }

  if (typeof errors === 'string') {
    return errors
  }

  return errors.map((error, index) => <p key={index}>{
    error
  }</p>)
}
