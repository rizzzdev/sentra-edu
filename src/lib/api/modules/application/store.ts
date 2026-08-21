/**
 * Client-side store for JobApplication
 * Directly subscribable: $applicationStore returns items array.
 *
 * Usage:
 *   import { applicationStore } from '$lib/api';
 *   onMount(() => applicationStore.fetch());
 *   {#each $applicationStore as item}
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
      const result = await apiRequest<any[]>('/api/applications');
      if (!result.error && result.data) {
        items.set(result.data);
      } else {
        error.set(result.message || 'Gagal memuat data.');
      }
      loading.set(false);
    },
  };
}

export const applicationStore = createStore();
