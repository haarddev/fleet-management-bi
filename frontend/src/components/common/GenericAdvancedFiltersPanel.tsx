import { useTranslation } from 'react-i18next'
import { AdvancedFiltersPanel } from './AdvancedFiltersPanel'

export type FilterField =
  | {
      type: 'text'
      key: string
      labelKey: string
      placeholder?: string
    }
  | {
      type: 'number'
      key: string
      labelKey: string
      placeholder?: string
    }
  | {
      type: 'date'
      key: string
      labelKey: string
    }
  | {
      type: 'select'
      key: string
      labelKey: string
      options: Array<{ value: string; label: string }>
    }
  | {
      type: 'checkbox'
      key: string
      labelKey: string
    }

type GenericAdvancedFiltersPanelProps<T extends Record<string, string | boolean>> = {
  titleKey: string
  fields: FilterField[]
  filters: T
  onChange: (patch: Partial<T>) => void
  onClear: () => void
  onClose: () => void
}

export function GenericAdvancedFiltersPanel<T extends Record<string, string | boolean>>({
  titleKey,
  fields,
  filters,
  onChange,
  onClear,
  onClose,
}: GenericAdvancedFiltersPanelProps<T>) {
  const { t } = useTranslation()

  return (
    <AdvancedFiltersPanel title={t(titleKey)} onClose={onClose} onClear={onClear}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {fields.map((field) => {
          if (field.type === 'checkbox') {
            return (
              <label
                key={field.key}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary"
                  checked={Boolean(filters[field.key])}
                  onChange={(e) => onChange({ [field.key]: e.target.checked } as Partial<T>)}
                />
                {t(field.labelKey)}
              </label>
            )
          }

          if (field.type === 'select') {
            return (
              <label key={field.key} className="flex flex-col gap-1.5">
                <span className="field-label">{t(field.labelKey)}</span>
                <select
                  className="field cursor-pointer"
                  value={String(filters[field.key] ?? '')}
                  onChange={(e) => onChange({ [field.key]: e.target.value } as Partial<T>)}
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )
          }

          return (
            <label key={field.key} className="flex flex-col gap-1.5">
              <span className="field-label">{t(field.labelKey)}</span>
              <input
                type={field.type}
                className="field cursor-text"
                placeholder={'placeholder' in field ? field.placeholder : undefined}
                value={String(filters[field.key] ?? '')}
                onChange={(e) => onChange({ [field.key]: e.target.value } as Partial<T>)}
              />
            </label>
          )
        })}
      </div>
    </AdvancedFiltersPanel>
  )
}
