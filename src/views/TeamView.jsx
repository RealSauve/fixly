import {
  IconUserCheck,
  IconUserOff,
  IconUsers,
} from '@tabler/icons-react'
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
      <span className="stat-tile__icon">
        <Icon size={18} stroke={1.9} aria-hidden="true" />
      </span>
      <div>
        <span className="stat-tile__label">{label}</span>
        <span className="stat-tile__value">{value}</span>
        <span className="stat-tile__foot">{foot}</span>
      </div>
    </article>
  )
}

export default function TeamView({ complaints, staff }) {
  const metrics = buildMetrics(complaints)
  const { rows, unassignedCount, unassignedOpen } = buildTeamStats(
    complaints,
    staff,
  )

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
          tone="cyan"
          label="Open complaints"
          value={metrics.active}
          foot={`${metrics.highOpen} high priority active`}
        />
        <StatTile
          icon={IconUserOff}
          tone="amber"
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

        <div className="table-wrap">
          <table className="table team-table">
            <thead>
              <tr>
                <th scope="col">Person</th>
                <th scope="col">Assigned</th>
                <th scope="col">Open</th>
                <th scope="col">High priority</th>
                <th scope="col">Resolved</th>
                <th scope="col">Resolution rate</th>
                <th scope="col">Avg. resolution</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((person) => (
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
      </article>
    </section>
  )
}
