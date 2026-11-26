import { useState } from 'react'
import {
  IconUserCheck,
  IconUserOff,
  IconUsers,
} from '@tabler/icons-react'
import SortHeader from '../components/SortHeader'
import TableFooter, { useTablePagination } from '../components/TableFooter'
import {
  buildMetrics,
  buildTeamStats,
  formatDuration,
  percent,
} from '../lib/analytics'
import { initials } from '../lib/format'

function StatTile({ icon: Icon, tone, label, value, foot }) {
  return (
    <article className={`stat-tile stat-tile--${tone}`}>
      <span className="icon-slot stat-tile__icon">
        <Icon size={18} aria-hidden="true" />
      </span>
      <div>
        <span className="stat-tile__label">{label}</span>
        <span className="stat-tile__value">{value}</span>
        <span className="stat-tile__foot">{foot}</span>
      </div>
    </article>
  )
}

function sortValue(row, key) {
  if (key === 'name') return row.name
  if (key === 'rate') return row.total ? row.resolved / row.total : 0
  if (key === 'avgResolutionMs') return row.avgResolutionMs ?? -1
  return row[key]
}

export default function TeamView({ complaints, staff }) {
  const [sort, setSort] = useState({ key: 'total', direction: 'desc' })
  const metrics = buildMetrics(complaints)
  const { rows, unassignedCount, unassignedOpen } = buildTeamStats(
    complaints,
    staff,
  )

  const sortedRows = [...rows].sort((a, b) => {
    const left = sortValue(a, sort.key)
    const right = sortValue(b, sort.key)
    const result =
      typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right))
    return sort.direction === 'asc' ? result : -result
  })
  const resetKey = `${sort.key}:${sort.direction}:${sortedRows
    .map((row) => row.id)
    .join('|')}`
  const pagination = useTablePagination(sortedRows, 4, resetKey)

  return (
    <section className="team-view">
      <div className="team-view__stats">
        <StatTile
          icon={IconUsers}
          tone="blue"
          label="Team members"
          value={staff.length}
          foot="Support, billing and technical"
        />
        <StatTile
          icon={IconUserCheck}
          tone="blue"
          label="Open tickets"
          value={metrics.active}
          foot={`${metrics.highOpen} high priority active`}
        />
        <StatTile
          icon={IconUserOff}
          tone="neutral"
          label="Unassigned"
          value={unassignedCount}
          foot={`${unassignedOpen} still open`}
        />
      </div>

      <article className="panel">
        <div className="panel__head">
          <div>
            <h2 className="panel__title">Workload by person</h2>
            <p className="panel__sub">
              Assignment, open work and resolution performance
            </p>
          </div>
        </div>

        <div className="data-table">
          <p className="table-scroll-hint">Swipe for more columns</p>
          <div
            className="table-wrap"
            tabIndex={0}
            role="region"
            aria-label="Team workload table, scrollable"
          >
            <table className="table team-table">
              <thead>
                <tr>
                  <SortHeader
                    label="Person"
                    sortKey="name"
                    sort={sort}
                    onSortChange={setSort}
                  />
                  <SortHeader
                    label="Assigned"
                    sortKey="total"
                    sort={sort}
                    onSortChange={setSort}
                  />
                  <SortHeader
                    label="Open"
                    sortKey="open"
                    sort={sort}
                    onSortChange={setSort}
                  />
                  <SortHeader
                    label="High priority"
                    sortKey="high"
                    sort={sort}
                    onSortChange={setSort}
                  />
                  <SortHeader
                    label="Resolved"
                    sortKey="resolved"
                    sort={sort}
                    onSortChange={setSort}
                  />
                  <SortHeader
                    label="Resolution rate"
                    sortKey="rate"
                    sort={sort}
                    onSortChange={setSort}
                  />
                  <SortHeader
                    label="Avg. resolution"
                    sortKey="avgResolutionMs"
                    sort={sort}
                    onSortChange={setSort}
                  />
                </tr>
              </thead>
              <tbody>
                {pagination.pageRows.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <span className="person">
                        <span className="avatar avatar--sm" aria-hidden="true">
                          {initials(person.name)}
                        </span>
                        <span>
                          <strong>{person.name}</strong>
                          <small>{person.role}</small>
                        </span>
                      </span>
                    </td>
                    <td className="team-table__num">{person.total}</td>
                    <td className="team-table__num">{person.open}</td>
                    <td className="team-table__num">{person.high}</td>
                    <td className="team-table__num">{person.resolved}</td>
                    <td>{percent(person.resolved, person.total)}%</td>
                    <td className="team-table__muted">
                      {formatDuration(person.avgResolutionMs)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TableFooter {...pagination} />
        </div>
      </article>
    </section>
  )
}
