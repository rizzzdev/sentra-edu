<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import JobApplyModal from '$lib/features/job-management/components/job-apply-modal.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import { JOB_STATUS_LABEL, getStatusLabel, getStatusBadgeClass } from '$lib/shared/utils/status-map';
  import type { JobPosting } from '$lib/shared/types/common.types';

  let searchQuery: string = '';
  let applyModalOpen: boolean = false;
  let applyingJob: JobPosting | null = null;

  $: currentUser = $authStore;

  function getClassesList(job: JobPosting): string[] {
    const ids = Array.isArray(job.classIds) && job.classIds.length > 0
      ? job.classIds
      : (job.classId ? [job.classId] : []);
    const names = ids
      .map((id) => $dbStore.classes.find((c) => c.id === id)?.className)
      .filter((n): n is string => Boolean(n));
    return names.length > 0 ? names : ['—'];
  }

  function getSubjectsList(job: JobPosting): string[] {
    const ids = Array.isArray(job.subjectIds) && job.subjectIds.length > 0
      ? job.subjectIds
      : (job.subjectId ? [job.subjectId] : []);
    const names = ids
      .map((id) => $dbStore.subjects.find((s) => s.id === id)?.name)
      .filter((n): n is string => Boolean(n));
    return names.length > 0 ? names : ['—'];
  }

  const DAY_NAME_MAP: Record<string, string> = {
    'Monday': 'Senin', 'Tuesday': 'Selasa', 'Wednesday': 'Rabu',
    'Thursday': 'Kamis', 'Friday': 'Jumat', 'Saturday': 'Sabtu', 'Sunday': 'Minggu',
    'mon': 'Senin', 'tue': 'Selasa', 'wed': 'Rabu',
    'thu': 'Kamis', 'fri': 'Jumat', 'sat': 'Sabtu', 'sun': 'Minggu',
    'Senin': 'Senin', 'Selasa': 'Selasa', 'Rabu': 'Rabu',
    'Kamis': 'Kamis', 'Jumat': 'Jumat', 'Sabtu': 'Sabtu', 'Minggu': 'Minggu'
  };

  function formatScheduleDays(days: string[] | undefined | null): string {
    if (!days || !Array.isArray(days) || days.length === 0) return '—';
    const mapped = days
      .map((d) => (typeof d === 'string' ? (DAY_NAME_MAP[d.trim()] || d.trim()) : ''))
      .filter(Boolean);
    return mapped.length > 0 ? mapped.join(', ') : '—';
  }

  $: openJobs = $dbStore.jobs.filter((j) => {
    if (j.deletedAt !== null) return false;
    if (j.status !== 'AVAILABLE' && j.status !== 'NEGOTIATING') return false;

    const q = searchQuery.toLowerCase();
    if (!q) return true;

    const classNames = getClassesList(j).join(' ').toLowerCase();
    const subjectNames = getSubjectsList(j).join(' ').toLowerCase();

    return (
      j.title.toLowerCase().includes(q) ||
      classNames.includes(q) ||
      subjectNames.includes(q)
    );
  });

  function hasApplied(jobId: string): boolean {
    if (!currentUser) return false;
    return $dbStore.applications.some(
      (a) => a.deletedAt === null && a.jobId === jobId && a.tentorId === currentUser?.id
    );
  }

  function getPackageName(packageId?: string): string {
    if (!packageId) return '—';
    return $dbStore.packages.find((p) => p.id === packageId)?.name || '—';
  }

  function getJobFee(job: JobPosting): number {
    const pkg = $dbStore.packages.find((p) => p.id === job.packageId);
    return pkg ? pkg.tentorFee : (job.tentorFee || 0);
  }

  function handleOpenApply(job: JobPosting) {
    applyingJob = job;
    applyModalOpen = true;
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="search" size="lg" /> Cari Lowongan</h3>
    <div class="desc">Daftar lowongan mengajar yang tersedia dan siap dilamar sesuai kompetensi Anda.</div>
  </div>
</div>

<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input type="text" placeholder="Cari judul / kelas / mapel..." bind:value={searchQuery} />
  </div>
</div>

{#if openJobs.length === 0}
  <div class="empty-state">
    <Icon name="work_off" size="xl" />
    <p>Tidak ada lowongan les yang tersedia saat ini.</p>
  </div>
{:else}
  {#each openJobs as j (j.id)}
    {@const applied = hasApplied(j.id)}
    <div class="job-card">
      <div class="j-top">
        <div class="j-title">{j.title}</div>
        <div style="display:flex;gap:6px;align-items:center">
          <span class="badge {getStatusBadgeClass(j.status)}">
            {getStatusLabel(j.status, JOB_STATUS_LABEL)}
          </span>
          <span class="badge {j.mode === 'ONLINE' ? 'b-neutral' : 'b-available'}">
            {j.mode === 'ONLINE' ? 'Online' : 'Tatap Muka'}
          </span>
        </div>
      </div>
      <div class="j-meta">
        <span>
          <Icon name="schedule" size="xs" /> {formatScheduleDays(j.scheduleDays)} {j.scheduleTime ? `· ${j.scheduleTime} WIB` : ''}
        </span>
        <span>
          <Icon name="sell" size="xs" /> {getPackageName(j.packageId)}
        </span>
        <span>
          <Icon name="stairs" size="xs" /> Kelas: {getClassesList(j).join(', ')}
        </span>
        <span>
          <Icon name="menu_book" size="xs" /> Mapel: {getSubjectsList(j).join(', ')}
        </span>
        {#if j.location}
          <span>
            <Icon name="location_on" size="xs" /> {j.location}
          </span>
        {/if}
        {#if j.notes}
          <span>
            <Icon name="notes" size="xs" /> {j.notes}
          </span>
        {/if}
      </div>
      <div class="j-foot">
        <span class="j-fee">
          Estimasi honor/sesi: <strong>{formatCurrencyIDR(getJobFee(j))}</strong> <span class="sub">(sesuai paket les)</span>
        </span>
        {#if (j.status === 'AVAILABLE' || j.status === 'NEGOTIATING') && !applied}
          <button
            type="button"
            class="btn btn-sm btn-primary"
            on:click={() => handleOpenApply(j)}
          >
            <Icon name="send" size="xs" /> Ajukan Lamaran
          </button>
        {:else if applied}
          <span class="badge b-pending">
            <Icon name="schedule" size="xs" /> Lamaran terkirim
          </span>
        {/if}
      </div>
    </div>
  {/each}
{/if}

{#if currentUser}
  <JobApplyModal
    open={applyModalOpen}
    job={applyingJob}
    tentor={currentUser}
    onClose={() => { applyModalOpen = false; }}
  />
{/if}
