import { IconMenu, IconPlus, IconSearch } from '@tabler/icons-react'

export default function TopBar({
  title,
  query,
  onQueryChange,
  onNew,
  newButtonRef,
  onMenu,
  userName,
  userInitials,
}) {
  return (
    <header className="topbar">
      <button
        className="icon-button topbar__menu"
        type="button"
        onClick={onMenu}
        aria-label="Open navigation menu"
      >
        <IconMenu size={20} stroke={1.75} aria-hidden="true" />
      </button>

      <span className="topbar__title">{title}</span>

      <div className="search topbar__search" role="search">
        <IconSearch size={18} stroke={1.5} aria-hidden="true" />
        <input
          className="control search__input"
          type="search"
          value={query}
          placeholder="Search by reference, subject or customer"
          aria-label="Search complaints"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div className="topbar__actions">
        <button
          ref={newButtonRef}
          className="button button--primary"
          type="button"
          aria-label="New complaint"
          onClick={onNew}
        >
          <IconPlus size={16} stroke={2} aria-hidden="true" />
          <span className="topbar__new-label">New complaint</span>
        </button>
        <span className="topbar__avatar" title={userName}>
          <span aria-hidden="true">{userInitials}</span>
          <span className="sr-only">Signed in as {userName}</span>
        </span>
      </div>
    </header>
  )
}
