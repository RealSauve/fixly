import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconBrandX,
  IconDots,
  IconHelpCircle,
  IconMail,
  IconPhone,
  IconShare,
  IconWalk,
  IconWebhook,
  IconWorld,
} from '@tabler/icons-react'
import { SOURCES } from './constants'

// Metadata for each intake channel. Chart colours reference brand tokens;
// the SVG charts apply them through CSS custom properties.
export const SOURCE_META = {
  Website: { icon: IconWorld, slug: 'website', color: 'var(--source-website)' },
  Email: { icon: IconMail, slug: 'email', color: 'var(--source-email)' },
  Webhook: { icon: IconWebhook, slug: 'webhook', color: 'var(--source-webhook)' },
  'Phone Call': { icon: IconPhone, slug: 'phone-call', color: 'var(--source-phone-call)' },
  WhatsApp: {
    icon: IconBrandWhatsapp,
    slug: 'whatsapp',
    color: 'var(--source-whatsapp)',
  },
  Instagram: {
    icon: IconBrandInstagram,
    slug: 'instagram',
    color: 'var(--source-instagram)',
  },
  Facebook: {
    icon: IconBrandFacebook,
    slug: 'facebook',
    color: 'var(--source-facebook)',
  },
  'X/Twitter': {
    icon: IconBrandX,
    slug: 'x-twitter',
    color: 'var(--source-x-twitter)',
  },
  'Social Media': {
    icon: IconShare,
    slug: 'social-media',
    color: 'var(--source-social-media)',
  },
  'Walk-in': { icon: IconWalk, slug: 'walk-in', color: 'var(--source-walk-in)' },
  Other: { icon: IconDots, slug: 'other', color: 'var(--source-other)' },
  Unknown: {
    icon: IconHelpCircle,
    slug: 'unknown',
    color: 'var(--source-unknown)',
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
