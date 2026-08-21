/**
 * Repository layer for EducationLevel
 */

import { prisma } from '../../prisma';
import type { Prisma, EducationLevel } from '$generated/prisma/client';

export const educationLevelRepository = {
  async findAll(): Promise<EducationLevel[]> {
    return prisma.educationLevel.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  },
  async findById(id: string): Promise<EducationLevel | null> {
    return prisma.educationLevel.findFirst({ where: { id, deletedAt: null } });
  },
  async create(data: any): Promise<EducationLevel> {
    return prisma.educationLevel.create({ data });
  },
  async update(id: string, data: any): Promise<EducationLevel> {
    return prisma.educationLevel.update({ where: { id }, data });
  },
  async softDelete(id: string): Promise<EducationLevel> {
    const now = new Date();
    return prisma.educationLevel.update({ where: { id }, data: { deletedAt: now, updatedAt: now } });
  }
};
