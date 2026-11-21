function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <a className="topbar__brand" href="#/">
            <span className="topbar__mark" aria-hidden="true" />
            Complaint Tracker
          </a>
        </div>
      </header>

      <main className="page" aria-label="Complaint tracker" />
    </div>
  )
}

export default App
