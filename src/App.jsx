import { useCallback, useEffect, useRef, useState } from 'react'
import { IconStar } from '@tabler/icons-react'
import EmptyState from './components/EmptyState'
import NewComplaintDrawer from './components/NewComplaintDrawer'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import TopBar from './components/TopBar'
import { CURRENT_USER_ID } from './lib/constants'
import { useComplaints } from './hooks/useComplaints'
import { useHashRoute } from './hooks/useHashRoute'
import { useToast } from './hooks/useToast'
import ComplaintsView from './views/ComplaintsView'
import DashboardView from './views/DashboardView'
import DetailView from './views/DetailView'
import NotFoundView from './views/NotFoundView'
import SourcesView from './views/SourcesView'
import TeamView from './views/TeamView'

const VIEW_META = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'A live view of your complaint queue.',
  },
  complaints: {
    title: 'Complaints',
    subtitle: 'Every complaint, in one place.',
  },
  inbox: {
    title: 'Inbox',
    subtitle: 'Triage complaints without leaving the list.',
  },
  assigned: {
    title: 'Assigned to me',
    subtitle: 'Complaints that need your attention.',
  },
  unassigned: {
    title: 'Unassigned',
    subtitle: 'Complaints still waiting for an owner.',
  },
  sources: {
    title: 'Complaint sources',
    subtitle: 'Where your complaints come from.',
  },
  team: {
    title: 'Team & workload',
    subtitle: 'How work is spread across the team.',
  },
  reviews: {
    title: 'Reviews',
    subtitle: 'Feedback gathered from review platforms.',
  },
}

// Views that show the complaint list and use the search field.
const LIST_VIEWS = ['complaints', 'inbox', 'assigned', 'unassigned']

function App() {
  const { name, id, view = 'complaints', navigate } = useHashRoute()
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
  const [lastView, setLastView] = useState('complaints')
  const newButtonRef = useRef(null)
  const announced = useRef(false)

  // A detail screen keeps the sidebar highlight on the screen it came from.
  useEffect(() => {
    if (name === 'dashboard') setLastView('dashboard')
    else if (name === 'list' && LIST_VIEWS.includes(view)) setLastView(view)
  }, [name, view])

  // Search only applies to complaint lists. Leaving those screens clears it.
  useEffect(() => {
    const searchable =
      name === 'dashboard' || (name === 'list' && LIST_VIEWS.includes(view))
    if (!searchable) setQuery('')
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
      const onComplaintList = name === 'list' && LIST_VIEWS.includes(view)
      if (!onComplaintList) navigate('#/complaints')
      requestAnimationFrame(() => newButtonRef.current?.focus())
    },
    [showToast, name, view, navigate],
  )

  const handleQueryChange = useCallback(
    (value) => {
      setQuery(value)
      // Searching from the dashboard jumps to the full list so the results
      // are visible without a second action.
      if (name === 'dashboard') navigate('#/complaints')
    },
    [name, navigate],
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
        } else {
          navigate('#/complaints')
          requestAnimationFrame(() =>
            document.querySelector('.search__input')?.focus(),
          )
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [drawerOpen, menuOpen, openDrawer, navigate])

  function handleReset() {
    const confirmed = window.confirm(
      'Reset demo data? This replaces everything in this browser.',
    )
    if (!confirmed) return

    resetData()
    setListVersion((version) => version + 1)
    setQuery('')
    setMenuOpen(false)
    showToast('Demo data restored')
    navigate('#/')
  }

  const complaint =
    name === 'detail' ? complaints.find((item) => item.id === id) : null

  const currentUser =
    staff.find((person) => person.id === CURRENT_USER_ID) ?? staff[0]

  const activeView =
    name === 'dashboard' ? 'dashboard' : name === 'list' ? view : lastView

  const unassignedCount = complaints.filter((item) => !item.assigneeId).length

  const viewMeta =
    name === 'dashboard'
      ? VIEW_META.dashboard
      : name === 'list'
        ? VIEW_META[view]
        : null

  const title =
    name === 'detail'
      ? (complaint?.reference ?? 'Complaint')
      : name === 'notFound'
        ? 'Page not found'
        : (viewMeta?.title ?? 'Fixly')

  const subtitle =
    name === 'detail'
      ? (complaint?.subject ?? 'Complaint detail')
      : name === 'notFound'
        ? 'The page you are looking for does not exist.'
        : (viewMeta?.subtitle ?? '')

  const searchEnabled =
    name === 'dashboard' || (name === 'list' && LIST_VIEWS.includes(view))

  const backHref = lastView === 'dashboard' ? '#/' : `#/${lastView}`

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
  if (name === 'dashboard') {
    content = (
      <DashboardView
        complaints={complaints}
        navigate={navigate}
        onNew={openDrawer}
      />
    )
  } else if (name === 'list' && view === 'reviews') {
    content = (
      <section className="page-empty">
        <EmptyState
          icon={IconStar}
          text="Reviews aren’t connected yet. When review platforms are added, their complaints will appear here."
        />
      </section>
    )
  } else if (name === 'list' && view === 'sources') {
    content = <SourcesView complaints={complaints} />
  } else if (name === 'list' && view === 'team') {
    content = <TeamView complaints={complaints} staff={staff} />
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
        activeView={activeView}
        unassignedCount={unassignedCount}
        open={menuOpen}
        onNavigate={() => setMenuOpen(false)}
        onReset={handleReset}
        userName={currentUser?.name ?? 'Support lead'}
        userRole={currentUser?.role ?? 'Support team'}
      />
      <div className="app__main">
        <TopBar
          title={title}
          subtitle={subtitle}
          query={query}
          onQueryChange={handleQueryChange}
          onNew={openDrawer}
          newButtonRef={newButtonRef}
          onMenu={() => setMenuOpen(true)}
          userName={currentUser?.name ?? ''}
          searchEnabled={searchEnabled}
        />
        <main className="page" aria-label="Fixly complaint tracker">
          {content}
        </main>
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
