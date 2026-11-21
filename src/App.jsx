import { useEffect, useRef, useState } from 'react'
import Footer from './components/Footer'
import Toast from './components/Toast'
import TopBar from './components/TopBar'
import { useComplaints } from './hooks/useComplaints'
import { useHashRoute } from './hooks/useHashRoute'
import { useToast } from './hooks/useToast'
import ComplaintsView from './views/ComplaintsView'
import DetailPlaceholderView from './views/DetailPlaceholderView'
import NotFoundView from './views/NotFoundView'

function App() {
  const { name, id, navigate } = useHashRoute()
  const {
    complaints,
    staff,
    storageStatus,
    updateStatus,
    updateAssignee,
    resetData,
  } = useComplaints()
  const { toast, showToast } = useToast()
  const [resetCount, setResetCount] = useState(0)
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

  function handleReset() {
    const confirmed = window.confirm(
      'Reset demo data? This replaces everything in this browser.',
    )
    if (!confirmed) return

    resetData()
    setResetCount((count) => count + 1)
    showToast('Demo data restored')
    if (name !== 'list') navigate('#/')
  }

  const complaint =
    name === 'detail'
      ? complaints.find((item) => item.id === id)
      : null

  let content
  if (name === 'list') {
    content = (
      <ComplaintsView
        key={resetCount}
        complaints={complaints}
        staff={staff}
        updateStatus={updateStatus}
        updateAssignee={updateAssignee}
        showToast={showToast}
        navigate={navigate}
      />
    )
  } else if (name === 'detail' && complaint) {
    content = <DetailPlaceholderView complaint={complaint} />
  } else {
    content = <NotFoundView />
  }

  return (
    <div className="app">
      <TopBar />
      <main className="page" aria-label="Fixly complaint tracker">
        {content}
      </main>
      <Footer onReset={handleReset} />
      <Toast toast={toast} />
    </div>
  )
}

export default App
