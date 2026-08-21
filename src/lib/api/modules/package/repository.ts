/**
 * Repository layer for Package
 */

import { prisma } from '../../prisma';
import type { Prisma, Package } from '$generated/prisma/client';

export const packageRepository = {
  async findAll(): Promise<Package[]> {
    return prisma.package.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  },
  async findById(id: string): Promise<Package | null> {
    return prisma.package.findFirst({ where: { id, deletedAt: null } });
  },
  async create(data: any): Promise<Package> {
    return prisma.package.create({ data });
  },
  async update(id: string, data: any): Promise<Package> {
    return prisma.package.update({ where: { id }, data });
  },
  async softDelete(id: string): Promise<Package> {
    const now = new Date();
    return prisma.package.update({ where: { id }, data: { deletedAt: now, updatedAt: now } });
  }
};
