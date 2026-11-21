export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <a className="topbar__brand" href="#/" aria-label="Fixly home">
          <img className="topbar__logo" src="/logo.png" alt="Fixly" />
        </a>
      </div>
    </header>
  )
}
