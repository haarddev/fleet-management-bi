type DrillDownPanelProps = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function DrillDownPanel({ open, title, children, onClose }: DrillDownPanelProps) {
  if (!open) return null

  return (
    <aside className="card flex max-h-[calc(100vh-180px)] w-[360px] min-w-[360px] flex-col overflow-hidden shadow-elevated">
      <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/50 px-5 py-4">
        <h3 className="text-[15px] font-bold tracking-tight text-slate-900">{title}</h3>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          onClick={onClose}
          aria-label="Close"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto p-5 text-sm">{children}</div>
    </aside>
  )
}
