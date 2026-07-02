import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { focusGlobalFilters } from '../../lib/filters'
import { downloadCsv, type ExportColumn } from '../../lib/export'
import { usePermissions } from '../../hooks/usePermissions'
import { cn } from '../../lib/cn'

type TableToolbarProps = {
  resultCount: number
  totalCount?: number
  exportFilename?: string
  exportColumns?: ExportColumn[]
  exportData?: Record<string, unknown>[]
  onDownload?: () => void
  onFilter?: () => void
  filterActive?: boolean
}

export function TableToolbar({
  resultCount,
  totalCount,
  exportFilename = 'export',
  exportColumns,
  exportData,
  onDownload,
  onFilter,
  filterActive = false,
}: TableToolbarProps) {
  const { t } = useTranslation()
  const { canExport } = usePermissions()
  const [downloadState, setDownloadState] = useState<'idle' | 'success' | 'empty'>('idle')

  const handleFilter = () => {
    if (onFilter) onFilter()
    else focusGlobalFilters()
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
      return
    }

    if (!exportColumns?.length || !exportData?.length) {
      setDownloadState('empty')
      window.setTimeout(() => setDownloadState('idle'), 2000)
      return
    }

    const ok = downloadCsv(exportFilename, exportColumns, exportData)
    if (ok) {
      setDownloadState('success')
      window.setTimeout(() => setDownloadState('idle'), 2000)
    }
  }

  const downloadLabel =
    downloadState === 'success'
      ? t('common.downloaded')
      : downloadState === 'empty'
        ? t('common.downloadEmpty')
        : t('common.download')

  const showingFiltered = totalCount !== undefined && totalCount !== resultCount

  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
        {showingFiltered
          ? t('common.filteredResults', { count: resultCount, total: totalCount })
          : t('common.results', { count: resultCount })}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(
            'btn-secondary cursor-pointer',
            filterActive && 'border-primary/40 bg-primary/5 text-primary',
          )}
          onClick={handleFilter}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          {t('common.filter')}
        </button>
        {canExport && (
          <button
            type="button"
            className={cn(
              'btn-primary cursor-pointer',
              downloadState === 'empty' && 'border-amber-300 bg-amber-500 hover:bg-amber-600',
              downloadState === 'success' && 'border-emerald-500 bg-emerald-600 hover:bg-emerald-700',
            )}
            onClick={handleDownload}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            {downloadLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export { TableToolbar as ActionBar }
