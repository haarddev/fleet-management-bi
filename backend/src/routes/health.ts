import { Router } from 'express';
import { checkDatabaseConnection } from '../db/prisma.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const dbConnected = await checkDatabaseConnection();

  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    service: 'fleet-management-BI',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});
