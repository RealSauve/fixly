import { useMemo, useState } from 'react'
import {
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react'
import ComplaintCard from '../components/ComplaintCard'
import ComplaintTable from '../components/ComplaintTable'
import EmptyState from '../components/EmptyState'
import StatCard from '../components/StatCard'
import { STATUSES } from '../lib/constants'
import { computeStats } from '../lib/stats'

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

export default function ComplaintsView({
  complaints,
  staff,
  updateStatus,
  updateAssignee,
  showToast,
  navigate,
  onNew,
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(ALL)
  const [priority, setPriority] = useState(ALL)
  const [sort, setSort] = useState('newest')

  const visible = useMemo(() => {
    const term = normalise(query)

    return complaints
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
  }, [complaints, query, status, priority, sort])

  const hasFilters = query.trim() !== '' || status !== ALL || priority !== ALL

  const stats = computeStats(complaints)

  function toggleStatusCard(value) {
    setStatus((current) => (current === value ? ALL : value))
  }

  function toggleHighPriorityCard() {
    const active = priority === 'High' && status === ACTIVE
    if (active) {
      setPriority(ALL)
      setStatus(ALL)
    } else {
      setPriority('High')
      setStatus(ACTIVE)
    }
  }

  function clearFilters() {
    setQuery('')
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

  const countLabel = `${visible.length} ${
    visible.length === 1 ? 'complaint' : 'complaints'
  }`

  return (
    <section className="complaints">
      <div className="stat-strip">
        <StatCard
          value={stats.new}
          label="New"
          active={status === 'New'}
          onClick={() => toggleStatusCard('New')}
        />
        <StatCard
          value={stats.inProgress}
          label="In Progress"
          active={status === 'In Progress'}
          onClick={() => toggleStatusCard('In Progress')}
        />
        <StatCard
          value={stats.waiting}
          label="Waiting on Customer"
          active={status === 'Waiting on Customer'}
          onClick={() => toggleStatusCard('Waiting on Customer')}
        />
        <StatCard
          value={stats.highPriority}
          label="High priority"
          active={priority === 'High' && status === ACTIVE}
          onClick={toggleHighPriorityCard}
        />
      </div>

      <div className="toolbar" role="search">
        <div className="search">
          <IconSearch size={18} stroke={1.5} aria-hidden="true" />
          <input
            className="control search__input"
            type="search"
            value={query}
            placeholder="Search by reference, subject or customer"
            aria-label="Search complaints"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

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

      {complaints.length === 0 ? (
        <EmptyState
          text="No complaints yet. Log your first one."
          action={{
            label: 'New complaint',
            variant: 'primary',
            onClick: onNew,
          }}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          text="No complaints match your filters."
          action={{
            label: 'Clear filters',
            variant: 'secondary',
            onClick: clearFilters,
          }}
        />
      ) : (
        <>
          <p className="result-count">{countLabel}</p>
          <ComplaintTable
            complaints={visible}
            staff={staff}
            onOpen={(id) => navigate(`#/complaint/${id}`)}
            onStatusChange={handleStatusChange}
            onAssigneeChange={handleAssigneeChange}
          />
          <div className="card-list">
            {visible.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                assigneeName={
                  staff.find((person) => person.id === complaint.assigneeId)
                    ?.name ?? null
                }
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
