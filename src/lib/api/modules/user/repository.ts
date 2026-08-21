/**
 * Repository layer for User
 */

import { prisma } from '../../prisma';
import type { Prisma, User } from '$generated/prisma/client';

export const userRepository = {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  },
  async findById(id: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  },
  async create(data: any): Promise<User> {
    return prisma.user.create({ data });
  },
  async update(id: string, data: any): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  },
  async softDelete(id: string): Promise<User> {
    const now = new Date();
    return prisma.user.update({ where: { id }, data: { deletedAt: now, updatedAt: now } });
  },
  async findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  },
};
