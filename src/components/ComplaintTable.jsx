import { IconChevronDown } from '@tabler/icons-react'
import { STATUSES } from '../lib/constants'
import { formatFullDate, formatRelativeTime } from '../lib/format'
import { toSlug } from '../lib/slug'
import Priority from './Priority'
import { StatusIcon } from './Status'
import SourceTag from './SourceTag'

export default function ComplaintTable({
  complaints,
  staff,
  onOpen,
  onStatusChange,
  onAssigneeChange,
}) {
  return (
    <div className="table-wrap">
      <table className="table table--complaints">
        <thead>
          <tr>
            <th scope="col">Reference</th>
            <th scope="col">Subject</th>
            <th scope="col" className="col-category">
              Category
            </th>
            <th scope="col" className="col-source">
              Source
            </th>
            <th scope="col" className="col-priority">
              Priority
            </th>
            <th scope="col" className="col-status">
              Status
            </th>
            <th scope="col" className="col-assignee">
              Assigned to
            </th>
            <th scope="col" className="col-updated">
              Updated
            </th>
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
              <td className="col-reference">
                <span className="reference">{complaint.reference}</span>
              </td>
              <td className="col-subject">
                <span className="table__subject">{complaint.subject}</span>
                <span className="table__customer">
                  {complaint.customerName}
                </span>
              </td>
              <td className="col-category">{complaint.category}</td>
              <td className="col-source">
                <SourceTag value={complaint.source} />
              </td>
              <td className="col-priority">
                <Priority value={complaint.priority} />
              </td>
              <td className="col-status">
                {/* Friendly label with an invisible native select on top, so
                    the row keeps the exact wording and a real select for
                    keyboard and screen reader users. */}
                <span
                  className={`status-cell tone--${toSlug(complaint.status)}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <span className="status-cell__value">
                    <StatusIcon value={complaint.status} />
                    <span>{complaint.status}</span>
                  </span>
                  <select
                    className="status-cell__select"
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
                  <IconChevronDown
                    className="select-chevron"
                    size={12}
                    stroke={2}
                    aria-hidden="true"
                  />
                </span>
              </td>
              <td className="col-assignee">
                <span
                  className="assignee-cell"
                  onClick={(event) => event.stopPropagation()}
                >
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
                </span>
                <span className="assignee-cell__static">
                  {staff.find((person) => person.id === complaint.assigneeId)
                    ?.name ?? 'Unassigned'}
                </span>
              </td>
              <td className="col-updated">
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
