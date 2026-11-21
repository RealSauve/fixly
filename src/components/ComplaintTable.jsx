import { IconChevronDown } from '@tabler/icons-react'
import { STATUSES } from '../lib/constants'
import { formatFullDate, formatRelativeTime } from '../lib/format'
import { toSlug } from '../lib/slug'
import Pill from './Pill'

export default function ComplaintTable({
  complaints,
  staff,
  onOpen,
  onStatusChange,
  onAssigneeChange,
}) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Reference</th>
            <th scope="col">Subject</th>
            <th scope="col" className="col-category">
              Category
            </th>
            <th scope="col">Priority</th>
            <th scope="col">Status</th>
            <th scope="col">Assigned to</th>
            <th scope="col">Updated</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr
              key={complaint.id}
              className="table__row"
              tabIndex={0}
              onClick={(event) => {
                if (event.target.closest('select, a, button, input')) return
                onOpen(complaint.id)
              }}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return
                if (event.key === 'Enter') {
                  event.preventDefault()
                  onOpen(complaint.id)
                }
              }}
            >
              <td>
                <span className="reference">{complaint.reference}</span>
              </td>
              <td>
                <span className="table__subject">{complaint.subject}</span>
                <span className="table__customer">
                  {complaint.customerName}
                </span>
              </td>
              <td className="col-category">{complaint.category}</td>
              <td>
                <Pill value={complaint.priority} />
              </td>
              <td>
                <span
                  className={`status-select-wrap tone--${toSlug(complaint.status)}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <select
                    value={complaint.status}
                    aria-label={`Status for ${complaint.reference}`}
                    onKeyDown={(event) => event.stopPropagation()}
                    onChange={(event) =>
                      onStatusChange(complaint, event.target.value)
                    }
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown size={12} stroke={2} aria-hidden="true" />
                </span>
              </td>
              <td>
                <select
                  className="assignee-select"
                  value={complaint.assigneeId ?? ''}
                  aria-label={`Assignee for ${complaint.reference}`}
                  onKeyDown={(event) => event.stopPropagation()}
                  onChange={(event) =>
                    onAssigneeChange(complaint, event.target.value || null)
                  }
                >
                  <option value="">Unassigned</option>
                  {staff.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <time
                  className="table__updated"
                  dateTime={complaint.updatedAt}
                  title={formatFullDate(complaint.updatedAt)}
                >
                  {formatRelativeTime(complaint.updatedAt)}
                </time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
