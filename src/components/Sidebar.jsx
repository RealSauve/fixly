import {
  IconHome,
  IconInbox,
  IconPlug,
  IconStar,
  IconUser,
  IconUserOff,
  IconUsers,
} from '@tabler/icons-react'

const NAV_ITEMS = [
  { view: 'overview', label: 'Overview', icon: IconHome },
  { view: 'inbox', label: 'Inbox', icon: IconInbox },
  { view: 'reviews', label: 'Reviews', icon: IconStar },
  { view: 'assigned', label: 'Assigned to me', icon: IconUser },
  { view: 'unassigned', label: 'Unassigned', icon: IconUserOff },
]

const SETTINGS_ITEMS = [
  { view: 'sources', label: 'Sources', icon: IconPlug },
  { view: 'team', label: 'Team', icon: IconUsers },
]

function hrefFor(view) {
  return view === 'overview' ? '#/' : `#/${view}`
}

function SidebarItem({ item, active, badge, onNavigate }) {
  const Icon = item.icon
  return (
    <a
      className={`sidebar__item${active ? ' is-active' : ''}`}
      href={hrefFor(item.view)}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
    >
      <Icon className="sidebar__icon" size={18} stroke={1.75} aria-hidden="true" />
      <span className="sidebar__label">{item.label}</span>
      {badge > 0 ? (
        <span className="sidebar__badge">
          {badge}
          <span className="sr-only">
            {item.view === 'reviews'
              ? ' complaints with no reply'
              : ' complaints unassigned'}
          </span>
        </span>
      ) : null}
    </a>
  )
}

export default function Sidebar({
  activeView,
  reviewsNoReply,
  unassignedCount,
  open,
  onNavigate,
}) {
  return (
    <>
      {open ? (
        <div className="sidebar__scrim" onClick={onNavigate} aria-hidden="true" />
      ) : null}
      <nav
        className={`sidebar${open ? ' is-open' : ''}`}
        aria-label="Main navigation"
      >
        <div className="sidebar__brand">
          <img
            className="sidebar__logo"
            src="/logo.png"
            alt="Fixly"
            width="80"
            height="28"
          />
        </div>

        <div className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.view}
              item={item}
              active={activeView === item.view}
              badge={
                item.view === 'reviews'
                  ? reviewsNoReply
                  : item.view === 'unassigned'
                    ? unassignedCount
                    : 0
              }
              onNavigate={onNavigate}
            />
          ))}

          <p className="sidebar__group-label">Settings</p>

          {SETTINGS_ITEMS.map((item) => (
            <SidebarItem
              key={item.view}
              item={item}
              active={activeView === item.view}
              badge={0}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>
    </>
  )
}
