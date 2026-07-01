import type { GlobalFilters } from '../types'

const AREA_KEYWORDS: Record<string, string[]> = {
  south: ['south'],
  north: ['north'],
  rishon: ['rishon'],
}

function rowText(row: Record<string, unknown>): string {
  return Object.values(row)
    .flatMap((v) => {
      if (typeof v === 'string') return [v]
      if (typeof v === 'number') return [String(v)]
      if (Array.isArray(v)) return v.map(String)
      return []
    })
    .join(' ')
    .toLowerCase()
}

export function matchesArea(row: Record<string, unknown>, area: string): boolean {
  if (area === 'all') return true
  const keywords = AREA_KEYWORDS[area] ?? [area]
  const haystack = rowText(row)
  return keywords.some((k) => haystack.includes(k))
}

export function matchesSearch(row: Record<string, unknown>, search: string): boolean {
  const q = search.trim().toLowerCase()
  if (!q) return true
  return rowText(row).includes(q)
}

export function applyGlobalFilters<T extends Record<string, unknown>>(rows: T[], filters: GlobalFilters): T[] {
  return rows.filter((row) => matchesArea(row, filters.area) && matchesSearch(row, filters.search))
}

export function filterDateKeys(dateKeys: string[], period: string): string[] {
  if (!dateKeys.length) return dateKeys
  const sorted = [...dateKeys].sort()
  const latest = new Date(sorted[sorted.length - 1])

  if (period === 'yearly') {
    const start = new Date(latest)
    start.setFullYear(start.getFullYear() - 1)
    return sorted.filter((d) => new Date(d) >= start)
  }

  if (period === 'quarterly') {
    const start = new Date(latest)
    start.setMonth(start.getMonth() - 3)
    return sorted.filter((d) => new Date(d) >= start)
  }

  const start = new Date(latest.getFullYear(), latest.getMonth(), 1)
  const end = new Date(latest.getFullYear(), latest.getMonth() + 1, 1)
  return sorted.filter((d) => {
    const dt = new Date(d)
    return dt >= start && dt < end
  })
}

export function filtersAreActive(filters: GlobalFilters): boolean {
  return filters.area !== 'all' || filters.search.trim().length > 0
}

export function focusGlobalFilters() {
  document.getElementById('global-filters')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  window.setTimeout(() => document.getElementById('global-search-input')?.focus(), 250)
}
