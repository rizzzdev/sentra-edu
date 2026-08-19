interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 menit

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    console.log('[Cache] HIT:', key);
    return entry.data;
  }
  console.log('[Cache] MISS:', key);
  return null;
}

export function setCache<T>(key: string, data: T): void {
  console.log('[Cache] SET:', key);
  cache.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(keys?: string[]): void {
  if (!keys) {
    console.log('[Cache] INVALIDATE ALL');
    cache.clear();
  } else {
    console.log('[Cache] INVALIDATE:', keys);
    keys.forEach(k => cache.delete(k));
  }
}

