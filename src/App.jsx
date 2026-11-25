import { useCallback, useEffect, useRef, useState } from 'react'
import { IconPlug } from '@tabler/icons-react'
import EmptyState from './components/EmptyState'
import Footer from './components/Footer'
import NewComplaintDrawer from './components/NewComplaintDrawer'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import TopBar from './components/TopBar'
import { CURRENT_USER_ID } from './lib/constants'
import { useComplaints } from './hooks/useComplaints'
import { useHashRoute } from './hooks/useHashRoute'
import { useToast } from './hooks/useToast'
import ComplaintsView from './views/ComplaintsView'
import DetailView from './views/DetailView'
import NotFoundView from './views/NotFoundView'

const VIEW_TITLES = {
  overview: 'Overview',
  inbox: 'Inbox',
  reviews: 'Reviews',
  assigned: 'Assigned to me',
  unassigned: 'Unassigned',
  sources: 'Sources',
  team: 'Team',
}

function initials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function TeamList({ staff }) {
  return (
    <section className="team" aria-label="Team">
      <ul className="team__list">
        {staff.map((person) => (
          <li className="team__row" key={person.id}>
            <span className="team__avatar" aria-hidden="true">
              {initials(person.name)}
            </span>
            <span className="team__name">{person.name}</span>
            <span className="team__role">{person.role}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function App() {
  const { name, id, view = 'overview', navigate } = useHashRoute()
  const {
    complaints,
    events,
    staff,
    storageStatus,
    createComplaint,
    updateStatus,
    updatePriority,
    updateAssignee,
    addNote,
    resetData,
  } = useComplaints()
  const { toast, showToast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [listVersion, setListVersion] = useState(0)
  const [lastListView, setLastListView] = useState('overview')
  const newButtonRef = useRef(null)
  const announced = useRef(false)

  // A complaint screen keeps the sidebar highlight on the list it came from.
  useEffect(() => {
    if (name === 'list') setLastListView(view)
  }, [name, view])

  useEffect(() => {
    if (announced.current) return
    announced.current = true

    if (storageStatus === 'recovered') {
      showToast(
        'Saved data could not be read, so demo data was restored.',
        'error',
      )
    } else if (storageStatus === 'unavailable') {
      showToast('Could not save changes in this browser.', 'error')
    }
  }, [storageStatus, showToast])

  const openDrawer = useCallback(() => {
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    requestAnimationFrame(() => newButtonRef.current?.focus())
  }, [])

  const handleCreated = useCallback(
    (complaint) => {
      setDrawerOpen(false)
      setListVersion((version) => version + 1)
      showToast(`Complaint ${complaint.reference} logged`)
      if (name !== 'list') navigate('#/')
      requestAnimationFrame(() => newButtonRef.current?.focus())
    },
    [showToast, name, navigate],
  )

  useEffect(() => {
    function handleKeyDown(event) {
      if (drawerOpen) return

      if (menuOpen) {
        if (event.key === 'Escape') setMenuOpen(false)
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return

      const target = event.target
      if (
        target &&
        typeof target.closest === 'function' &&
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return
      }

      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault()
        openDrawer()
      }

      if (event.key === '/') {
        const search = document.querySelector('.search__input')
        if (search) {
          event.preventDefault()
          search.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [drawerOpen, menuOpen, openDrawer])

  function handleReset() {
    const confirmed = window.confirm(
      'Reset demo data? This replaces everything in this browser.',
    )
    if (!confirmed) return

    resetData()
    setListVersion((version) => version + 1)
    showToast('Demo data restored')
    if (name !== 'list') navigate('#/')
  }

  const complaint =
    name === 'detail' ? complaints.find((item) => item.id === id) : null

  const currentUser =
    staff.find((person) => person.id === CURRENT_USER_ID) ?? staff[0]
  const userName = currentUser?.name ?? ''

  // Review complaints with no reply yet. Sources arrive in Part 2, so this
  // is zero (and hidden) for now.
  const reviewsNoReply = complaints.filter(
    (item) => item.source && !item.repliedAt,
  ).length
  const unassignedCount = complaints.filter((item) => !item.assigneeId).length

  const title =
    name === 'notFound'
      ? 'Fixly'
      : name === 'detail'
        ? (complaint?.reference ?? 'Fixly')
        : VIEW_TITLES[view]

  const backHref = lastListView === 'overview' ? '#/' : `#/${lastListView}`

  function renderDetail(item) {
    return (
      <DetailView
        complaint={item}
        events={events.filter((event) => event.complaintId === item.id)}
        staff={staff}
        updateStatus={updateStatus}
        updatePriority={updatePriority}
        updateAssignee={updateAssignee}
        addNote={addNote}
        showToast={showToast}
        backHref={backHref}
      />
    )
  }

  let content
  if (name === 'list' && view === 'sources') {
    content = <EmptyState text="No sources yet." icon={IconPlug} />
  } else if (name === 'list' && view === 'team') {
    content = <TeamList staff={staff} />
  } else if (name === 'list') {
    content = (
      <ComplaintsView
        key={`${listVersion}:${view}`}
        view={view}
        complaints={complaints}
        staff={staff}
        query={query}
        onQueryChange={setQuery}
        updateStatus={updateStatus}
        updateAssignee={updateAssignee}
        showToast={showToast}
        navigate={navigate}
        onNew={openDrawer}
        renderDetail={renderDetail}
      />
    )
  } else if (name === 'detail' && complaint) {
    content = renderDetail(complaint)
  } else {
    content = <NotFoundView />
  }

  return (
    <div className="app">
      <Sidebar
        activeView={name === 'list' ? view : lastListView}
        reviewsNoReply={reviewsNoReply}
        unassignedCount={unassignedCount}
        open={menuOpen}
        onNavigate={() => setMenuOpen(false)}
      />
      <div className="app__main">
        <TopBar
          title={title}
          query={query}
          onQueryChange={setQuery}
          onNew={openDrawer}
          newButtonRef={newButtonRef}
          onMenu={() => setMenuOpen(true)}
          userName={userName}
          userInitials={userName ? initials(userName) : ''}
        />
        <main className="page" aria-label="Fixly complaint tracker">
          {content}
        </main>
        <Footer onReset={handleReset} />
      </div>
      {drawerOpen ? (
        <NewComplaintDrawer
          complaints={complaints}
          staff={staff}
          onCreate={createComplaint}
          onCreated={handleCreated}
          onClose={closeDrawer}
        />
      ) : null}
      <Toast toast={toast} />
    </div>
  )
}

export default App
