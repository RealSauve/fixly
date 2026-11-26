import BarList from '../components/charts/BarList'
import DonutChart from '../components/charts/DonutChart'
import SourceTag from '../components/SourceTag'
import {
  buildMetrics,
  buildSourceStats,
  percent,
  sourceBreakdown,
} from '../lib/analytics'

export default function SourcesView({ complaints }) {
  const metrics = buildMetrics(complaints)
  const sources = sourceBreakdown(complaints)
  const stats = buildSourceStats(complaints)
  const openBySource = stats
    .map((row) => ({
      label: row.label,
      value: row.open,
      color: row.color,
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)

  return (
    <section className="sources-view">
      <div className="sources-view__grid">
        <article className="panel">
          <div className="panel__head">
            <div>
              <h2 className="panel__title">Where complaints come from</h2>
              <p className="panel__sub">
                Every complaint grouped by its intake channel
              </p>
            </div>
          </div>

          <div className="sources-view__chart">
            <DonutChart
              data={sources}
              total={metrics.total}
              centerLabel="Total"
              centerValue={metrics.total}
              size={210}
              thickness={22}
            />

            <ul className="legend-list">
              {sources.map((item) => (
                <li key={item.label}>
                  <span
                    className="legend-list__dot"
                    style={{ '--dot-color': item.color }}
                  />
                  <span className="legend-list__label">{item.label}</span>
                  <strong>{item.value}</strong>
                  <span className="legend-list__pct">
                    {percent(item.value, metrics.total)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="panel">
          <div className="panel__head">
            <div>
              <h2 className="panel__title">Open by source</h2>
              <p className="panel__sub">
                Unresolved work by intake channel
              </p>
            </div>
            <span className="chip chip--soft">{metrics.active} open</span>
          </div>

          {openBySource.length === 0 ? (
            <p className="panel__empty">No open complaints right now.</p>
          ) : (
            <BarList items={openBySource} total={metrics.active} />
          )}
        </article>
      </div>

      <article className="panel">
        <div className="panel__head">
          <div>
            <h2 className="panel__title">Source performance</h2>
            <p className="panel__sub">
              Volume, open work and resolution rate for each channel
            </p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table source-table">
            <thead>
              <tr>
                <th scope="col">Source</th>
                <th scope="col">Complaints</th>
                <th scope="col">Open</th>
                <th scope="col">Resolved</th>
                <th scope="col">High priority</th>
                <th scope="col">Resolution rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row) => (
                <tr key={row.label}>
                  <td>
                    <SourceTag value={row.label} />
                  </td>
                  <td className="source-table__num">{row.total}</td>
                  <td className="source-table__num">{row.open}</td>
                  <td className="source-table__num">{row.resolved}</td>
                  <td className="source-table__num">{row.high}</td>
                  <td>
                    <div className="rate-cell">
                      <span className="rate-cell__bar">
                        <span
                          className="rate-cell__fill"
                          style={{
                            '--rate-width': `${percent(
                              row.resolved,
                              row.total,
                            )}%`,
                            '--rate-color': row.color,
                          }}
                        />
                      </span>
                      <span className="rate-cell__value">
                        {percent(row.resolved, row.total)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
