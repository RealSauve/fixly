export default function NotFoundView() {
  return (
    <section className="not-found">
      <p className="not-found__text">Ticket not found.</p>
      <a className="button button--secondary" href="#/tickets">
        Back to tickets
      </a>
    </section>
  )
}
