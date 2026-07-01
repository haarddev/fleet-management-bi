export function toInputDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function defaultMonthRange(): { start: string; end: string } {
  const end = new Date()
  const start = new Date(end.getFullYear(), end.getMonth(), 1)
  return { start: toInputDate(start), end: toInputDate(end) }
}

/** Last 7 days — used for drill-down demo when no range is applied */
export function demoDateRange(): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 6)
  return { start: toInputDate(start), end: toInputDate(end) }
}

/** DD/MM/YYYY for applied-range display */
export function formatRangeDisplay(isoDate: string): string {
  if (!isoDate) return '—'
  const [y, m, d] = isoDate.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
