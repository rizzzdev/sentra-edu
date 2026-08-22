/**
 * Client-side store for MagicLink (extended with findByToken)
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
    const result = await apiRequest<any[]>('/api/magic-links');
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

export const magicLinkStore = {
  subscribe: items.subscribe,
  loading: { subscribe: loading.subscribe },
  loaded: { subscribe: loaded.subscribe },
  error: { subscribe: error.subscribe },
  fetch: doFetch,
  refetch: doFetch,

  async findByToken(token: string) {
    return apiRequest('/api/magic-links?token=' + encodeURIComponent(token));
  }
};
