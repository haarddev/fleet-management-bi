import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import he from './locales/he.json'

const savedLang = localStorage.getItem('fleet-bi-lang') as 'en' | 'he' | null
const defaultLang = import.meta.env.VITE_DEFAULT_LANGUAGE || 'he'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    he: { translation: he },
  },
  lng: savedLang ?? defaultLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
