const idFor = (item) => item.key ?? item.label

const SIZE = 200
const RADIUS = 80
const DEFAULT_STROKE = 24
const DEFAULT_GAP = 3
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Plain SVG rings: one circle per segment, rotated so the first dash starts
// at 12 o'clock. Hover state can come from the ring or a matching legend row.
export default function DonutChart({
  data,
  total,
  centerLabel = 'Total',
  centerValue,
  size = 200,
  sortByValue = false,
  showCenter = true,
  activeId = null,
  onActiveChange,
  fullRing = false,
  strokeWidth = fullRing ? 20 : DEFAULT_STROKE,
  gap = fullRing ? 6 : DEFAULT_GAP,
}) {
  const sum = total ?? data.reduce((acc, item) => acc + item.value, 0)
  const label = data
    .map((item) => `${item.label}: ${item.value}`)
    .join(', ')

  // Round caps add half the stroke at each end. Full rings shift the dash
  // into the middle of its slice so the caps leave an even, small gap.
  const capAllowance = strokeWidth + gap
  const startShift = fullRing ? capAllowance / 2 : 0

  const segments = data
    .map((item, index) => ({ ...item, index }))
    .filter((item) => item.value > 0)
    .sort((a, b) =>
      sortByValue ? b.value - a.value || a.index - b.index : a.index - b.index,
    )

  let offset = 0
  const arcs = segments.map((item) => {
    const length = sum > 0 ? (item.value / sum) * CIRCUMFERENCE : 0
    const dash = Math.max(1, length - capAllowance)
    const arc = {
      ...item,
      dashArray: `${dash} ${CIRCUMFERENCE - dash}`,
      dashOffset: -(offset + startShift),
    }
    offset += length
    return arc
  })

  const activeItem = segments.find((item) => idFor(item) === activeId)

  return (
    <div
      className={`donut${sum > 0 ? '' : ' donut--empty'}${
        fullRing ? ' donut--full' : ''
      }`}
      style={{
        '--donut-size': `${size}px`,
        '--donut-thickness': `${strokeWidth}px`,
      }}
      role="img"
      aria-label={`Distribution chart. ${label}.`}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
        focusable="false"
      >
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          {fullRing ? (
            <circle
              className="donut__track"
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={strokeWidth}
            />
          ) : null}
          {arcs.map((item) => {
            const id = idFor(item)
            const muted = activeId !== null && activeId !== id
            return (
              <circle
                key={id}
                className={`donut__segment${
                  activeId === id ? ' is-active' : ''
                }${muted ? ' is-dimmed' : ''}`}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={item.dashArray}
                strokeDashoffset={item.dashOffset}
                onMouseEnter={() => onActiveChange?.(id)}
                onMouseLeave={() => onActiveChange?.(null)}
              />
            )
          })}
        </g>
      </svg>

      {showCenter ? (
        <div className="donut__center">
          <span className="donut__value">
            {activeItem ? activeItem.value : (centerValue ?? sum)}
          </span>
          <span className="donut__label">
            {activeItem ? activeItem.label : centerLabel}
          </span>
        </div>
      ) : null}
    </div>
  )
}
