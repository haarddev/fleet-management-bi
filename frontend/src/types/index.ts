export type Language = 'en' | 'he'
export type Direction = 'ltr' | 'rtl'
export type PriceType = 'A' | 'B'

export type GlobalFilters = {
  period: string
  area: string
  search: string
}

export type UserProfile = {
  name: string
  email: string
}

export type KpiItem = {
  label: string
  value: string
  subValue?: string
}

export type TableColumn<T> = {
  key: keyof T | string
  label: string
  align?: 'start' | 'center' | 'end'
  render?: (row: T) => React.ReactNode
}

export type CellStatus = 'normal' | 'below-threshold' | 'positive' | 'negative' | 'no-data'
