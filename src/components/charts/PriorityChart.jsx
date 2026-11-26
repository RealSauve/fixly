import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { axisTick, chartColors, niceTicks } from './chartTheme'

export default function PriorityChart({ items, max }) {
  const { ticks, top } = niceTicks(max ?? Math.max(1, ...items.map((item) => item.value)))
  const label = items.map((item) => `${item.label}: ${item.value}`).join(', ')

  return (
    <div
      className="priority-chart"
      role="img"
      aria-label={`Priority breakdown. ${label}.`}
    >
      <div className="priority-chart__plot">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={items}
            accessibilityLayer={false}
            margin={{ top: 8, right: 6, bottom: 0, left: -12 }}
          >
            <CartesianGrid
              vertical={false}
              stroke={chartColors.grid}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="label"
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
              width={34}
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Bar
              dataKey="value"
              barSize={18}
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
            >
              {items.map((item) => (
                <Cell key={item.key ?? item.label} fill={item.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
