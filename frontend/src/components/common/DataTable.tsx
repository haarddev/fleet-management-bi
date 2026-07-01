import type { CellStatus } from '../../types'
import { cn } from '../../lib/cn'

export type Column<T> = {
  key: string
  label: string
  align?: 'start' | 'center' | 'end'
  render?: (row: T, index: number) => React.ReactNode
  cellStatus?: (row: T) => CellStatus | undefined
}

const cellStatusClass: Record<CellStatus, string> = {
  normal: 'text-slate-900',
  'below-threshold': 'font-semibold text-red-600',
  positive: 'font-semibold text-emerald-600',
  negative: 'font-semibold text-red-600',
  'no-data': 'text-slate-400',
}

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  selectedKey?: string
  rowKey: (row: T) => string
  stickyFirst?: boolean
  emptyMessage?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  selectedKey,
  rowKey,
  stickyFirst = false,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'sticky top-0 z-[1] px-4 py-3 text-start text-[11px] font-bold uppercase tracking-wider text-slate-500',
                    stickyFirst && 'first:z-[2] first:start-0 first:shadow-[2px_0_6px_rgb(15_23_42/0.04)]',
                  )}
                  style={{ textAlign: col.align ?? 'start' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const key = rowKey(row)
                const isSelected = selectedKey === key
                return (
                  <tr
                    key={key}
                    className={cn(
                      'border-b border-slate-100 transition-colors duration-150',
                      'hover:bg-blue-50/50',
                      idx % 2 === 1 && 'bg-slate-50/40',
                      onRowClick && 'cursor-pointer',
                      isSelected && 'bg-blue-50 shadow-[inset_3px_0_0_var(--color-primary)]',
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => {
                      const status = col.cellStatus?.(row)
                      return (
                        <td
                          key={col.key}
                          className={cn(
                            'whitespace-nowrap px-4 py-3',
                            status && cellStatusClass[status],
                            stickyFirst && 'first:sticky first:start-0 first:z-[1] first:bg-inherit',
                          )}
                          style={{ textAlign: col.align ?? 'start' }}
                        >
                          {col.render ? col.render(row, idx) : String(row[col.key] ?? '—')}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
