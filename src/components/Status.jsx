import {
  IconCircleCheck,
  IconCircleFilled,
  IconCircleHalf,
  IconClock,
} from '@tabler/icons-react'
import { toSlug } from '../lib/slug'

const STATUS_ICONS = {
  New: IconCircleFilled,
  'In Progress': IconCircleHalf,
  'Waiting on Customer': IconClock,
  Resolved: IconCircleCheck,
}

// Icon for a status, used on its own where the row shows a select instead
// of the static label.
export function StatusIcon({ value, size = 14 }) {
  const Icon = STATUS_ICONS[value] ?? IconCircleFilled
  return <Icon size={size} stroke={2} aria-hidden="true" />
}

export default function Status({ value }) {
  return (
    <span className={`status tone--${toSlug(value)}`}>
      <StatusIcon value={value} />
      <span>{value}</span>
    </span>
  )
}
