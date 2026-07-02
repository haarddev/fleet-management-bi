import { prisma } from '../db/prisma.js';
import { driverIdleMock, travelStatusLogsMock, vehicleIdleMock } from '../data/mock/modules.js';

const toNum = (v: { toNumber(): number } | number | null | undefined) =>
  v == null ? 0 : typeof v === 'number' ? v : v.toNumber();

const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

export async function getWeeklyCenterFromDb() {
  const allDays = await prisma.weeklyRevenueDay.findMany({
    orderBy: [{ year: 'desc' }, { weekNum: 'desc' }, { revenueDate: 'asc' }],
  });

  const latestMonth = allDays.length
    ? new Date(allDays.reduce((max, d) => (d.revenueDate > max ? d.revenueDate : max), allDays[0].revenueDate))
    : new Date();
  const monthStart = new Date(latestMonth.getFullYear(), latestMonth.getMonth(), 1);
  const monthEnd = new Date(latestMonth.getFullYear(), latestMonth.getMonth() + 1, 1);

  const monthDays = allDays.filter((d) => d.revenueDate >= monthStart && d.revenueDate < monthEnd);
  const totalRevenue = monthDays.reduce((s, d) => s + toNum(d.revenue), 0);
  const days = monthDays.filter((d) => d.revenue !== null).length;

  const weekMap = new Map<number, typeof allDays>();
  for (const row of allDays) {
    const key = row.year * 100 + row.weekNum;
    if (!weekMap.has(key)) weekMap.set(key, []);
    weekMap.get(key)!.push(row);
  }

  const weeks = Array.from(weekMap.values()).map((daysInWeek) => {
    const first = daysInWeek[0];
    const mappedDays = daysInWeek.map((d) => ({
      date: toDateStr(d.revenueDate),
      revenue: d.revenue !== null ? toNum(d.revenue) : null,
      vehicles: d.vehicles,
      organicVehicles: d.organicVehicles,
      changePercent: d.changePercent !== null ? toNum(d.changePercent) : null,
      holiday: d.holidayLabel ?? undefined,
    }));

    const revenues = mappedDays.map((d) => d.revenue).filter((r): r is number => r !== null);
    const totalIncome = revenues.reduce((s, r) => s + r, 0);
    const avgDailyRevenue = revenues.length ? totalIncome / revenues.length : 0;
    const changes = mappedDays.map((d) => d.changePercent).filter((c): c is number => c !== null);
    const changePercent = changes.length ? changes.reduce((s, c) => s + c, 0) / changes.length : 0;

    return {
      weekNum: first.weekNum,
      year: first.year,
      days: mappedDays,
      summary: {
        totalIncome,
        avgDailyRevenue,
        avgContractor: Math.round(avgDailyRevenue * 0.17),
        avgOrganic: Math.round(avgDailyRevenue * 0.83),
        changePercent,
      },
    };
  });

  return {
    kpis: {
      totalRevenue,
      totalBuses: Math.round(totalRevenue * 0.578),
      busesPercent: 57.8,
      totalMinibuses: Math.round(totalRevenue * 0.249),
      minibusesPercent: 24.9,
      totalContractor: Math.round(totalRevenue * 0.173),
      contractorPercent: 17.3,
      days,
    },
    weeks,
  };
}

export async function getVehicleRevenueFromDb() {
  const vehicles = await prisma.vehicle.findMany({
    include: { vehicleDailyRevenue: { orderBy: { revenueDate: 'asc' } } },
    orderBy: { vehicleNumber: 'asc' },
  });

  return vehicles.map((v) => {
    const daily: Record<string, number | null> = {};
    let totalPeriod = 0;
    for (const r of v.vehicleDailyRevenue) {
      const key = toDateStr(r.revenueDate);
      const revenue = r.revenue !== null ? toNum(r.revenue) : null;
      daily[key] = revenue;
      if (revenue !== null) totalPeriod += revenue;
    }
    return {
      vehicleNumber: v.vehicleNumber,
      threshold: toNum(v.incomeThreshold),
      totalPeriod,
      daily,
    };
  });
}

export async function getCustomersFromDb() {
  const rows = await prisma.customer.findMany({
    include: { customerRevenueSummary: { orderBy: { totalRevenue: 'desc' } } },
  });

  const data = rows
    .flatMap((c) =>
      c.customerRevenueSummary.map((s) => ({
        id: String(c.id),
        name: c.name,
        code: c.code,
        trips: s.trips,
        vehicles: s.vehicles,
        totalRevenue: toNum(s.totalRevenue),
        sharePercent: toNum(s.sharePercent),
        contractorIncome: toNum(s.contractorIncome),
        contractorSharePercent: toNum(s.contractorSharePercent),
        contractorProfitPercent: toNum(s.contractorProfitPercent),
        revenueYtd: toNum(s.revenueYtd),
        vehiclesAtLoss: s.vehiclesAtLoss,
      })),
    )
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return {
    data,
    count: data.length,
    summary: {
      customerCount: data.length,
      totalRevenue: data.reduce((s, c) => s + c.totalRevenue, 0),
      totalRevenueYtd: data.reduce((s, c) => s + c.revenueYtd, 0),
    },
  };
}

export async function getCustomerByIdFromDb(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: Number(id) },
    include: { customerRevenueSummary: true },
  });
  if (!customer || !customer.customerRevenueSummary[0]) return null;

  const s = customer.customerRevenueSummary[0];
  return {
    id: String(customer.id),
    name: customer.name,
    code: customer.code,
    trips: s.trips,
    vehicles: s.vehicles,
    totalRevenue: toNum(s.totalRevenue),
    sharePercent: toNum(s.sharePercent),
    contractorIncome: toNum(s.contractorIncome),
    contractorSharePercent: toNum(s.contractorSharePercent),
    contractorProfitPercent: toNum(s.contractorProfitPercent),
    revenueYtd: toNum(s.revenueYtd),
    vehiclesAtLoss: s.vehiclesAtLoss,
    losingVehicles: [
      {
        vehicleNumber: '28861303',
        vehicleType: 'BI Minibuses',
        lossDays: 5,
        avgDailyIncome: 18500,
        threshold: 24000,
        contractor: 'BI Minibuses',
        multiCustomerDays: 2,
      },
    ],
  };
}

export async function getDriversFromDb() {
  const drivers = await prisma.driver.findMany({
    include: {
      region: true,
      driverDailyRevenue: { orderBy: { revenueDate: 'asc' } },
    },
    orderBy: { name: 'asc' },
  });

  const data = drivers.map((d) => {
    const daily: Record<string, number | null> = {};
    let totalPeriod = 0;
    for (const r of d.driverDailyRevenue) {
      const key = toDateStr(r.revenueDate);
      const revenue = r.revenue !== null ? toNum(r.revenue) : null;
      daily[key] = revenue;
      if (revenue !== null) totalPeriod += revenue;
    }
    const operatingDays = Object.values(daily).filter((v) => v !== null).length;
    return {
      id: String(d.id),
      license: d.license,
      name: d.name,
      area: d.region?.nameEn ?? '',
      driverType: d.driverType,
      totalPeriod,
      daily,
      trips: 142,
      operatingDays: operatingDays || 20,
      avgDailyIncome: operatingDays ? Math.round(totalPeriod / operatingDays) : 0,
      vehicles: ['62978603'],
      clients: ['Customer A'],
    };
  });

  return { data, count: data.length };
}

export async function getDriverByIdFromDb(id: string) {
  const { data } = await getDriversFromDb();
  return data.find((d) => d.id === id) ?? null;
}

export async function getVehicleInventoryFromDb() {
  const rows = await prisma.vehicle.findMany({
    include: { region: true },
    orderBy: { vehicleNumber: 'asc' },
  });
  return {
    data: rows.map((v) => ({
      vehicleNumber: v.vehicleNumber,
      vehicleType: v.vehicleType,
      area: v.region?.nameEn ?? '',
      status: v.status,
      contractor: v.contractor ?? '',
      startDate: v.startDate ? toDateStr(v.startDate) : '',
      endDate: v.endDate ? toDateStr(v.endDate) : '',
      actualEndDate: v.actualEndDate ? toDateStr(v.actualEndDate) : '',
      downtimeDays: v.downtimeDays,
      notes: v.notes ?? '',
    })),
    count: rows.length,
  };
}

export async function getDisabledVehiclesFromDb() {
  const [rows, total] = await Promise.all([
    prisma.vehicle.findMany({
      where: { status: 'disabled' },
      include: { region: true },
      orderBy: { vehicleNumber: 'asc' },
    }),
    prisma.vehicle.count(),
  ]);

  return {
    data: rows.map((v) => ({
      vehicleNumber: v.vehicleNumber,
      area: v.region?.nameEn ?? '',
      vehicleType: v.vehicleType,
      downtimeStart: v.startDate ? toDateStr(v.startDate) : '',
      endDate: v.endDate ? toDateStr(v.endDate) : '',
      actualEnd: v.actualEndDate ? toDateStr(v.actualEndDate) : '',
      daysOff: v.downtimeDays,
      status: v.status,
      notes: v.notes ?? '',
    })),
    count: rows.length,
    kpi: {
      disabled: rows.length,
      total,
      percent: total ? Number(((rows.length / total) * 100).toFixed(1)) : 0,
    },
  };
}

export async function getActivityLogFromDb() {
  const rows = await prisma.activityLog.findMany({ orderBy: { loggedAt: 'desc' } });
  return {
    data: rows.map((r) => ({
      id: String(r.id),
      timestamp: r.loggedAt.toISOString(),
      user: r.userName,
      actionType: r.actionType,
      module: r.module,
      details: r.details,
      ip: r.ipAddress,
    })),
    count: rows.length,
  };
}

export async function getAgreementsFromDb() {
  const rows = await prisma.maintenanceAgreement.findMany({
    include: { vehicle: true },
    orderBy: { endDate: 'asc' },
  });
  return {
    data: rows.map((a) => ({
      vehicleNumber: a.vehicle.vehicleNumber,
      supplier: a.supplier,
      agreementNumber: a.agreementNumber,
      startDate: toDateStr(a.startDate),
      endDate: toDateStr(a.endDate),
      monthlyCost: toNum(a.monthlyCost),
      annualCost: toNum(a.annualCost),
      serviceTypes: a.serviceTypes ?? '',
      status: a.status,
    })),
    count: rows.length,
  };
}

export async function getExpensesFromDb() {
  const rows = await prisma.vehicleExpense.findMany({
    include: { vehicle: true },
    orderBy: { expenseDate: 'desc' },
  });
  const total = rows.reduce((s, e) => s + toNum(e.amount), 0);
  return {
    data: rows.map((e) => ({
      vehicleNumber: e.vehicle.vehicleNumber,
      date: e.expenseDate,
      category: e.category,
      description: e.description,
      amount: toNum(e.amount),
      provider: e.provider,
    })),
    count: rows.length,
    total,
  };
}

export async function getRelocationsFromDb() {
  const rows = await prisma.vehicleRelocation.findMany({
    include: { vehicle: true },
    orderBy: { changeDate: 'desc' },
  });
  return {
    data: rows.map((r) => ({
      vehicleNumber: r.vehicle.vehicleNumber,
      changeDate: toDateStr(r.changeDate),
      fromCustomer: r.fromCustomer,
      toCustomer: r.toCustomer,
      fromDriver: r.fromDriver,
      toDriver: r.toDriver,
      fromArea: r.fromArea,
      toArea: r.toArea,
      reason: r.reason,
      operator: r.operatorName,
    })),
    count: rows.length,
  };
}

export async function getWorkScheduleFromDb() {
  const rows = await prisma.trip.findMany({
    include: { customer: true, region: true, vehicle: true, driver: true },
    orderBy: { startTime: 'asc' },
  });

  const data = rows.map((t) => ({
    tripId: t.tripId,
    startTime: t.startTime.toISOString().slice(11, 16),
    endTime: t.endTime.toISOString().slice(11, 16),
    description: t.description,
    customer: t.customer?.name ?? '',
    area: t.region?.nameEn ?? '',
    vehicleType: t.vehicleType,
    vehicleNumber: t.vehicle?.vehicleNumber ?? '',
    price: toNum(t.price),
    estimatedPrice: toNum(t.estimatedPrice),
    driverType: t.driverType,
    driverName: t.driver?.name ?? '',
    manufacturer: t.manufacturerStatus,
    confirmed: t.confirmed,
  }));

  return {
    data,
    count: data.length,
    summary: {
      sumEstimated: data.reduce((s, r) => s + r.estimatedPrice, 0),
      sumPrice: data.reduce((s, r) => s + r.price, 0),
    },
    travelStatusLogs: data.length
      ? data.flatMap((t) => {
          const base = {
            tripId: t.tripId,
            driverName: t.driverName,
            vehicleNumber: t.vehicleNumber,
          }
          const logs = [
            {
              id: `${t.tripId}-start`,
              loggedAt: new Date().toISOString().slice(0, 10) + `T${t.startTime}:00`,
              statusTag: t.manufacturer ?? 'BI process',
              details: 'Trip started',
              ...base,
            },
          ]
          if (t.manufacturer?.toLowerCase().includes('cancelled')) {
            logs.push({
              id: `${t.tripId}-cancel`,
              loggedAt: new Date().toISOString().slice(0, 10) + `T${t.endTime}:00`,
              statusTag: 'BI cancelled',
              details: 'Trip cancelled',
              ...base,
            })
          } else {
            logs.push({
              id: `${t.tripId}-done`,
              loggedAt: new Date().toISOString().slice(0, 10) + `T${t.endTime}:00`,
              statusTag: 'BI process',
              details: 'Trip completed successfully',
              ...base,
            })
          }
          return logs
        })
      : travelStatusLogsMock,
  };
}

export async function getVehicleIdleFromDb(opts?: { startDate?: string; endDate?: string }) {
  const where: import('../generated/prisma/client.js').Prisma.VehicleIdleStatWhereInput = {};

  if (opts?.startDate && opts?.endDate) {
    const start = new Date(opts.startDate);
    const end = new Date(opts.endDate);
    where.periodStart = { lte: end };
    where.periodEnd = { gte: start };
  }

  const rows = await prisma.vehicleIdleStat.findMany({
    where,
    include: { vehicle: { include: { region: true } } },
    orderBy: { vehicle: { vehicleNumber: 'asc' } },
  });
  const data = rows.map((s) => ({
    vehicleNumber: s.vehicle.vehicleNumber,
    area: s.vehicle.region?.nameEn ?? '',
    vehicleType: s.vehicle.vehicleType,
    totalKm: toNum(s.totalKm),
    productiveKm: toNum(s.productiveKm),
    idleKm: toNum(s.idleKm),
    productivityPercent: toNum(s.productivityPercent),
  }));

  return {
    data: data.length ? data : vehicleIdleMock,
    count: data.length ? data.length : vehicleIdleMock.length,
    period: opts?.startDate && opts?.endDate
      ? { startDate: opts.startDate, endDate: opts.endDate }
      : undefined,
  };
}

export async function getDriverIdleFromDb(opts?: { startDate?: string; endDate?: string }) {
  const where: import('../generated/prisma/client.js').Prisma.DriverIdleStatWhereInput = {};

  if (opts?.startDate && opts?.endDate) {
    const start = new Date(opts.startDate);
    const end = new Date(opts.endDate);
    where.periodStart = { lte: end };
    where.periodEnd = { gte: start };
  }

  const rows = await prisma.driverIdleStat.findMany({
    where,
    include: { driver: { include: { region: true } } },
    orderBy: { driver: { name: 'asc' } },
  });
  const data = rows.map((s) => ({
    driverName: s.driver.name,
    area: s.driver.region?.nameEn ?? '',
    totalKm: toNum(s.totalKm),
    productiveKm: toNum(s.productiveKm),
    idleKm: toNum(s.idleKm),
    productivityPercent: toNum(s.productivityPercent),
    operatingDays: s.operatingDays,
    vehicleCount: s.vehicleCount,
  }));

  return {
    data: data.length ? data : driverIdleMock,
    count: data.length ? data.length : driverIdleMock.length,
    period: opts?.startDate && opts?.endDate
      ? { startDate: opts.startDate, endDate: opts.endDate }
      : undefined,
  };
}
