import seed from '../data/seed.json'

export const STORAGE_KEY = 'complaint-tracker:v1'
const STORE_VERSION = 2

export function cloneSeed() {
  return JSON.parse(JSON.stringify(seed))
}

function getStorage() {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function isValidStore(store) {
  return Boolean(
    store &&
      (store.version === 1 || store.version === 2) &&
      Number.isFinite(store.counter) &&
      Array.isArray(store.staff) &&
      Array.isArray(store.complaints) &&
      Array.isArray(store.events),
  )
}

// Version 1 stores predate complaint sources. Backfill from the sample set
// where the id matches, otherwise label the record Unknown so nothing is lost.
export function migrateStore(store) {
  if (store.version === STORE_VERSION) return store

  const seedSources = new Map(
    seed.complaints.map((complaint) => [complaint.id, complaint.source]),
  )

  return {
    ...store,
    version: STORE_VERSION,
    complaints: store.complaints.map((complaint) => ({
      ...complaint,
      source:
        complaint.source ?? seedSources.get(complaint.id) ?? 'Unknown',
    })),
  }
}

export function saveStore(store) {
  const storage = getStorage()
  if (!storage) return false

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(store))
    return true
  } catch {
    return false
  }
}

export function loadStore() {
  const storage = getStorage()
  if (!storage) {
    return { store: cloneSeed(), status: 'unavailable' }
  }

  let raw = null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { store: cloneSeed(), status: 'unavailable' }
  }

  if (!raw) {
    const store = cloneSeed()
    return { store, status: saveStore(store) ? 'seeded' : 'unavailable' }
  }

  try {
    const parsed = JSON.parse(raw)
    if (isValidStore(parsed)) {
      const store = migrateStore(parsed)
      if (store !== parsed) saveStore(store)
      return { store, status: 'loaded' }
    }
  } catch {
    // Fall through to recovery below.
  }

  const store = cloneSeed()
  return { store, status: saveStore(store) ? 'recovered' : 'unavailable' }
}

export function clearStore() {
  const storage = getStorage()
  if (!storage) return false

  try {
    storage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
