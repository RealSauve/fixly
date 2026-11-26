import { useEffect, useState } from 'react'
import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconEye,
  IconEyeOff,
  IconRefresh,
} from '@tabler/icons-react'
import IntakeForm from '../components/IntakeForm'
import SortHeader from '../components/SortHeader'
import TableFooter, { useTablePagination } from '../components/TableFooter'
import { formatRelativeTime } from '../lib/format'
import { signPayload } from '../lib/signature'
import { HOSTED_FORM_HASH } from '../hooks/useIntegrations'

const PAYLOAD_FIELDS = [
  ['name', 'string', 'Yes', 'Customer name, 2–80 characters'],
  ['email', 'string', 'Email or phone', 'Valid email address'],
  ['phone', 'string', 'Email or phone', 'Optional when email is present'],
  ['subject', 'string', 'Yes', 'Ticket subject, 3–100 characters'],
  ['message', 'string', 'Yes', 'Details, 10–1000 characters'],
  ['category', 'string', 'Yes', 'One of the ticket categories'],
  ['priority', 'string', 'No', 'Low, Medium or High; defaults to Medium'],
]

const VERIFY_SNIPPET = `import { createHmac, timingSafeEqual } from 'node:crypto'

const expected = createHmac('sha256', process.env.FIXLY_WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex')
const received = String(req.headers['x-fixly-signature'])
  .replace(/^sha256=/, '')
const ok =
  received.length === expected.length &&
  timingSafeEqual(Buffer.from(received, 'hex'), Buffer.from(expected, 'hex'))

if (!ok) return res.status(401).send('Invalid signature')`

function StatusPill({ channel }) {
  const tone = channel.connected
    ? 'connected'
    : channel.kind === 'address'
      ? 'setup'
      : 'off'

  return (
    <span className={`status-pill status-pill--${tone}`}>
      <span className="status-pill__dot" />
      {channel.status}
    </span>
  )
}

function CodeBlock({ label, value, onCopy }) {
  return (
    <div className="code-block">
      <div className="code-block__head">
        <span>{label}</span>
        {onCopy ? (
          <button className="button button--text" type="button" onClick={onCopy}>
            <IconCopy size={14} aria-hidden="true" />
            Copy
          </button>
        ) : null}
      </div>
      <pre className="code-block__pre">
        <code>{value}</code>
      </pre>
    </div>
  )
}

function Toggle({ checked, onChange, label, showLabel = false }) {
  return (
    <label className="toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
      />
      <span className="toggle__track" aria-hidden="true">
        <span className="toggle__thumb" />
      </span>
      {showLabel ? <span className="toggle__label">{label}</span> : null}
    </label>
  )
}

function PayloadFields() {
  const [sort, setSort] = useState({ key: 'name', direction: 'asc' })
  const rows = PAYLOAD_FIELDS.map(([name, type, required, note]) => ({
    name,
    type,
    required,
    note,
  })).sort((a, b) => {
    const result = String(a[sort.key]).localeCompare(String(b[sort.key]))
    return sort.direction === 'asc' ? result : -result
  })
  const pagination = useTablePagination(
    rows,
    4,
    `${sort.key}:${sort.direction}`,
  )

  return (
    <div className="data-table fields-table__wrap">
      <div className="table-wrap">
        <table className="table fields-table">
          <thead>
            <tr>
              <SortHeader
                label="Field"
                sortKey="name"
                sort={sort}
                onSortChange={setSort}
              />
              <SortHeader
                label="Type"
                sortKey="type"
                sort={sort}
                onSortChange={setSort}
              />
              <SortHeader
                label="Required"
                sortKey="required"
                sort={sort}
                onSortChange={setSort}
              />
              <SortHeader
                label="Notes"
                sortKey="note"
                sort={sort}
                onSortChange={setSort}
              />
            </tr>
          </thead>
          <tbody>
            {pagination.pageRows.map((row) => (
              <tr key={row.name}>
                <td>
                  <code className="code-inline">{row.name}</code>
                </td>
                <td>{row.type}</td>
                <td>{row.required}</td>
                <td>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TableFooter {...pagination} />
    </div>
  )
}

function OAuthCards({ channels, toggle }) {
  return (
    <div className="oauth-cards">
      {channels
        .filter((channel) => channel.kind === 'oauth')
        .map((channel) => {
          const Icon = channel.icon
          return (
            <div className="oauth-card" key={channel.id}>
              <span className="icon-slot oauth-card__icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div className="oauth-card__body">
                <strong>{channel.label}</strong>
                <span>
                  {channel.connected
                    ? 'Connected in this browser'
                    : 'Not connected'}
                </span>
              </div>
              <Toggle
                checked={channel.connected}
                onChange={() => toggle(channel.id)}
                label={`${channel.label} connection`}
              />
            </div>
          )
        })}
    </div>
  )
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    // Clipboard access can be blocked; fall back to a temporary selection.
    const area = document.createElement('textarea')
    area.value = value
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(area)
    return copied
  }
}

export default function IntegrationsView({
  channels,
  deliveries,
  connect,
  disconnect,
  toggle,
  regenerateSecret,
  sendTest,
  submitIntake,
  samplePayload,
  webhookEndpoint,
  emailAddress,
  showToast,
}) {
  const [selectedId, setSelectedId] = useState('webhook')
  const [revealed, setRevealed] = useState(false)
  const [signature, setSignature] = useState('')

  const webhook = channels.find((channel) => channel.id === 'webhook')
  const website = channels.find((channel) => channel.id === 'website')
  const selected = channels.find((channel) => channel.id === selectedId)

  const secret = webhook?.connection?.secret ?? ''

  useEffect(() => {
    let cancelled = false
    if (!secret) {
      setSignature('')
      return () => {
        cancelled = true
      }
    }
    signPayload(secret, samplePayload).then((value) => {
      if (!cancelled) setSignature(value)
    })
    return () => {
      cancelled = true
    }
  }, [secret, samplePayload])

  async function handleCopy(value, label) {
    const copied = await copyText(value)
    showToast(
      copied ? `${label} copied` : `Could not copy ${label.toLowerCase()}`,
      copied ? 'success' : 'error',
    )
  }

  function handleChannelAction(channel) {
    setSelectedId(channel.id)
    if (channel.kind !== 'address' && !channel.connected && !channel.kind === 'oauth') {
      connect(channel.id)
    }
  }

  const payloadJson = JSON.stringify(samplePayload, null, 2)
  const signatureHeader = signature ? `sha256=${signature}` : ''
  const signaturePreview =
    signatureHeader || 'Connect webhook to preview the signature'
  const headersText = `Content-Type: application/json
X-Fixly-Signature: ${signatureHeader || 'sha256=<hmac of raw body>'}
X-Fixly-Secret: <your signing secret>`
  const curl = `curl --request POST \\\n  --url ${webhookEndpoint} \\\n  --header 'Content-Type: application/json' \\\n  --header 'X-Fixly-Signature: ${signatureHeader || 'sha256=<hmac of raw body>'}' \\\n  --data '${payloadJson}'`
  const responseJson = JSON.stringify(
    {
      ok: true,
      reference: 'CMP-0169',
      receivedAt: '2026-11-26T10:24:00.000Z',
    },
    null,
    2,
  )
  const embedUrl = `${window.location.origin}/${HOSTED_FORM_HASH}`
  const websiteSnippet = `<iframe
  src="${embedUrl}"
  title="Contact Fixly"
  width="100%"
  height="620"
  loading="lazy"
></iframe>`

  function renderSetup() {
    if (!selected) return null

    if (selected.id === 'webhook') {
      return (
        <section className="panel setup-panel" aria-labelledby="webhook-setup-title">
          <div className="setup-panel__head">
            <div>
              <h3 className="setup-panel__title" id="webhook-setup-title">
                Webhook setup
              </h3>
              <p className="setup-panel__sub">
                Configure your app to POST a JSON ticket to this endpoint.
              </p>
            </div>
            <StatusPill channel={webhook} />
          </div>

          <div className="notice">
            <IconAlertCircle size={18} aria-hidden="true" />
            <p>
              <strong>Browser-only prototype.</strong> The URL below is a
              sample endpoint, not a live one. “Send test ticket” uses the same
              local intake handler a hosted endpoint would call.
            </p>
          </div>

          <div className="setup-fields">
            <div className="setup-field">
              <span className="setup-field__label">Endpoint</span>
              <div className="value-row">
                <code className="code-inline">{webhookEndpoint}</code>
                <button
                  className="button button--secondary button--small"
                  type="button"
                  onClick={() => handleCopy(webhookEndpoint, 'Endpoint')}
                >
                  <IconCopy size={14} aria-hidden="true" />
                  Copy
                </button>
              </div>
            </div>

            <div className="setup-field">
              <span className="setup-field__label">Signing secret</span>
              <div className="value-row">
                <code className="code-inline">
                  {revealed ? secret : secret ? '••••••••••••••••••••••••••••••••' : 'Not generated yet'}
                </code>
                <button
                  className="button button--secondary button--small"
                  type="button"
                  disabled={!secret}
                  aria-label={revealed ? 'Hide secret' : 'Show secret'}
                  onClick={() => setRevealed((value) => !value)}
                >
                  {revealed ? (
                    <IconEyeOff size={14} aria-hidden="true" />
                  ) : (
                    <IconEye size={14} aria-hidden="true" />
                  )}
                  {revealed ? 'Hide' : 'Show'}
                </button>
                <button
                  className="button button--secondary button--small"
                  type="button"
                  disabled={!secret}
                  onClick={() => handleCopy(secret, 'Secret')}
                >
                  <IconCopy size={14} aria-hidden="true" />
                  Copy
                </button>
                <button
                  className="button button--secondary button--small"
                  type="button"
                  disabled={!secret}
                  onClick={() => {
                    if (regenerateSecret('webhook')) setRevealed(true)
                  }}
                >
                  <IconRefresh size={14} aria-hidden="true" />
                  Regenerate
                </button>
              </div>
            </div>

            <div className="setup-field">
              <span className="setup-field__label">Signature preview</span>
              <div className="value-row">
                <code className="code-inline">{signaturePreview}</code>
                {signatureHeader ? (
                  <button
                    className="button button--secondary button--small"
                    type="button"
                    onClick={() => handleCopy(signatureHeader, 'Signature')}
                  >
                    <IconCopy size={14} aria-hidden="true" />
                    Copy
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="setup-actions">
            <button
              className="button button--primary"
              type="button"
              disabled={!webhook?.connected}
              onClick={sendTest}
            >
              <IconCheck size={16} aria-hidden="true" />
              Send test ticket
            </button>
            <Toggle
              checked={Boolean(webhook?.connected)}
              onChange={() => toggle('webhook')}
              label="Webhook enabled"
              showLabel
            />
          </div>

          <div className="docs">
            <h4 className="docs__title">Payload fields</h4>
            <PayloadFields />
            <h4 className="docs__title">Example JSON</h4>
            <CodeBlock
              label="application/json"
              value={payloadJson}
              onCopy={() => handleCopy(payloadJson, 'Payload')}
            />
            <h4 className="docs__title">Headers</h4>
            <CodeBlock
              label="HTTP"
              value={headersText}
              onCopy={() => handleCopy(headersText, 'Headers')}
            />
            <h4 className="docs__title">Signature verification</h4>
            <CodeBlock
              label="Node.js"
              value={VERIFY_SNIPPET}
              onCopy={() => handleCopy(VERIFY_SNIPPET, 'Verification example')}
            />
            <h4 className="docs__title">Request</h4>
            <CodeBlock
              label="cURL"
              value={curl}
              onCopy={() => handleCopy(curl, 'cURL example')}
            />
            <h4 className="docs__title">Response</h4>
            <CodeBlock label="201 Created" value={responseJson} />
          </div>
        </section>
      )
    }

    if (selected.id === 'website') {
      return (
        <section className="panel setup-panel" aria-labelledby="website-setup-title">
          <div className="setup-panel__head">
            <div>
              <h3 className="setup-panel__title" id="website-setup-title">
                Website form
              </h3>
              <p className="setup-panel__sub">
                Embed the hosted form or open it as a standalone page.
              </p>
            </div>
            <StatusPill channel={website} />
          </div>

          <div className="notice">
            <IconAlertCircle size={18} aria-hidden="true" />
            <p>
              <strong>Local preview.</strong> The form submits through this
              browser’s intake handler. The embed snippet is a reference for a
              hosted page; a static site cannot accept the POST itself.
            </p>
          </div>

          <div className="setup-fields">
            <div className="setup-field">
              <span className="setup-field__label">Hosted link</span>
              <div className="value-row">
                <code className="code-inline">{embedUrl}</code>
                <a
                  className="button button--secondary button--small"
                  href={HOSTED_FORM_HASH}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconExternalLink size={14} aria-hidden="true" />
                  Open
                </a>
              </div>
            </div>
          </div>

          <div className="setup-actions">
            <Toggle
              checked={Boolean(website?.connected)}
              onChange={() => toggle('website')}
              label="Website form enabled"
              showLabel
            />
          </div>

          <div className="docs">
            <h4 className="docs__title">Embed snippet</h4>
            <CodeBlock
              label="HTML"
              value={websiteSnippet}
              onCopy={() => handleCopy(websiteSnippet, 'Embed snippet')}
            />
          </div>

          <div className="preview">
            <div className="preview__bar">
              <span className="preview__label">Live preview</span>
              <span className="preview__url">fixly.example/intake/website</span>
            </div>
            <div className="preview__body">
              <IntakeForm
                onSubmit={submitIntake}
                heading="Send us a ticket"
                description="This preview writes straight into the local ticket queue."
                buttonLabel="Submit preview"
              />
            </div>
          </div>
        </section>
      )
    }

    if (selected.id === 'email') {
      return (
        <section className="panel setup-panel" aria-labelledby="email-setup-title">
          <div className="setup-panel__head">
            <div>
              <h3 className="setup-panel__title" id="email-setup-title">
                Email forwarding
              </h3>
              <p className="setup-panel__sub">
                One unique address to share with customers, mapped to Email
                tickets.
              </p>
            </div>
            <StatusPill channel={selected} />
          </div>

          <div className="notice">
            <IconAlertCircle size={18} aria-hidden="true" />
            <p>
              <strong>No mailbox is monitored here.</strong> Production needs a
              mail gateway that verifies the sender and calls the same intake
              handler.
            </p>
          </div>

          <div className="setup-fields">
            <div className="setup-field">
              <span className="setup-field__label">Forwarding address</span>
              <div className="value-row">
                <code className="code-inline">{emailAddress}</code>
                <button
                  className="button button--secondary button--small"
                  type="button"
                  onClick={() => handleCopy(emailAddress, 'Address')}
                >
                  <IconCopy size={14} aria-hidden="true" />
                  Copy
                </button>
              </div>
            </div>

            <ol className="setup-steps">
              <li>Copy the forwarding address above.</li>
              <li>In your mail provider, forward your support inbox to it.</li>
              <li>Keep the original subject; it becomes the ticket subject.</li>
              <li>Send a test message and check the delivery log.</li>
            </ol>
          </div>
        </section>
      )
    }

    return (
      <section className="panel setup-panel" aria-labelledby="oauth-setup-title">
        <div className="setup-panel__head">
          <div>
            <h3 className="setup-panel__title" id="oauth-setup-title">
              Social channels
            </h3>
            <p className="setup-panel__sub">
              Turn a channel on locally to preview how its tickets would land
              in the queue.
            </p>
          </div>
        </div>

        <div className="notice">
          <IconAlertCircle size={18} aria-hidden="true" />
          <p>
            <strong>Local connections only.</strong> No provider sign-in is
            performed and no messages are read. Production needs a provider app,
            a server-side token exchange and webhook verification.
          </p>
        </div>

        <OAuthCards channels={channels} toggle={toggle} />
      </section>
    )
  }

  return (
    <section className="integrations" aria-label="Integrations settings">
      <div className="integrations__intro">
        <div>
          <h2 className="integrations__title">Channels</h2>
          <p className="integrations__subtitle">
            Connect an intake source. Every submission becomes a ticket with
            a matching source tag.
          </p>
        </div>
        <div className="integrations__scope">
          <IconAlertCircle size={16} aria-hidden="true" />
          <span>Local prototype · no external service called</span>
        </div>
      </div>

      <div className="integrations__layout">
        <div className="integrations__primary">
          <section className="panel channel-panel" aria-labelledby="channel-list-title">
            <div className="panel__head">
              <div>
                <h3 className="panel__title" id="channel-list-title">
                  Available channels
                </h3>
                <p className="panel__sub">
                  Counts come from tickets already in this browser.
                </p>
              </div>
            </div>

            <div className="channel-list" role="list">
              {channels.map((channel) => {
                const Icon = channel.icon
                return (
                  <div
                    className={`channel-row${
                      selectedId === channel.id ? ' is-selected' : ''
                    }`}
                    key={channel.id}
                    role="listitem"
                  >
                    <span className="icon-slot channel-row__icon">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div className="channel-row__body">
                      <strong>{channel.label}</strong>
                      <span>{channel.description}</span>
                    </div>
                    <div className="channel-row__count">
                      <strong className="num">{channel.count}</strong>
                      <span>tickets</span>
                    </div>
                    <StatusPill channel={channel} />
                    <button
                      className="button button--secondary button--small"
                      type="button"
                      onClick={() => handleChannelAction(channel)}
                    >
                      {channel.kind === 'address'
                        ? 'View address'
                        : channel.connected
                          ? 'Manage'
                          : 'Connect'}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          {renderSetup()}
        </div>

        <aside className="integrations__side">
          <section className="panel deliveries" aria-labelledby="deliveries-title">
            <div className="panel__head">
              <div>
                <h3 className="panel__title" id="deliveries-title">
                  Recent deliveries
                </h3>
                <p className="panel__sub">Test and form submissions.</p>
              </div>
              <span className="deliveries__count num">{deliveries.length}</span>
            </div>

            {deliveries.length === 0 ? (
              <p className="deliveries__empty">
                Nothing received yet. Send a test ticket or use the website
                preview.
              </p>
            ) : (
              <ul className="delivery-list">
                {deliveries.slice(0, 12).map((delivery) => (
                  <li className="delivery-item" key={delivery.id}>
                    <div className="delivery-item__top">
                      <strong>{delivery.source}</strong>
                      <span
                        className={`delivery-item__status delivery-item__status--${delivery.status}`}
                      >
                        {delivery.status}
                      </span>
                    </div>
                    <p className="delivery-item__message">
                      {delivery.reference
                        ? `${delivery.reference} · ${delivery.message}`
                        : delivery.message}
                    </p>
                    <time className="delivery-item__time" dateTime={delivery.createdAt}>
                      {formatRelativeTime(delivery.createdAt)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel source-map" aria-labelledby="source-map-title">
            <div className="panel__head">
              <div>
                <h3 className="panel__title" id="source-map-title">
                  Source mapping
                </h3>
                <p className="panel__sub">
                  Incoming tickets appear under these sources.
                </p>
              </div>
            </div>
            <ul className="source-map__list">
              {channels.map((channel) => (
                <li key={channel.id}>
                  <span>{channel.label}</span>
                  <span className="source-map__arrow" aria-hidden="true">
                    →
                  </span>
                  <span>{channel.source}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </section>
  )
}
