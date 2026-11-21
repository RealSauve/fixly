import { IconInbox } from '@tabler/icons-react'

export default function EmptyState({ text, action, icon: Icon = IconInbox }) {
  return (
    <div className="empty">
      <Icon className="empty__icon" size={40} stroke={1.5} aria-hidden="true" />
      <p className="empty__text">{text}</p>
      {action ? (
        <button
          className={`button button--${action.variant ?? 'secondary'}`}
          type="button"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  )
}
