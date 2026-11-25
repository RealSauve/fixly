import { useMemo, useState } from 'react'
import {
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react'
import ComplaintTable from '../components/ComplaintTable'
import EmptyState from '../components/EmptyState'
import Priority from '../components/Priority'
import Status from '../components/Status'
import { CURRENT_USER_ID, STATUSES } from '../lib/constants'
import { formatFullDate, formatRelativeTime } from '../lib/format'

const ALL = 'All'
const ACTIVE = 'All active'

function normalise(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function byCreatedAt(direction) {
  return (a, b) => {
    const diff = new Date(a.createdAt) - new Date(b.createdAt)
    if (diff !== 0) return direction === 'newest' ? -diff : diff
    return direction === 'newest'
      ? b.id.localeCompare(a.id, undefined, { numeric: true })
      : a.id.localeCompare(b.id, undefined, { numeric: true })
  }
}

// One headline sentence instead of stat tiles: complaints whose next reply
// is ours (New or In Progress), with the high-priority count called out.
function headlineFor(complaints) {
  if (complaints.length === 0) return null

  const waiting = complaints.filter(
    (complaint) =>
      complaint.status === 'New' || complaint.status === 'In Progress',
  )
  const high = waiting.filter(
    (complaint) => complaint.priority === 'High',
  ).length

  if (waiting.length === 0) return 'No complaints are waiting for a reply.'

  const head =
    waiting.length === 1
      ? '1 complaint is waiting for a reply'
      : `${waiting.length} complaints are waiting for a reply`

  if (high === 0) return `${head}.`
  if (waiting.length === 1) return `${head} and it is high priority.`
  return `${head}, ${high} of them high priority.`
}

// The sidebar view decides which complaints the list starts from.
function scopedList(view, complaints) {
  if (view === 'assigned') {
    return complaints.filter(
      (complaint) => complaint.assigneeId === CURRENT_USER_ID,
    )
  }
  if (view === 'unassigned') {
    return complaints.filter((complaint) => !complaint.assigneeId)
  }
  if (view === 'reviews') {
    // Review sources arrive in Part 2, so nothing matches yet.
    return complaints.filter((complaint) => Boolean(complaint.source))
  }
  return complaints
}

const EMPTY_TEXT = {
  reviews: 'No reviews yet.',
  assigned: 'Nothing assigned to you yet.',
  unassigned: 'Every complaint has an owner.',
}

function InboxRow({ complaint, selected, onOpen }) {
  return (
    <li>
      <button
        type="button"
        className={`inbox-row${selected ? ' is-selected' : ''}`}
        aria-current={selected ? 'true' : undefined}
        onClick={() => onOpen(complaint.id)}
      >
        <span className="inbox-row__top">
          <span className="reference">{complaint.reference}</span>
          <time
            className="inbox-row__time"
            dateTime={complaint.updatedAt}
            title={formatFullDate(complaint.updatedAt)}
          >
            {formatRelativeTime(complaint.updatedAt)}
          </time>
        </span>
        <span className="inbox-row__subject">{complaint.subject}</span>
        <span className="inbox-row__customer">{complaint.customerName}</span>
        <span className="inbox-row__meta">
          <Status value={complaint.status} />
          <Priority value={complaint.priority} />
        </span>
      </button>
    </li>
  )
}

export default function ComplaintsView({
  view,
  complaints,
  staff,
  query,
  onQueryChange,
  updateStatus,
  updateAssignee,
  showToast,
  navigate,
  onNew,
  renderDetail,
}) {
  const [status, setStatus] = useState(ALL)
  const [priority, setPriority] = useState(ALL)
  const [sort, setSort] = useState('newest')
  const [selectedId, setSelectedId] = useState(null)

  const scoped = useMemo(
    () => scopedList(view, complaints),
    [view, complaints],
  )

  const visible = useMemo(() => {
    const term = normalise(query)

    return scoped
      .filter((complaint) => {
        if (term) {
          const haystack = [
            complaint.reference,
            complaint.subject,
            complaint.customerName,
          ]
          if (!haystack.some((value) => normalise(value).includes(term))) {
            return false
          }
        }

        if (status === ACTIVE) {
          if (complaint.status === 'Resolved') return false
        } else if (status !== ALL && complaint.status !== status) {
          return false
        }

        if (priority !== ALL && complaint.priority !== priority) {
          return false
        }

        return true
      })
      .sort(byCreatedAt(sort))
  }, [scoped, query, status, priority, sort])

  const hasFilters = query.trim() !== '' || status !== ALL || priority !== ALL

  function clearFilters() {
    onQueryChange('')
    setStatus(ALL)
    setPriority(ALL)
  }

  function handleStatusChange(complaint, next) {
    const updated = updateStatus(complaint.id, next)
    if (updated) showToast('Status updated')
  }

  function handleAssigneeChange(complaint, next) {
    const updated = updateAssignee(complaint.id, next)
    if (!updated) return

    const name = staff.find((person) => person.id === next)?.name
    showToast(name ? `Assigned to ${name}` : 'Unassigned')
  }

  // In the split view a click selects the complaint; on narrow screens the
  // list and the complaint are separate screens, so it navigates instead.
  function openTicket(id) {
    const narrow = window.matchMedia('(max-width: 1023px)').matches
    if (narrow) navigate(`#/complaint/${id}`)
    else setSelectedId(id)
  }

  const countLabel = `${visible.length} ${
    visible.length === 1 ? 'complaint' : 'complaints'
  }`

  const toolbar = (
    <div className="toolbar">
      <select
        className="control toolbar__select"
        value={status}
        aria-label="Filter by status"
        onChange={(event) => setStatus(event.target.value)}
      >
        <option value={ALL}>All statuses</option>
        <option value={ACTIVE}>All active</option>
        {STATUSES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        className="control toolbar__select"
        value={priority}
        aria-label="Filter by priority"
        onChange={(event) => setPriority(event.target.value)}
      >
        <option value={ALL}>All priorities</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <button
        className="sort-toggle"
        type="button"
        aria-label={`Sort: ${sort === 'newest' ? 'Newest first' : 'Oldest first'}`}
        onClick={() =>
          setSort((current) => (current === 'newest' ? 'oldest' : 'newest'))
        }
      >
        {sort === 'newest' ? (
          <IconSortDescending size={18} stroke={1.5} aria-hidden="true" />
        ) : (
          <IconSortAscending size={18} stroke={1.5} aria-hidden="true" />
        )}
        {sort === 'newest' ? 'Newest first' : 'Oldest first'}
      </button>

      {hasFilters ? (
        <button
          className="button button--text"
          type="button"
          onClick={clearFilters}
        >
          Clear filters
        </button>
      ) : null}
    </div>
  )

  let listContent
  if (scoped.length === 0) {
    listContent = (
      <EmptyState
        text={EMPTY_TEXT[view] ?? 'No complaints yet. Log your first one.'}
        action={
          view === 'overview' || view === 'inbox'
            ? { label: 'New ticket', variant: 'primary', onClick: onNew }
            : undefined
        }
      />
    )
  } else if (visible.length === 0) {
    listContent = (
      <EmptyState
        text="No complaints match your filters."
        action={{
          label: 'Clear filters',
          variant: 'secondary',
          onClick: clearFilters,
        }}
      />
    )
  } else {
    listContent = (
      <>
        <p className="result-count">{countLabel}</p>
        <ComplaintTable
          complaints={visible}
          staff={staff}
          onOpen={(id) => navigate(`#/complaint/${id}`)}
          onStatusChange={handleStatusChange}
          onAssigneeChange={handleAssigneeChange}
        />
      </>
    )
  }

  if (view === 'inbox') {
    const selected =
      visible.find((complaint) => complaint.id === selectedId) ??
      visible[0] ??
      null

    return (
      <section className="complaints">
        <div className="split">
          <div className="split__list">
            {toolbar}
            {scoped.length === 0 || visible.length === 0 ? (
              listContent
            ) : (
              <>
                <p className="result-count">{countLabel}</p>
                <ul className="inbox-list">
                  {visible.map((complaint) => (
                    <InboxRow
                      key={complaint.id}
                      complaint={complaint}
                      selected={selected?.id === complaint.id}
                      onOpen={openTicket}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="split__detail">
            {selected ? (
              renderDetail(selected)
            ) : (
              <EmptyState text="No ticket selected." />
            )}
          </div>
        </div>
      </section>
    )
  }

  const headline = view === 'overview' ? headlineFor(complaints) : null

  return (
    <section className="complaints">
      {headline ? <h1 className="headline">{headline}</h1> : null}

      {toolbar}
      {listContent}
    </section>
  )
}
