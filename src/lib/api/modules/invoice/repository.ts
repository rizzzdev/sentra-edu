/**
 * Repository layer for Invoice
 */

import { prisma } from '../../prisma';
import type { Prisma, Invoice } from '$generated/prisma/client';

export const invoiceRepository = {
  async findAll(): Promise<Invoice[]> {
    return prisma.invoice.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  },
  async findById(id: string): Promise<Invoice | null> {
    return prisma.invoice.findFirst({ where: { id, deletedAt: null } });
  },
  async create(data: any): Promise<Invoice> {
    return prisma.invoice.create({ data });
  },
  async update(id: string, data: any): Promise<Invoice> {
    return prisma.invoice.update({ where: { id }, data });
  },
  async softDelete(id: string): Promise<Invoice> {
    const now = new Date();
    return prisma.invoice.update({ where: { id }, data: { deletedAt: now, updatedAt: now } });
  }
};
