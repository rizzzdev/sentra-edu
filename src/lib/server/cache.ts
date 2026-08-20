import type {
  DatabaseSchema,
  User,
  EducationLevel,
  ClassLevel,
  Subject,
  PackagePlan,
  Enrollment,
  JobPost,
  JobApplication,
  AttendanceRecord,
  InvoiceRecord,
  PayrollClaim,
  RecruitmentCandidate,
  NotificationItem,
  MagicLinkRegistration
} from '$lib/shared/types/common.types';

export type CacheableData =
  | DatabaseSchema
  | User
  | User[]
  | EducationLevel
  | EducationLevel[]
  | ClassLevel
  | ClassLevel[]
  | Subject
  | Subject[]
  | PackagePlan
  | PackagePlan[]
  | Enrollment
  | Enrollment[]
  | JobPost
  | JobPost[]
  | JobApplication
  | JobApplication[]
  | AttendanceRecord
  | AttendanceRecord[]
  | InvoiceRecord
  | InvoiceRecord[]
  | PayrollClaim
  | PayrollClaim[]
  | RecruitmentCandidate
  | RecruitmentCandidate[]
  | NotificationItem
  | NotificationItem[]
  | MagicLinkRegistration
  | MagicLinkRegistration[]
  | Record<string, string | number | boolean | null | undefined | object>;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<CacheableData>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 menit

export function getCached<T extends CacheableData>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    console.log('[Cache] HIT:', key);
    return entry.data as T;
  }
  console.log('[Cache] MISS:', key);
  return null;
}

export function setCache<T extends CacheableData>(key: string, data: T): void {
  console.log('[Cache] SET:', key);
  cache.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(keys?: string[]): void {
  if (!keys) {
    console.log('[Cache] INVALIDATE ALL');
    cache.clear();
  } else {
    console.log('[Cache] INVALIDATE:', keys);
    keys.forEach((cacheKey) => cache.delete(cacheKey));
  }
}
