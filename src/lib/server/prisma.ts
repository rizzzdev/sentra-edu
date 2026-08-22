/**
 * Prisma Client Singleton — Server-side only
 *
 * Usage:
 *   import { prisma } from '$lib/server'
 *   const users = await prisma.user.findMany();
 */

import { PrismaClient } from '$generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { DATABASE_URL } from '$env/static/private';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: pg.Pool;
};

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const connectionString = DATABASE_URL || (typeof process !== 'undefined' && process.env ? process.env.DATABASE_URL : '') || '';

    if (!globalForPrisma.pool) {
      globalForPrisma.pool = new pg.Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        keepAlive: true
      });

      globalForPrisma.pool.on('error', (err) => {
        console.warn('[pg.Pool] Connection warning/error:', err.message);
      });
    }

    const adapter = new PrismaPg(globalForPrisma.pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

// Proxy so `prisma.user.findMany()` works directly
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getPrisma();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
