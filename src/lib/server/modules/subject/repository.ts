/**
 * Repository layer for Subject
 */

import { prisma } from '../../prisma';
import type { Prisma, Subject } from '$generated/prisma/client';

export const subjectRepository = {
  async findAll(): Promise<Subject[]> {
    return prisma.subject.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  },
  async findById(id: string): Promise<Subject | null> {
    return prisma.subject.findFirst({ where: { id, deletedAt: null } });
  },
  async create(data: any): Promise<Subject> {
    return prisma.subject.create({ data });
  },
  async update(id: string, data: any): Promise<Subject> {
    return prisma.subject.update({ where: { id }, data });
  },
  async softDelete(id: string): Promise<Subject> {
    const now = new Date();
    return prisma.subject.update({ where: { id }, data: { deletedAt: now, updatedAt: now } });
  }
};
