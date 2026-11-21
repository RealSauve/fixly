import { IconArrowLeft } from '@tabler/icons-react'

export default function DetailPlaceholderView({ complaint }) {
  return (
    <section className="placeholder">
      <a className="back-link" href="#/">
        <IconArrowLeft size={16} stroke={1.5} aria-hidden="true" />
        Back to complaints
      </a>
      <p className="reference">{complaint.reference}</p>
      <h1 className="placeholder__title">{complaint.subject}</h1>
      <p className="placeholder__note">
        The complaint detail screen is built in the next slice.
      </p>
    </section>
  )
}
