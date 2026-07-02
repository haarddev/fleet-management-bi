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
import { requireModule } from './middleware/rbac.js';
import { settingsRouter } from './routes/settings.js';

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
  app.use('/api/revenue', requireModule('revenue'), revenueRouter);
  app.use('/api/maintenance', requireModule('maintenance'), maintenanceRouter);
  app.use('/api/management', requireModule('management'), managementRouter);
  app.use('/api/operation', requireModule('operation'), operationRouter);
  app.use('/api/idle', requireModule('idle'), idleRouter);
  app.use('/api/settings', requireModule('settings'), settingsRouter);

  app.get('/api', (_req, res) => {
    res.json({
      name: 'fleet-management-BI',
      message: 'Fleet Management BI API',
    });
  });

  return app;
}
