import {
  IconActivity,
  IconArrowRight,
  IconArrowUpRight,
  IconCircleDot,
  IconClockHour4,
  IconFlag,
  IconPlus,
  IconTicket,
} from '@tabler/icons-react'
import BarList from '../components/charts/BarList'
import DonutChart from '../components/charts/DonutChart'
import TrendChart from '../components/charts/TrendChart'
import Priority from '../components/Priority'
import SourceTag from '../components/SourceTag'
import Status from '../components/Status'
import {
  buildMetrics,
  categoryBreakdown,
  formatDuration,
  percent,
  priorityBreakdown,
  sourceBreakdown,
  statusBreakdown,
  trendSeries,
} from '../lib/analytics'

function MiniStat({ icon: Icon, tone, label, value, foot }) {
  return (
    <div className="mini-stat">
      <span className={`mini-stat__icon mini-stat__icon--${tone}`}>
        <Icon size={16} stroke={1.9} aria-hidden="true" />
      </span>
      <span className="mini-stat__label">{label}</span>
      <span className="mini-stat__value">{value}</span>
      <span className="mini-stat__foot">{foot}</span>
    </div>
  )
}

export default function DashboardView({ complaints, navigate, onNew }) {
  const metrics = buildMetrics(complaints)
  const statuses = statusBreakdown(metrics)
  const priorities = priorityBreakdown(metrics)
  const categories = categoryBreakdown(complaints)
  const sources = sourceBreakdown(complaints)
  const trend = trendSeries(complaints, 21)
  const recent = [...complaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 7)

  const loggedInWindow = trend.points.reduce(
    (sum, point) => sum + point.logged,
    0,
  )
  const resolvedInWindow = trend.points.reduce(
    (sum, point) => sum + point.resolved,
    0,
  )

  function openComplaint(id) {
    navigate(`#/complaint/${id}`)
  }

  return (
    <div className="dashboard">
      <div className="dash-row dash-row--top">
        <article className="dash-hero">
          <div className="dash-hero__top">
            <span className="dash-hero__label">Total complaints</span>
            <span className="dash-hero__badge">
              <IconTicket size={13} stroke={2} aria-hidden="true" />
              Live data
            </span>
          </div>

          <div>
            <p className="dash-hero__value">{metrics.total}</p>
            <p className="dash-hero__sub">
              {metrics.active} active · {metrics.resolved} resolved
            </p>
          </div>

          <div className="dash-hero__actions">
            <a className="dash-hero__btn dash-hero__btn--light" href="#/complaints">
              View complaints
              <IconArrowUpRight size={15} stroke={2} aria-hidden="true" />
            </a>
            <button
              className="dash-hero__btn dash-hero__btn--ghost"
              type="button"
              onClick={onNew}
            >
              <IconPlus size={15} stroke={2} aria-hidden="true" />
              New complaint
            </button>
          </div>
        </article>

        <article className="panel dash-queue">
          <div className="panel__head">
            <div>
              <h2 className="panel__title">Queue health</h2>
              <p className="panel__sub">A live snapshot of active work</p>
            </div>
            <span className="chip chip--live">
              <IconActivity size={12} stroke={2} aria-hidden="true" />
              Live
            </span>
          </div>

          <div className="mini-stats">
            <MiniStat
              icon={IconCircleDot}
              tone="blue"
              label="Open"
              value={metrics.open}
              foot={`${metrics.new} new · ${metrics.inProgress} in progress`}
            />
            <MiniStat
              icon={IconClockHour4}
              tone="cyan"
              label="Waiting"
              value={metrics.waiting}
              foot="Waiting on the customer"
            />
            <MiniStat
              icon={IconFlag}
              tone="red"
              label="High priority"
              value={metrics.high}
              foot={`${metrics.highOpen} still active`}
            />
          </div>
        </article>

        <article className="panel dash-score">
          <div className="panel__head">
            <div>
              <h2 className="panel__title">Resolution rate</h2>
              <p className="panel__sub">Share of complaints closed</p>
            </div>
          </div>

          <div className="score">
            <span className="score__value">
              {percent(metrics.resolved, metrics.total)}%
            </span>
            <span className="score__meta">
              {metrics.resolved} of {metrics.total} resolved
            </span>
          </div>

          <div className="score__bar">
            <span
              style={{ width: `${percent(metrics.resolved, metrics.total)}%` }}
              aria-hidden="true"
            />
          </div>

          <div className="score__row">
            <span>Average resolution time</span>
            <strong>{formatDuration(metrics.avgResolutionMs)}</strong>
          </div>

          <p className="score__note">
            {metrics.resolved === 0
              ? 'No complaints have been resolved yet.'
              : 'Measured from the moment a complaint is logged.'}
          </p>
          <p className="score__note score__note--muted">
            CSAT is not collected in this demo.
          </p>
        </article>
      </div>

      <div className="dash-row dash-row--mid">
        <article className="panel dash-trend">
          <div className="panel__head">
            <div>
              <h2 className="panel__title">Complaint activity</h2>
              <p className="panel__sub">
                Daily volume across 21 days. Hover, tap or use arrow keys for
                details.
              </p>
            </div>
            <div className="legend" aria-hidden="true">
              <span className="legend__item">
                <span className="legend__dot legend__dot--blue" />
                Logged
              </span>
              <span className="legend__item">
                <span className="legend__dot legend__dot--green" />
                Resolved
              </span>
            </div>
          </div>

          <div className="trend-summary">
            <div className="trend-summary__item">
              <span className="trend-summary__value">{loggedInWindow}</span>
              <span className="trend-summary__label">logged</span>
            </div>
            <div className="trend-summary__item">
              <span className="trend-summary__value">{resolvedInWindow}</span>
              <span className="trend-summary__label">resolved</span>
            </div>
            <div className="trend-summary__item">
              <span className="trend-summary__value">
                {formatDuration(metrics.avgResolutionMs)}
              </span>
              <span className="trend-summary__label">avg. resolution</span>
            </div>
          </div>

          <TrendChart points={trend.points} max={trend.max} />
        </article>

        <article className="panel dash-status">
          <div className="panel__head">
            <div>
              <h2 className="panel__title">Status breakdown</h2>
              <p className="panel__sub">Where complaints stand right now</p>
            </div>
          </div>

          <div className="dash-status__body">
            <div className="dash-status__chart">
              <DonutChart
                data={statuses}
                total={metrics.total}
                centerLabel="Total"
                centerValue={metrics.total}
                size={150}
                thickness={16}
              />
            </div>

            <ul className="legend-list">
              {statuses.map((item) => (
                <li key={item.key}>
                  <span
                    className="legend-list__dot"
                    style={{ '--dot-color': item.color }}
                  />
                  <span className="legend-list__label">{item.label}</span>
                  <strong>{item.value}</strong>
                  <span className="legend-list__pct">
                    {percent(item.value, metrics.total)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel__divider" />

          <h3 className="panel__subtitle">By priority</h3>
          <BarList items={priorities} total={metrics.total} />
        </article>
      </div>

      <div className="dash-row dash-row--bottom">
        <article className="panel dash-recent">
          <div className="panel__head">
            <div>
              <h2 className="panel__title">Recent complaints</h2>
              <p className="panel__sub">The latest complaints logged</p>
            </div>
            <a className="panel__link" href="#/complaints">
              View all
              <IconArrowRight size={14} stroke={2} aria-hidden="true" />
            </a>
          </div>

          {recent.length === 0 ? (
            <p className="panel__empty">No complaints yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="recent-table">
                <thead>
                  <tr>
                    <th scope="col">Complaint</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="recent-col-source">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((complaint) => (
                    <tr
                      key={complaint.id}
                      tabIndex={0}
                      onClick={() => openComplaint(complaint.id)}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter') return
                        event.preventDefault()
                        openComplaint(complaint.id)
                      }}
                    >
                      <td>
                        <span className="recent-table__ref">
                          {complaint.reference}
                        </span>
                        <span className="recent-table__subject">
                          {complaint.subject}
                        </span>
                        <span className="recent-table__customer">
                          {complaint.customerName}
                        </span>
                      </td>
                      <td>
                        <Priority value={complaint.priority} />
                      </td>
                      <td>
                        <Status value={complaint.status} short />
                      </td>
                      <td className="recent-col-source">
                        <SourceTag value={complaint.source} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <div className="dash-side">
          <article className="panel dash-sources">
          <div className="panel__head">
            <div>
              <h2 className="panel__title">Complaint sources</h2>
              <p className="panel__sub">Where complaints come from</p>
            </div>
            <a className="panel__link" href="#/sources">
              Details
              <IconArrowRight size={14} stroke={2} aria-hidden="true" />
            </a>
          </div>

          <div className="dash-donut">
            <DonutChart
              data={sources}
              total={metrics.total}
              centerLabel="Total"
              centerValue={metrics.total}
              size={154}
              thickness={17}
            />
          </div>

          <ul className="source-legend">
            {sources.map((item) => (
              <li key={item.label}>
                <span
                  className="legend-list__dot"
                  style={{ '--dot-color': item.color }}
                />
                <span className="source-legend__label">{item.label}</span>
                <strong>{item.value}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel dash-categories">
          <div className="panel__head">
            <div>
              <h2 className="panel__title">Top categories</h2>
              <p className="panel__sub">Complaint volume by type</p>
            </div>
          </div>

          <BarList items={categories} total={metrics.total} />
          </article>
        </div>
      </div>
    </div>
  )
}
