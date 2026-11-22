import { IconPlus } from '@tabler/icons-react'

export default function TopBar({ showNew, onNew, newButtonRef }) {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <a className="topbar__brand" href="#/" aria-label="Fixly home">
          <img className="topbar__logo" src="/logo.png" alt="Fixly" />
        </a>
        {showNew ? (
          <button
            ref={newButtonRef}
            className="button button--primary"
            type="button"
            onClick={onNew}
          >
            <IconPlus size={16} stroke={2} aria-hidden="true" />
            New complaint
          </button>
        ) : null}
      </div>
    </header>
  )
}
