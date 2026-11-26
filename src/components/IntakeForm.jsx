import { useId, useState } from 'react'
import { IconSend } from '@tabler/icons-react'
import { CATEGORIES } from '../lib/constants'
import Field from './Field'

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  category: 'Delivery',
}

export default function IntakeForm({
  onSubmit,
  channel = 'website',
  heading = 'Tell us what went wrong',
  description = 'A support lead will review your ticket and follow up by email.',
  buttonLabel = 'Send ticket',
}) {
  const id = useId().replace(/:/g, '')
  const [values, setValues] = useState(EMPTY)
  const [result, setResult] = useState(null)

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    if (result) setResult(null)
  }

  function submit(event) {
    event.preventDefault()
    const outcome = onSubmit(values, channel)
    setResult(outcome)

    if (outcome.ok) {
      setValues(EMPTY)
    }
  }

  return (
    <form className="intake-form" onSubmit={submit} noValidate>
      <div className="intake-form__head">
        <h3 className="intake-form__title">{heading}</h3>
        <p className="intake-form__description">{description}</p>
      </div>

      <div className="intake-form__grid">
        <Field id={`${id}-name`} label="Your name">
          <input
            className="field__input"
            id={`${id}-name`}
            name="name"
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            autoComplete="name"
            placeholder="Halima Bello"
          />
        </Field>

        <Field id={`${id}-email`} label="Email">
          <input
            className="field__input"
            id={`${id}-email`}
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => update('email', event.target.value)}
            autoComplete="email"
            placeholder="halima@example.com"
          />
        </Field>

        <Field id={`${id}-phone`} label="Phone (optional)">
          <input
            className="field__input"
            id={`${id}-phone`}
            name="phone"
            type="tel"
            value={values.phone}
            onChange={(event) => update('phone', event.target.value)}
            autoComplete="tel"
            placeholder="+234 803 555 0142"
          />
        </Field>

        <Field id={`${id}-category`} label="Category">
          <select
            className="field__select"
            id={`${id}-category`}
            name="category"
            value={values.category}
            onChange={(event) => update('category', event.target.value)}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id={`${id}-subject`} label="Subject">
        <input
          className="field__input"
          id={`${id}-subject`}
          name="subject"
          value={values.subject}
          onChange={(event) => update('subject', event.target.value)}
          placeholder="What happened?"
        />
      </Field>

      <Field id={`${id}-message`} label="Details">
        <textarea
          className="field__textarea"
          id={`${id}-message`}
          name="message"
          value={values.message}
          onChange={(event) => update('message', event.target.value)}
          placeholder="Tell us what happened and what you expected."
        />
      </Field>

      <div className="intake-form__actions">
        <button className="button button--primary" type="submit">
          <IconSend size={16} aria-hidden="true" />
          {buttonLabel}
        </button>
        {result ? (
          <p
            className={`intake-form__result${
              result.ok ? ' is-success' : ' is-error'
            }`}
            role={result.ok ? 'status' : 'alert'}
          >
            {result.ok
              ? `Received as ${result.complaint.reference}.`
              : result.error}
          </p>
        ) : null}
      </div>
    </form>
  )
}
