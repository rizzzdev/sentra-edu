/**
 * Repository layer for Candidate
 */

import { prisma } from '../../prisma';
import type { Prisma, Candidate } from '$generated/prisma/client';

export const candidateRepository = {
  async findAll(): Promise<Candidate[]> {
    return prisma.candidate.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  },
  async findById(id: string): Promise<Candidate | null> {
    return prisma.candidate.findFirst({ where: { id, deletedAt: null } });
  },
  async create(data: any): Promise<Candidate> {
    return prisma.candidate.create({ data });
  },
  async update(id: string, data: any): Promise<Candidate> {
    return prisma.candidate.update({ where: { id }, data });
  },
  async softDelete(id: string): Promise<Candidate> {
    const now = new Date();
    return prisma.candidate.update({ where: { id }, data: { deletedAt: now, updatedAt: now } });
  }
};
