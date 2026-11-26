import { useState } from 'react'
import {
  IconChartDonut,
  IconInbox,
  IconLayoutDashboard,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconRefresh,
  IconSparkles,
  IconStar,
  IconTicket,
  IconUserCheck,
  IconUserOff,
  IconUsers,
} from '@tabler/icons-react'

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { view: 'dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
      { view: 'complaints', label: 'Complaints', icon: IconTicket },
      { view: 'inbox', label: 'Inbox', icon: IconInbox },
      { view: 'assigned', label: 'Assigned to me', icon: IconUserCheck },
      {
        view: 'unassigned',
        label: 'Unassigned',
        icon: IconUserOff,
        badge: 'unassigned',
      },
    ],
  },
  {
    label: 'Insights',
    items: [
      { view: 'sources', label: 'Sources', icon: IconChartDonut },
      { view: 'team', label: 'Team', icon: IconUsers },
      {
        view: 'reviews',
        label: 'Reviews',
        icon: IconStar,
        badgeText: 'Soon',
      },
    ],
  },
]

function hrefFor(view) {
  return view === 'dashboard' ? '#/' : `#/${view}`
}

function readCollapsed() {
  try {
    return window.localStorage.getItem('fixly:sidebar') === 'collapsed'
  } catch {
    return false
  }
}

function SidebarItem({
  item,
  active,
  badge,
  onNavigate,
  onShowTooltip,
  onHideTooltip,
}) {
  const Icon = item.icon

  return (
    <a
      className={`sidebar__item${active ? ' is-active' : ''}`}
      href={hrefFor(item.view)}
      aria-current={active ? 'page' : undefined}
      onClick={() => {
        onHideTooltip()
        onNavigate()
      }}
      onMouseEnter={(event) => onShowTooltip(event, item.label)}
      onMouseLeave={onHideTooltip}
      onFocus={(event) => onShowTooltip(event, item.label)}
      onBlur={onHideTooltip}
    >
      <Icon
        className="sidebar__icon"
        size={20}
        stroke={1.8}
        aria-hidden="true"
      />
      <span className="sidebar__label">{item.label}</span>
      {badge > 0 ? (
        <span className="sidebar__badge">
          {badge}
          <span className="sr-only"> complaints unassigned</span>
        </span>
      ) : null}
      {item.badgeText ? (
        <span className="sidebar__badge sidebar__badge--soft">
          {item.badgeText}
        </span>
      ) : null}
    </a>
  )
}

export default function Sidebar({
  activeView,
  unassignedCount,
  open,
  onNavigate,
  onReset,
  userName,
  userRole,
}) {
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [tooltip, setTooltip] = useState(null)

  // On mobile the sidebar is a full overlay, so the desktop collapse
  // preference is ignored while it is open.
  const isCollapsed = collapsed && !open

  function toggleCollapsed() {
    setTooltip(null)
    setCollapsed((current) => {
      const next = !current
      try {
        window.localStorage.setItem(
          'fixly:sidebar',
          next ? 'collapsed' : 'expanded',
        )
      } catch {
        // A blocked storage API should not stop the sidebar from working.
      }
      return next
    })
  }

  function showTooltip(event, label) {
    if (!isCollapsed) return
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({ label, top: rect.top + rect.height / 2 })
  }

  function hideTooltip() {
    setTooltip(null)
  }

  return (
    <>
      {open ? (
        <div className="sidebar__scrim" onClick={onNavigate} aria-hidden="true" />
      ) : null}

      <nav
        className={`sidebar${isCollapsed ? ' is-collapsed' : ''}${
          open ? ' is-open' : ''
        }`}
        aria-label="Main navigation"
      >
        <div className="sidebar__head">
          <a
            className="sidebar__brand"
            href="#/"
            aria-label="Fixly dashboard"
            onClick={onNavigate}
          >
            <img
              className="sidebar__logo"
              src="/logo.png"
              alt="Fixly"
              width="96"
              height="28"
            />
          </a>
          <button
            className="sidebar__collapse"
            type="button"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
            onClick={toggleCollapsed}
          >
            {isCollapsed ? (
              <IconLayoutSidebarLeftExpand
                size={18}
                stroke={1.8}
                aria-hidden="true"
              />
            ) : (
              <IconLayoutSidebarLeftCollapse
                size={18}
                stroke={1.8}
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        <div className="sidebar__user" title={`${userName} · ${userRole}`}>
          <img
            className="sidebar__avatar"
            src="/avatar.jpg"
            alt=""
            width="40"
            height="40"
          />
          <span className="sidebar__user-text">
            <strong>{userName}</strong>
            <small>{userRole}</small>
          </span>
        </div>

        <div className="sidebar__nav">
          {NAV_GROUPS.map((group) => (
            <div className="sidebar__group" key={group.label}>
              <p className="sidebar__group-label">{group.label}</p>
              {group.items.map((item) => (
                <SidebarItem
                  key={item.view}
                  item={item}
                  active={activeView === item.view}
                  badge={item.badge === 'unassigned' ? unassignedCount : 0}
                  onNavigate={onNavigate}
                  onShowTooltip={showTooltip}
                  onHideTooltip={hideTooltip}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar__footer">
          {isCollapsed ? (
            <button
              className="sidebar__reset"
              type="button"
              title="Reset demo data"
              aria-label="Reset demo data"
              onClick={onReset}
            >
              <IconRefresh size={18} stroke={1.8} aria-hidden="true" />
            </button>
          ) : (
            <div className="sidebar__promo">
              <span className="sidebar__promo-icon">
                <IconSparkles size={17} stroke={1.8} aria-hidden="true" />
              </span>
              <p className="sidebar__promo-title">Demo workspace</p>
              <p className="sidebar__promo-text">
                Changes are saved in this browser only.
              </p>
              <button
                className="sidebar__promo-btn"
                type="button"
                onClick={onReset}
              >
                <IconRefresh size={14} stroke={1.9} aria-hidden="true" />
                Reset demo data
              </button>
            </div>
          )}
        </div>
      </nav>

      {isCollapsed && tooltip ? (
        <div
          className="sidebar-tooltip"
          style={{ top: tooltip.top }}
          role="tooltip"
        >
          {tooltip.label}
        </div>
      ) : null}
    </>
  )
}
