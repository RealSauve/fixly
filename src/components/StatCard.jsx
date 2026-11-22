export default function StatCard({ value, label, active, onClick }) {
  return (
    <button
      className={`stat-card${active ? ' is-active' : ''}`}
      type="button"
      aria-pressed={active}
      onClick={onClick}
    >
      <span className="stat-card__number">{value}</span>
      <span className="stat-card__label">{label}</span>
    </button>
  )
}
