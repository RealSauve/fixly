import { useCallback, useEffect, useRef, useState } from 'react'
import reviewsEmptyImage from '../assets/Reviews empty state.png'
import IntakeForm from './components/IntakeForm'
import NewComplaintDrawer from './components/NewComplaintDrawer'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import TopBar from './components/TopBar'
import { CURRENT_USER_ID } from './lib/constants'
import { useComplaints } from './hooks/useComplaints'
import { useHashRoute } from './hooks/useHashRoute'
import { useIntegrations } from './hooks/useIntegrations'
import { useToast } from './hooks/useToast'
import ComplaintsView from './views/ComplaintsView'
import DashboardView from './views/DashboardView'
import DetailView from './views/DetailView'
import IntegrationsView from './views/IntegrationsView'
import NotFoundView from './views/NotFoundView'
import SettingsView from './views/SettingsView'
import SourcesView from './views/SourcesView'
import TeamView from './views/TeamView'

const VIEW_META = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'A live view of your ticket queue.',
  },
  tickets: {
    title: 'Tickets',
    subtitle: 'Every ticket, in one place.',
  },
  inbox: {
    title: 'Inbox',
    subtitle: 'Triage tickets without leaving the list.',
  },
  assigned: {
    title: 'Assigned to me',
    subtitle: 'Tickets that need your attention.',
  },
  unassigned: {
    title: 'Unassigned',
    subtitle: 'Tickets still waiting for an owner.',
  },
  sources: {
    title: 'Ticket sources',
    subtitle: 'Where your tickets come from.',
  },
  team: {
    title: 'Team & workload',
    subtitle: 'How work is spread across the team.',
  },
  integrations: {
    title: 'Integrations',
    subtitle: 'Bring tickets in through other channels.',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Browser-local controls for this prototype.',
  },
  reviews: {
    title: 'Reviews',
    subtitle: 'Feedback gathered from review platforms.',
  },
}

// Views that show the ticket list and use the search field.
const LIST_VIEWS = ['tickets', 'inbox', 'assigned', 'unassigned']

// Route segments are the source of truth for page names, so new pages get
// their own heading automatically. Only labels that differ need an override.
const ROUTE_LABELS = {
  assigned: 'Assigned to me',
}

function headingFromRoute(segment = '') {
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment]
  return segment
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function App() {
  const { name, id, view = 'tickets', filters, navigate } = useHashRoute()
  const {
    complaints,
    events,
    staff,
    integrations,
    deliveries,
    storageStatus,
    createComplaint,
    updateStatus,
    updatePriority,
    updateAssignee,
    addNote,
    saveIntegration,
    recordDelivery,
    resetData,
  } = useComplaints()
  const { toast, showToast } = useToast()
  const integrationTools = useIntegrations({
    complaints,
    integrations,
    deliveries,
    createComplaint,
    recordDelivery,
    saveIntegration,
    showToast,
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState('30d')
  const [listVersion, setListVersion] = useState(0)
  const [lastView, setLastView] = useState('tickets')
  const newButtonRef = useRef(null)
  const announced = useRef(false)

  // A detail screen keeps the sidebar highlight on the screen it came from.
  useEffect(() => {
    if (name === 'dashboard') setLastView('dashboard')
    else if (name === 'list' && LIST_VIEWS.includes(view)) setLastView(view)
  }, [name, view])

  // Search only applies to ticket lists. Leaving those screens clears it.
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
        'Saved data could not be read, so sample data was restored.',
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
      showToast(`Ticket ${complaint.reference} logged`)
      const onTicketList = name === 'list' && LIST_VIEWS.includes(view)
      if (!onTicketList) navigate('#/tickets')
      requestAnimationFrame(() => newButtonRef.current?.focus())
    },
    [showToast, name, view, navigate],
  )

  const handleQueryChange = useCallback(
    (value) => {
      setQuery(value)
      // Searching from the dashboard jumps to the full list so the results
      // are visible without a second action.
      if (name === 'dashboard') navigate('#/tickets')
    },
    [name, navigate],
  )

  const handleMatrixSelect = useCallback(
    (priority, status) => {
      const isActive = filters?.priority === priority && filters?.status === status
      setQuery('')
      if (isActive) {
        navigate('#/tickets')
      } else {
        navigate(
          `#/tickets?priority=${encodeURIComponent(priority)}&status=${encodeURIComponent(status)}`,
        )
      }
    },
    [filters, navigate],
  )

  const handlePrioritySelect = useCallback(
    (priority) => {
      const isActive = filters?.priority === priority && !filters?.status && !filters?.source
      setQuery('')
      navigate(
        isActive ? '#/tickets' : `#/tickets?priority=${encodeURIComponent(priority)}`,
      )
    },
    [filters, navigate],
  )

  const handleSourceSelect = useCallback(
    (source) => {
      const isActive = filters?.source === source && !filters?.priority && !filters?.status
      setQuery('')
      navigate(isActive ? '#/tickets' : `#/tickets?source=${encodeURIComponent(source)}`)
    },
    [filters, navigate],
  )

  useEffect(() => {
    function handleKeyDown(event) {
      if (drawerOpen || name === 'intake') return

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
          navigate('#/tickets')
          requestAnimationFrame(() =>
            document.querySelector('.search__input')?.focus(),
          )
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [drawerOpen, menuOpen, name, openDrawer, navigate])

  function handleReset() {
    const confirmed = window.confirm(
      'Reset sample data? This replaces everything in this browser.',
    )
    if (!confirmed) return

    resetData()
    setListVersion((version) => version + 1)
    setQuery('')
    setMenuOpen(false)
    showToast('Sample data restored')
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

  const firstName = currentUser?.name?.trim().split(/\s+/)[0] || 'there'

  const title =
    name === 'dashboard'
      ? `Welcome back, ${firstName}! 👋`
      : name === 'detail'
        ? (complaint?.reference ?? 'Ticket')
        : name === 'notFound'
          ? 'Page not found'
          : (headingFromRoute(view) ?? viewMeta?.title ?? 'Fixly')

  const subtitle =
    name === 'detail'
      ? (complaint?.subject ?? 'Ticket detail')
      : name === 'notFound'
        ? 'The page you are looking for does not exist.'
        : name === 'dashboard'
          ? 'Monitor your ticket activity in one place.'
          : name === 'list' && view === 'tickets'
            ? `${complaints.length} tickets · all time`
            : (viewMeta?.subtitle ?? '')

  const searchEnabled =
    name === 'dashboard' || (name === 'list' && LIST_VIEWS.includes(view))

  const showNew = searchEnabled

  // The hosted website form is a separate, uncluttered page. It uses the same
  // intake handler as the test button and preview in Integrations.
  if (name === 'intake') {
    return (
      <main className="intake-page">
        <div className="intake-page__card">
          <div className="intake-page__brand">Fixly</div>
          <IntakeForm onSubmit={integrationTools.submitIntake} channel="website" />
          <p className="intake-page__foot">
            This form is part of a browser-only prototype. Submissions stay in
            this browser.
          </p>
        </div>
      </main>
    )
  }

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
        period={period}
        onPeriodChange={setPeriod}
        onMatrixSelect={handleMatrixSelect}
        onPrioritySelect={handlePrioritySelect}
        onSourceSelect={handleSourceSelect}
        activeFilter={name === 'list' && view === 'tickets' ? filters : null}
      />
    )
  } else if (name === 'list' && view === 'reviews') {
    content = (
      <section className="panel reviews-empty">
        <img
          className="reviews-empty__image"
          src={reviewsEmptyImage}
          alt=""
          aria-hidden="true"
        />
        <h2 className="reviews-empty__title">No reviews yet</h2>
        <p className="reviews-empty__text">
          Customer reviews will appear here once this feature is available.
        </p>
      </section>
    )
  } else if (name === 'list' && view === 'sources') {
    content = <SourcesView complaints={complaints} />
  } else if (name === 'list' && view === 'team') {
    content = <TeamView complaints={complaints} staff={staff} />
  } else if (name === 'list' && view === 'integrations') {
    content = (
      <IntegrationsView
        channels={integrationTools.channels}
        deliveries={integrationTools.deliveries}
        connect={integrationTools.connect}
        disconnect={integrationTools.disconnect}
        regenerateSecret={integrationTools.regenerateSecret}
        sendTest={integrationTools.sendTest}
        submitIntake={integrationTools.submitIntake}
        samplePayload={integrationTools.samplePayload}
        showToast={showToast}
      />
    )
  } else if (name === 'list' && view === 'settings') {
    content = (
      <SettingsView storageStatus={storageStatus} onReset={handleReset} />
    )
  } else if (name === 'list') {
    content = (
      <ComplaintsView
        key={`${listVersion}:${view}:${JSON.stringify(filters)}`}
        view={view}
        initialFilters={filters}
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
    <div className={`app${name === 'dashboard' ? ' app--dashboard' : ''}`}>
      <Sidebar
        activeView={activeView}
        unassignedCount={unassignedCount}
        open={menuOpen}
        onNavigate={() => setMenuOpen(false)}
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
          complaints={complaints}
          period={period}
          onPeriodChange={setPeriod}
          searchEnabled={searchEnabled}
          showNew={showNew}
        />
        <main className="page" aria-label="Fixly ticket tracker">
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
