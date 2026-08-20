<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import JobApplyModal from '$lib/features/job-management/components/job-apply-modal.svelte';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
  import Modal from '$lib/components/molecules/modal.svelte';
  import Button from '$lib/components/atoms/button.svelte';
  import LeafletMap from '$lib/components/molecules/leaflet-map.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import { JOB_STATUS_LABEL, getStatusLabel, getStatusBadgeClass, getScheduleDaysList } from '$lib/shared/utils/status-map';
  import type { JobPosting } from '$lib/shared/types/common.types';
  import { onMount } from 'svelte';

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

  function getClassesList(job: JobPosting): string[] {
    const ids = Array.isArray(job.classIds) && job.classIds.length > 0
      ? job.classIds
      : (job.classId ? [job.classId] : []);
    const names = ids
      .map((id) => $dbStore.classes.find((c) => c.id === id)?.className)
      .filter((n): n is string => Boolean(n));
    return names.length > 0 ? names : ['Semua Kelas'];
  }

  function getSubjectsList(job: JobPosting): string[] {
    const ids = Array.isArray(job.subjectIds) && job.subjectIds.length > 0
      ? job.subjectIds
      : (job.subjectId ? [job.subjectId] : []);
    const names = ids
      .map((id) => $dbStore.subjects.find((s) => s.id === id)?.name)
      .filter((n): n is string => Boolean(n));
    return names.length > 0 ? names : ['Semua Mapel'];
  }

  function getPackage(packageId?: string) {
    if (!packageId) return null;
    return $dbStore.packages.find((p) => p.id === packageId) || null;
  }

  function getJobFee(job: JobPosting): number {
    const pkg = getPackage(job.packageId);
    return pkg?.tentorFee ? pkg.tentorFee : (job.tentorFee || 0);
  }

  function getStudentCount(job: JobPosting): number {
    if (job.studentCount && job.studentCount > 0) return job.studentCount;
    if (Array.isArray(job.studentIds) && job.studentIds.length > 0) return job.studentIds.length;
    if (Array.isArray(job.studentNames) && job.studentNames.length > 0) return job.studentNames.length;
    return 1;
  }

  function getJobMode(job: JobPosting): 'ONLINE' | 'OFFLINE' {
    const raw = (job.jobMode || job.mode || 'OFFLINE').toUpperCase();
    return raw === 'ONLINE' ? 'ONLINE' : 'OFFLINE';
  }

  function getPackageMode(job: JobPosting): 'PRIVAT' | 'KELOMPOK' {
    const pkg = getPackage(job.packageId);
    const raw = (pkg?.mode || '').toUpperCase();
    if (raw.includes('KELOMPOK') || raw.includes('GROUP') || getStudentCount(job) > 1) {
      return 'KELOMPOK';
    }
    return 'PRIVAT';
  }

  $: openJobs = $dbStore.jobs.filter((j) => {
    if (j.deletedAt !== null) return false;
    if (j.status !== 'AVAILABLE' && j.status !== 'NEGOTIATING') return false;

    if (statusFilter && j.status !== statusFilter) return false;

    const jMode = getJobMode(j);
    if (modeFilter && jMode !== modeFilter) return false;

    const pMode = getPackageMode(j);
    if (packageModeFilter && pMode !== packageModeFilter) return false;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    const classNames = getClassesList(j).join(' ').toLowerCase();
    const subjectNames = getSubjectsList(j).join(' ').toLowerCase();
    const pkgName = (getPackage(j.packageId)?.name || '').toLowerCase();
    const location = (j.location || '').toLowerCase();

    return (
      j.title.toLowerCase().includes(q) ||
      classNames.includes(q) ||
      subjectNames.includes(q) ||
      pkgName.includes(q) ||
      location.includes(q)
    );
  });

  function hasApplied(jobId: string): boolean {
    if (!currentUser) return false;
    return $dbStore.applications.some(
      (a) => a.deletedAt === null && a.jobId === jobId && a.tentorId === currentUser?.id
    );
  }

  function handleOpenApply(job: JobPosting) {
    applyingJob = job;
    applyModalOpen = true;
  }

  function handleOpenLocation(job: JobPosting) {
    viewingLocationJob = job;
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
        <div class="flex justify-between items-center pt-3 border-t border-[var(--color-border)]">
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
    {#each openJobs as j (j.id)}
      {@const applied = hasApplied(j.id)}
      {@const pkg = getPackage(j.packageId)}
      {@const jMode = getJobMode(j)}
      {@const pMode = getPackageMode(j)}
      {@const fee = getJobFee(j)}
      {@const studentCount = getStudentCount(j)}

      <div class="job-card">
        <!-- TOP HEADER -->
        <div class="j-top">
          <div>
            <div class="j-title">{j.title}</div>
            <div class="flex items-center gap-1.5 flex-wrap mt-1.5">
              <span class="badge {getStatusBadgeClass(j.status)}">
                {#if j.status === 'AVAILABLE'}
                  <Icon name="event_available" size="xs" />
                {:else if j.status === 'NEGOTIATING'}
                  <Icon name="handshake" size="xs" />
                {/if}
                {getStatusLabel(j.status, JOB_STATUS_LABEL)}
              </span>

              <span class="badge {jMode === 'ONLINE' ? 'b-neutral' : 'b-available'}">
                <Icon name={jMode === 'ONLINE' ? 'videocam' : 'home_pin'} size="xs" />
                {jMode === 'ONLINE' ? 'Online' : 'Tatap Muka'}
              </span>

              <span class="badge {pMode === 'KELOMPOK' ? 'b-admin' : 'b-interviewed'}">
                <Icon name={pMode === 'KELOMPOK' ? 'groups' : 'person'} size="xs" />
                {pMode === 'KELOMPOK' ? 'Kelompok' : 'Privat'}
              </span>

              <span class="badge b-neutral text-xs font-medium">
                <Icon name="groups" size="xs" />
                {studentCount} Murid
              </span>
            </div>
          </div>
        </div>

        <!-- SPECS & DETAILS -->
        <div class="j-meta-grid">
          <!-- KELAS -->
          <div class="meta-item">
            <span class="meta-label"><Icon name="stairs" size="xs" /> Kelas</span>
            <div class="flex items-center gap-1 flex-wrap mt-1">
              {#each getClassesList(j) as cls}
                <span class="badge b-neutral text-xs">
                  {cls}
                </span>
              {/each}
            </div>
          </div>

          <!-- MAPEL -->
          <div class="meta-item">
            <span class="meta-label"><Icon name="menu_book" size="xs" /> Mata Pelajaran</span>
            <div class="flex items-center gap-1 flex-wrap mt-1">
              {#each getSubjectsList(j) as sub}
                <span class="badge b-sky text-xs">
                  {sub}
                </span>
              {/each}
            </div>
          </div>

          <!-- JADWAL -->
          <div class="meta-item sm:col-span-2">
            <span class="meta-label"><Icon name="schedule" size="xs" /> Jadwal & Durasi</span>
            <div class="flex items-center gap-2 flex-wrap mt-1">
              <div class="flex items-center gap-1 flex-wrap">
                {#each getScheduleDaysList(j.scheduleDays) as day}
                  <span class="badge b-neutral text-xs font-semibold">
                    <Icon name="calendar_today" size="xs" />
                    {day}
                  </span>
                {/each}
              </div>
              <span class="text-xs text-muted-fg font-medium">
                • {j.scheduleTime || '16:00'}{#if j.scheduleEndTime} – {j.scheduleEndTime}{/if} WIB
                ({j.sessionDurationMinutes || 90} menit/sesi)
              </span>
            </div>
          </div>

          <!-- CATATAN -->
          {#if j.notes || j.additionalNotes}
            <div class="meta-item sm:col-span-2">
              <div class="text-xs text-muted-fg bg-[var(--color-surface-hover)] p-2.5 rounded-lg flex items-start gap-1.5">
                <Icon name="info" size="xs" className="mt-0.5 flex-shrink-0 text-primary" />
                <span>{j.notes || j.additionalNotes}</span>
              </div>
            </div>
          {/if}
        </div>

        <!-- FOOTER & ACTION -->
        <div class="j-foot">
          <div class="meta-item">
            <span class="meta-label"><Icon name="payments" size="xs" /> Estimasi Honor Pengajar</span>
            <div class="j-fee mt-0.5">
              <strong>{formatCurrencyIDR(fee)}</strong> <span class="text-xs text-muted-fg font-normal">/ sesi</span>
              {#if j.transportAllowance && j.transportAllowance > 0}
                <span class="text-xs text-emerald-600 font-semibold ml-1">
                  (+ {formatCurrencyIDR(j.transportAllowance)} transport)
                </span>
              {/if}
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            {#if jMode === 'OFFLINE' && (j.location || (j.latitude && j.longitude))}
              <button
                type="button"
                class="btn btn-sm btn-outline inline-flex items-center gap-1.5"
                on:click={() => handleOpenLocation(j)}
              >
                <Icon name="location_on" size="xs" /> Lihat Lokasi
              </button>
            {/if}

            {#if (j.status === 'AVAILABLE' || j.status === 'NEGOTIATING') && !applied}
              <button
                type="button"
                class="btn btn-sm btn-primary inline-flex items-center gap-1.5 shadow-sm"
                on:click={() => handleOpenApply(j)}
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
    maxWidth="600px"
    onClose={() => { locationModalOpen = false; }}
  >
    <div>
      {#if viewingLocationJob.latitude && viewingLocationJob.longitude}
        <div class="rounded-xl overflow-hidden border border-[var(--color-border)] shadow-sm">
          <LeafletMap
            latitude={viewingLocationJob.latitude}
            longitude={viewingLocationJob.longitude}
            readonly={true}
            height="320px"
            zoom={15}
          />
        </div>
      {:else}
        <div class="text-xs text-muted-fg italic text-center py-8 border border-dashed border-[var(--color-border)] rounded-xl">
          <Icon name="map" size="md" className="opacity-40 mb-1 block mx-auto text-3xl" />
          Koordinat peta GPS belum disetel untuk lowongan ini.
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

<style>
  .j-meta-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--color-border, #e2e8f0);
  }

  @media (min-width: 640px) {
    .j-meta-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .meta-item {
    display: flex;
    flex-direction: column;
  }

  .meta-label {
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--color-muted-fg, #64748b);
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
</style>
