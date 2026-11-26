// Shared tooltip for the Recharts visuals. Recharts clones this element with
// active/payload/label, so callers only supply presentation options here.
export default function ChartTooltip({
  active,
  payload,
  title,
  meta,
  valueFormatter,
}) {
  if (!active || !payload?.length) return null

  const heading = typeof title === 'function' ? title(payload[0], payload) : title
  const detail = typeof meta === 'function' ? meta(payload[0], payload) : meta

  return (
    <div className="chart-tooltip">
      {heading ? <div className="chart-tooltip__title">{heading}</div> : null}

      {payload.map((item) => (
        <div
          className="chart-tooltip__row"
          key={`${item.dataKey ?? item.name ?? 'value'}-${item.value}`}
        >
          <span className="chart-tooltip__name">
            <span
              className="chart-tooltip__swatch"
              style={{ '--swatch-color': item.color ?? item.payload?.color }}
              aria-hidden="true"
            />
            {item.name}
          </span>
          <span className="chart-tooltip__value">
            {valueFormatter
              ? valueFormatter(item.value, item)
              : item.value}
          </span>
        </div>
      ))}

      {detail ? <div className="chart-tooltip__meta">{detail}</div> : null}
    </div>
  )
}
