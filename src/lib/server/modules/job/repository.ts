/**
 * Repository layer for Job
 */

import { prisma } from '../../prisma';
import type { Prisma, Job } from '$generated/prisma/client';

export const jobRepository = {
  async findAll(): Promise<Job[]> {
    return prisma.job.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  },
  async findById(id: string): Promise<Job | null> {
    return prisma.job.findFirst({ where: { id, deletedAt: null } });
  },
  async create(data: any): Promise<Job> {
    return prisma.job.create({ data });
  },
  async update(id: string, data: any): Promise<Job> {
    return prisma.job.update({ where: { id }, data });
  },
  async softDelete(id: string): Promise<Job> {
    const now = new Date();
    return prisma.job.update({ where: { id }, data: { deletedAt: now, updatedAt: now } });
  }
};
