/**
 * Repository layer for Enrollment
 */

import { prisma } from '../../prisma';
import type { Prisma, Enrollment } from '$generated/prisma/client';

export const enrollmentRepository = {
  async findAll(): Promise<Enrollment[]> {
    return prisma.enrollment.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  },
  async findById(id: string): Promise<Enrollment | null> {
    return prisma.enrollment.findFirst({ where: { id, deletedAt: null } });
  },
  async create(data: any): Promise<Enrollment> {
    return prisma.enrollment.create({ data });
  },
  async update(id: string, data: any): Promise<Enrollment> {
    return prisma.enrollment.update({ where: { id }, data });
  },
  async softDelete(id: string): Promise<Enrollment> {
    const now = new Date();
    return prisma.enrollment.update({ where: { id }, data: { deletedAt: now, updatedAt: now } });
  }
};
