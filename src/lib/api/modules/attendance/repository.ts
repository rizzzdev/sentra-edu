/**
 * Repository layer for Attendance
 */

import { prisma } from '../../prisma';
import type { Prisma, Attendance } from '$generated/prisma/client';

export const attendanceRepository = {
  async findAll(): Promise<Attendance[]> {
    return prisma.attendance.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  },
  async findById(id: string): Promise<Attendance | null> {
    return prisma.attendance.findFirst({ where: { id, deletedAt: null } });
  },
  async create(data: any): Promise<Attendance> {
    return prisma.attendance.create({ data });
  },
  async update(id: string, data: any): Promise<Attendance> {
    return prisma.attendance.update({ where: { id }, data });
  },
  async softDelete(id: string): Promise<Attendance> {
    const now = new Date();
    return prisma.attendance.update({ where: { id }, data: { deletedAt: now, updatedAt: now } });
  }
};
