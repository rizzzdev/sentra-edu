/**
 * Client-side store for User
 * Directly subscribable: $userStore returns items array.
 *
 * Usage:
 *   import { userStore } from '$lib/api';
 *   onMount(() => userStore.fetch());
 *   {#each $userStore as item}
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
      const result = await apiRequest<any[]>('/api/users');
      if (!result.error && result.data) {
        items.set(result.data);
      } else {
        error.set(result.message || 'Gagal memuat data.');
      }
      loading.set(false);
    },
    async findByEmail(email: string): Promise<ApiResponse<any>> {
      return apiRequest('/api/users?email=' + encodeURIComponent(email));
    }
  };
}

export const userStore = createStore();
