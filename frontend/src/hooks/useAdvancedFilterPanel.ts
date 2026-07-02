import { useMemo, useState } from 'react'

export function useAdvancedFilterPanel<T>(defaults: T, isActive: (filters: T) => boolean) {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState(defaults)

  const active = useMemo(() => isActive(filters), [filters, isActive])

  return {
    open,
    filters,
    active,
    setFilters,
    patch: (patch: Partial<T>) => setFilters((prev) => ({ ...prev, ...patch })),
    clear: () => setFilters(defaults),
    toggle: () => setOpen((value) => !value),
    close: () => setOpen(false),
    toolbarProps: {
      filterActive: open || active,
      onFilter: () => setOpen((value) => !value),
    },
  }
}
