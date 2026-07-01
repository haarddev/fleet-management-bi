export type VehicleRevenueRow = {
  vehicleNumber: string
  threshold: number
  totalPeriod: number
  daily: Record<string, number | null>
}

export const vehicleRevenueMock: VehicleRevenueRow[] = [
  {
    vehicleNumber: '28861303',
    threshold: 24000,
    totalPeriod: 528000,
    daily: {
      '2026-04-01': 26500,
      '2026-04-02': 22000,
      '2026-04-03': null,
      '2026-04-04': 28000,
      '2026-04-05': 19500,
    },
  },
  {
    vehicleNumber: '62978603',
    threshold: 20000,
    totalPeriod: 445000,
    daily: {
      '2026-04-01': 21000,
      '2026-04-02': 22500,
      '2026-04-03': 20800,
      '2026-04-04': null,
      '2026-04-05': 23000,
    },
  },
  {
    vehicleNumber: '28860503',
    threshold: 24000,
    totalPeriod: 612000,
    daily: {
      '2026-04-01': 25000,
      '2026-04-02': 26000,
      '2026-04-03': 25500,
      '2026-04-04': 27000,
      '2026-04-05': 24800,
    },
  },
]

export type CustomerRow = {
  id: string
  name: string
  code: string
  trips: number
  vehicles: number
  totalRevenue: number
  sharePercent: number
  contractorIncome: number
  contractorSharePercent: number
  contractorProfitPercent: number
  revenueYtd: number
  vehiclesAtLoss: number
}

export const customerRevenueMock: CustomerRow[] = [
  {
    id: '1',
    name: 'Customer A',
    code: '1001',
    trips: 1240,
    vehicles: 45,
    totalRevenue: 2_450_000,
    sharePercent: 22.5,
    contractorIncome: 180000,
    contractorSharePercent: 7.3,
    contractorProfitPercent: 12.4,
    revenueYtd: 8_200_000,
    vehiclesAtLoss: 3,
  },
  {
    id: '2',
    name: 'Customer B',
    code: '1002',
    trips: 980,
    vehicles: 32,
    totalRevenue: 1_890_000,
    sharePercent: 17.4,
    contractorIncome: 145000,
    contractorSharePercent: 7.7,
    contractorProfitPercent: 10.2,
    revenueYtd: 6_100_000,
    vehiclesAtLoss: 8,
  },
  {
    id: '3',
    name: 'Jerusalem Antiquities Authority',
    code: '1045',
    trips: 650,
    vehicles: 18,
    totalRevenue: 980_000,
    sharePercent: 9.0,
    contractorIncome: 72000,
    contractorSharePercent: 7.3,
    contractorProfitPercent: 8.5,
    revenueYtd: 3_200_000,
    vehiclesAtLoss: 1,
  },
]

export type DriverRow = {
  id: string
  license: string
  name: string
  area: string
  driverType: 'employee' | 'contractor'
  totalPeriod: number
  daily: Record<string, number | null>
  trips: number
  operatingDays: number
  avgDailyIncome: number
  vehicles: string[]
  clients: string[]
}

export const driverRevenueMock: DriverRow[] = [
  {
    id: '1',
    license: 'DL-4521',
    name: 'Abd Abu Mhareb',
    area: 'South',
    driverType: 'employee',
    totalPeriod: 185000,
    daily: { '2026-04-01': 9200, '2026-04-02': 8800, '2026-04-03': null, '2026-04-04': 9500 },
    trips: 142,
    operatingDays: 20,
    avgDailyIncome: 9250,
    vehicles: ['62978603', '28861303'],
    clients: ['Customer A', 'Jerusalem Antiquities Authority'],
  },
  {
    id: '2',
    license: 'DL-3890',
    name: 'It was said by Abu Rashad',
    area: 'South',
    driverType: 'contractor',
    totalPeriod: 156000,
    daily: { '2026-04-01': 7500, '2026-04-02': 6800, '2026-04-03': 7200, '2026-04-04': null },
    trips: 118,
    operatingDays: 18,
    avgDailyIncome: 8667,
    vehicles: ['28860503'],
    clients: ['Customer B'],
  },
]
