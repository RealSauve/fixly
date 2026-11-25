import { IconFlag } from '@tabler/icons-react'
import { toSlug } from '../lib/slug'

// Low priority is deliberately not shown anywhere.
export default function Priority({ value }) {
  if (value === 'Low') return null

  return (
    <span className={`priority priority--${toSlug(value)}`}>
      <IconFlag size={14} stroke={2} aria-hidden="true" />
      <span>{value}</span>
    </span>
  )
}
