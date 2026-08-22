/**
 * Repository layer for PayrollClaim
 */

import { prisma } from '../../prisma';
import type { Prisma, PayrollClaim } from '$generated/prisma/client';

export const payrollRepository = {
  async findAll(): Promise<PayrollClaim[]> {
    return prisma.payrollClaim.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  },
  async findById(id: string): Promise<PayrollClaim | null> {
    return prisma.payrollClaim.findFirst({ where: { id, deletedAt: null } });
  },
  async create(data: any): Promise<PayrollClaim> {
    return prisma.payrollClaim.create({ data });
  },
  async update(id: string, data: any): Promise<PayrollClaim> {
    return prisma.payrollClaim.update({ where: { id }, data });
  },
  async softDelete(id: string): Promise<PayrollClaim> {
    const now = new Date();
    return prisma.payrollClaim.update({ where: { id }, data: { deletedAt: now, updatedAt: now } });
  }
};
