import { useEffect, useRef, useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { CATEGORIES, PRIORITIES, SOURCES } from '../lib/constants'
import {
  LIMITS,
  findRecentDuplicate,
  validateComplaint,
} from '../lib/validate'
import Field from './Field'

const EMPTY_VALUES = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  subject: '',
  description: '',
  category: '',
  source: '',
  priority: 'Medium',
  assigneeId: '',
}

function describedBy(...ids) {
  return ids.filter(Boolean).join(' ') || undefined
}

export default function NewComplaintDrawer({
  complaints,
  staff,
  onCreate,
  onCreated,
  onClose,
}) {
  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [warning, setWarning] = useState(false)

  const dialogRef = useRef(null)
  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const phoneRef = useRef(null)
  const subjectRef = useRef(null)
  const descriptionRef = useRef(null)
  const categoryRef = useRef(null)
  const sourceRef = useRef(null)
  const submitRef = useRef(null)
  const warningRef = useRef(null)
  const savingRef = useRef(false)

  useEffect(() => {
    if (warning) warningRef.current?.scrollIntoView({ block: 'nearest' })
  }, [warning])

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusable =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialog) return

      const nodes = [...dialog.querySelectorAll(focusable)].filter(
        (node) => node.offsetParent !== null,
      )
      if (nodes.length === 0) return

      const first = nodes[0]
      const last = nodes[nodes.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  function update(field, value) {
    const next = { ...values, [field]: value }
    setValues(next)

    if (warning && (field === 'customerName' || field === 'subject')) {
      setWarning(false)
    }
    if (submitted) setErrors(validateComplaint(next))
  }

  function focusFirstInvalid(nextErrors) {
    if (nextErrors.customerName) return nameRef.current?.focus()
    if (nextErrors.customerEmail || nextErrors.contact)
      return emailRef.current?.focus()
    if (nextErrors.customerPhone) return phoneRef.current?.focus()
    if (nextErrors.subject) return subjectRef.current?.focus()
    if (nextErrors.description) return descriptionRef.current?.focus()
    if (nextErrors.category) return categoryRef.current?.focus()
    if (nextErrors.source) return sourceRef.current?.focus()
  }

  function submit(force = false) {
    if (savingRef.current) return

    const nextErrors = validateComplaint(values)
    setErrors(nextErrors)
    setSubmitted(true)

    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalid(nextErrors)
      return
    }

    if (!force && findRecentDuplicate(complaints, values)) {
      setWarning(true)
      return
    }

    savingRef.current = true
    setSaving(true)
    const complaint = onCreate(values)
    onCreated(complaint)
  }

  function handleSubmit(event) {
    event.preventDefault()
    submit(false)
  }

  function dismissWarning() {
    setWarning(false)
    requestAnimationFrame(() => submitRef.current?.focus())
  }

  const validateOnBlur = () => {
    if (submitted) setErrors(validateComplaint(values))
  }

  return (
    <>
      <div className="drawer-scrim" onClick={onClose} aria-hidden="true" />
      <aside
        ref={dialogRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-complaint-title"
      >
        <header className="drawer__header">
          <h2 className="drawer__title" id="new-complaint-title">
            New ticket
          </h2>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            <IconX size={18} aria-hidden="true" />
          </button>
        </header>

        <form className="drawer__form" onSubmit={handleSubmit} noValidate>
          <div className="drawer__body">
            <Field
              id="customerName"
              label="Customer name"
              error={errors.customerName}
            >
              <input
                ref={nameRef}
                className="field__input"
                id="customerName"
                name="customerName"
                type="text"
                autoComplete="name"
                maxLength={LIMITS.nameMax}
                value={values.customerName}
                aria-invalid={Boolean(errors.customerName)}
                aria-describedby={describedBy(
                  errors.customerName && 'customerName-error',
                )}
                onChange={(event) => update('customerName', event.target.value)}
                onBlur={validateOnBlur}
              />
            </Field>

            <Field
              id="customerEmail"
              label="Email"
              error={errors.customerEmail}
            >
              <input
                ref={emailRef}
                className="field__input"
                id="customerEmail"
                name="customerEmail"
                type="email"
                autoComplete="email"
                value={values.customerEmail}
                aria-invalid={Boolean(errors.customerEmail)}
                aria-describedby={describedBy(
                  errors.customerEmail && 'customerEmail-error',
                  errors.contact && 'contact-error',
                )}
                onChange={(event) => update('customerEmail', event.target.value)}
                onBlur={validateOnBlur}
              />
            </Field>

            <Field
              id="customerPhone"
              label="Phone"
              error={errors.customerPhone}
            >
              <input
                ref={phoneRef}
                className="field__input"
                id="customerPhone"
                name="customerPhone"
                type="tel"
                autoComplete="tel"
                value={values.customerPhone}
                aria-invalid={Boolean(errors.customerPhone)}
                aria-describedby={describedBy(
                  errors.customerPhone && 'customerPhone-error',
                  errors.contact && 'contact-error',
                )}
                onChange={(event) => update('customerPhone', event.target.value)}
                onBlur={validateOnBlur}
              />
            </Field>

            {errors.contact ? (
              <p className="form__error" id="contact-error" role="alert">
                {errors.contact}
              </p>
            ) : null}

            <Field id="subject" label="Subject" error={errors.subject}>
              <input
                ref={subjectRef}
                className="field__input"
                id="subject"
                name="subject"
                type="text"
                maxLength={LIMITS.subjectMax}
                value={values.subject}
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={describedBy(
                  errors.subject && 'subject-error',
                )}
                onChange={(event) => update('subject', event.target.value)}
                onBlur={validateOnBlur}
              />
            </Field>

            <Field
              id="description"
              label="Description"
              error={errors.description}
              hint={`${values.description.length} / ${LIMITS.descriptionMax}`}
              hintClassName="field__hint--right"
            >
              <textarea
                ref={descriptionRef}
                className="field__textarea"
                id="description"
                name="description"
                rows={4}
                maxLength={LIMITS.descriptionMax}
                value={values.description}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={describedBy(
                  errors.description && 'description-error',
                  'description-hint',
                )}
                onChange={(event) => update('description', event.target.value)}
                onBlur={validateOnBlur}
              />
            </Field>

            <Field id="category" label="Category" error={errors.category}>
              <select
                ref={categoryRef}
                className="field__select"
                id="category"
                name="category"
                value={values.category}
                aria-invalid={Boolean(errors.category)}
                aria-describedby={describedBy(
                  errors.category && 'category-error',
                )}
                onChange={(event) => update('category', event.target.value)}
                onBlur={validateOnBlur}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              id="source"
              label="Ticket source"
              error={errors.source}
              hint="Where the ticket reached you."
            >
              <select
                ref={sourceRef}
                className="field__select"
                id="source"
                name="source"
                value={values.source}
                aria-invalid={Boolean(errors.source)}
                aria-describedby={describedBy(
                  errors.source && 'source-error',
                  'source-hint',
                )}
                onChange={(event) => update('source', event.target.value)}
                onBlur={validateOnBlur}
              >
                <option value="">Select a source</option>
                {SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </Field>

            <div className="field">
              <span className="field__label" id="priority-label">
                Priority
              </span>
              <div
                className="segmented"
                role="group"
                aria-labelledby="priority-label"
              >
                {PRIORITIES.map((priority) => (
                  <button
                    key={priority}
                    className={`segmented__option${
                      values.priority === priority ? ' is-selected' : ''
                    }`}
                    type="button"
                    aria-pressed={values.priority === priority}
                    onClick={() => update('priority', priority)}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            <Field id="assignee" label="Assigned to">
              <select
                className="field__select"
                id="assignee"
                name="assignee"
                value={values.assigneeId}
                onChange={(event) => update('assigneeId', event.target.value)}
              >
                <option value="">Unassigned</option>
                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </Field>

            {warning ? (
              <div ref={warningRef} className="form__warning" role="alert">
                <p>This looks like a ticket you just logged.</p>
                <div className="form__warning-actions">
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => submit(true)}
                  >
                    Log anyway
                  </button>
                  <button
                    className="button button--text"
                    type="button"
                    onClick={dismissWarning}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <footer className="drawer__footer">
            <button
              className="button button--text"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              ref={submitRef}
              className="button button--primary"
              type="submit"
              disabled={saving}
            >
              Log ticket
            </button>
          </footer>
        </form>
      </aside>
    </>
  )
}
