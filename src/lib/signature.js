// Browser-side preview of the webhook signature. A hosted receiver would do
// the same HMAC check on the server before creating a ticket.
export async function signPayload(secret, payload) {
  if (!secret || !globalThis.crypto?.subtle) return ''

  const body = JSON.stringify(payload)
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const buffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body))

  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
