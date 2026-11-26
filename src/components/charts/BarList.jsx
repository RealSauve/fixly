// Horizontal bars for category, priority and source comparisons.
export default function BarList({ items, max, total }) {
  const peak = max ?? Math.max(1, ...items.map((item) => item.value))

  return (
    <ul className="bar-list">
      {items.map((item) => {
        const width = peak ? (item.value / peak) * 100 : 0
        const share =
          total && total > 0 ? Math.round((item.value / total) * 100) : null

        return (
          <li className="bar-list__item" key={item.label}>
            <span className="bar-list__label">{item.label}</span>
            <span className="bar-list__value">
              {item.value}
              {share !== null ? (
                <span className="bar-list__share"> · {share}%</span>
              ) : null}
            </span>
            <span className="bar-list__track">
              <span
                className="bar-list__fill"
                style={{
                  '--bar-width': `${width}%`,
                  '--bar-color': item.color,
                }}
              />
            </span>
          </li>
        )
      })}
    </ul>
  )
}
