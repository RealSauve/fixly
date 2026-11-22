import { useCallback, useEffect, useRef, useState } from 'react'
import Footer from './components/Footer'
import NewComplaintDrawer from './components/NewComplaintDrawer'
import Toast from './components/Toast'
import TopBar from './components/TopBar'
import { useComplaints } from './hooks/useComplaints'
import { useHashRoute } from './hooks/useHashRoute'
import { useToast } from './hooks/useToast'
import ComplaintsView from './views/ComplaintsView'
import DetailView from './views/DetailView'
import NotFoundView from './views/NotFoundView'

function App() {
  const { name, id, navigate } = useHashRoute()
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
  const [listVersion, setListVersion] = useState(0)
  const newButtonRef = useRef(null)
  const announced = useRef(false)

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
    if (name === 'list') setDrawerOpen(true)
  }, [name])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    requestAnimationFrame(() => newButtonRef.current?.focus())
  }, [])

  const handleCreated = useCallback(
    (complaint) => {
      setDrawerOpen(false)
      setListVersion((version) => version + 1)
      showToast(`Complaint ${complaint.reference} logged`)
      requestAnimationFrame(() => newButtonRef.current?.focus())
    },
    [showToast],
  )

  useEffect(() => {
    function handleKeyDown(event) {
      if (drawerOpen) return
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
  }, [drawerOpen, openDrawer])

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

  let content
  if (name === 'list') {
    content = (
      <ComplaintsView
        key={listVersion}
        complaints={complaints}
        staff={staff}
        updateStatus={updateStatus}
        updateAssignee={updateAssignee}
        showToast={showToast}
        navigate={navigate}
        onNew={openDrawer}
      />
    )
  } else if (name === 'detail' && complaint) {
    content = (
      <DetailView
        complaint={complaint}
        events={events.filter((event) => event.complaintId === complaint.id)}
        staff={staff}
        updateStatus={updateStatus}
        updatePriority={updatePriority}
        updateAssignee={updateAssignee}
        addNote={addNote}
        showToast={showToast}
      />
    )
  } else {
    content = <NotFoundView />
  }

  return (
    <div className="app">
      <TopBar
        showNew={name === 'list'}
        onNew={openDrawer}
        newButtonRef={newButtonRef}
      />
      <main className="page" aria-label="Fixly complaint tracker">
        {content}
      </main>
      <Footer onReset={handleReset} />
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
