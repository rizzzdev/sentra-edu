/**
 * Client-side store for MagicLink
 * Directly subscribable: $magicLinkStore returns items array.
 *
 * Usage:
 *   import { magicLinkStore } from '$lib/api';
 *   onMount(() => magicLinkStore.fetch());
 *   {#each $magicLinkStore as item}
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
      const result = await apiRequest<any[]>('/api/magic-links');
      if (!result.error && result.data) {
        items.set(result.data);
      } else {
        error.set(result.message || 'Gagal memuat data.');
      }
      loading.set(false);
    },
    async findByToken(token: string): Promise<ApiResponse<any>> {
      return apiRequest('/api/magic-links?token=' + encodeURIComponent(token));
    }
  };
}

export const magicLinkStore = createStore();
