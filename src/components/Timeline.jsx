import { useRef, useState } from 'react'
import {
  IconFlag,
  IconLock,
  IconPlus,
  IconRefresh,
  IconUser,
} from '@tabler/icons-react'
import { formatFullDate, formatRelativeTime } from '../lib/format'

const NOTE_MAX = 500

const SYSTEM_ICONS = {
  created: IconPlus,
  status: IconRefresh,
  priority: IconFlag,
  assignee: IconUser,
}

function actorName(staff, actorId) {
  return staff.find((person) => person.id === actorId)?.name ?? 'Unknown'
}

function NoteComposer({ onAdd }) {
  const [text, setText] = useState('')
  const areaRef = useRef(null)
  const canSubmit = text.trim().length > 0

  function submit() {
    if (!canSubmit) return
    onAdd(text)
    setText('')
    areaRef.current?.focus()
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div className="timeline__composer">
      <textarea
        ref={areaRef}
        className="field__textarea"
        id="note-input"
        rows={3}
        maxLength={NOTE_MAX}
        placeholder="Add an internal note. Customers never see this."
        aria-label="Add an internal note"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="timeline__composer-bar">
        <span className="timeline__counter" aria-live="polite">
          {text.length} / {NOTE_MAX}
        </span>
        <button
          className="button button--primary"
          type="button"
          disabled={!canSubmit}
          onClick={submit}
        >
          Add note
        </button>
      </div>
    </div>
  )
}

function SystemEvent({ event, staff }) {
  const Icon = SYSTEM_ICONS[event.type] ?? IconRefresh
  return (
    <>
      <span className="timeline__marker" aria-hidden="true">
        <Icon size={12} />
      </span>
      <div className="timeline__line">
        <span className="timeline__text">{event.text}</span>
        <span className="timeline__actor">
          {actorName(staff, event.actorId)}
        </span>
        <time dateTime={event.createdAt} title={formatFullDate(event.createdAt)}>
          {formatRelativeTime(event.createdAt)}
        </time>
      </div>
    </>
  )
}

function NoteEvent({ event, staff }) {
  return (
    <>
      <span className="timeline__marker timeline__marker--note" aria-hidden="true">
        <IconLock size={12} />
      </span>
      <div className="timeline__note">
        <div className="timeline__note-head">
          <IconLock size={14} aria-hidden="true" />
          <span className="timeline__note-label">Internal note</span>
          <span className="timeline__note-meta">
            <span>{actorName(staff, event.actorId)}</span>
            <time
              dateTime={event.createdAt}
              title={formatFullDate(event.createdAt)}
            >
              {formatRelativeTime(event.createdAt)}
            </time>
          </span>
        </div>
        <p className="timeline__note-body">{event.text}</p>
      </div>
    </>
  )
}

export default function Timeline({ events, staff, onAddNote }) {
  const sorted = [...events].sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt) ||
      String(b.id).localeCompare(String(a.id), undefined, { numeric: true }),
  )

  return (
    <section className="card">
      <h2 className="card__title">Timeline</h2>

      <NoteComposer onAdd={onAddNote} />

      {sorted.length === 0 ? (
        <p className="timeline__empty">No activity yet.</p>
      ) : (
        <ol className="timeline__list">
          {sorted.map((event) => (
            <li className="timeline__item" key={event.id}>
              {event.type === 'note' ? (
                <NoteEvent event={event} staff={staff} />
              ) : (
                <SystemEvent event={event} staff={staff} />
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
