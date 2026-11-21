import { IconAlertTriangle, IconCheck } from '@tabler/icons-react'

export default function Toast({ toast }) {
  if (!toast) return null

  const Icon = toast.tone === 'error' ? IconAlertTriangle : IconCheck

  return (
    <div className={`toast toast--${toast.tone}`} role="status" aria-live="polite">
      <Icon size={18} stroke={1.5} aria-hidden="true" />
      <span>{toast.message}</span>
    </div>
  )
}
