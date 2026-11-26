// Simple SVG donut. Each segment is a stroked circle offset around the ring,
// so there is no chart dependency to install or keep up to date.
export default function DonutChart({
  data,
  total,
  centerLabel = 'Total',
  centerValue,
  size = 180,
  thickness = 18,
}) {
  const sum = total ?? data.reduce((acc, item) => acc + item.value, 0)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const label = data
    .map((item) => `${item.label}: ${item.value}`)
    .join(', ')

  let offset = 0

  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Distribution chart. ${label}.`}
      >
        <circle
          className="donut__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
        />
        {sum > 0
          ? data.map((item) => {
              const fraction = item.value / sum
              const length = fraction * circumference
              const dash = Math.max(length - 3, 0)
              const element = (
                <circle
                  key={item.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              )
              offset += length
              return element
            })
          : null}
      </svg>
      <div className="donut__center">
        <span className="donut__value">{centerValue ?? sum}</span>
        <span className="donut__label">{centerLabel}</span>
      </div>
    </div>
  )
}
