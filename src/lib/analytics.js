import { PRIORITIES, STATUSES } from './constants'
import { SOURCE_ORDER, normaliseSource, sourceMeta } from './sources'

const DAY = 24 * 60 * 60 * 1000

// Chart palettes reuse the same semantic tokens as the badges.
export const STATUS_CHART = [
  { key: 'New', label: 'New', color: 'var(--status-new)' },
  { key: 'In Progress', label: 'In progress', color: 'var(--status-progress)' },
  { key: 'Waiting on Customer', label: 'Waiting', color: 'var(--status-waiting)' },
  { key: 'Resolved', label: 'Resolved', color: 'var(--status-resolved)' },
]

export const PRIORITY_CHART = [
  { key: 'High', label: 'High', color: 'var(--priority-high)' },
  { key: 'Medium', label: 'Medium', color: 'var(--priority-medium)' },
  { key: 'Low', label: 'Low', color: 'var(--priority-low)' },
]

const CATEGORY_COLORS = [
  'var(--blue-700)',
  'var(--blue-600)',
  'var(--blue-500)',
  'var(--blue-400)',
  'var(--ink-2)',
  'var(--ink-3)',
]

function toDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function durationMs(complaint) {
  const created = toDate(complaint.createdAt)
  const resolved = toDate(complaint.resolvedAt)
  if (!created || !resolved) return null

  const ms = resolved.getTime() - created.getTime()
  return ms >= 0 ? ms : null
}

export function formatDuration(ms) {
  if (ms === null || !Number.isFinite(ms) || ms < 0) return '—'

  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return `${minutes}m`

  const hours = ms / (60 * 60 * 1000)
  if (hours < 24) return `${hours < 10 ? hours.toFixed(1) : Math.round(hours)}h`

  const days = ms / DAY
  return `${days < 10 ? days.toFixed(1) : Math.round(days)} ${
    days < 1.05 ? 'day' : 'days'
  }`
}

export function percent(part, total) {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

// The single source of truth for every number on the dashboard.
export function buildMetrics(complaints) {
  const byStatus = Object.fromEntries(STATUSES.map((status) => [status, 0]))
  const byPriority = Object.fromEntries(PRIORITIES.map((item) => [item, 0]))
  const durations = []

  for (const complaint of complaints) {
    if (byStatus[complaint.status] !== undefined) {
      byStatus[complaint.status] += 1
    }
    if (byPriority[complaint.priority] !== undefined) {
      byPriority[complaint.priority] += 1
    }
    if (complaint.status === 'Resolved') {
      const ms = durationMs(complaint)
      if (ms !== null) durations.push(ms)
    }
  }

  const total = complaints.length
  const resolved = byStatus.Resolved
  const open = byStatus.New + byStatus['In Progress']
  const waiting = byStatus['Waiting on Customer']
  const active = total - resolved
  const high = byPriority.High
  const highOpen = complaints.filter(
    (complaint) =>
      complaint.priority === 'High' && complaint.status !== 'Resolved',
  ).length
  const avgResolutionMs =
    durations.length > 0
      ? durations.reduce((sum, value) => sum + value, 0) / durations.length
      : null

  return {
    total,
    open,
    waiting,
    resolved,
    active,
    high,
    highOpen,
    new: byStatus.New,
    inProgress: byStatus['In Progress'],
    byStatus,
    byPriority,
    avgResolutionMs,
    resolutionRate: total ? resolved / total : 0,
    unassigned: complaints.filter((complaint) => !complaint.assigneeId).length,
  }
}

// An open ticket with no activity cut-off is ageing once it passes this age.
export const AGEING_DAYS = 14

export function isAgeing(complaint, now = new Date()) {
  if (!complaint || complaint.status === 'Resolved') return false
  const created = toDate(complaint.createdAt)
  if (!created) return false
  return now.getTime() - created.getTime() >= AGEING_DAYS * DAY
}

// What a support lead should look at first. Every count comes from the same
// complaint dataset that feeds the rest of the dashboard.
export function attentionItems(complaints, now = new Date()) {
  const unassigned = complaints.filter((item) => !item.assigneeId)
  const highActive = complaints.filter(
    (item) => item.priority === 'High' && item.status !== 'Resolved',
  )
  const waiting = complaints.filter(
    (item) => item.status === 'Waiting on Customer',
  )
  const ageing = complaints.filter((item) => isAgeing(item, now))

  return [
    {
      key: 'unassigned',
      label: 'Unassigned',
      detail: 'No owner yet',
      count: unassigned.length,
      href: '#/tickets?assignee=unassigned',
      tone: 'neutral',
    },
    {
      key: 'high',
      label: 'High priority active',
      detail: 'Active tickets at High priority',
      count: highActive.length,
      href: '#/tickets?priority=High&status=All%20active',
      tone: 'danger',
    },
    {
      key: 'waiting',
      label: 'Waiting on customer',
      detail: 'Paused until the customer replies',
      count: waiting.length,
      href: '#/tickets?status=Waiting%20on%20Customer',
      tone: 'neutral',
    },
    {
      key: 'ageing',
      label: 'Ageing tickets',
      detail: `Open for ${AGEING_DAYS} days or more`,
      count: ageing.length,
      href: '#/tickets?age=old',
      tone: 'warning',
    },
  ]
}

export function statusBreakdown(metrics) {
  return STATUS_CHART.map((item) => ({
    ...item,
    value: metrics.byStatus[item.key] ?? 0,
  })).filter((item) => item.value > 0)
}

export function priorityBreakdown(metrics) {
  return PRIORITY_CHART.map((item) => ({
    ...item,
    value: metrics.byPriority[item.key] ?? 0,
  })).filter((item) => item.value > 0)
}

// One pass over the same ticket array that feeds every other dashboard card.
export function priorityStatusMatrix(tickets) {
  const rows = PRIORITY_CHART.map(({ key, label }) => ({ key, label }))
  const cols = STATUS_CHART.map(({ key, label }) => ({ key, label }))
  const counts = Object.fromEntries(
    rows.map((row) => [
      row.key,
      Object.fromEntries(cols.map((col) => [col.key, 0])),
    ]),
  )

  for (const ticket of tickets) {
    if (counts[ticket.priority]?.[ticket.status] !== undefined) {
      counts[ticket.priority][ticket.status] += 1
    }
  }

  const rowTotals = Object.fromEntries(
    rows.map((row) => [
      row.key,
      cols.reduce((sum, col) => sum + counts[row.key][col.key], 0),
    ]),
  )
  const colTotals = Object.fromEntries(
    cols.map((col) => [
      col.key,
      rows.reduce((sum, row) => sum + counts[row.key][col.key], 0),
    ]),
  )
  const max = Math.max(
    0,
    ...rows.flatMap((row) => cols.map((col) => counts[row.key][col.key])),
  )

  return { rows, cols, counts, rowTotals, colTotals, max, total: tickets.length }
}

export function categoryBreakdown(complaints) {
  const counts = new Map()

  for (const complaint of complaints) {
    counts.set(complaint.category, (counts.get(complaint.category) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, value], index) => ({
      label,
      value,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
}

export function sourceBreakdown(complaints) {
  const counts = new Map(SOURCE_ORDER.map((source) => [source, 0]))

  for (const complaint of complaints) {
    const source = normaliseSource(complaint.source)
    counts.set(source, (counts.get(source) ?? 0) + 1)
  }

  return [...counts.entries()]
    .filter(([, value]) => value > 0)
    .map(([label, value]) => ({
      label,
      value,
      color: sourceMeta(label).color,
    }))
}

export function buildSourceStats(complaints) {
  return SOURCE_ORDER.map((source) => {
    const items = complaints.filter(
      (complaint) => normaliseSource(complaint.source) === source,
    )
    const resolvedItems = items.filter(
      (complaint) => complaint.status === 'Resolved',
    )
    const durations = resolvedItems
      .map((complaint) => durationMs(complaint))
      .filter((value) => value !== null)

    return {
      label: source,
      color: sourceMeta(source).color,
      total: items.length,
      open: items.length - resolvedItems.length,
      resolved: resolvedItems.length,
      high: items.filter((complaint) => complaint.priority === 'High').length,
      rate: items.length ? resolvedItems.length / items.length : 0,
      avgResolutionMs:
        durations.length > 0
          ? durations.reduce((sum, value) => sum + value, 0) / durations.length
          : null,
    }
  }).filter((row) => row.total > 0)
}

export function buildTeamStats(complaints, staff) {
  const rows = staff.map((person) => {
    const items = complaints.filter(
      (complaint) => complaint.assigneeId === person.id,
    )
    const resolvedItems = items.filter(
      (complaint) => complaint.status === 'Resolved',
    )
    const durations = resolvedItems
      .map((complaint) => durationMs(complaint))
      .filter((value) => value !== null)

    return {
      ...person,
      total: items.length,
      open: items.length - resolvedItems.length,
      resolved: resolvedItems.length,
      high: items.filter((complaint) => complaint.priority === 'High').length,
      rate: items.length ? resolvedItems.length / items.length : 0,
      avgResolutionMs:
        durations.length > 0
          ? durations.reduce((sum, value) => sum + value, 0) / durations.length
          : null,
    }
  })

  const unassigned = complaints.filter((complaint) => !complaint.assigneeId)

  return {
    rows,
    unassignedCount: unassigned.length,
    unassignedOpen: unassigned.filter(
      (complaint) => complaint.status !== 'Resolved',
    ).length,
  }
}

function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function monthKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}`
}

function startOfWeek(date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const weekday = (monday.getDay() + 6) % 7
  monday.setDate(monday.getDate() - weekday)
  return monday
}

function shiftDays(date, amount) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
}

function shiftMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export const TREND_PERIODS = [
  { key: '7d', label: 'Last 7 days', granularity: 'day', days: 7 },
  { key: '30d', label: 'Last 30 days', granularity: 'day', days: 30 },
  { key: '90d', label: 'Last 90 days', granularity: 'week', days: 90 },
  { key: 'year', label: 'Last year', granularity: 'month', months: 12 },
]

// Anchored to the most recent real activity so the sample history stays
// meaningful whenever the browser-local prototype is opened.
// The dashboard uses the same window as the activity chart for every card and
// breakdown. A ticket belongs to the window if it was created or resolved in it.
export function complaintsInPeriod(complaints, period = '30d') {
  const { start, end } = trendSeries(complaints, period)
  const from = start.getTime()
  const until = new Date(end)
  until.setHours(23, 59, 59, 999)

  return complaints.filter((complaint) => {
    const created = toDate(complaint.createdAt)?.getTime()
    const resolved = toDate(complaint.resolvedAt)?.getTime()
    return (
      (created !== undefined && created >= from && created <= until.getTime()) ||
      (resolved !== undefined && resolved >= from && resolved <= until.getTime())
    )
  })
}

export function trendSeries(complaints, period = '30d') {
  const config = TREND_PERIODS.find((item) => item.key === period) ?? TREND_PERIODS[1]
  const dates = []

  for (const complaint of complaints) {
    const created = toDate(complaint.createdAt)
    if (created) dates.push(created)
    const resolved = toDate(complaint.resolvedAt)
    if (resolved) dates.push(resolved)
  }

  const latest =
    dates.length > 0
      ? new Date(Math.max(...dates.map((date) => date.getTime())))
      : new Date()
  latest.setHours(0, 0, 0, 0)

  const buckets = new Map()
  let start
  let keyFor

  if (config.granularity === 'month') {
    start = shiftMonths(latest, -(config.months - 1))
    keyFor = monthKey
    for (let index = 0; index < config.months; index += 1) {
      const date = shiftMonths(start, index)
      buckets.set(keyFor(date), { date, logged: 0, resolved: 0 })
    }
  } else if (config.granularity === 'week') {
    start = startOfWeek(shiftDays(latest, -(config.days - 1)))
    keyFor = (date) => dayKey(startOfWeek(date))
    let date = start
    while (date <= latest) {
      buckets.set(dayKey(date), { date, logged: 0, resolved: 0 })
      date = shiftDays(date, 7)
    }
  } else {
    start = shiftDays(latest, -(config.days - 1))
    keyFor = dayKey
    for (let index = 0; index < config.days; index += 1) {
      const date = shiftDays(start, index)
      buckets.set(keyFor(date), { date, logged: 0, resolved: 0 })
    }
  }

  for (const complaint of complaints) {
    const created = toDate(complaint.createdAt)
    if (created) {
      const bucket = buckets.get(keyFor(created))
      if (bucket) bucket.logged += 1
    }

    const resolved = toDate(complaint.resolvedAt)
    if (resolved) {
      const bucket = buckets.get(keyFor(resolved))
      if (bucket) bucket.resolved += 1
    }
  }

  const points = [...buckets.values()]
  const max = Math.max(
    1,
    ...points.map((point) => Math.max(point.logged, point.resolved)),
  )

  return {
    points,
    max,
    start,
    end: latest,
    granularity: config.granularity,
    label: config.label,
  }
}

const DASHBOARD_KPI_METRICS = [
  {
    key: 'total',
    label: 'Total tickets',
    href: '#/tickets',
    matches: () => true,
  },
  {
    key: 'unassigned',
    label: 'Unassigned',
    href: '#/tickets?assignee=unassigned',
    matches: (complaint) => !complaint.assigneeId,
  },
  {
    key: 'high',
    label: 'High priority active',
    href: '#/tickets?priority=High&status=All%20active',
    matches: (complaint) =>
      complaint.priority === 'High' && complaint.status !== 'Resolved',
  },
  {
    key: 'waiting',
    label: 'Waiting on customer',
    href: '#/tickets?status=Waiting%20on%20Customer',
    matches: (complaint) => complaint.status === 'Waiting on Customer',
  },
]

function inDateRange(complaint, start, end) {
  const created = toDate(complaint.createdAt)?.getTime()
  const resolved = toDate(complaint.resolvedAt)?.getTime()
  const from = start.getTime()
  const until = end.getTime()

  return (
    (created !== undefined && created >= from && created <= until) ||
    (resolved !== undefined && resolved >= from && resolved <= until)
  )
}

// Dashboard KPIs stay on a fixed 30-day window even when the activity chart
// uses a different range. Each point counts tickets whose created or resolved
// date falls on that day, using the same membership rule as the card total.
export function dashboardKpis(complaints) {
  const trend = trendSeries(complaints, '30d')
  const currentStart = new Date(trend.start)
  const currentEnd = new Date(trend.end)
  currentEnd.setHours(23, 59, 59, 999)
  const previousStart = shiftDays(currentStart, -30)
  const previousEnd = new Date(currentStart.getTime() - 1)

  return DASHBOARD_KPI_METRICS.map((metric) => {
    const { matches, ...meta } = metric
    const currentItems = complaints.filter(
      (complaint) =>
        inDateRange(complaint, currentStart, currentEnd) && matches(complaint),
    )
    const previous = complaints.filter(
      (complaint) =>
        inDateRange(complaint, previousStart, previousEnd) && matches(complaint),
    ).length
    const value = currentItems.length
    const changePct = previous > 0 ? ((value - previous) / previous) * 100 : null

    const points = trend.points.map(({ date }) => {
      const key = dayKey(date)
      return currentItems.filter((complaint) => {
        const created = toDate(complaint.createdAt)
        const resolved = toDate(complaint.resolvedAt)
        return (
          (created !== null && dayKey(created) === key) ||
          (resolved !== null && dayKey(resolved) === key)
        )
      }).length
    })

    return {
      ...meta,
      value,
      previous,
      changePct,
      points,
    }
  })
}
