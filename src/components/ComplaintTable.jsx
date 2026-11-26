import { isAgeing } from '../lib/analytics'
import { STATUSES } from '../lib/constants'
import { formatFullDate, formatRelativeTime, initials } from '../lib/format'
import { toSlug } from '../lib/slug'
import Priority from './Priority'
import SortHeader from './SortHeader'
import SourceTag from './SourceTag'
import TableFooter, { useTablePagination } from './TableFooter'

const COLUMNS = [
  { key: 'reference', label: 'Reference', className: 'col-reference' },
  { key: 'subject', label: 'Subject', className: 'col-subject' },
  { key: 'category', label: 'Category', className: 'col-category' },
  { key: 'source', label: 'Source', className: 'col-source' },
  { key: 'priority', label: 'Priority', className: 'col-priority' },
  { key: 'status', label: 'Status', className: 'col-status' },
  { key: 'assignee', label: 'Assigned to', className: 'col-assignee' },
  { key: 'updatedAt', label: 'Updated', className: 'col-updated' },
]

export default function ComplaintTable({
  complaints,
  staff,
  resultLabel,
  onOpen,
  onStatusChange,
  onAssigneeChange,
  sort,
  onSortChange,
}) {
  const resetKey = `${sort?.key ?? 'updatedAt'}:${sort?.direction ?? 'desc'}:${complaints
    .map((complaint) => complaint.id)
    .join('|')}`
  const pagination = useTablePagination(complaints, 4, resetKey)

  return (
    <div className="data-table">
      <div className="table-wrap">
        <table className="table table--complaints">
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <SortHeader
                  key={column.key}
                  label={column.label}
                  sortKey={column.key}
                  sort={sort}
                  onSortChange={onSortChange}
                  className={column.className}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {pagination.pageRows.map((complaint) => {
              const assignee = staff.find(
                (person) => person.id === complaint.assigneeId,
              )

              return (
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
                    {isAgeing(complaint) ? (
                      <span className="age-flag">Ageing</span>
                    ) : null}
                  </td>
                  <td className="col-category">{complaint.category}</td>
                  <td className="col-source">
                    <SourceTag value={complaint.source} />
                  </td>
                  <td className="col-priority">
                    <Priority value={complaint.priority} />
                  </td>
                  <td className="col-status">
                    <span
                      className={`status-cell tone--${toSlug(complaint.status)}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span className="status-cell__value">
                        <span className="badge__dot" aria-hidden="true" />
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
                    </span>
                  </td>
                  <td className="col-assignee">
                    <span
                      className="assignee-cell"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span
                        className={`avatar avatar--sm${
                          assignee ? '' : ' avatar--unassigned'
                        }`}
                        aria-hidden="true"
                      >
                        {assignee ? initials(assignee.name) : '?'}
                      </span>
                      <span className="assignee-cell__static">
                        {assignee?.name ?? 'Unassigned'}
                      </span>
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
              )
            })}
          </tbody>
        </table>
      </div>
      <TableFooter resultLabel={resultLabel} {...pagination} />
    </div>
  )
}
