import { buildMetrics, categoryBreakdown, sourceBreakdown } from './analytics'

// Local-only assistant. Every answer is computed from the current ticket data;
// nothing is sent anywhere and no model is called.
export const ASK_AI_QUESTIONS = [
  { id: 'attention', label: 'What needs attention now?' },
  { id: 'channel', label: 'Which channel is busiest?' },
  { id: 'category', label: 'Which issue is most common?' },
  { id: 'queue', label: 'How is the queue doing?' },
]

export function answerQuestion(id, complaints) {
  const metrics = buildMetrics(complaints)

  if (metrics.total === 0) {
    return 'There are no tickets in this browser yet.'
  }

  if (id === 'attention') {
    return `${metrics.new} new and ${metrics.highOpen} high-priority tickets are still active. ${metrics.waiting} are waiting on customers.`
  }

  if (id === 'channel') {
    const [top] = sourceBreakdown(complaints)
    return top
      ? `${top.label} is the busiest channel with ${top.value} of ${metrics.total} tickets.`
      : 'No channel data is available yet.'
  }

  if (id === 'category') {
    const [top] = categoryBreakdown(complaints)
    return top
      ? `${top.label} is the most common issue with ${top.value} of ${metrics.total} tickets.`
      : 'No category data is available yet.'
  }

  if (id === 'queue') {
    return `${metrics.active} of ${metrics.total} tickets are still active. ${metrics.resolved} are resolved.`
  }

  return 'Ask one of the questions above.'
}
