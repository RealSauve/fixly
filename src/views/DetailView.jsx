import { IconArrowLeft } from '@tabler/icons-react'
import Field from '../components/Field'
import Timeline from '../components/Timeline'
import { PRIORITIES, STATUSES } from '../lib/constants'
import { formatDate, formatFullDate } from '../lib/format'

function MetaRow({ label, value }) {
  return (
    <div className="detail__meta-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export default function DetailView({
  complaint,
  events,
  staff,
  updateStatus,
  updatePriority,
  updateAssignee,
  addNote,
  showToast,
  backHref = '#/',
}) {
  function handleStatusChange(event) {
    const updated = updateStatus(complaint.id, event.target.value)
    if (updated) showToast('Status updated')
  }

  function handlePriorityChange(event) {
    const updated = updatePriority(complaint.id, event.target.value)
    if (updated) showToast('Priority updated')
  }

  function handleAssigneeChange(event) {
    const updated = updateAssignee(complaint.id, event.target.value)
    if (!updated) return

    const name = staff.find((person) => person.id === event.target.value)?.name
    showToast(name ? `Assigned to ${name}` : 'Unassigned')
  }

  return (
    <section className="detail">
      <header className="detail__header">
        <a className="back-link" href={backHref}>
          <IconArrowLeft size={16} stroke={1.5} aria-hidden="true" />
          Back to complaints
        </a>
        <p className="reference detail__reference">{complaint.reference}</p>
        <h1 className="detail__title">{complaint.subject}</h1>
        <p className="detail__created">
          Created {formatDate(complaint.createdAt)}
        </p>
      </header>

      <div className="detail__grid">
        <div className="detail__main">
          <section className="card">
            <h2 className="card__title">Description</h2>
            <p className="detail__description">{complaint.description}</p>
          </section>

          <section className="card">
            <h2 className="card__title">Customer</h2>
            <p className="detail__customer-name">{complaint.customerName}</p>
            <dl className="detail__contact">
              <div className="detail__contact-row">
                <dt>Email</dt>
                <dd>
                  {complaint.customerEmail ? (
                    <a href={`mailto:${complaint.customerEmail}`}>
                      {complaint.customerEmail}
                    </a>
                  ) : (
                    <span className="detail__muted">Not provided</span>
                  )}
                </dd>
              </div>
              <div className="detail__contact-row">
                <dt>Phone</dt>
                <dd>
                  {complaint.customerPhone ? (
                    <a href={`tel:${complaint.customerPhone}`}>
                      {complaint.customerPhone}
                    </a>
                  ) : (
                    <span className="detail__muted">Not provided</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <Timeline
            events={events}
            staff={staff}
            onAddNote={(text) => addNote(complaint.id, text)}
          />
        </div>

        <aside className="detail__panel">
          <section className="card">
            <h2 className="card__title">Details</h2>

            <div className="detail__fields">
              <Field id="detail-status" label="Status">
                <select
                  className="field__select"
                  id="detail-status"
                  value={complaint.status}
                  onChange={handleStatusChange}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="detail-priority" label="Priority">
                <select
                  className="field__select"
                  id="detail-priority"
                  value={complaint.priority}
                  onChange={handlePriorityChange}
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="detail-assignee" label="Assigned to">
                <select
                  className="field__select"
                  id="detail-assignee"
                  value={complaint.assigneeId ?? ''}
                  onChange={handleAssigneeChange}
                >
                  <option value="">Unassigned</option>
                  {staff.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <dl className="detail__meta">
              <MetaRow label="Category" value={complaint.category} />
              <MetaRow
                label="Created"
                value={formatFullDate(complaint.createdAt)}
              />
              <MetaRow
                label="Last updated"
                value={formatFullDate(complaint.updatedAt)}
              />
              {complaint.resolvedAt ? (
                <MetaRow
                  label="Resolved"
                  value={formatFullDate(complaint.resolvedAt)}
                />
              ) : null}
            </dl>
          </section>
        </aside>
      </div>
    </section>
  )
}
