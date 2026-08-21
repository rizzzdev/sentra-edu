/**
 * Repository layer for MagicLink
 */

import { prisma } from '../../prisma';
import type { Prisma, MagicLink } from '$generated/prisma/client';

export const magicLinkRepository = {
  async findAll(): Promise<MagicLink[]> {
    return prisma.magicLink.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  },
  async findById(id: string): Promise<MagicLink | null> {
    return prisma.magicLink.findFirst({ where: { id, deletedAt: null } });
  },
  async create(data: any): Promise<MagicLink> {
    return prisma.magicLink.create({ data });
  },
  async update(id: string, data: any): Promise<MagicLink> {
    return prisma.magicLink.update({ where: { id }, data });
  },
  async softDelete(id: string): Promise<MagicLink> {
    const now = new Date();
    return prisma.magicLink.update({ where: { id }, data: { deletedAt: now, updatedAt: now } });
  },
  async findByToken(token: string) {
    return prisma.magicLink.findFirst({ where: { token, deletedAt: null } });
  },
};
