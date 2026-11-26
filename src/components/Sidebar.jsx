import { useEffect, useRef, useState } from 'react'
import {
  IconChartDonut,
  IconInbox,
  IconLayoutDashboard,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconPlugConnected,
  IconSettings,
  IconStar,
  IconTicket,
  IconUserCheck,
  IconUserOff,
  IconUsers,
  IconX,
} from '@tabler/icons-react'
import SponsoredAd from './SponsoredAd'

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { view: 'dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
      { view: 'tickets', label: 'Tickets', icon: IconTicket },
      { view: 'inbox', label: 'Inbox', icon: IconInbox },
      { view: 'assigned', label: 'Assigned to me', icon: IconUserCheck },
    ],
  },
  {
    label: 'Insights',
    items: [
      {
        view: 'unassigned',
        label: 'Unassigned',
        icon: IconUserOff,
        badge: 'unassigned',
      },
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
  {
    label: 'Manage',
    items: [
      { view: 'integrations', label: 'Integrations', icon: IconPlugConnected },
      { view: 'settings', label: 'Settings', icon: IconSettings },
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
      <span className="icon-slot sidebar__icon-slot">
        <Icon className="sidebar__icon" size={20} aria-hidden="true" />
      </span>
      <span className="sidebar__label">{item.label}</span>
      {badge > 0 ? (
        <span
          className={`sidebar__badge${
            item.badge === 'unassigned' ? ' sidebar__badge--danger' : ''
          }`}
        >
          {badge}
          <span className="sr-only"> tickets unassigned</span>
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
  onClose,
  userName,
  userRole,
}) {
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [tooltip, setTooltip] = useState(null)
  const navRef = useRef(null)
  const closeRef = useRef(null)

  // On mobile the sidebar is a full overlay, so the desktop collapse
  // preference is ignored while it is open.
  const isCollapsed = collapsed && !open

  useEffect(() => {
    if (!open) return undefined

    closeRef.current?.focus()

    function trapFocus(event) {
      if (event.key !== 'Tab') return
      const focusable = navRef.current?.querySelectorAll(
        'a[href], button:not([disabled])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', trapFocus)
    return () => document.removeEventListener('keydown', trapFocus)
  }, [open])

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
        <div className="sidebar__scrim" onClick={onClose} aria-hidden="true" />
      ) : null}

      <nav
        ref={navRef}
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
            ref={closeRef}
            className="sidebar__close"
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
          >
            <IconX size={20} aria-hidden="true" />
          </button>
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
                aria-hidden="true"
              />
            ) : (
              <IconLayoutSidebarLeftCollapse
                size={18}
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
          {isCollapsed ? null : <SponsoredAd />}
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
