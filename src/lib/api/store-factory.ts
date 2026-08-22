/**
 * Shared store factory — creates a fetchable CRUD store with loading/loaded/error tracking.
 * All module stores use this to ensure consistent behavior.
 */

import { writable } from 'svelte/store';
import { apiRequest } from './request';

export interface StoreInstance<T> {
  subscribe: ReturnType<typeof writable<T>>['subscribe'];
  loading: { subscribe: ReturnType<typeof writable<boolean>>['subscribe'] };
  loaded: { subscribe: ReturnType<typeof writable<boolean>>['subscribe'] };
  error: { subscribe: ReturnType<typeof writable<string | null>>['subscribe'] };
  fetch(): Promise<void>;
  /** Force re-fetch (used after CUD operations) */
  refetch(): Promise<void>;
}

export function createStore<T = any[]>(
  apiPath: string,
  transform?: (data: any) => T
): StoreInstance<T> {
  const items = writable<T>([] as any);
  const loading = writable(false);
  const loaded = writable(false);
  const error = writable<string | null>(null);

  async function doFetch(): Promise<void> {
    loading.set(true);
    error.set(null);
    try {
      const result = await apiRequest<any[]>(apiPath);
      if (!result.error && result.data) {
        items.set(transform ? transform(result.data) : (result.data as unknown as T));
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

  return {
    subscribe: items.subscribe,
    loading: { subscribe: loading.subscribe },
    loaded: { subscribe: loaded.subscribe },
    error: { subscribe: error.subscribe },
    fetch: doFetch,
    refetch: doFetch
  };
}
