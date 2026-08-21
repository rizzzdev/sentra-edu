/**
 * Prisma Client Singleton — Server-side
 *
 * Usage:
 *   import { prisma } from '$lib/api'
 *   const users = await prisma.user.findMany();
 */

import { PrismaClient } from '$generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { DATABASE_URL } from '$env/static/private';

let _prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    const adapter = new PrismaPg({ connectionString: DATABASE_URL });
    _prisma = new PrismaClient({ adapter });
  }
  return _prisma;
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
