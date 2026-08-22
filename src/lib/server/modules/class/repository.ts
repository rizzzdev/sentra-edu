/**
 * Repository layer for ClassLevel
 */

import { prisma } from '../../prisma';
import type { Prisma, ClassLevel } from '$generated/prisma/client';

export const classRepository = {
  async findAll(): Promise<ClassLevel[]> {
    return prisma.classLevel.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  },
  async findById(id: string): Promise<ClassLevel | null> {
    return prisma.classLevel.findFirst({ where: { id, deletedAt: null } });
  },
  async create(data: any): Promise<ClassLevel> {
    return prisma.classLevel.create({ data });
  },
  async update(id: string, data: any): Promise<ClassLevel> {
    return prisma.classLevel.update({ where: { id }, data });
  },
  async softDelete(id: string): Promise<ClassLevel> {
    const now = new Date();
    return prisma.classLevel.update({ where: { id }, data: { deletedAt: now, updatedAt: now } });
  }
};
