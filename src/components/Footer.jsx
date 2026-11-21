export default function Footer({ onReset }) {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__text">
          Prototype. Data is saved in this browser only.
        </p>
        <button className="button button--text" type="button" onClick={onReset}>
          Reset demo data
        </button>
      </div>
    </footer>
  )
}
