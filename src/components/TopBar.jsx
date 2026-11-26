import { useEffect, useRef, useState } from 'react'
import {
  IconBell,
  IconMenu,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconX,
} from '@tabler/icons-react'
import { ASK_AI_QUESTIONS, answerQuestion } from '../lib/askAi'

export default function TopBar({
  title,
  subtitle,
  query,
  onQueryChange,
  onNew,
  newButtonRef,
  onMenu,
  userName,
  complaints = [],
  searchEnabled = true,
  showNew = true,
}) {
  const [openPanel, setOpenPanel] = useState(null)
  const [question, setQuestion] = useState(null)
  const askRef = useRef(null)
  const bellRef = useRef(null)

  const newTickets = complaints
    .filter((ticket) => ticket.status === 'New')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const answer = question ? answerQuestion(question, complaints) : null

  useEffect(() => {
    if (!openPanel) return undefined

    function handlePointerDown(event) {
      if (
        askRef.current?.contains(event.target) ||
        bellRef.current?.contains(event.target)
      ) {
        return
      }
      setOpenPanel(null)
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpenPanel(null)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openPanel])

  function togglePanel(next) {
    setOpenPanel((current) => (current === next ? null : next))
  }

  return (
    <header className="topbar">
      <div className="topbar__row topbar__row--utility">
        <button
          className="icon-button topbar__menu"
          type="button"
          onClick={onMenu}
          aria-label="Open navigation menu"
        >
          <IconMenu size={20} aria-hidden="true" />
        </button>

        {searchEnabled ? (
          <div className="search topbar__search" role="search">
            <IconSearch size={18} aria-hidden="true" />
            <input
              className="search__input"
              type="search"
              value={query}
              placeholder="Search tickets…"
              aria-label="Search tickets by reference, subject or customer"
              onChange={(event) => onQueryChange(event.target.value)}
            />
            <kbd className="search__kbd" title="Search shortcut">
              ⌘ K
            </kbd>
          </div>
        ) : null}

        <div className="topbar__tools">
          <div className="header-popover" ref={askRef}>
            <button
              className="icon-button ask-button"
              type="button"
              aria-label="Ask AI"
              aria-expanded={openPanel === 'ask'}
              aria-controls="ask-ai-panel"
              onClick={() => togglePanel('ask')}
            >
              <IconSparkles size={18} aria-hidden="true" />
            </button>

            {openPanel === 'ask' ? (
              <section
                className="header-popover__panel ask-panel"
                id="ask-ai-panel"
                role="region"
                aria-label="Ask AI"
              >
                <div className="header-popover__head">
                  <strong>Ask AI</strong>
                  <button
                    className="icon-button header-popover__close"
                    type="button"
                    aria-label="Close Ask AI"
                    onClick={() => setOpenPanel(null)}
                  >
                    <IconX size={16} aria-hidden="true" />
                  </button>
                </div>
                <p className="ask-panel__note">
                  Simulated local assistant. Answers come from tickets in this
                  browser.
                </p>
                <div className="ask-panel__questions">
                  {ASK_AI_QUESTIONS.map((item) => (
                    <button
                      className={`ask-panel__question${
                        question === item.id ? ' is-active' : ''
                      }`}
                      key={item.id}
                      type="button"
                      aria-pressed={question === item.id}
                      onClick={() => setQuestion(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="ask-panel__answer" aria-live="polite">
                  {answer ??
                    'Choose a question to see an answer derived from your tickets.'}
                </div>
              </section>
            ) : null}
          </div>

          <div className="header-popover" ref={bellRef}>
            <button
              className="icon-button bell-button"
              type="button"
              aria-label={`${newTickets.length} new ${
                newTickets.length === 1 ? 'ticket' : 'tickets'
              }. Open notifications.`}
              aria-expanded={openPanel === 'bell'}
              aria-controls="notifications-panel"
              onClick={() => togglePanel('bell')}
            >
              <IconBell size={18} aria-hidden="true" />
              {newTickets.length > 0 ? (
                <span className="bell-button__dot" aria-hidden="true" />
              ) : null}
            </button>

            {openPanel === 'bell' ? (
              <section
                className="header-popover__panel bell-panel"
                id="notifications-panel"
                role="region"
                aria-label="New tickets"
              >
                <div className="header-popover__head">
                  <strong>New tickets</strong>
                  <button
                    className="icon-button header-popover__close"
                    type="button"
                    aria-label="Close notifications"
                    onClick={() => setOpenPanel(null)}
                  >
                    <IconX size={16} aria-hidden="true" />
                  </button>
                </div>

                {newTickets.length === 0 ? (
                  <p className="bell-panel__empty">No new tickets right now.</p>
                ) : (
                  <ul className="bell-panel__list">
                    {newTickets.slice(0, 5).map((ticket) => (
                      <li key={ticket.id}>
                        <a
                          href={`#/ticket/${ticket.id}`}
                          onClick={() => setOpenPanel(null)}
                        >
                          <span className="bell-panel__ref">{ticket.reference}</span>
                          <span className="bell-panel__subject">{ticket.subject}</span>
                          <span className="bell-panel__customer">
                            {ticket.customerName}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                <a
                  className="bell-panel__all"
                  href="#/tickets?status=New"
                  onClick={() => setOpenPanel(null)}
                >
                  View all new tickets
                </a>
              </section>
            ) : null}
          </div>

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
      </div>

      <div className="topbar__row topbar__row--welcome">
        <div className="topbar__heading">
          <h1 className="topbar__title">{title}</h1>
          {subtitle ? <p className="topbar__subtitle">{subtitle}</p> : null}
        </div>

        {showNew ? (
          <div className="topbar__controls">
            <button
              ref={newButtonRef}
              className="button topbar__new"
              type="button"
              aria-label="New ticket"
              onClick={onNew}
            >
              <span className="topbar__new-icon" aria-hidden="true">
                <IconPlus size={18} aria-hidden="true" />
              </span>
              <span className="topbar__new-label">New ticket</span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}