import { IconMenu, IconPlus, IconSearch } from '@tabler/icons-react'

export default function TopBar({
  title,
  subtitle,
  query,
  onQueryChange,
  onNew,
  newButtonRef,
  onMenu,
  userName,
  searchEnabled = true,
}) {
  return (
    <header className="topbar">
      <button
        className="icon-button topbar__menu"
        type="button"
        onClick={onMenu}
        aria-label="Open navigation menu"
      >
        <IconMenu size={20} stroke={1.8} aria-hidden="true" />
      </button>

      <div className="topbar__heading">
        <h1 className="topbar__title">{title}</h1>
        {subtitle ? <p className="topbar__subtitle">{subtitle}</p> : null}
      </div>

      {searchEnabled ? (
        <div className="search topbar__search" role="search">
          <IconSearch size={18} stroke={1.7} aria-hidden="true" />
          <input
            className="search__input"
            type="search"
            value={query}
            placeholder="Search complaints…"
            aria-label="Search complaints by reference, subject or customer"
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <kbd className="search__kbd" title="Press / to search">
            /
          </kbd>
        </div>
      ) : null}

      <div className="topbar__actions">
        <button
          ref={newButtonRef}
          className="button button--primary topbar__new"
          type="button"
          aria-label="New complaint"
          onClick={onNew}
        >
          <IconPlus size={16} stroke={2.1} aria-hidden="true" />
          <span className="topbar__new-label">New complaint</span>
        </button>
        <span className="topbar__profile" title={userName}>
          <img
            className="topbar__avatar"
            src="/avatar.jpg"
            alt={`Signed in as ${userName}`}
            width="40"
            height="40"
          />
        </span>
      </div>
    </header>
  )
}
