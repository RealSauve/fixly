import { useEffect, useState } from 'react'

// The dashboard is the home screen; ticket lists and tools each have a hash
// route. The ticket detail screen stays at #/ticket/<id>.
const VIEW_PATTERN =
  /^\/(tickets|inbox|assigned|unassigned|reviews|sources|team|integrations|settings)\/?$/

function readFilters(query) {
  const filters = {}
  const priority = query.get('priority')
  const status = query.get('status')
  const source = query.get('source')
  const assignee = query.get('assignee')
  const age = query.get('age')
  if (priority) filters.priority = priority
  if (status) filters.status = status
  if (source) filters.source = source
  if (assignee) filters.assignee = assignee
  if (age) filters.age = age
  return Object.keys(filters).length > 0 ? filters : null
}

function parse(hash) {
  const raw = (hash || '').replace(/^#/, '') || '/'
  const queryIndex = raw.indexOf('?')
  const path = queryIndex >= 0 ? raw.slice(0, queryIndex) : raw
  const query = new URLSearchParams(queryIndex >= 0 ? raw.slice(queryIndex + 1) : '')
  const suffix = queryIndex >= 0 ? raw.slice(queryIndex) : ''

  if (path === '/' || path === '/dashboard') return { name: 'dashboard' }

  if (path === '/complaints') {
    return { name: 'list', view: 'tickets', filters: readFilters(query), redirect: `/tickets${suffix}` }
  }

  const viewMatch = path.match(VIEW_PATTERN)
  if (viewMatch) {
    return {
      name: 'list',
      view: viewMatch[1],
      filters: viewMatch[1] === 'tickets' ? readFilters(query) : null,
    }
  }

  const intakeMatch = path.match(/^\/intake\/(website)\/?$/)
  if (intakeMatch) return { name: 'intake', channel: intakeMatch[1] }

  const match = path.match(/^\/(?:ticket|complaint)\/([^/]+)\/?$/)
  if (match) {
    let id = match[1]
    try {
      id = decodeURIComponent(id)
    } catch {
      // Keep the raw value if it is not valid percent-encoding.
    }
    const redirect = path.startsWith('/complaint/') ? `/ticket/${match[1]}` : null
    return { name: 'detail', id, redirect }
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

  const route = parse(hash)

  useEffect(() => {
    if (route.redirect) window.location.hash = route.redirect
  }, [route.redirect])

  const navigate = (next) => {
    window.location.hash = next
  }

  return { ...route, navigate }
}
