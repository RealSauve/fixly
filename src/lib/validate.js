export const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  subjectMin: 3,
  subjectMax: 100,
  descriptionMin: 10,
  descriptionMax: 1000,
  noteMax: 500,
  duplicateWindowMs: 60 * 1000,
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_CHARS_RE = /^[0-9+\-()\s]+$/

export function countDigits(value) {
  return (String(value).match(/\d/g) ?? []).length
}

export function validateComplaint(values) {
  const errors = {}
  const name = String(values.customerName ?? '').trim()
  const email = String(values.customerEmail ?? '').trim()
  const phone = String(values.customerPhone ?? '').trim()
  const subject = String(values.subject ?? '').trim()
  const description = String(values.description ?? '').trim()

  if (!name) errors.customerName = 'Enter the customer name.'
  else if (name.length < LIMITS.nameMin)
    errors.customerName = `Use at least ${LIMITS.nameMin} characters.`
  else if (name.length > LIMITS.nameMax)
    errors.customerName = `Use ${LIMITS.nameMax} characters or fewer.`

  if (!email && !phone) errors.contact = 'Add an email or a phone number.'

  if (email && !EMAIL_RE.test(email)) {
    errors.customerEmail = 'Enter a valid email address.'
  }

  if (phone) {
    if (!PHONE_CHARS_RE.test(phone)) {
      errors.customerPhone = 'Use digits, spaces, +, -, or parentheses.'
    } else if (countDigits(phone) < 7) {
      errors.customerPhone = 'Enter at least 7 digits.'
    }
  }

  if (!subject) errors.subject = 'Enter a subject.'
  else if (subject.length < LIMITS.subjectMin)
    errors.subject = `Use at least ${LIMITS.subjectMin} characters.`
  else if (subject.length > LIMITS.subjectMax)
    errors.subject = `Use ${LIMITS.subjectMax} characters or fewer.`

  if (!description) errors.description = 'Describe the ticket.'
  else if (description.length < LIMITS.descriptionMin)
    errors.description = `Use at least ${LIMITS.descriptionMin} characters.`
  else if (description.length > LIMITS.descriptionMax)
    errors.description = `Use ${LIMITS.descriptionMax} characters or fewer.`

  if (!values.category) errors.category = 'Choose a category.'

  if (!values.source) errors.source = 'Choose a source.'

  return errors
}

export function findRecentDuplicate(complaints, values, now = Date.now()) {
  const name = String(values.customerName ?? '').trim().toLowerCase()
  const subject = String(values.subject ?? '').trim().toLowerCase()
  if (!name || !subject) return null

  return (
    complaints.find((complaint) => {
      if (
        complaint.customerName.trim().toLowerCase() !== name ||
        complaint.subject.trim().toLowerCase() !== subject
      ) {
        return false
      }

      const created = new Date(complaint.createdAt).getTime()
      return (
        Number.isFinite(created) &&
        now - created < LIMITS.duplicateWindowMs
      )
    }) ?? null
  )
}
