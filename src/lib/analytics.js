import { PRIORITIES, STATUSES } from './constants'
import { SOURCE_ORDER, normaliseSource, sourceMeta } from './sources'

const DAY = 24 * 60 * 60 * 1000

// Chart palettes. These are data-visualisation colours, not layout colours,
// so they live next to the data helpers rather than in tokens.css.
export const STATUS_CHART = [
  { key: 'New', label: 'New', color: '#2563eb' },
  { key: 'In Progress', label: 'In progress', color: '#13b5e6' },
  { key: 'Waiting on Customer', label: 'Waiting on customer', color: '#94a3b8' },
  { key: 'Resolved', label: 'Resolved', color: '#1f7a3e' },
]

export const PRIORITY_CHART = [
  { key: 'High', label: 'High', color: '#b42318' },
  { key: 'Medium', label: 'Medium', color: '#d97706' },
  { key: 'Low', label: 'Low', color: '#94a3b8' },
]

const CATEGORY_COLORS = [
  '#2563eb',
  '#0ea5e9',
  '#7c3aed',
  '#16a34a',
  '#d97706',
  '#64748b',
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

// A daily window ending at the most recent recorded activity. Anchoring the
// window to the data means the sample dataset stays meaningful whenever the
// prototype is opened, and a live store simply extends the window.
export function trendSeries(complaints, days = 21) {
  const dates = []
  for (const complaint of complaints) {
    const created = toDate(complaint.createdAt)
    if (created) dates.push(created)
    const resolved = toDate(complaint.resolvedAt)
    if (resolved) dates.push(resolved)
  }

  const end =
    dates.length > 0
      ? new Date(Math.max(...dates.map((date) => date.getTime())))
      : new Date()
  end.setHours(0, 0, 0, 0)

  const start = new Date(end.getTime() - (days - 1) * DAY)
  const buckets = new Map()

  for (let index = 0; index < days; index += 1) {
    const date = new Date(start.getTime() + index * DAY)
    buckets.set(dayKey(date), { date, logged: 0, resolved: 0 })
  }

  for (const complaint of complaints) {
    const created = toDate(complaint.createdAt)
    if (created) {
      const bucket = buckets.get(dayKey(created))
      if (bucket) bucket.logged += 1
    }

    const resolved = toDate(complaint.resolvedAt)
    if (resolved) {
      const bucket = buckets.get(dayKey(resolved))
      if (bucket) bucket.resolved += 1
    }
  }

  const points = [...buckets.values()]
  const max = Math.max(
    1,
    ...points.map((point) => Math.max(point.logged, point.resolved)),
  )

  return { points, max, start, end }
}
