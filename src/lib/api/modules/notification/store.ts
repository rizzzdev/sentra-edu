/**
 * Client-side store for Notification (extended with custom methods)
 */
import { writable } from 'svelte/store';
import { apiRequest } from '../../request';

const items = writable<any[]>([]);
const loading = writable(false);
const loaded = writable(false);
const error = writable<string | null>(null);

async function doFetch(): Promise<void> {
  loading.set(true);
  error.set(null);
  try {
    const result = await apiRequest<any[]>('/api/notifications');
    if (!result.error && result.data) {
      items.set(result.data);
    } else {
      error.set(result.message || 'Gagal memuat data.');
    }
  } catch (fetchErrorRaw) {
    const fetchError = fetchErrorRaw as Error;
    error.set(fetchError.message || 'Gagal memuat data.');
  } finally {
    loaded.set(true);
    loading.set(false);
  }
}

export const notificationStore = {
  subscribe: items.subscribe,
  loading: { subscribe: loading.subscribe },
  loaded: { subscribe: loaded.subscribe },
  error: { subscribe: error.subscribe },
  fetch: doFetch,
  refetch: doFetch,

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const result = await apiRequest('/api/notifications', {
      method: 'PUT',
      body: JSON.stringify({ id: notificationId, read: true })
    });
    if (!result.error) await doFetch();
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
