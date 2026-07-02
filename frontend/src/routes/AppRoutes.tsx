import { Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlobalFiltersBar } from '../components/layout/GlobalFilters'
import { MainLayout } from '../components/layout/MainLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { ActivityLogPage } from '../pages/management/ActivityLog'
import {
  AgreementsPage,
  DisabledVehiclesPage,
  DowntimePage,
  ExpensesPage,
  RelocationsPage,
  VehicleInventoryPage,
} from '../pages/maintenance'
import { DailyStatusPage } from '../pages/operation/DailyStatus'
import { WorkSchedulePage } from '../pages/operation/WorkSchedule'
import { DriverIdleAnalysisPage, VehicleIdleAnalysisPage } from '../pages/idle/IdleAnalysis'
import { SettingsPage } from '../pages/settings/SettingsPage'
import { CustomerRevenuePage } from '../pages/revenue/CustomerRevenue'
import { DriverRevenuePage } from '../pages/revenue/DriverRevenue'
import { VehicleRevenuePage } from '../pages/revenue/VehicleRevenue'
import { WeeklyCenterPage } from '../pages/revenue/WeeklyCenter'
import { ProtectedRoute } from './ProtectedRoute'
import { HomeRedirect } from './HomeRedirect'

type ScreenRoute = {
  path: string
  titleKey: string
  element: React.ReactNode
  showPriceToggle?: boolean
  showGlobalFilters?: boolean
}

function ScreenRouteWrapper({
  titleKey,
  showPriceToggle,
  showGlobalFilters = true,
  element,
}: {
  titleKey: string
  showPriceToggle?: boolean
  showGlobalFilters?: boolean
  element: React.ReactNode
}) {
  const { t } = useTranslation()
  return (
    <MainLayout
      title={t(titleKey)}
      filters={showGlobalFilters ? <GlobalFiltersBar showPriceToggle={showPriceToggle} /> : undefined}
    >
      {element}
    </MainLayout>
  )
}

const screens: ScreenRoute[] = [
  { path: '/daily', titleKey: 'weeklyCenter.title', element: <WeeklyCenterPage /> },
  { path: '/vehicleRevenue', titleKey: 'vehicleRevenue.title', element: <VehicleRevenuePage />, showPriceToggle: true },
  { path: '/customerRevenue', titleKey: 'customerRevenue.title', element: <CustomerRevenuePage /> },
  { path: '/driverRevenue', titleKey: 'driverRevenue.title', element: <DriverRevenuePage />, showPriceToggle: true },
  { path: '/maintenance/vehicle-inventory', titleKey: 'maintenance.vehicleInventory', element: <VehicleInventoryPage /> },
  { path: '/maintenance/disabled-vehicles', titleKey: 'maintenance.disabledVehicles', element: <DisabledVehiclesPage /> },
  { path: '/maintenance/downtime', titleKey: 'maintenance.downtime', element: <DowntimePage /> },
  { path: '/maintenance/agreements', titleKey: 'maintenance.agreements', element: <AgreementsPage /> },
  { path: '/maintenance/expenses', titleKey: 'maintenance.expenses', element: <ExpensesPage /> },
  { path: '/maintenance/relocations', titleKey: 'maintenance.relocations', element: <RelocationsPage /> },
  { path: '/management/activity-log', titleKey: 'management.activityLog', element: <ActivityLogPage /> },
  { path: '/operation/daily-status', titleKey: 'operation.dailyStatus', element: <DailyStatusPage /> },
  { path: '/operation/work-schedule', titleKey: 'operation.workSchedule', element: <WorkSchedulePage /> },
  { path: '/idle/vehicle-analysis', titleKey: 'idle.vehicleAnalysis', element: <VehicleIdleAnalysisPage /> },
  { path: '/idle/driver-analysis', titleKey: 'idle.driverAnalysis', element: <DriverIdleAnalysisPage /> },
  { path: '/settings', titleKey: 'settings.title', element: <SettingsPage />, showGlobalFilters: false },
]

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomeRedirect />
          </ProtectedRoute>
        }
      />
      {screens.map((screen) => (
        <Route
          key={screen.path}
          path={screen.path}
          element={
            <ProtectedRoute path={screen.path}>
              <ScreenRouteWrapper
                titleKey={screen.titleKey}
                showPriceToggle={screen.showPriceToggle}
                showGlobalFilters={screen.showGlobalFilters}
                element={screen.element}
              />
            </ProtectedRoute>
          }
        />
      ))}
    </Routes>
  )
}
