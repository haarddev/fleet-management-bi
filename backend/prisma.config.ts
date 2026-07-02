/// <reference types="node" />
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DATABASE_HOST ?? 'localhost';
  const port = process.env.DATABASE_PORT ?? '5432';
  const database = process.env.DATABASE_NAME ?? 'fleet_management_bi';
  const user = process.env.DATABASE_USERNAME;
  const password = process.env.DATABASE_PASSWORD;

  if (!user || !password) {
    throw new Error('Set DATABASE_URL or DATABASE_USERNAME/DATABASE_PASSWORD in .env');
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: getDatabaseUrl(),
  },
});
