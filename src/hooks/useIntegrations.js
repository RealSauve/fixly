import { useCallback, useMemo } from 'react'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandX,
  IconMailForward,
  IconWebhook,
  IconWorld,
} from '@tabler/icons-react'
import {
  createIntakeHandler,
  INTAKE_SOURCES,
  SAMPLE_PAYLOAD,
} from '../lib/intake'

export const WEBHOOK_ENDPOINT = 'https://fixly.example/api/integrations/webhook'
export const EMAIL_ADDRESS = 'tickets@fixly.example'
export const HOSTED_FORM_HASH = '#/intake/website'

// The catalogue is fixed: these are the channels this browser-only prototype
// can describe honestly. Counts always come from the complaint data.
export const CHANNELS = [
  {
    id: 'webhook',
    label: 'Webhook',
    source: INTAKE_SOURCES.webhook,
    icon: IconWebhook,
    kind: 'api',
    description: 'Send a JSON ticket from another app or workflow tool.',
  },
  {
    id: 'website',
    label: 'Website form',
    source: INTAKE_SOURCES.website,
    icon: IconWorld,
    kind: 'api',
    description: 'Use the hosted form or add a small form to your site.',
  },
  {
    id: 'email',
    label: 'Email forwarding',
    source: INTAKE_SOURCES.email,
    icon: IconMailForward,
    kind: 'address',
    description: 'Give customers one address that forwards into the queue.',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    source: INTAKE_SOURCES.instagram,
    icon: IconBrandInstagram,
    kind: 'oauth',
    description: 'Bring direct messages from a business account into Fixly.',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    source: INTAKE_SOURCES.facebook,
    icon: IconBrandFacebook,
    kind: 'oauth',
    description: 'Bring page messages into the same support queue.',
  },
  {
    id: 'x',
    label: 'X/Twitter',
    source: INTAKE_SOURCES.x,
    icon: IconBrandX,
    kind: 'oauth',
    description: 'Capture mentions and direct messages as tickets.',
  },
]

function makeSecret() {
  const bytes = new Uint8Array(16)
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function useIntegrations({
  complaints,
  integrations,
  deliveries,
  createComplaint,
  recordDelivery,
  saveIntegration,
  showToast,
}) {
  const connections = useMemo(
    () => new Map(integrations.map((item) => [item.id, item])),
    [integrations],
  )

  const channels = useMemo(
    () =>
      CHANNELS.map((channel) => {
        const connection = connections.get(channel.id)
        const connected = Boolean(connection?.enabled)
        return {
          ...channel,
          connection,
          connected,
          count: complaints.filter(
            (complaint) => complaint.source === channel.source,
          ).length,
          status:
            channel.kind === 'address'
              ? 'Gateway needed'
              : connected
                ? 'Connected'
                : 'Not connected',
        }
      }),
    [complaints, connections],
  )

  const isEnabled = useCallback(
    (id) => Boolean(connections.get(id)?.enabled),
    [connections],
  )

  const connect = useCallback(
    (id) => {
      const channel = CHANNELS.find((item) => item.id === id)
      if (!channel || !['api', 'oauth'].includes(channel.kind)) return false

      const existing = connections.get(id)
      const now = new Date().toISOString()
      saveIntegration(id, {
        enabled: true,
        secret: existing?.secret ?? makeSecret(),
        connectedAt: existing?.connectedAt ?? now,
      })
      showToast(`${channel.label} connected in this browser`)
      return true
    },
    [connections, saveIntegration, showToast],
  )

  const disconnect = useCallback(
    (id) => {
      const channel = CHANNELS.find((item) => item.id === id)
      if (!channel) return
      saveIntegration(id, { enabled: false })
      showToast(`${channel.label} disconnected in this browser`)
    },
    [saveIntegration, showToast],
  )

  const toggle = useCallback(
    (id) => {
      const channel = CHANNELS.find((item) => item.id === id)
      if (!channel || channel.kind === 'address') return
      if (isEnabled(id)) disconnect(id)
      else connect(id)
    },
    [connect, disconnect, isEnabled],
  )

  const regenerateSecret = useCallback(
    (id) => {
      const confirmed = window.confirm(
        'Replace this browser secret? Copy the new value once it is shown.',
      )
      if (!confirmed) return false

      saveIntegration(id, { secret: makeSecret(), rotatedAt: new Date().toISOString() })
      showToast('Secret replaced')
      return true
    },
    [saveIntegration, showToast],
  )

  const submitIntake = useMemo(
    () =>
      createIntakeHandler({
        createComplaint,
        recordDelivery,
        isEnabled,
      }),
    [createComplaint, recordDelivery, isEnabled],
  )

  const sendTest = useCallback(() => {
    const result = submitIntake(SAMPLE_PAYLOAD, 'webhook')
    if (result.ok) {
      showToast(`Test ticket ${result.complaint.reference} received`)
    } else {
      showToast(result.error, 'error')
    }
    return result
  }, [submitIntake, showToast])

  return {
    channels,
    deliveries,
    isEnabled,
    connect,
    disconnect,
    toggle,
    webhookEndpoint: WEBHOOK_ENDPOINT,
    emailAddress: EMAIL_ADDRESS,
    regenerateSecret,
    submitIntake,
    sendTest,
    samplePayload: SAMPLE_PAYLOAD,
  }
}