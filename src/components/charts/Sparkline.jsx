import { useId } from 'react'

const WIDTH = 72
const HEIGHT = 30
const PADDING = 3

function smoothPath(points) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let path = `M ${points[0].x} ${points[0].y}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index]
    const current = points[index]
    const next = points[index + 1]
    const after = points[index + 2] ?? next
    const cp1x = current.x + (next.x - previous.x) / 6
    const cp1y = current.y + (next.y - previous.y) / 6
    const cp2x = next.x - (after.x - current.x) / 6
    const cp2y = next.y - (after.y - current.y) / 6

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`
  }
  return path
}

// Small SVG trend used by the dashboard KPI cards. Colour comes from the
// card's --kpi-accent token via currentColor, so no palette lives here.
export default function Sparkline({ values = [], className = '' }) {
  const rawId = useId()
  const gradientId = `sparkline-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`

  if (values.length === 0) {
    return <span className={`sparkline sparkline--empty ${className}`} aria-hidden="true" />
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min
  const points = values.map((value, index) => ({
    x: values.length === 1 ? WIDTH / 2 : (index / (values.length - 1)) * WIDTH,
    y:
      span === 0
        ? HEIGHT / 2
        : PADDING +
          (1 - (value - min) / span) * (HEIGHT - PADDING * 2),
  }))

  const line = smoothPath(points)
  const area = `${line} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`

  return (
    <span className={`sparkline ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} focusable="false">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.24" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          className="sparkline__line"
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
