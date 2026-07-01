import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { Direction, GlobalFilters, Language, PriceType } from '../types'

type AppContextValue = {
  language: Language
  direction: Direction
  setLanguage: (lang: Language) => void
  priceType: PriceType
  setPriceType: (price: PriceType) => void
  filters: GlobalFilters
  setFilters: (filters: Partial<GlobalFilters>) => void
}

const AppContext = createContext<AppContextValue | null>(null)

const defaultFilters: GlobalFilters = {
  period: 'monthly-reverse',
  area: 'all',
  search: '',
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const [language, setLanguageState] = useState<Language>(
    (localStorage.getItem('fleet-bi-lang') as Language) ??
      (import.meta.env.VITE_DEFAULT_LANGUAGE as Language) ??
      'he',
  )
  const [priceType, setPriceType] = useState<PriceType>('A')
  const [filters, setFiltersState] = useState<GlobalFilters>(defaultFilters)

  const direction: Direction = language === 'he' ? 'rtl' : 'ltr'

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang)
      localStorage.setItem('fleet-bi-lang', lang)
      void i18n.changeLanguage(lang)
    },
    [i18n],
  )

  const setFilters = useCallback((partial: Partial<GlobalFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }))
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = direction
  }, [language, direction])

  const value = useMemo(
    () => ({
      language,
      direction,
      setLanguage,
      priceType,
      setPriceType,
      filters,
      setFilters,
    }),
    [language, direction, setLanguage, priceType, filters, setFilters],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
