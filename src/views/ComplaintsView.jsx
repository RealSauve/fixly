import { useMemo, useState } from 'react'
import {
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconX,
} from '@tabler/icons-react'
import ComplaintTable from '../components/ComplaintTable'
import EmptyState from '../components/EmptyState'
import Priority from '../components/Priority'
import Status from '../components/Status'
import { isAgeing } from '../lib/analytics'
import { CURRENT_USER_ID, SOURCES, STATUSES } from '../lib/constants'
import { formatFullDate, formatRelativeTime } from '../lib/format'
import { normaliseSource } from '../lib/sources'

const ALL = 'All'
const ACTIVE = 'All active'

function normalise(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

const PRIORITY_ORDER = ['High', 'Medium', 'Low']
const STATUS_ORDER = ['New', 'In Progress', 'Waiting on Customer', 'Resolved']

function sortValue(ticket, key) {
  switch (key) {
    case 'reference':
    case 'subject':
    case 'category':
    case 'source':
    case 'assignee':
      return String(ticket[key] ?? ticket.assigneeId ?? '')
    case 'priority':
      return PRIORITY_ORDER.indexOf(ticket.priority)
    case 'status':
      return STATUS_ORDER.indexOf(ticket.status)
    case 'updatedAt':
      return new Date(ticket.updatedAt).getTime()
    default:
      return 0
  }
}

// The sidebar view decides which tickets the list starts from.
function scopedList(view, complaints) {
  if (view === 'assigned') {
    return complaints.filter(
      (complaint) => complaint.assigneeId === CURRENT_USER_ID,
    )
  }
  if (view === 'unassigned') {
    return complaints.filter((complaint) => !complaint.assigneeId)
  }
  return complaints
}

const EMPTY_TEXT = {
  tickets: 'No tickets yet. Log your first one.',
  inbox: 'No tickets yet. Log your first one.',
  assigned: 'Nothing assigned to you yet.',
  unassigned: 'Every ticket has an owner.',
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
  initialFilters,
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
  const [status, setStatus] = useState(initialFilters?.status ?? ALL)
  const [priority, setPriority] = useState(initialFilters?.priority ?? ALL)
  const [source, setSource] = useState(ALL)
  const [assignee, setAssignee] = useState(initialFilters?.assignee ?? ALL)
  const [age, setAge] = useState(initialFilters?.age ?? ALL)
  const [filtersOpen, setFiltersOpen] = useState(
    Boolean(initialFilters && Object.keys(initialFilters).length > 0),
  )
  const [sort, setSort] = useState({ key: 'updatedAt', direction: 'desc' })
  const [selectedId, setSelectedId] = useState(null)

  const scoped = useMemo(
    () => scopedList(view, complaints),
    [view, complaints],
  )

  const visible = useMemo(() => {
    const term = normalise(query)
    const compare = (a, b) => {
      const left = sortValue(a, sort.key)
      const right = sortValue(b, sort.key)
      const result =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right))
      if (result !== 0) return sort.direction === 'asc' ? result : -result
      return a.id.localeCompare(b.id, undefined, { numeric: true })
    }

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

        if (source !== ALL && normaliseSource(complaint.source) !== source) {
          return false
        }

        if (assignee === 'unassigned' && complaint.assigneeId) {
          return false
        }

        if (age === 'old' && !isAgeing(complaint)) {
          return false
        }

        return true
      })
      .sort(compare)
  }, [scoped, query, status, priority, source, assignee, age, sort])

  const activeFilters = [
    ...(query.trim() ? [{ key: 'query', label: 'Search', value: query.trim() }] : []),
    ...(status !== ALL ? [{ key: 'status', label: 'Status', value: status }] : []),
    ...(priority !== ALL
      ? [{ key: 'priority', label: 'Priority', value: priority }]
      : []),
    ...(source !== ALL ? [{ key: 'source', label: 'Source', value: source }] : []),
    ...(assignee !== ALL
      ? [{ key: 'assignee', label: 'Owner', value: 'Unassigned' }]
      : []),
    ...(age !== ALL ? [{ key: 'age', label: 'Age', value: 'Older than 14 days' }] : []),
  ]
  const hasFilters = activeFilters.length > 0

  function removeFilter(key) {
    if (key === 'query') onQueryChange('')
    if (key === 'status') setStatus(ALL)
    if (key === 'priority') setPriority(ALL)
    if (key === 'source') setSource(ALL)
    if (key === 'assignee') setAssignee(ALL)
    if (key === 'age') setAge(ALL)
  }

  function clearFilters() {
    onQueryChange('')
    setStatus(ALL)
    setPriority(ALL)
    setSource(ALL)
    setAssignee(ALL)
    setAge(ALL)
    if (initialFilters && view === 'tickets') navigate('#/tickets')
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

  // In the split view a click selects the ticket; on narrow screens the
  // list and the ticket are separate screens, so it navigates instead.
  function openTicket(id) {
    const narrow = window.matchMedia('(max-width: 1023px)').matches
    if (narrow) navigate(`#/ticket/${id}`)
    else setSelectedId(id)
  }

  const countLabel = `${visible.length} ${
    visible.length === 1 ? 'ticket' : 'tickets'
  }`
  const newestFirst = sort.direction === 'desc'

  const toolbar = (
    <div className="toolbar">
      <button
        className="filter-toggle"
        type="button"
        aria-expanded={filtersOpen}
        aria-controls="ticket-filters"
        onClick={() => setFiltersOpen((open) => !open)}
      >
        <IconFilter size={17} aria-hidden="true" />
        Filters
        {activeFilters.length ? (
          <span className="filter-toggle__count">{activeFilters.length}</span>
        ) : null}
      </button>

      {activeFilters.map((filter) => (
        <span className="filter-chip" key={filter.key}>
          {filter.label}: {filter.value}
          <button
            type="button"
            aria-label={`Remove ${filter.label} filter`}
            onClick={() => removeFilter(filter.key)}
          >
            <IconX size={12} aria-hidden="true" />
          </button>
        </span>
      ))}

      <button
        className="sort-toggle"
        type="button"
        aria-label={`Sort: ${newestFirst ? 'Newest first' : 'Oldest first'}`}
        onClick={() =>
          setSort({ key: 'updatedAt', direction: newestFirst ? 'asc' : 'desc' })
        }
      >
        {newestFirst ? (
          <IconSortDescending size={18} aria-hidden="true" />
        ) : (
          <IconSortAscending size={18} aria-hidden="true" />
        )}
        {newestFirst ? 'Newest first' : 'Oldest first'}
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

      <div className="filter-panel" id="ticket-filters" hidden={!filtersOpen}>
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

        <select
          className="control toolbar__select"
          value={source}
          aria-label="Filter by source"
          onChange={(event) => setSource(event.target.value)}
        >
          <option value={ALL}>All sources</option>
          {SOURCES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          {complaints.some((complaint) => normaliseSource(complaint.source) === 'Unknown') ? (
            <option value="Unknown">Unknown</option>
          ) : null}
        </select>
      </div>
    </div>
  )

  let listContent
  if (scoped.length === 0) {
    listContent = (
      <EmptyState
        text={EMPTY_TEXT[view] ?? 'No tickets yet. Log your first one.'}
        action={
          view === 'tickets' || view === 'inbox'
            ? { label: 'New ticket', variant: 'primary', onClick: onNew }
            : undefined
        }
      />
    )
  } else if (visible.length === 0) {
    listContent = (
      <EmptyState
        text="No tickets match your filters."
        action={{
          label: 'Clear filters',
          variant: 'secondary',
          onClick: clearFilters,
        }}
      />
    )
  } else {
    listContent = (
      <div className="panel list-panel">
        <ComplaintTable
          complaints={visible}
          staff={staff}
          resultLabel={countLabel}
          onOpen={(id) => navigate(`#/ticket/${id}`)}
          onStatusChange={handleStatusChange}
          onAssigneeChange={handleAssigneeChange}
          sort={sort}
          onSortChange={setSort}
        />
      </div>
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
          <div className="split__list panel split__panel">
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

  return (
    <section className="complaints">
      {toolbar}
      {listContent}
    </section>
  )
}
