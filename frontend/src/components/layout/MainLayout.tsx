import { Outlet } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

type MainLayoutProps = {
  title: string
  filters?: React.ReactNode
  children?: React.ReactNode
}

export function MainLayout({ title, filters, children }: MainLayoutProps) {
  const { direction } = useApp()

  return (
    <div dir={direction} className="flex h-screen overflow-hidden flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header title={title} />
        {filters}
        <main className="flex-1 overflow-auto px-6 py-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">{children ?? <Outlet />}</div>
        </main>
      </div>
    </div>
  )
}
