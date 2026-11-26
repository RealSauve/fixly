// Chart styling stays in the existing design tokens. Recharts receives token
// references, while tick typography and grid rules live in dashboard.css.
export const chartColors = {
  primary: 'var(--chart-primary)',
  secondary: 'var(--chart-secondary)',
  grid: 'var(--chart-grid)',
  guide: 'var(--chart-guide)',
  band: 'var(--chart-band)',
  surface: 'var(--surface)',
  ink: 'var(--ink)',
}

export const axisTick = { className: 'chart-axis__tick' }

export function formatTickets(value) {
  return `${value} ${value === 1 ? 'ticket' : 'tickets'}`
}

export function niceTicks(max) {
  const target = Math.max(1, max / 4)
  const magnitude = 10 ** Math.floor(Math.log10(target))
  const step = [1, 2, 5, 10].find((n) => n * magnitude >= target) * magnitude
  const top = Math.ceil(max / step) * step
  const ticks = []

  for (let value = 0; value <= top; value += step) ticks.push(value)
  return { ticks, top }
}
