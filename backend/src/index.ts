import 'dotenv/config';
import type { Server } from 'node:http';
import { checkDatabaseConnection, disconnectDatabase } from './db/prisma.js';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 3000;

let server: Server | null = null;

async function start() {
  const dbOk = await checkDatabaseConnection();
  if (!dbOk) {
    console.warn('Warning: PostgreSQL is not reachable. Check DATABASE_URL.');
  } else {
    console.log('PostgreSQL connected (Prisma):', process.env.DATABASE_NAME);
  }

  const app = createApp();

  server = app.listen(PORT, () => {
    console.log(`fleet-management-BI API running on http://localhost:${PORT}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other process or set PORT in .env`);
      process.exit(1);
    }
    throw err;
  });
}

async function shutdown() {
  if (server) {
    await new Promise<void>((resolve) => server!.close(() => resolve()));
  }
  await disconnectDatabase();
}

process.on('SIGINT', () => void shutdown().then(() => process.exit(0)));
process.on('SIGTERM', () => void shutdown().then(() => process.exit(0)));

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
