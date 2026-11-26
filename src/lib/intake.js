import { CATEGORIES, PRIORITIES } from './constants'
import { validateComplaint } from './validate'

// Every local channel maps to an existing complaint source. This is what makes
// webhook and website submissions show up under Complaints and Sources.
export const INTAKE_SOURCES = {
  webhook: 'Webhook',
  website: 'Website',
  email: 'Email',
  instagram: 'Instagram',
  facebook: 'Facebook',
  x: 'X/Twitter',
}

export const SAMPLE_PAYLOAD = {
  name: 'Halima Bello',
  email: 'halima.bello@example.com',
  phone: '+234 803 555 0142',
  subject: 'Transfer failed twice',
  message:
    'I was charged for a transfer that never completed. Please check reference TXN-88421 and reverse the duplicate debit.',
  category: 'Billing & Refunds',
  priority: 'High',
}

function firstValue(payload, keys) {
  for (const key of keys) {
    const value = payload?.[key]
    if (value !== undefined && value !== null && String(value).trim()) {
      return value
    }
  }
  return ''
}

export function normaliseIntakePayload(payload, channel = 'webhook') {
  const source = INTAKE_SOURCES[channel] ?? INTAKE_SOURCES.webhook
  const category = firstValue(payload, ['category'])
  const priority = firstValue(payload, ['priority'])

  const values = {
    customerName: firstValue(payload, ['customerName', 'name']),
    customerEmail: firstValue(payload, ['customerEmail', 'email']),
    customerPhone: firstValue(payload, ['customerPhone', 'phone']),
    subject: firstValue(payload, ['subject', 'title']),
    description: firstValue(payload, ['description', 'message']),
    category: CATEGORIES.includes(category) ? category : 'Other',
    source,
    priority: PRIORITIES.includes(priority) ? priority : 'Medium',
  }

  return { values, errors: validateComplaint(values), source }
}

// One handler for the test button, the website preview and the hosted form.
// A real hosted endpoint would call the same code after verifying the secret.
export function createIntakeHandler({
  createComplaint,
  recordDelivery,
  isEnabled,
}) {
  return function submitIntake(payload, channel = 'webhook') {
    const source = INTAKE_SOURCES[channel] ?? INTAKE_SOURCES.webhook

    if (isEnabled && !isEnabled(channel)) {
      const error = 'Connect this channel before sending a ticket.'
      const delivery = recordDelivery({
        channel,
        source,
        status: 'failed',
        message: error,
      })
      return { ok: false, error, delivery }
    }

    const { values, errors } = normaliseIntakePayload(payload, channel)
    const error = Object.values(errors)[0]

    if (error) {
      const delivery = recordDelivery({
        channel,
        source,
        status: 'failed',
        message: error,
      })
      return { ok: false, error, delivery, errors }
    }

    const complaint = createComplaint(values)
    const delivery = recordDelivery({
      channel,
      source,
      status: 'received',
      complaintId: complaint.id,
      reference: complaint.reference,
      message: 'Ticket created',
    })

    return {
      ok: true,
      complaint,
      delivery,
      response: {
        ok: true,
        reference: complaint.reference,
        receivedAt: delivery.createdAt,
      },
    }
  }
}
