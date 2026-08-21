/**
 * Database — Derived store combining all module stores.
 * isLoaded becomes true only when ALL stores have finished loading.
 *
 * Usage:
 *   import { database, fetchAllStores } from '$lib/shared/stores';
 *   onMount(() => fetchAllStores());
 *   {#if !$database.isLoaded} <Spinner /> {/if}
 */

import { derived } from 'svelte/store';
import { userStore } from '$lib/api/modules/user';
import { subjectStore } from '$lib/api/modules/subject';
import { educationLevelStore } from '$lib/api/modules/education-level';
import { classStore } from '$lib/api/modules/class';
import { packageStore } from '$lib/api/modules/package';
import { enrollmentStore } from '$lib/api/modules/enrollment';
import { jobStore } from '$lib/api/modules/job';
import { applicationStore } from '$lib/api/modules/application';
import { attendanceStore } from '$lib/api/modules/attendance';
import { invoiceStore } from '$lib/api/modules/invoice';
import { payrollStore } from '$lib/api/modules/payroll';
import { candidateStore } from '$lib/api/modules/candidate';
import { notificationStore } from '$lib/api/modules/notification';
import { magicLinkStore } from '$lib/api/modules/magic-link';
import type { DatabaseSchema } from '$lib/shared/types';

const stores = [
  userStore, subjectStore, educationLevelStore, classStore, packageStore,
  enrollmentStore, jobStore, applicationStore, attendanceStore,
  invoiceStore, payrollStore, candidateStore, notificationStore, magicLinkStore
];

export const database = derived(
  stores,
  ([$users, $subjects, $educationLevels, $classes, $packages,
    $enrollments, $jobs, $applications, $attendances,
    $invoices, $payrollClaims, $candidates, $notifications, $magicLinks]): DatabaseSchema => ({
    version: 1,
    seededAt: new Date().toISOString(),
    isLoaded: true,
    users: $users,
    subjects: $subjects,
    educationLevels: $educationLevels,
    classes: $classes,
    packages: $packages,
    enrollments: $enrollments,
    jobs: $jobs,
    applications: $applications,
    attendances: $attendances,
    invoices: $invoices,
    payrollClaims: $payrollClaims,
    candidates: $candidates,
    notifications: $notifications,
    magicLinks: $magicLinks
  })
);

/**
 * Fetch all module stores in parallel.
 * Call this from layouts to pre-populate all data.
 */
export async function fetchAllStores(): Promise<void> {
  await Promise.all(stores.map(s => s.fetch()));
}
