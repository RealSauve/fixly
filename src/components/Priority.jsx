import { IconFlag } from '@tabler/icons-react'
import { toSlug } from '../lib/slug'

// Every complaint shows its priority. Low uses a quiet grey pill so it does
// not compete with High and Medium, but it stays visible and searchable.
export default function Priority({ value }) {
  return (
    <span className={`priority priority--${toSlug(value)}`}>
      <IconFlag size={14} stroke={2} aria-hidden="true" />
      <span>{value}</span>
    </span>
  )
}
