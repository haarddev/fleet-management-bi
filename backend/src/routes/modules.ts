import { Router } from 'express';
import { checkDatabaseConnection } from '../db/pool.js';
import {
  getActivityLogFromDb,
  getAgreementsFromDb,
  getCustomerByIdFromDb,
  getCustomersFromDb,
  getDisabledVehiclesFromDb,
  getDriverByIdFromDb,
  getDriverIdleFromDb,
  getDriversFromDb,
  getExpensesFromDb,
  getRelocationsFromDb,
  getVehicleIdleFromDb,
  getVehicleInventoryFromDb,
  getVehicleRevenueFromDb,
  getWeeklyCenterFromDb,
  getWorkScheduleFromDb,
} from '../repositories/biRepository.js';
import { dailyStatusMock, downtimeMock } from '../data/mock/modules.js';

async function handleDb<T>(res: import('express').Response, fn: () => Promise<T>) {
  try {
    const data = await fn();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
}

export const revenueRouter = Router();

revenueRouter.get('/weekly-center', (req, res) => {
  void handleDb(res, getWeeklyCenterFromDb);
});

revenueRouter.get('/vehicles', (req, res) => {
  void handleDb(res, async () => {
    const data = await getVehicleRevenueFromDb();
    return { data, count: data.length };
  });
});

revenueRouter.get('/customers', (req, res) => {
  void handleDb(res, getCustomersFromDb);
});

revenueRouter.get('/customers/:id', async (req, res) => {
  try {
    const customer = await getCustomerByIdFromDb(req.params.id);
    if (!customer) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

revenueRouter.get('/drivers', (req, res) => {
  void handleDb(res, getDriversFromDb);
});

revenueRouter.get('/drivers/:id', async (req, res) => {
  try {
    const driver = await getDriverByIdFromDb(req.params.id);
    if (!driver) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(driver);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

export const maintenanceRouter = Router();

maintenanceRouter.get('/vehicle-inventory', (req, res) => {
  void handleDb(res, getVehicleInventoryFromDb);
});

maintenanceRouter.get('/disabled-vehicles', (req, res) => {
  void handleDb(res, getDisabledVehiclesFromDb);
});

maintenanceRouter.get('/downtime', (_req, res) => {
  res.json({ data: downtimeMock, count: downtimeMock.length });
});

maintenanceRouter.get('/agreements', (req, res) => {
  void handleDb(res, getAgreementsFromDb);
});

maintenanceRouter.get('/expenses', (req, res) => {
  void handleDb(res, getExpensesFromDb);
});

maintenanceRouter.get('/relocations', (req, res) => {
  void handleDb(res, getRelocationsFromDb);
});

export const managementRouter = Router();

managementRouter.get('/activity-log', (req, res) => {
  void handleDb(res, getActivityLogFromDb);
});

export const operationRouter = Router();

operationRouter.get('/daily-status', (_req, res) => {
  res.json(dailyStatusMock);
});

operationRouter.get('/work-schedule', (req, res) => {
  void handleDb(res, getWorkScheduleFromDb);
});

export const idleRouter = Router();

idleRouter.get('/vehicles', (req, res) => {
  const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
  const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;
  void handleDb(res, () => getVehicleIdleFromDb({ startDate, endDate }));
});

idleRouter.get('/drivers', (req, res) => {
  const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
  const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;
  void handleDb(res, () => getDriverIdleFromDb({ startDate, endDate }));
});
