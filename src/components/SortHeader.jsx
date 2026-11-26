import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsSort,
} from '@tabler/icons-react'

export default function SortHeader({
  label,
  sortKey,
  sort,
  onSortChange,
  className,
}) {
  const active = sort?.key === sortKey
  const Icon = !active
    ? IconArrowsSort
    : sort.direction === 'asc'
      ? IconArrowUp
      : IconArrowDown

  return (
    <th
      scope="col"
      className={className}
      aria-sort={
        active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <button
        className="data-table__sort"
        type="button"
        onClick={() =>
          onSortChange?.({
            key: sortKey,
            direction: active && sort.direction === 'asc' ? 'desc' : 'asc',
          })
        }
      >
        <span>{label}</span>
        <Icon size={12} aria-hidden="true" />
      </button>
    </th>
  )
}
