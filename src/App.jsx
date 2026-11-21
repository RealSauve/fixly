import DebugView from './views/DebugView.jsx'

function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <a className="topbar__brand" href="#/" aria-label="Fixly home">
            <img className="topbar__logo" src="/logo.png" alt="Fixly" />
          </a>
        </div>
      </header>

      <main className="page" aria-label="Fixly complaint tracker">
        <DebugView />
      </main>
    </div>
  )
}

export default App
