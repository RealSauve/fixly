import { useState } from 'react'
import {
  IconArrowDownRight,
  IconArrowRight,
  IconArrowUpRight,
  IconCalendar,
  IconClock,
  IconFlag,
  IconMinus,
  IconTicket,
  IconUser,
} from '@tabler/icons-react'
import BarList from '../components/charts/BarList'
import DonutChart from '../components/charts/DonutChart'
import PriorityChart from '../components/charts/PriorityChart'
import Sparkline from '../components/charts/Sparkline'
import TrendChart from '../components/charts/TrendChart'
import RecentTicketsTable from '../components/RecentTicketsTable'
import {
  TREND_PERIODS,
  buildMetrics,
  categoryBreakdown,
  complaintsInPeriod,
  dashboardKpis,
  priorityBreakdown,
  sourceBreakdown,
  statusBreakdown,
  trendSeries,
} from '../lib/analytics'

const KPI_ICONS = {
  total: IconTicket,
  unassigned: IconUser,
  high: IconFlag,
  waiting: IconClock,
}

const SOURCE_RAMP = [
  { label: 'Website', color: 'var(--blue-700)' },
  { label: 'Email', color: 'var(--blue-600)' },
  { label: 'Phone Call', color: 'var(--blue-500)' },
  { label: 'WhatsApp', color: 'var(--blue-400)' },
  { label: 'Other', color: 'var(--blue-200)' },
]
const SOURCE_ORDER = SOURCE_RAMP.map((item) => item.label)
const SOURCE_COLORS = Object.fromEntries(
  SOURCE_RAMP.map((item) => [item.label, item.color]),
)

function changeTone(key, changePct) {
  if (changePct === null || changePct === 0) return 'neutral'
  if (key === 'unassigned' || key === 'high') {
    return changePct > 0 ? 'negative' : 'positive'
  }
  if (key === 'waiting') return changePct < 0 ? 'positive' : 'neutral'
  return changePct > 0 ? 'positive' : 'neutral'
}

function KpiChange({ kpi }) {
  const tone = changeTone(kpi.key, kpi.changePct)
  const DirectionIcon =
    kpi.changePct === null || kpi.changePct === 0
      ? IconMinus
      : kpi.changePct > 0
        ? IconArrowUpRight
        : IconArrowDownRight
  const text =
    kpi.changePct === null ? '-' : `${Math.round(Math.abs(kpi.changePct))}%`

  return (
    <span className="kpi-card__change-wrap">
      <span className={`kpi-card__change kpi-card__change--${tone}`}>
        <DirectionIcon size={15} aria-hidden="true" />
        <strong>{text}</strong>
      </span>
      <span className="kpi-card__period">vs last 30 days</span>
    </span>
  )
}

function CardPeriodSelect({ period, onPeriodChange, label }) {
  return (
    <label className="period-select period-select--card">
      <IconCalendar size={15} aria-hidden="true" />
      <select
        className="period-select__control"
        aria-label={label}
        value={period}
        onChange={(event) => onPeriodChange?.(event.target.value)}
      >
        {TREND_PERIODS.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function DashboardView({
  complaints,
  navigate,
  period = '30d',
  onPeriodChange,
  onSourceSelect,
  activeFilter,
}) {
  const [activeStatus, setActiveStatus] = useState(null)
  const [activeSource, setActiveSource] = useState(null)

  // One filtered dataset feeds every card, chart and breakdown on this screen.
  const visible = complaintsInPeriod(complaints, period)
  const metrics = buildMetrics(visible)
  const kpis = dashboardKpis(complaints)
  const categories = categoryBreakdown(visible)
  // Dashboard-only ramp: darkest to lightest Fixly blue, no neutral segments.
  const sources = sourceBreakdown(visible)
    .map((item) => ({
      ...item,
      color: SOURCE_COLORS[item.label] ?? 'var(--blue-200)',
    }))
    .filter((item) => SOURCE_ORDER.includes(item.label))
    .sort(
      (a, b) => SOURCE_ORDER.indexOf(a.label) - SOURCE_ORDER.indexOf(b.label),
    )
  const priorities = priorityBreakdown(metrics)
  const trend = trendSeries(complaints, period)

  const statuses = statusBreakdown(metrics)
    .map((item, index) => ({ ...item, index }))
    .sort((a, b) => b.value - a.value || a.index - b.index)

  const recent = [...visible].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )

  function openTicket(id) {
    navigate(`#/ticket/${id}`)
  }

  return (
    <div className="dashboard">
      <div className="dash-row dash-row--kpis">
        {kpis.map((kpi) => {
          const Icon = KPI_ICONS[kpi.key]
          return (
            <a
              key={kpi.key}
              className={`panel kpi-card kpi-card--${kpi.key}`}
              href={kpi.href}
              aria-label={`${kpi.label}: ${kpi.value}. View filtered tickets.`}
            >
              <span className="kpi-card__top">
                <span className="kpi-card__icon" aria-hidden="true">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span className="kpi-card__heading">
                  <span className="kpi-card__label">{kpi.label}</span>
                  <strong className="kpi-card__value">{kpi.value}</strong>
                </span>
              </span>
              <span className="kpi-card__bottom">
                <KpiChange kpi={kpi} />
                <Sparkline values={kpi.points} className="kpi-card__spark" />
              </span>
            </a>
          )
        })}
      </div>

      <div className="dash-row dash-row--mid">
        <article className="panel dash-trend">
          <div className="panel__head">
            <h2 className="panel__title">Ticket activity</h2>
            <CardPeriodSelect
              period={period}
              onPeriodChange={onPeriodChange}
              label="Ticket activity date range"
            />
          </div>

          <div className="trend-legend" aria-label="Ticket activity series">
            <span className="trend-legend__item">
              <span
                className="trend-legend__dot trend-legend__dot--created"
                aria-hidden="true"
              />
              Created
            </span>
            <span className="trend-legend__item">
              <span
                className="trend-legend__dot trend-legend__dot--resolved"
                aria-hidden="true"
              />
              Resolved
            </span>
          </div>

          <TrendChart
            points={trend.points}
            max={trend.max}
            granularity={trend.granularity}
          />
        </article>
      </div>

      <div className="dash-row dash-row--charts">
        <article className="panel dash-status" aria-label="Status breakdown">
          <div className="panel__head">
            <div>
              <h2 className="panel__title">Status breakdown</h2>
              <p className="panel__sub">Where tickets stand</p>
            </div>
          </div>

          <div className="status-card__body">
            <DonutChart
              data={statuses}
              total={metrics.total}
              size={200}
              sortByValue
              centerValue={metrics.total}
              centerLabel="tickets"
              activeId={activeStatus}
              onActiveChange={setActiveStatus}
            />
            <ul className="donut-legend status-legend">
              {statuses.map((item) => (
                <li key={item.key}>
                  <button
                    className={`donut-legend__item${
                      activeStatus === item.key ? ' is-active' : ''
                    }`}
                    type="button"
                    onMouseEnter={() => setActiveStatus(item.key)}
                    onMouseLeave={() => setActiveStatus(null)}
                    onFocus={() => setActiveStatus(item.key)}
                    onBlur={() => setActiveStatus(null)}
                  >
                    <span
                      className="donut-legend__marker"
                      style={{ background: item.color }}
                      aria-hidden="true"
                    />
                    <span className="donut-legend__label">{item.label}</span>
                    <strong className="num">{item.value}</strong>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="panel dash-priority">
          <div className="panel__head">
            <div>
              <h2 className="panel__title">Priority</h2>
              <p className="panel__sub">Active tickets by priority</p>
            </div>
            <a className="panel__link" href="#/tickets">
              View tickets
              <IconArrowRight size={14} aria-hidden="true" />
            </a>
          </div>

          <PriorityChart
            items={priorities}
            max={Math.max(1, ...priorities.map((item) => item.value))}
          />
        </article>
      </div>

      <div className="dash-row dash-row--bottom">
        <article className="panel dash-recent">
          <div className="panel__head">
            <div>
              <h2 className="panel__title">Recent tickets</h2>
              <p className="panel__sub">The latest tickets in this period</p>
            </div>
            <a className="panel__link" href="#/tickets">
              View all
              <IconArrowRight size={14} aria-hidden="true" />
            </a>
          </div>

          {recent.length === 0 ? (
            <p className="panel__empty">No tickets in this period.</p>
          ) : (
            <RecentTicketsTable tickets={recent} onOpen={openTicket} />
          )}
        </article>

        <div className="dash-side">
          <article className="panel dash-sources">
            <div className="panel__head">
              <h2 className="panel__title">Ticket sources</h2>
              <CardPeriodSelect
                period={period}
                onPeriodChange={onPeriodChange}
                label="Ticket sources date range"
              />
            </div>

            <div className="dash-donut">
              <DonutChart
                data={sources}
                total={metrics.total}
                size={200}
                fullRing
                centerValue={metrics.total}
                centerLabel="tickets"
                activeId={activeSource}
                onActiveChange={setActiveSource}
              />
            </div>

            <ul className="source-legend">
              {sources.map((item) => (
                <li key={item.label}>
                  <button
                    className={`source-legend__item${
                      activeSource === item.label ? ' is-active' : ''
                    }`}
                    type="button"
                    aria-label={`${item.label}: ${item.value} tickets. Filter list.`}
                    aria-pressed={activeFilter?.source === item.label}
                    onMouseEnter={() => setActiveSource(item.label)}
                    onMouseLeave={() => setActiveSource(null)}
                    onFocus={() => setActiveSource(item.label)}
                    onBlur={() => setActiveSource(null)}
                    onClick={() => onSourceSelect?.(item.label)}
                  >
                    <span
                      className="legend-list__dot"
                      style={{ '--dot-color': item.color }}
                      aria-hidden="true"
                    />
                    <span className="source-legend__label">{item.label}</span>
                    <strong className="num">{item.value}</strong>
                  </button>
                </li>
              ))}
            </ul>

            <a className="panel__link dash-sources__link" href="#/sources">
              View details
              <IconArrowRight size={14} aria-hidden="true" />
            </a>
          </article>

          <article className="panel dash-categories">
            <div className="panel__head">
              <div>
                <h2 className="panel__title">Top categories</h2>
                <p className="panel__sub">Ticket volume by type</p>
              </div>
            </div>

            <BarList items={categories} total={metrics.total} />
          </article>
        </div>
      </div>
    </div>
  )
}