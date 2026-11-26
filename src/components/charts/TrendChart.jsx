import { useId, useRef, useState } from 'react'

const WIDTH = 720
const HEIGHT = 320
const PAD = { top: 18, right: 14, bottom: 32, left: 34 }
const PLOT_W = WIDTH - PAD.left - PAD.right
const PLOT_H = HEIGHT - PAD.top - PAD.bottom

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
})
const tooltipDateFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

function xFor(index, count) {
  if (count <= 1) return PAD.left + PLOT_W / 2
  return PAD.left + (index / (count - 1)) * PLOT_W
}

function yFor(value, max) {
  return PAD.top + PLOT_H - (value / max) * PLOT_H
}

// Monotone cubic interpolation: the curve passes through every daily value
// without inventing peaks or dipping below zero between days.
function monotonePath(points) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${points[0].x},${points[0].y}`

  const count = points.length
  const dx = []
  const slope = []
  for (let index = 0; index < count - 1; index += 1) {
    dx[index] = points[index + 1].x - points[index].x
    slope[index] = (points[index + 1].y - points[index].y) / dx[index]
  }

  const tangent = new Array(count)
  tangent[0] = slope[0]
  tangent[count - 1] = slope[count - 2]
  for (let index = 1; index < count - 1; index += 1) {
    if (slope[index - 1] * slope[index] <= 0) {
      tangent[index] = 0
    } else {
      const before = 2 * dx[index] + dx[index - 1]
      const after = dx[index] + 2 * dx[index - 1]
      tangent[index] =
        (before + after) /
        (before / slope[index - 1] + after / slope[index])
    }
  }

  let path = `M${points[0].x},${points[0].y}`
  for (let index = 0; index < count - 1; index += 1) {
    const third = dx[index] / 3
    const cp1x = points[index].x + third
    const cp1y = points[index].y + tangent[index] * third
    const cp2x = points[index + 1].x - third
    const cp2y = points[index + 1].y - tangent[index + 1] * third
    path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${points[index + 1].x},${points[index + 1].y}`
  }

  return path
}

function axisLabelIndexes(count) {
  if (count <= 6) return [...Array(count).keys()]
  const step = Math.ceil((count - 1) / 4)
  const indexes = []
  for (let index = 0; index < count; index += step) indexes.push(index)
  if (indexes[indexes.length - 1] !== count - 1) indexes.push(count - 1)
  return indexes
}

export default function TrendChart({ points, max }) {
  const gradientId = useId().replace(/:/g, '')
  const svgRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(null)

  const logged = points.map((point, index) => ({
    x: xFor(index, points.length),
    y: yFor(point.logged, max),
  }))
  const resolved = points.map((point, index) => ({
    x: xFor(index, points.length),
    y: yFor(point.resolved, max),
  }))

  const loggedPath = monotonePath(logged)
  const resolvedPath = monotonePath(resolved)
  const baseline = PAD.top + PLOT_H
  const areaPath =
    logged.length > 0
      ? `${loggedPath} L${logged[logged.length - 1].x},${baseline} L${
          logged[0].x
        },${baseline} Z`
      : ''

  const step = max <= 4 ? 1 : Math.ceil(max / 4)
  const ticks = []
  for (let value = 0; value <= max; value += step) ticks.push(value)
  if (ticks[ticks.length - 1] !== max) ticks.push(max)

  const labelIndexes = axisLabelIndexes(points.length)
  const summary = points
    .map(
      (point, index) =>
        `${dateFormat.format(point.date)}: ${point.logged} logged, ${point.resolved} resolved`,
    )
    .join(', ')

  const active = activeIndex === null ? null : points[activeIndex]
  const activeX = activeIndex === null ? 0 : xFor(activeIndex, points.length)
  const tooltipLeft = Math.min(
    88,
    Math.max(12, (activeX / WIDTH) * 100),
  )
  const tooltipTop =
    active === null
      ? 0
      : (yFor(Math.max(active.logged, active.resolved), max) / HEIGHT) * 100

  function handlePointerMove(event) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || points.length === 0) return

    const svgX = ((event.clientX - rect.left) / rect.width) * WIDTH
    const ratio = (svgX - PAD.left) / PLOT_W
    const index = Math.round(ratio * (points.length - 1))
    setActiveIndex(Math.max(0, Math.min(points.length - 1, index)))
  }

  function handleKeyDown(event) {
    let next = null
    if (event.key === 'ArrowRight') {
      next =
        activeIndex === null
          ? points.length - 1
          : Math.min(points.length - 1, activeIndex + 1)
    } else if (event.key === 'ArrowLeft') {
      next =
        activeIndex === null
          ? points.length - 1
          : Math.max(0, activeIndex - 1)
    } else if (event.key === 'Home') {
      next = 0
    } else if (event.key === 'End') {
      next = points.length - 1
    } else if (event.key === 'Escape') {
      setActiveIndex(null)
      return
    } else {
      return
    }

    event.preventDefault()
    setActiveIndex(next)
  }

  return (
    <div
      className="trend"
      tabIndex={0}
      role="group"
      aria-label="Complaint activity chart. Hover, tap or use arrow keys to inspect a day."
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
      onPointerLeave={() => setActiveIndex(null)}
      onFocus={() => setActiveIndex(points.length - 1)}
      onBlur={() => setActiveIndex(null)}
      onKeyDown={handleKeyDown}
    >
      <svg
        ref={svgRef}
        className="trend__svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Complaints logged and resolved per day. ${summary}.`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => {
          const y = yFor(tick, max)
          return (
            <g key={tick}>
              <line
                className="trend__grid"
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={y}
                y2={y}
              />
              <text
                className="trend__y"
                x={PAD.left - 10}
                y={y + 4}
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          )
        })}

        {areaPath ? (
          <path d={areaPath} fill={`url(#${gradientId})`} />
        ) : null}

        {loggedPath ? (
          <path
            className="trend__line trend__line--logged"
            d={loggedPath}
            fill="none"
          />
        ) : null}

        {resolvedPath ? (
          <path
            className="trend__line trend__line--resolved"
            d={resolvedPath}
            fill="none"
          />
        ) : null}

        {logged.map((point, index) =>
          points[index].logged > 0 ? (
            <circle
              key={`logged-${index}`}
              className="trend__dot trend__dot--logged"
              cx={point.x}
              cy={point.y}
              r={3.2}
            />
          ) : null,
        )}

        {resolved.map((point, index) =>
          points[index].resolved > 0 ? (
            <circle
              key={`resolved-${index}`}
              className="trend__dot trend__dot--resolved"
              cx={point.x}
              cy={point.y}
              r={3.2}
            />
          ) : null,
        )}

        {activeIndex !== null ? (
          <g aria-hidden="true">
            <line
              className="trend__guide"
              x1={activeX}
              x2={activeX}
              y1={PAD.top}
              y2={baseline}
            />
            {active.logged > 0 ? (
              <circle
                className="trend__halo trend__halo--logged"
                cx={logged[activeIndex].x}
                cy={logged[activeIndex].y}
                r={9}
              />
            ) : null}
            {active.resolved > 0 ? (
              <circle
                className="trend__halo trend__halo--resolved"
                cx={resolved[activeIndex].x}
                cy={resolved[activeIndex].y}
                r={9}
              />
            ) : null}
          </g>
        ) : null}

        {labelIndexes.map((index) => (
          <text
            key={`label-${index}`}
            className="trend__x"
            x={xFor(index, points.length)}
            y={HEIGHT - 8}
            textAnchor={
              index === 0
                ? 'start'
                : index === points.length - 1
                  ? 'end'
                  : 'middle'
            }
          >
            {dateFormat.format(points[index].date)}
          </text>
        ))}
      </svg>

      {active ? (
        <div
          className="trend__tooltip"
          style={{
            left: `${tooltipLeft}%`,
            top: `max(${tooltipTop}%, 88px)`,
          }}
          aria-hidden="true"
        >
          <span className="trend__tooltip-date">
            {tooltipDateFormat.format(active.date)}
          </span>
          <span className="trend__tooltip-row">
            <span className="trend__tooltip-dot trend__tooltip-dot--logged" />
            Logged
            <strong>{active.logged}</strong>
          </span>
          <span className="trend__tooltip-row">
            <span className="trend__tooltip-dot trend__tooltip-dot--resolved" />
            Resolved
            <strong>{active.resolved}</strong>
          </span>
        </div>
      ) : null}

      <span className="sr-only" aria-live="polite">
        {active
          ? `${tooltipDateFormat.format(active.date)}: ${active.logged} logged, ${active.resolved} resolved`
          : ''}
      </span>
    </div>
  )
}
