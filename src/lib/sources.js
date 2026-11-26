import {
  IconBrandWhatsapp,
  IconDots,
  IconHelpCircle,
  IconMail,
  IconPhone,
  IconShare,
  IconWalk,
  IconWorld,
} from '@tabler/icons-react'
import { SOURCES } from './constants'

// Metadata for each intake channel: an icon, a CSS class and a chart colour.
// The chart colour lives here because the SVG charts need a real value.
export const SOURCE_META = {
  Website: {
    icon: IconWorld,
    slug: 'website',
    color: '#2563eb',
  },
  Email: {
    icon: IconMail,
    slug: 'email',
    color: '#7c3aed',
  },
  'Phone Call': {
    icon: IconPhone,
    slug: 'phone-call',
    color: '#0ea5e9',
  },
  WhatsApp: {
    icon: IconBrandWhatsapp,
    slug: 'whatsapp',
    color: '#16a34a',
  },
  'Social Media': {
    icon: IconShare,
    slug: 'social-media',
    color: '#db2777',
  },
  'Walk-in': {
    icon: IconWalk,
    slug: 'walk-in',
    color: '#d97706',
  },
  Other: {
    icon: IconDots,
    slug: 'other',
    color: '#64748b',
  },
  Unknown: {
    icon: IconHelpCircle,
    slug: 'unknown',
    color: '#94a3b8',
  },
}

// Older complaints may have no source at all, so everything funnels through
// this helper instead of reading complaint.source directly.
export function normaliseSource(value) {
  return value && SOURCE_META[value] ? value : 'Unknown'
}

export function sourceMeta(value) {
  return SOURCE_META[normaliseSource(value)]
}

// Order used by charts and tables: the real channels first, Unknown last.
export const SOURCE_ORDER = [...SOURCES, 'Unknown']
