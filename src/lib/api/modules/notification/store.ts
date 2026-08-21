/**
 * Client-side store for Notification
 * Directly subscribable: $notificationStore returns items array.
 *
 * Usage:
 *   import { notificationStore } from '$lib/api';
 *   onMount(() => notificationStore.fetch());
 *   {#each $notificationStore as item}
 */

import { writable } from 'svelte/store';
import { apiRequest } from '../../request';
import type { ApiResponse } from '../../types';

const items = writable<any[]>([]);
const loading = writable(false);
const error = writable<string | null>(null);

function createStore() {
  return {
    subscribe: items.subscribe,
    loading: { subscribe: loading.subscribe },
    error: { subscribe: error.subscribe },

    async fetch(): Promise<void> {
      loading.set(true);
      error.set(null);
      const result = await apiRequest<any[]>('/api/notifications');
      if (!result.error && result.data) {
        items.set(result.data);
      } else {
        error.set(result.message || 'Gagal memuat data.');
      }
      loading.set(false);
    },
    async markNotificationAsRead(notificationId: string): Promise<void> {
      const result = await apiRequest('/api/notifications', {
        method: 'PUT',
        body: JSON.stringify({ id: notificationId, read: true })
      });
      if (!result.error) await this.fetch();
    },

    async markAllNotificationsAsRead(userId: string): Promise<void> {
      const currentItems: any[] = [];
      items.subscribe((v: any[]) => { currentItems.push(...v); })();
      const unread = currentItems.filter(n => n.userId === userId && !n.read);
      await Promise.all(unread.map(n => this.markNotificationAsRead(n.id)));
    },

    pushNotification(userIdOrNotification: any, title?: string, message?: string, icon?: string): void {
      if (typeof userIdOrNotification === 'string' && title) {
        const newNotif = {
          id: 'temp-' + Date.now(),
          userId: userIdOrNotification,
          title,
          message: message || '',
          icon: icon || 'notifications',
          read: false,
          createdAt: new Date().toISOString()
        };
        items.update((current: any[]) => [newNotif, ...current]);
      } else {
        items.update((current: any[]) => [userIdOrNotification, ...current]);
      }
    }
  };
}

export const notificationStore = createStore();
