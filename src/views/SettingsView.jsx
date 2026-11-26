import { IconAlertCircle, IconRefresh } from '@tabler/icons-react'

export default function SettingsView({ storageStatus, onReset }) {
  function handleReset() {
    const confirmed = window.confirm(
      'Reset sample data? This replaces tickets, integrations and deliveries in this browser.',
    )
    if (!confirmed) return
    onReset()
  }

  const unavailable = storageStatus === 'unavailable'

  return (
    <section className="settings" aria-label="Settings">
      <div className="settings__intro">
        <h2 className="settings__title">Settings</h2>
        <p className="settings__subtitle">
          A small set of controls for this browser-only prototype.
        </p>
      </div>

      <section className="panel settings__panel" aria-labelledby="settings-data-title">
        <div className="panel__head">
          <div>
            <h3 className="panel__title" id="settings-data-title">
              Data
            </h3>
            <p className="panel__sub">
              Tickets, notes, connections and deliveries are stored in this
              browser. Nothing is sent anywhere.
            </p>
          </div>
        </div>

        <div className="settings__row">
          <div className="settings__row-copy">
            <strong>Sample data</strong>
            <p>
              Restore the original 15 sample tickets, the sample team and an
              empty integration log.
            </p>
          </div>
          <button
            className="button button--secondary"
            type="button"
            onClick={handleReset}
          >
            <IconRefresh size={16} aria-hidden="true" />
            Reset sample data
          </button>
        </div>

        <div className="settings__row settings__row--quiet">
          <div className="settings__row-copy">
            <strong>Browser storage</strong>
            <p>
              {unavailable
                ? 'This browser refused to save changes. Reload to try again.'
                : 'Changes are saved locally as you make them.'}
            </p>
          </div>
          {unavailable ? (
            <span className="settings__warning">
              <IconAlertCircle size={16} aria-hidden="true" />
              Unavailable
            </span>
          ) : (
            <span className="settings__ok">Working</span>
          )}
        </div>
      </section>
    </section>
  )
}
