export const STATUSES = [
  'New',
  'In Progress',
  'Waiting on Customer',
  'Resolved',
]

export const PRIORITIES = ['Low', 'Medium', 'High']

// The signed-in prototype user. Part 4 replaces this with real accounts.
export const CURRENT_USER_ID = 's1'

export const CATEGORIES = [
  'Delivery',
  'Billing & Refunds',
  'Product Quality',
  'Service Outage',
  'Account Access',
  'Other',
]

// Where a complaint came from. Kept as a list so the drawer, filters and
// analytics all read the same options.
export const SOURCES = [
  'Website',
  'Email',
  'WhatsApp',
  'Phone Call',
  'Social Media',
  'Walk-in',
  'Other',
]
