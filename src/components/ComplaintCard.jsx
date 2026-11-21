import { formatFullDate, formatRelativeTime } from '../lib/format'
import Pill from './Pill'

export default function ComplaintCard({ complaint, assigneeName }) {
  return (
    <a className="complaint-card" href={`#/complaint/${complaint.id}`}>
      <div className="complaint-card__top">
        <span className="reference">{complaint.reference}</span>
        <time
          className="complaint-card__time"
          dateTime={complaint.updatedAt}
          title={formatFullDate(complaint.updatedAt)}
        >
          {formatRelativeTime(complaint.updatedAt)}
        </time>
      </div>
      <p className="complaint-card__subject">{complaint.subject}</p>
      <p className="complaint-card__customer">{complaint.customerName}</p>
      <div className="complaint-card__bottom">
        <Pill value={complaint.priority} />
        <Pill value={complaint.status} withDot />
        <span className="complaint-card__assignee">
          {assigneeName ?? 'Unassigned'}
        </span>
      </div>
    </a>
  )
}
