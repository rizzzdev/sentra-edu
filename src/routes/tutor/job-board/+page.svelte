<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import JobApplyModal from '$lib/features/job-management/components/job-apply-modal.svelte';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
  import Modal from '$lib/components/molecules/modal.svelte';
  import Button from '$lib/components/atoms/button.svelte';
  import LeafletMap from '$lib/components/molecules/leaflet-map.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import { JOB_STATUS_LABEL, getStatusLabel, getStatusBadgeClass, getScheduleDaysList } from '$lib/shared/utils/status-map';
  import type { JobPosting } from '$lib/shared/types/common.types';
  import { onMount } from 'svelte';
import { subjectStore, classStore, packageStore, jobStore, applicationStore } from '$lib/api';

  let searchQuery: string = '';
  let modeFilter: string = '';
  let packageModeFilter: string = '';
  let statusFilter: string = '';
  let isLoading: boolean = true;

  let applyModalOpen: boolean = false;
  let applyingJob: JobPosting | null = null;

  let locationModalOpen: boolean = false;
  let viewingLocationJob: JobPosting | null = null;

  $: currentUser = $authStore;

  onMount(() => {
    setTimeout(() => {
      isLoading = false;
    }, 250);
  });

  function getClassesList(jobPosting: JobPosting): string[] {
    const classIds = Array.isArray(jobPosting.classIds) && jobPosting.classIds.length > 0
      ? jobPosting.classIds
      : (jobPosting.classId ? [jobPosting.classId] : []);
    const names = classIds
      .map((classIdentifier) => $classStore.find((classItem) => classItem.id === classIdentifier)?.className)
      .filter((name): name is string => Boolean(name));
    return names.length > 0 ? names : ['Semua Kelas'];
  }

  function getSubjectsList(jobPosting: JobPosting): string[] {
    const subjectIds = Array.isArray(jobPosting.subjectIds) && jobPosting.subjectIds.length > 0
      ? jobPosting.subjectIds
      : (jobPosting.subjectId ? [jobPosting.subjectId] : []);
    const names = subjectIds
      .map((subjectIdentifier) => $subjectStore.find((subjectItem) => subjectItem.id === subjectIdentifier)?.name)
      .filter((name): name is string => Boolean(name));
    return names.length > 0 ? names : ['Semua Mapel'];
  }

  function getPackage(packageId?: string) {
    if (!packageId) return null;
    return $packageStore.find((packageItem) => packageItem.id === packageId) || null;
  }

  function getJobFee(jobPosting: JobPosting): number {
    const packagePlan = getPackage(jobPosting.packageId);
    return packagePlan?.tentorFee ? packagePlan.tentorFee : (jobPosting.tentorFee || 0);
  }

  function getStudentCount(jobPosting: JobPosting): number {
    if (jobPosting.studentCount && jobPosting.studentCount > 0) return jobPosting.studentCount;
    if (Array.isArray(jobPosting.studentIds) && jobPosting.studentIds.length > 0) return jobPosting.studentIds.length;
    if (Array.isArray(jobPosting.studentNames) && jobPosting.studentNames.length > 0) return jobPosting.studentNames.length;
    return 1;
  }

  function getJobMode(jobPosting: JobPosting): 'ONLINE' | 'OFFLINE' {
    const rawMode = (jobPosting.jobMode || jobPosting.mode || 'OFFLINE').toUpperCase();
    return rawMode === 'ONLINE' ? 'ONLINE' : 'OFFLINE';
  }

  function getPackageMode(jobPosting: JobPosting): 'PRIVAT' | 'KELOMPOK' {
    const packagePlan = getPackage(jobPosting.packageId);
    const rawMode = (packagePlan?.mode || '').toUpperCase();
    if (rawMode.includes('KELOMPOK') || rawMode.includes('GROUP') || getStudentCount(jobPosting) > 1) {
      return 'KELOMPOK';
    }
    return 'PRIVAT';
  }

  $: openJobs = $jobStore.filter((jobItem) => {
    if (jobItem.deletedAt !== null) return false;
    if (jobItem.status !== 'AVAILABLE' && jobItem.status !== 'NEGOTIATING') return false;

    if (statusFilter && jobItem.status !== statusFilter) return false;

    const jobItemMode = getJobMode(jobItem);
    if (modeFilter && jobItemMode !== modeFilter) return false;

    const packagePlanMode = getPackageMode(jobItem);
    if (packageModeFilter && packagePlanMode !== packageModeFilter) return false;

    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const classNames = getClassesList(jobItem).join(' ').toLowerCase();
    const subjectNames = getSubjectsList(jobItem).join(' ').toLowerCase();
    const packageName = (getPackage(jobItem.packageId)?.name || '').toLowerCase();
    const location = (jobItem.location || '').toLowerCase();

    return (
      jobItem.title.toLowerCase().includes(query) ||
      classNames.includes(query) ||
      subjectNames.includes(query) ||
      packageName.includes(query) ||
      location.includes(query)
    );
  });

  function hasApplied(jobId: string): boolean {
    if (!currentUser) return false;
    return $applicationStore.some(
      (applicationItem) => applicationItem.deletedAt === null && applicationItem.jobId === jobId && applicationItem.tentorId === currentUser?.id
    );
  }

  function handleOpenApply(jobPosting: JobPosting) {
    applyingJob = jobPosting;
    applyModalOpen = true;
  }

  function handleOpenLocation(jobPosting: JobPosting) {
    viewingLocationJob = jobPosting;
    locationModalOpen = true;
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="search" size="lg" /> Cari Lowongan</h3>
    <div class="desc">Daftar lowongan mengajar aktif yang dapat Anda lamar sesuai dengan kualifikasi & jadwal Anda.</div>
  </div>
</div>

<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input type="text" placeholder="Cari judul, kelas, mata pelajaran, lokasi..." bind:value={searchQuery} />
  </div>

  <SelectSearch
    bind:value={modeFilter}
    placeholder="Semua Mode"
    options={[
      { value: '', label: 'Semua Mode' },
      { value: 'OFFLINE', label: 'Tatap Muka (Offline)' },
      { value: 'ONLINE', label: 'Online (Daring)' }
    ]}
    className="max-w-44"
  />

  <SelectSearch
    bind:value={packageModeFilter}
    placeholder="Semua Tipe"
    options={[
      { value: '', label: 'Semua Tipe' },
      { value: 'PRIVAT', label: 'Privat' },
      { value: 'KELOMPOK', label: 'Kelompok' }
    ]}
    className="max-w-40"
  />

  <SelectSearch
    bind:value={statusFilter}
    placeholder="Semua Status"
    options={[
      { value: '', label: 'Semua Status' },
      { value: 'AVAILABLE', label: 'Tersedia' },
      { value: 'NEGOTIATING', label: 'Negosiasi' }
    ]}
    className="max-w-40"
  />
</div>

{#if isLoading}
  <div class="space-y-4">
    {#each Array(3) as _}
      <div class="job-card p-5 space-y-3">
        <div class="flex justify-between items-start">
          <Skeleton width="w-48" height="h-6" />
          <Skeleton width="w-24" height="h-6" className="rounded-full" />
        </div>
        <Skeleton width="w-full" height="h-4" />
        <Skeleton width="w-3/4" height="h-4" />
        <div class="flex justify-between items-center pt-3 border-t border-border">
          <Skeleton width="w-36" height="h-5" />
          <Skeleton width="w-28" height="h-8" className="rounded-lg" />
        </div>
      </div>
    {/each}
  </div>
{:else if openJobs.length === 0}
  <div class="empty-state">
    <Icon name="work_off" size="xl" className="opacity-40 mb-2 block mx-auto text-5xl" />
    <div class="font-bold text-fg text-base">Tidak ada lowongan les yang cocok.</div>
    <p class="text-sm text-muted-fg mt-1">
      {searchQuery || modeFilter || packageModeFilter || statusFilter
        ? 'Coba sesuaikan kata kunci pencarian atau reset filter di atas.'
        : 'Saat ini belum ada lowongan bimbingan belajar baru yang tersedia.'}
    </p>
  </div>
{:else}
  <div class="space-y-4">
    {#each openJobs as jobItem (jobItem.id)}
      {@const applied = hasApplied(jobItem.id)}
      {@const jobMode = getJobMode(jobItem)}
      {@const packagePlanMode = getPackageMode(jobItem)}
      {@const fee = getJobFee(jobItem)}
      {@const studentCount = getStudentCount(jobItem)}

      <div class="job-card">
        <!-- TOP HEADER -->
        <div class="j-top">
          <div>
            <div class="j-title">{jobItem.title}</div>
            <div class="flex items-center gap-1.5 flex-wrap mt-1.5">
              <span class="badge {getStatusBadgeClass(jobItem.status)}">
                {#if jobItem.status === 'AVAILABLE'}
                  <Icon name="event_available" size="xs" />
                {:else if jobItem.status === 'NEGOTIATING'}
                  <Icon name="handshake" size="xs" />
                {/if}
                {getStatusLabel(jobItem.status, JOB_STATUS_LABEL)}
              </span>

              <span class="badge {jobMode === 'ONLINE' ? 'b-neutral' : 'b-available'}">
                <Icon name={jobMode === 'ONLINE' ? 'videocam' : 'home_pin'} size="xs" />
                {jobMode === 'ONLINE' ? 'Online' : 'Tatap Muka'}
              </span>

              <span class="badge {packagePlanMode === 'KELOMPOK' ? 'b-admin' : 'b-interviewed'}">
                <Icon name={packagePlanMode === 'KELOMPOK' ? 'groups' : 'person'} size="xs" />
                {packagePlanMode === 'KELOMPOK' ? 'Kelompok' : 'Privat'}
              </span>

              <span class="badge b-neutral text-xs font-medium">
                <Icon name="groups" size="xs" />
                {studentCount} Murid
              </span>
            </div>
          </div>
        </div>

        <!-- SPECS & DETAILS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3.5 pt-3 border-t border-border">
          <!-- KELAS -->
          <div class="flex flex-col">
            <span class="text-xs font-semibold uppercase tracking-wider text-muted-fg inline-flex items-center gap-1"><Icon name="stairs" size="xs" /> Kelas</span>
            <div class="flex items-center gap-1 flex-wrap mt-1">
              {#each getClassesList(jobItem) as className}
                <span class="badge b-neutral text-xs">
                  {className}
                </span>
              {/each}
            </div>
          </div>

          <!-- MAPEL -->
          <div class="flex flex-col">
            <span class="text-xs font-semibold uppercase tracking-wider text-muted-fg inline-flex items-center gap-1"><Icon name="menu_book" size="xs" /> Mata Pelajaran</span>
            <div class="flex items-center gap-1 flex-wrap mt-1">
              {#each getSubjectsList(jobItem) as subjectName}
                <span class="badge b-sky text-xs">
                  {subjectName}
                </span>
              {/each}
            </div>
          </div>

          <!-- JADWAL -->
          <div class="flex flex-col sm:col-span-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-muted-fg inline-flex items-center gap-1"><Icon name="schedule" size="xs" /> Jadwal & Durasi</span>
            <div class="flex items-center gap-2 flex-wrap mt-1">
              <div class="flex items-center gap-1 flex-wrap">
                {#each getScheduleDaysList(jobItem.scheduleDays) as day}
                  <span class="badge b-neutral text-xs font-semibold">
                    <Icon name="calendar_today" size="xs" />
                    {day}
                  </span>
                {/each}
              </div>
              <span class="text-xs text-muted-fg font-medium">
                • {jobItem.scheduleTime || '16:00'}{#if jobItem.scheduleEndTime} – {jobItem.scheduleEndTime}{/if} WIB
                ({jobItem.sessionDurationMinutes || 90} menit/sesi)
              </span>
            </div>
          </div>

          <!-- CATATAN -->
          {#if jobItem.notes || jobItem.additionalNotes}
            <div class="flex flex-col sm:col-span-2">
              <div class="text-xs text-muted-fg bg-muted p-2.5 rounded-lg flex items-start gap-1.5">
                <Icon name="info" size="xs" className="mt-0.5 flex-shrink-0 text-primary" />
                <span>{jobItem.notes || jobItem.additionalNotes}</span>
              </div>
            </div>
          {/if}
        </div>

        <!-- FOOTER & ACTION -->
        <div class="j-foot">
          <div class="flex flex-col">
            <span class="text-xs font-semibold uppercase tracking-wider text-muted-fg inline-flex items-center gap-1"><Icon name="payments" size="xs" /> Estimasi Honor Pengajar</span>
            <div class="j-fee mt-0.5">
              <strong>{formatCurrencyIDR(fee)}</strong> <span class="text-xs text-muted-fg font-normal">/ sesi</span>
              {#if jobItem.transportAllowance && jobItem.transportAllowance > 0}
                <span class="text-xs text-emerald-600 font-semibold ml-1">
                  (+ {formatCurrencyIDR(jobItem.transportAllowance)} transport)
                </span>
              {/if}
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            {#if jobMode === 'OFFLINE' && (jobItem.location || (jobItem.latitude && jobItem.longitude))}
              <button
                type="button"
                class="btn btn-sm btn-outline inline-flex items-center gap-1.5"
                on:click={() => handleOpenLocation(jobItem)}
              >
                <Icon name="location_on" size="xs" /> Lihat Lokasi
              </button>
            {/if}

            {#if (jobItem.status === 'AVAILABLE' || jobItem.status === 'NEGOTIATING') && !applied}
              <button
                type="button"
                class="btn btn-sm btn-primary inline-flex items-center gap-1.5 shadow-sm"
                on:click={() => handleOpenApply(jobItem)}
              >
                <Icon name="send" size="xs" /> Ajukan Lamaran
              </button>
            {:else if applied}
              <span class="badge b-pending py-1.5 px-3">
                <Icon name="check_circle" size="xs" /> Lamaran Terkirim
              </span>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}

<!-- MODAL LAMAR -->
{#if currentUser}
  <JobApplyModal
    open={applyModalOpen}
    job={applyingJob}
    tentor={currentUser}
    onClose={() => { applyModalOpen = false; }}
  />
{/if}

<!-- MODAL LOKASI (LEAFLET MAP) -->
{#if viewingLocationJob}
  <Modal
    open={locationModalOpen}
    title="Lokasi Bimbingan Belajar"
    icon="location_on"
    maxWidth="620px"
    onClose={() => { locationModalOpen = false; }}
  >
    <div class="flex flex-col gap-4 py-1">
      {#if viewingLocationJob.latitude && viewingLocationJob.longitude}
        <div class="rounded-xl overflow-hidden border border-border shadow-sm">
          <LeafletMap
            latitude={viewingLocationJob.latitude}
            longitude={viewingLocationJob.longitude}
            readonly={true}
            height="300px"
            zoom={15}
          />
        </div>
      {/if}

      {#if viewingLocationJob.location}
        <div class="flex items-start gap-3.5 p-4 sm:px-4.5 bg-muted border border-border rounded-xl">
          <div class="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon name="pin_drop" size="sm" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-bold uppercase tracking-wider text-muted-fg">Alamat Lengkap</div>
            <div class="text-sm font-medium text-fg leading-relaxed mt-1">{viewingLocationJob.location}</div>
          </div>
        </div>
      {:else if !viewingLocationJob.latitude || !viewingLocationJob.longitude}
        <div class="text-xs text-muted-fg italic text-center py-8 border border-dashed border-border rounded-xl">
          <Icon name="map" size="md" className="opacity-40 mb-1 block mx-auto text-3xl" />
          Informasi lokasi belum disetel untuk lowongan ini.
        </div>
      {/if}
    </div>

    <svelte:fragment slot="footer">
      <Button variant="outline" on:click={() => { locationModalOpen = false; }}>
        Tutup
      </Button>
    </svelte:fragment>
  </Modal>
{/if}
