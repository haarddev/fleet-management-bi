import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

const currencyFormatter = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('he-IL', {
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

/** Plain number for KPI cards (no currency symbol). */
export function formatKpiNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatPercent(value: number, showSign = false): string {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function formatDate(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export function formatChange(value: number): ReactNode {
  if (value === 0) return '—'
  const arrow = value > 0 ? '↑' : '↓'
  return (
    <span className={cn('font-semibold', value > 0 ? 'text-emerald-600' : 'text-red-600')}>
      {formatPercent(Math.abs(value))} {arrow}
    </span>
  )
}
