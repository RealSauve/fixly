import { normaliseSource, sourceMeta } from '../lib/sources'

export default function SourceTag({ value }) {
  const label = normaliseSource(value)
  const meta = sourceMeta(label)
  const Icon = meta.icon

  return (
    <span className={`source-tag source-tag--${meta.slug}`}>
      <Icon size={13} stroke={1.9} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
