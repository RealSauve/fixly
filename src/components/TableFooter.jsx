import { useEffect, useState } from 'react'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

export function useTablePagination(rows, pageSize = 4, resetKey = '') {
  const [page, setPage] = useState(1)
  const total = rows.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => {
    setPage(1)
  }, [resetKey, total])

  const current = Math.min(page, pageCount)
  const start = (current - 1) * pageSize

  return {
    total,
    page: current,
    pageCount,
    onPageChange: setPage,
    pageRows: rows.slice(start, start + pageSize),
  }
}

function pageItems(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = new Set([1, total, current])
  if (current <= 3) {
    ;[2, 3, 4].forEach((page) => pages.add(page))
  } else if (current >= total - 2) {
    ;[total - 3, total - 2, total - 1].forEach((page) => pages.add(page))
  } else {
    pages.add(current - 1)
    pages.add(current + 1)
  }

  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)
  const items = []

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      items.push(`gap-${page}`)
    }
    items.push(page)
  })

  return items
}

export default function TableFooter({
  total,
  page,
  pageCount,
  pageSize = 4,
  resultLabel,
  onPageChange,
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(total, page * pageSize)

  return (
    <div className="data-table__footer">
      <span className="data-table__count">
        {resultLabel ? `${resultLabel} · ` : ''}
        Showing {start}–{end}
      </span>

      <nav className="data-table__pagination" aria-label="Table pagination">
        <button
          className="data-table__page data-table__page--arrow"
          type="button"
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <IconChevronLeft size={14} aria-hidden="true" />
        </button>

        {pageItems(page, pageCount).map((item) =>
          typeof item === 'string' ? (
            <span className="data-table__ellipsis" key={item} aria-hidden="true">
              …
            </span>
          ) : (
            <button
              className={`data-table__page${item === page ? ' is-active' : ''}`}
              type="button"
              key={item}
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ),
        )}

        <button
          className="data-table__page data-table__page--arrow"
          type="button"
          aria-label="Next page"
          disabled={page === pageCount}
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        >
          <IconChevronRight size={14} aria-hidden="true" />
        </button>
      </nav>
    </div>
  )
}
