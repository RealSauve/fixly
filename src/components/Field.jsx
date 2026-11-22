export default function Field({
  id,
  label,
  error,
  hint,
  hintClassName = '',
  children,
}) {
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p
          className={`field__hint${hintClassName ? ` ${hintClassName}` : ''}`}
          id={`${id}-hint`}
        >
          {hint}
        </p>
      ) : null}
    </div>
  )
}
