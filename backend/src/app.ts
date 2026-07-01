import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { authMiddleware } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';
import {
  idleRouter,
  maintenanceRouter,
  managementRouter,
  operationRouter,
  revenueRouter,
} from './routes/modules.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);

  app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/auth')) {
      next();
      return;
    }
    authMiddleware(req, res, next);
  });
  app.use('/api/revenue', revenueRouter);
  app.use('/api/maintenance', maintenanceRouter);
  app.use('/api/management', managementRouter);
  app.use('/api/operation', operationRouter);
  app.use('/api/idle', idleRouter);

  app.get('/api', (_req, res) => {
    res.json({
      name: 'fleet-management-BI',
      message: 'Fleet Management BI API',
    });
  });

  return app;
}
