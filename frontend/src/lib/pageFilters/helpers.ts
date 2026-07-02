export function hasText(value: string | undefined | null): boolean {
  return Boolean(value?.trim())
}

export function matchesText(haystack: string | undefined, needle: string): boolean {
  if (!needle.trim()) return true
  return (haystack ?? '').toLowerCase().includes(needle.trim().toLowerCase())
}

export function inNumericRange(
  value: number,
  minRaw: string,
  maxRaw: string,
): boolean {
  const min = minRaw.trim() ? Number(minRaw) : null
  const max = maxRaw.trim() ? Number(maxRaw) : null
  if (min !== null && !Number.isNaN(min) && value < min) return false
  if (max !== null && !Number.isNaN(max) && value > max) return false
  return true
}

export function inDateRange(
  value: string | undefined,
  from: string,
  to: string,
): boolean {
  if (!value) return true
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return true
  if (from) {
    const start = new Date(from)
    start.setHours(0, 0, 0, 0)
    if (date < start) return false
  }
  if (to) {
    const end = new Date(to)
    end.setHours(23, 59, 59, 999)
    if (date > end) return false
  }
  return true
}

export function uniqueValues<T>(rows: T[], getter: (row: T) => string): string[] {
  return Array.from(new Set(rows.map(getter).map((v) => v.trim()).filter(Boolean))).sort()
}

export function anyActive(values: Array<string | boolean>, allValue = 'all'): boolean {
  return values.some((value) => {
    if (typeof value === 'boolean') return value
    return value.trim() !== '' && value !== allValue
  })
}
