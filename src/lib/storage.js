import seed from '../data/seed.json'

export const STORAGE_KEY = 'complaint-tracker:v1'
const STORE_VERSION = 4

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
  if (!store || ![1, 2, 3, 4].includes(store.version)) return false

  return Boolean(
    Number.isFinite(store.counter) &&
      Array.isArray(store.staff) &&
      Array.isArray(store.complaints) &&
      Array.isArray(store.events) &&
      (store.version !== 3 ||
        (Array.isArray(store.integrations) &&
          Array.isArray(store.deliveries))),
  )
}

// Version 4 replaces the sparse 15-ticket sample with a full year of history.
// Earlier local prototype edits are intentionally replaced so every chart has
// enough real buckets to read.
export function migrateStore(store) {
  if (store.version === STORE_VERSION) return store
  return cloneSeed()
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
