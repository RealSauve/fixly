import { useEffect, useRef, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { axisTick, chartColors, niceTicks } from './chartTheme'

const dayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const monthFormat = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' })
const shortMonthFormat = new Intl.DateTimeFormat('en-GB', { month: 'short' })
const dayTooltipFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

function ActiveRing({ cx, cy }) {
  if (cx == null || cy == null) return null

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <circle r={8} fill={chartColors.surface} />
      <circle r={4.5} fill={chartColors.ink} />
    </g>
  )
}

export default function TrendChart({ points, max, granularity = 'day' }) {
  const [keyboardIndex, setKeyboardIndex] = useState(null)
  const [hoverIndex, setHoverIndex] = useState(null)
  const [cursor, setCursor] = useState(null)
  const [plotWidth, setPlotWidth] = useState(0)
  const rootRef = useRef(null)
  const plotRef = useRef(null)

  const firstTime = points[0]?.date?.getTime() ?? null
  const lastTime = points[points.length - 1]?.date?.getTime() ?? null

  // A period change rebuilds every bucket; clear the old selection.
  useEffect(() => {
    setKeyboardIndex(null)
    setHoverIndex(null)
    setCursor(null)
  }, [granularity, points.length, firstTime, lastTime])

  const isMonth = granularity === 'month'
  const bucketName = isMonth ? 'month' : granularity === 'week' ? 'week' : 'day'
  const axisFormat = isMonth ? shortMonthFormat : dayFormat
  const tooltipFormat = isMonth
    ? monthFormat
    : granularity === 'week'
      ? { format: (date) => `Week of ${dayTooltipFormat.format(date)}` }
      : dayTooltipFormat

  const data = points.map((point, index) => ({
    index,
    label: axisFormat.format(point.date),
    tooltipLabel: tooltipFormat.format(point.date),
    created: point.logged,
    resolved: point.resolved,
  }))

  const totals = data.reduce(
    (sum, point) => ({
      created: sum.created + point.created,
      resolved: sum.resolved + point.resolved,
    }),
    { created: 0, resolved: 0 },
  )
  const isEmpty = data.length === 0 || totals.created + totals.resolved === 0

  useEffect(() => {
    const element = plotRef.current
    if (isEmpty || !element || typeof ResizeObserver === 'undefined') {
      return undefined
    }

    const observer = new ResizeObserver(([entry]) => {
      setPlotWidth(entry.contentRect.width)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [isEmpty])

  const { ticks, top } = niceTicks(max)
  const activeIndex = hoverIndex ?? keyboardIndex
  const activePoint =
    activeIndex !== null && activeIndex < data.length ? data[activeIndex] : null

  // Thin charts need fewer labels. Keep the familiar desktop cadence and
  // widen the step only when the plot cannot fit the labels.
  const baseTickStep = granularity === 'week' ? 2 : isMonth ? 3 : 7
  const minTickWidth = plotWidth > 0 && plotWidth < 480 ? 64 : 44
  const fittedStep =
    plotWidth > 0
      ? Math.max(
          1,
          Math.ceil((data.length * minTickWidth) / Math.max(1, plotWidth - 44)),
        )
      : baseTickStep
  const tickStep = Math.max(baseTickStep, fittedStep)
  const xTicks = []
  for (let index = 0; index < data.length; index += tickStep) {
    xTicks.push(data[index].label)
  }

  function placeTooltip(event) {
    const root = rootRef.current?.getBoundingClientRect()
    if (!root) return
    const x = event.clientX - root.left + 14
    const y = event.clientY - root.top - 24
    setCursor({
      x: Math.max(8, Math.min(root.width - 188, x)),
      y: Math.max(8, Math.min(root.height - 96, y)),
    })
  }

  function handlePlotMove(event) {
    if (data.length === 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    // The y axis reserves 44px; match the LineChart margin on the right.
    const left = 44
    const right = rect.width - 12
    const ratio = (event.clientX - rect.left - left) / Math.max(1, right - left)
    const clamped = Math.max(0, Math.min(1, ratio))
    setKeyboardIndex(null)
    setHoverIndex(Math.round(clamped * (data.length - 1)))
    placeTooltip(event)
  }

  function selectKeyboard(index) {
    setHoverIndex(null)
    setKeyboardIndex(index)

    const root = rootRef.current?.getBoundingClientRect()
    const plot = plotRef.current?.getBoundingClientRect()
    if (root && plot && data.length > 1) {
      const ratio = index / (data.length - 1)
      const pointX = plot.left - root.left + 44 + ratio * (plot.width - 56)
      setCursor({
        x: Math.max(8, Math.min(root.width - 188, pointX + 14)),
        y: 8,
      })
    }
  }

  function handleKeyDown(event) {
    let next = null

    if (event.key === 'ArrowRight') {
      next = activeIndex === null ? 0 : Math.min(data.length - 1, activeIndex + 1)
    } else if (event.key === 'ArrowLeft') {
      next = activeIndex === null ? data.length - 1 : Math.max(0, activeIndex - 1)
    } else if (event.key === 'Home') {
      next = 0
    } else if (event.key === 'End') {
      next = data.length - 1
    } else if (event.key === 'Escape') {
      setKeyboardIndex(null)
      setCursor(null)
      return
    } else {
      return
    }

    if (data.length === 0) return
    event.preventDefault()
    selectKeyboard(next)
  }

  const range = isEmpty
    ? 'No activity in this period.'
    : `${data.length} ${bucketName}s from ${data[0].label} to ${data[data.length - 1].label}.`

  return (
    <div
      className="trend"
      ref={rootRef}
      tabIndex={0}
      role="group"
      aria-label={`Ticket activity chart. ${range} Hover, tap or use arrow keys to inspect a ${bucketName}.`}
      onKeyDown={handleKeyDown}
      onFocus={() => selectKeyboard(data.length - 1)}
      onBlur={() => {
        setKeyboardIndex(null)
        setHoverIndex(null)
        setCursor(null)
      }}
      onPointerDown={() => {
        setKeyboardIndex(null)
        setCursor(null)
      }}
    >
      {isEmpty ? (
        <div className="trend__empty">
          <div className="trend__skeleton" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <p>No ticket activity in this period.</p>
        </div>
      ) : (
        <div
          className="trend__plot"
          ref={plotRef}
          onMouseMove={handlePlotMove}
          onMouseLeave={() => {
            setHoverIndex(null)
            setCursor(null)
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              accessibilityLayer={false}
              margin={{ top: 10, right: 12, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                vertical
                horizontal
                stroke={chartColors.grid}
                strokeWidth={1}
              />
              <XAxis
                dataKey="label"
                ticks={xTicks}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                interval={0}
              />
              <YAxis
                ticks={ticks}
                domain={[0, top]}
                allowDecimals={false}
                width={44}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              {activePoint ? (
                <ReferenceLine
                  x={activePoint.label}
                  y1={0}
                  y2={top}
                  stroke={chartColors.band}
                  strokeWidth={36}
                  strokeOpacity={1}
                  ifOverflow="discard"
                />
              ) : null}
              <Line
                name="Created"
                dataKey="created"
                type="monotone"
                className="trend-series trend-series--created"
                stroke={chartColors.primary}
                strokeWidth={2.5}
                dot={(props) =>
                  props.index === activeIndex ? <ActiveRing {...props} /> : null
                }
                isAnimationActive={false}
              />
              <Line
                name="Resolved"
                dataKey="resolved"
                type="monotone"
                className="trend-series trend-series--resolved"
                stroke={chartColors.secondary}
                strokeWidth={2.5}
                dot={(props) =>
                  props.index === activeIndex ? <ActiveRing {...props} /> : null
                }
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {activePoint && cursor ? (
        <div
          className="trend-tooltip"
          style={{ left: cursor.x, top: cursor.y }}
          role="status"
        >
          <div className="trend-tooltip__date">{activePoint.tooltipLabel}</div>
          <div className="trend-tooltip__row">
            <span
              className="trend-tooltip__dot trend-tooltip__dot--created"
              aria-hidden="true"
            />
            <span>Created</span>
            <strong className="num">{activePoint.created}</strong>
          </div>
          <div className="trend-tooltip__row">
            <span
              className="trend-tooltip__dot trend-tooltip__dot--resolved"
              aria-hidden="true"
            />
            <span>Resolved</span>
            <strong className="num">{activePoint.resolved}</strong>
          </div>
        </div>
      ) : null}

      <span className="sr-only" aria-live="polite">
        {activePoint
          ? `${activePoint.tooltipLabel}: ${activePoint.created} created, ${activePoint.resolved} resolved`
          : ''}
      </span>
    </div>
  )
}
