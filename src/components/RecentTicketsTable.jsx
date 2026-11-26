import { useState } from 'react'
import { initials } from '../lib/format'
import Priority from './Priority'
import SortHeader from './SortHeader'
import SourceTag from './SourceTag'
import Status from './Status'

const PRIORITY_ORDER = ['High', 'Medium', 'Low']
const STATUS_ORDER = ['New', 'In Progress', 'Waiting on Customer', 'Resolved']

function sortValue(ticket, key) {
  switch (key) {
    case 'createdAt':
      return new Date(ticket.createdAt).getTime()
    case 'priority':
      return PRIORITY_ORDER.indexOf(ticket.priority)
    case 'status':
      return STATUS_ORDER.indexOf(ticket.status)
    case 'source':
      return ticket.source.toLowerCase()
    default:
      return ticket[key] ?? ''
  }
}

export default function RecentTicketsTable({ tickets, onOpen }) {
  const [sort, setSort] = useState({ key: 'createdAt', direction: 'desc' })

  const sorted = [...tickets].sort((a, b) => {
    const left = sortValue(a, sort.key)
    const right = sortValue(b, sort.key)
    const result =
      typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right))
    return sort.direction === 'asc' ? result : -result
  })

  // The dashboard shows a fixed snapshot; View all leads to the full list.
  const visible = sorted.slice(0, 4)

  return (
    <div className="data-table">
      <div className="table-wrap">
        <table className="table recent-table">
          <thead>
            <tr>
              <SortHeader
                label="Ticket"
                sortKey="createdAt"
                sort={sort}
                onSortChange={setSort}
              />
              <SortHeader
                label="Priority"
                sortKey="priority"
                sort={sort}
                onSortChange={setSort}
              />
              <SortHeader
                label="Status"
                sortKey="status"
                sort={sort}
                onSortChange={setSort}
              />
              <SortHeader
                label="Source"
                sortKey="source"
                sort={sort}
                onSortChange={setSort}
                className="recent-col-source"
              />
            </tr>
          </thead>
          <tbody>
            {visible.map((ticket) => (
              <tr
                key={ticket.id}
                tabIndex={0}
                onClick={() => onOpen(ticket.id)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return
                  event.preventDefault()
                  onOpen(ticket.id)
                }}
              >
                <td>
                  <span className="recent-table__person">
                    <span className="avatar avatar--sm" aria-hidden="true">
                      {initials(ticket.customerName)}
                    </span>
                    <span className="recent-table__person-text">
                      <span className="recent-table__subject">{ticket.subject}</span>
                      <span className="recent-table__customer">
                        {ticket.reference} · {ticket.customerName}
                      </span>
                    </span>
                  </span>
                </td>
                <td>
                  <Priority value={ticket.priority} />
                </td>
                <td>
                  <Status value={ticket.status} short />
                </td>
                <td className="recent-col-source">
                  <SourceTag value={ticket.source} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
