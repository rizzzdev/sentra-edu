/**
 * Repository layer for Notification
 */

import { prisma } from '../../prisma';
import type { Notification } from '$generated/prisma/client';

export const notificationRepository = {
  async findAll(): Promise<Notification[]> {
    return prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
  },
  async findById(id: string): Promise<Notification | null> {
    return prisma.notification.findFirst({ where: { id } });
  },
  async create(data: any): Promise<Notification> {
    return prisma.notification.create({ data });
  },
  async findByUser(userId: string) {
    return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  },
  async markAsRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { read: true } });
  },
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  },
};
