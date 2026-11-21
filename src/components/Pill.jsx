import { toSlug } from '../lib/slug'

export default function Pill({ value, withDot = false }) {
  return (
    <span className={`pill tone--${toSlug(value)}`}>
      {withDot ? <span className="pill__dot" aria-hidden="true" /> : null}
      {value}
    </span>
  )
}
