import { useEffect, useState } from 'react'

function parse(hash) {
  const path = (hash || '').replace(/^#/, '') || '/'

  if (path === '/') return { name: 'list' }

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
