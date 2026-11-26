import { IconCrown } from '@tabler/icons-react'

export default function SponsoredAd() {
  return (
    <aside className="ad-card" aria-label="Unlock insights">
      <span className="ad-card__tile" aria-hidden="true">
        <IconCrown size={16} aria-hidden="true" />
      </span>
      <h3 className="ad-card__title">Unlock insights</h3>
      <p className="ad-card__text">Unlock advanced metrics and reports.</p>
      <button className="ad-card__cta" type="button">
        Become Pro
      </button>
    </aside>
  )
}
