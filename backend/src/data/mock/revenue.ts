export type WeeklyKpis = {
  totalRevenue: number
  totalBuses: number
  busesPercent: number
  totalMinibuses: number
  minibusesPercent: number
  totalContractor: number
  contractorPercent: number
  days: number
}

export type DailyCell = {
  date: string
  revenue: number | null
  vehicles: number
  organicVehicles: number
  changePercent: number | null
  holiday?: string
}

export type WeeklyRow = {
  weekNum: number
  year: number
  days: DailyCell[]
  summary: {
    totalIncome: number
    avgDailyRevenue: number
    avgContractor: number
    avgOrganic: number
    changePercent: number
  }
}

export type WeeklyCenterResponse = {
  kpis: WeeklyKpis
  weeks: WeeklyRow[]
}

export const weeklyCenterMock: WeeklyCenterResponse = {
  kpis: {
    totalRevenue: 12_450_000,
    totalBuses: 7_200_000,
    busesPercent: 57.8,
    totalMinibuses: 3_100_000,
    minibusesPercent: 24.9,
    totalContractor: 2_150_000,
    contractorPercent: 17.3,
    days: 22,
  },
  weeks: [
    {
      weekNum: 16,
      year: 2026,
      days: [
        { date: '2026-04-12', revenue: 580000, vehicles: 22, organicVehicles: 8, changePercent: 3.2 },
        { date: '2026-04-13', revenue: 620000, vehicles: 24, organicVehicles: 9, changePercent: 5.1 },
        { date: '2026-04-14', revenue: 590000, vehicles: 23, organicVehicles: 8, changePercent: -1.4 },
        { date: '2026-04-15', revenue: 610000, vehicles: 24, organicVehicles: 10, changePercent: 2.8 },
        { date: '2026-04-16', revenue: 640000, vehicles: 25, organicVehicles: 11, changePercent: 4.5 },
        { date: '2026-04-17', revenue: 420000, vehicles: 18, organicVehicles: 6, changePercent: -8.2 },
        { date: '2026-04-18', revenue: null, vehicles: 0, organicVehicles: 0, changePercent: null, holiday: 'Memorial Day' },
      ],
      summary: {
        totalIncome: 3_460_000,
        avgDailyRevenue: 576_667,
        avgContractor: 98_500,
        avgOrganic: 478_167,
        changePercent: 2.4,
      },
    },
    {
      weekNum: 15,
      year: 2026,
      days: [
        { date: '2026-04-05', revenue: 560000, vehicles: 21, organicVehicles: 7, changePercent: 1.1 },
        { date: '2026-04-06', revenue: 600000, vehicles: 23, organicVehicles: 9, changePercent: 3.8 },
        { date: '2026-04-07', revenue: 575000, vehicles: 22, organicVehicles: 8, changePercent: -0.5 },
        { date: '2026-04-08', revenue: 595000, vehicles: 23, organicVehicles: 9, changePercent: 1.9 },
        { date: '2026-04-09', revenue: 630000, vehicles: 24, organicVehicles: 10, changePercent: 4.2 },
        { date: '2026-04-10', revenue: 410000, vehicles: 17, organicVehicles: 5, changePercent: -6.1 },
        { date: '2026-04-11', revenue: 380000, vehicles: 16, organicVehicles: 5, changePercent: -4.3 },
      ],
      summary: {
        totalIncome: 3_350_000,
        avgDailyRevenue: 558_333,
        avgContractor: 92_000,
        avgOrganic: 466_333,
        changePercent: -1.2,
      },
    },
  ],
}
