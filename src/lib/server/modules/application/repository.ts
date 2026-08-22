/**
 * Repository layer for JobApplication
 */

import { prisma } from '../../prisma';
import type { Prisma, JobApplication } from '$generated/prisma/client';

export const applicationRepository = {
  async findAll(): Promise<JobApplication[]> {
    return prisma.jobApplication.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  },
  async findById(id: string): Promise<JobApplication | null> {
    return prisma.jobApplication.findFirst({ where: { id, deletedAt: null } });
  },
  async create(data: any): Promise<JobApplication> {
    return prisma.jobApplication.create({ data });
  },
  async update(id: string, data: any): Promise<JobApplication> {
    return prisma.jobApplication.update({ where: { id }, data });
  },
  async softDelete(id: string): Promise<JobApplication> {
    const now = new Date();
    return prisma.jobApplication.update({ where: { id }, data: { deletedAt: now, updatedAt: now } });
  }
};
