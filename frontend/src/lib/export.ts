import type { Column } from '../components/common/DataTable'

export type ExportColumn = {
  key: string
  label: string
  getValue?: (row: Record<string, unknown>) => string | number
}

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export function downloadCsv(
  filename: string,
  columns: ExportColumn[],
  data: Record<string, unknown>[],
): boolean {
  if (!data.length || !columns.length) return false

  const header = columns.map((c) => escapeCsvCell(c.label)).join(',')
  const body = data
    .map((row) =>
      columns
        .map((col) => {
          const raw = col.getValue ? col.getValue(row) : row[col.key]
          const val = raw == null ? '' : String(raw)
          return escapeCsvCell(val)
        })
        .join(','),
    )
    .join('\n')

  const blob = new Blob([`\uFEFF${header}\n${body}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
  return true
}

export function buildExportColumns<T extends Record<string, unknown>>(columns: Column<T>[]): ExportColumn[] {
  return columns.map((col) => ({
    key: col.key,
    label: col.label,
    getValue: (row) => {
      if (col.render) {
        const rendered = col.render(row as T, 0)
        if (typeof rendered === 'string' || typeof rendered === 'number') return rendered
      }
      const val = row[col.key]
      return val == null ? '' : String(val)
    },
  }))
}
