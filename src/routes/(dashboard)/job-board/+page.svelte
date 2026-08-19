<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import JobApplyModal from '$lib/features/job-management/components/job-apply-modal.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import type { JobPosting } from '$lib/shared/types/common.types';

  let searchQuery: string = '';
  let applyModalOpen: boolean = false;
  let applyingJob: JobPosting | null = null;

  $: currentUser = $authStore;

  $: openJobs = $dbStore.jobs.filter((j) => {
    if (j.deletedAt !== null) return false;
    if (j.status !== 'AVAILABLE' && j.status !== 'NEGOTIATING') return false;

    const q = searchQuery.toLowerCase();
    if (!q) return true;

    const cls = $dbStore.classes.find((c) => c.id === j.classId);
    const sub = $dbStore.subjects.find((s) => s.id === j.subjectId);

    return (
      j.title.toLowerCase().includes(q) ||
      (cls?.className || '').toLowerCase().includes(q) ||
      (sub?.name || '').toLowerCase().includes(q)
    );
  });

  function hasApplied(jobId: string): boolean {
    if (!currentUser) return false;
    return $dbStore.applications.some(
      (a) => a.deletedAt === null && a.jobId === jobId && a.tentorId === currentUser?.id
    );
  }

  function getClassName(classId: string): string {
    return $dbStore.classes.find((c) => c.id === classId)?.className || '—';
  }

  function getSubjectName(subjectId: string): string {
    return $dbStore.subjects.find((s) => s.id === subjectId)?.name || '—';
  }

  function getPackageName(packageId?: string): string {
    if (!packageId) return '—';
    return $dbStore.packages.find((p) => p.id === packageId)?.name || '—';
  }

  function getJobFee(job: JobPosting): number {
    const pkg = $dbStore.packages.find((p) => p.id === job.packageId);
    return pkg ? pkg.tentorFee : 0;
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
          <span class="badge {j.status === 'AVAILABLE' ? 'b-available' : 'b-negotiating'}">{j.status}</span>
          <span class="badge {j.mode === 'ONLINE' ? 'b-neutral' : 'b-available'}">{j.mode || 'OFFLINE'}</span>
        </div>
      </div>
      <div class="j-meta">
        <span>
          <Icon name="schedule" size="xs" /> {j.schedulePreference}
        </span>
        <span>
          <Icon name="sell" size="xs" /> {getPackageName(j.packageId)}
        </span>
        <span>
          <Icon name="group" size="xs" /> {j.studentName}
        </span>
        <span>
          <Icon name="school" size="xs" /> {getClassName(j.classId)} · {getSubjectName(j.subjectId)}
        </span>
        {#if j.latitude !== null && j.longitude !== null}
          <span>
            <Icon name="location_on" size="xs" /> Lokasi les: {j.latitude}, {j.longitude}
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
