import { useEffect, useState } from 'react'

// The dashboard is the home screen; complaint lists and tools each have a
// hash route. The complaint detail screen stays at #/complaint/<id>.
const VIEW_PATTERN =
  /^\/(complaints|inbox|assigned|unassigned|reviews|sources|team)\/?$/

function parse(hash) {
  const path = (hash || '').replace(/^#/, '') || '/'

  if (path === '/' || path === '/dashboard') return { name: 'dashboard' }

  const viewMatch = path.match(VIEW_PATTERN)
  if (viewMatch) return { name: 'list', view: viewMatch[1] }

  const match = path.match(/^\/complaint\/([^/]+)\/?$/)
  if (match) {
    let id = match[1]
    try {
      id = decodeURIComponent(id)
    } catch {
      // Keep the raw value if it is not valid percent-encoding.
    }
    return { name: 'detail', id }
  }

  return { name: 'notFound' }
}

export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const handleChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', handleChange)
    return () => window.removeEventListener('hashchange', handleChange)
  }, [])

  const navigate = (next) => {
    window.location.hash = next
  }

  return { ...parse(hash), navigate }
}
