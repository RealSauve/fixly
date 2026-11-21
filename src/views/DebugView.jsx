import { useComplaints } from '../hooks/useComplaints'
import { useToast } from '../hooks/useToast'
import { formatFullDate, formatRelativeTime } from '../lib/format'
import Toast from '../components/Toast'

const STATUS_ACTIONS = ['New', 'In Progress', 'Waiting on Customer', 'Resolved']

export default function DebugView() {
  const {
    complaints,
    staff,
    currentUser,
    storageStatus,
    updateStatus,
    resetData,
  } = useComplaints()
  const { toast, showToast } = useToast()

  const first = complaints[0]

  function handleStatus(status) {
    if (!first) return
    const updated = updateStatus(first.id, status)
    if (updated) showToast(`Status updated to ${status}`)
  }

  function handleReset() {
    const confirmed = window.confirm(
      'Reset demo data? This replaces everything in this browser.',
    )
    if (!confirmed) return

    resetData()
    showToast('Demo data restored')
  }

  return (
    <section className="debug">
      <div className="debug__header">
        <div>
          <p className="debug__eyebrow">Temporary debug view</p>
          <h1 className="debug__title">{complaints.length} complaints</h1>
          <p className="debug__meta">
            Signed in as {currentUser.name} · {staff.length} staff · storage:{' '}
            {storageStatus}
          </p>
        </div>
        <button
          className="button button--secondary"
          type="button"
          onClick={handleReset}
        >
          Reset demo data
        </button>
      </div>

      {first ? (
        <article className="debug__card">
          <p className="debug__reference">{first.reference}</p>
          <h2 className="debug__subject">{first.subject}</h2>
          <p className="debug__meta">
            {first.customerName} · {first.status} · {first.priority} · updated{' '}
            <span title={formatFullDate(first.updatedAt)}>
              {formatRelativeTime(first.updatedAt)}
            </span>
          </p>
          <div className="debug__actions">
            {STATUS_ACTIONS.map((status) => (
              <button
                key={status}
                className="button button--secondary"
                type="button"
                onClick={() => handleStatus(status)}
                disabled={first.status === status}
              >
                Set {status}
              </button>
            ))}
          </div>
        </article>
      ) : (
        <p className="debug__meta">No complaints yet.</p>
      )}

      <div className="debug__list">
        {complaints.map((complaint) => (
          <div className="debug__row" key={complaint.id}>
            <span className="debug__reference">{complaint.reference}</span>
            <span>{complaint.subject}</span>
            <span className="debug__meta">{complaint.status}</span>
          </div>
        ))}
      </div>

      {toast ? <Toast key={toast.id} toast={toast} /> : null}
    </section>
  )
}
