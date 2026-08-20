<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import JobModal from '$lib/features/job-management/components/job-modal.svelte';
  import JobManageModal from '$lib/features/job-management/components/job-manage-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import { JOB_STATUS_LABEL, getStatusLabel, getStatusBadgeClass } from '$lib/shared/utils/status-map';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
  import type { JobPosting } from '$lib/shared/types/common.types';

  let searchQuery: string = '';
  let statusFilter: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 10;

  let jobModalOpen: boolean = false;
  let editingJob: JobPosting | null = null;
  let assignModalOpen: boolean = false;
  let assigningJob: JobPosting | null = null;
  let deleteDialogOpen: boolean = false;
  let deletingJobId: string | null = null;

  $: allJobs = $dbStore.jobs.filter((j) => j.deletedAt === null);

  $: nTotal = allJobs.length;
  $: nTersedia = allJobs.filter((j) => j.status === 'AVAILABLE').length;
  $: nNegosiasi = allJobs.filter((j) => j.status === 'NEGOTIATING').length;
  $: nDitugaskan = allJobs.filter((j) => j.status === 'ASSIGNED').length;

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

  function getScheduleDaysList(days: string[] | undefined | null): string[] {
    if (!days || !Array.isArray(days) || days.length === 0) return ['—'];
    const mapped = days
      .map((d) => (typeof d === 'string' ? (DAY_NAME_MAP[d.trim()] || d.trim()) : ''))
      .filter(Boolean);
    return mapped.length > 0 ? mapped : ['—'];
  }

  function getUserName(userId: string | null | undefined): string {
    if (!userId) return '';
    return $dbStore.users.find((u) => u.id === userId)?.fullName || '';
  }

  function getJobFee(job: JobPosting): number {
    const pkg = $dbStore.packages.find((p) => p.id === job.packageId);
    return pkg ? pkg.tentorFee : (job.tentorFee || 0);
  }

  $: filteredJobs = allJobs.filter((j) => {
    const q = searchQuery.trim().toLowerCase();
    const classNames = getClassesList(j).join(' ').toLowerCase();
    const subjectNames = getSubjectsList(j).join(' ').toLowerCase();

    const matchesSearch = !q ||
      j.title.toLowerCase().includes(q) ||
      classNames.includes(q) ||
      subjectNames.includes(q);

    const matchesStatus = !statusFilter || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  $: totalPages = Math.max(1, Math.ceil(filteredJobs.length / itemsPerPage));

  $: if (searchQuery || statusFilter) {
    if (currentPage > totalPages) {
      currentPage = 1;
    }
  }

  $: paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  function handleConfirmDelete() {
    if (!deletingJobId) return;
    const response = dbStore.deleteJob(deletingJobId);
    deleteDialogOpen = false;
    deletingJobId = null;
    if (!response.error) toastStore.success(response.message);
    else toastStore.error(response.message);
  }

  function handleResetFilters() {
    searchQuery = '';
    statusFilter = '';
    currentPage = 1;
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="work" size="lg" /> Lowongan Les</h3>
    <div class="desc">Daftar lowongan bimbingan belajar yang siap ditugaskan atau dinegosiasikan dengan tentor.</div>
  </div>
  <button type="button" class="btn btn-primary inline-flex items-center gap-1.5" on:click={() => { editingJob = null; jobModalOpen = true; }}>
    <Icon name="add" size="sm" /> Buat Lowongan
  </button>
</div>

<!-- STAT METRICS -->
<div class="stat-grid">
  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="work" size="lg" /></div>
    <div><div class="s-val">{nTotal}</div><div class="s-lbl">Total Lowongan</div></div>
  </div>
  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="event_available" size="lg" /></div>
    <div><div class="s-val">{nTersedia}</div><div class="s-lbl">Tersedia</div></div>
  </div>
  <div class="stat">
    <div class="s-icon tone-amber"><Icon name="handshake" size="lg" /></div>
    <div><div class="s-val">{nNegosiasi}</div><div class="s-lbl">Negosiasi</div></div>
  </div>
  <div class="stat">
    <div class="s-icon tone-violet"><Icon name="lock" size="lg" /></div>
    <div><div class="s-val">{nDitugaskan}</div><div class="s-lbl">Ditugaskan</div></div>
  </div>
</div>

<!-- FILTER BAR -->
<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input
      type="text"
      placeholder="Cari judul lowongan / kelas / mapel..."
      bind:value={searchQuery}
      on:input={() => { currentPage = 1; }}
    />
  </div>

  <SelectSearch
    bind:value={statusFilter}
    placeholder="Semua Status"
    options={[
      { value: '', label: 'Semua Status' },
      ...Object.entries(JOB_STATUS_LABEL).map(([v, l]) => ({ value: v, label: l }))
    ]}
    className="max-w-48"
  />

  {#if searchQuery || statusFilter}
    <button
      type="button"
      class="btn btn-sm btn-outline"
      on:click={handleResetFilters}
      title="Reset filter"
    >
      <Icon name="restart_alt" size="xs" /> Reset
    </button>
  {/if}
</div>

<!-- TABLE CARD -->
<div class="card mb-6">
  <div class="card-body flush">
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Lowongan</th>
            <th>Kelas</th>
            <th>Mata Pelajaran</th>
            <th>Jadwal Belajar</th>
            <th>Status</th>
            <th style="text-align:right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedJobs.length === 0}
            <tr>
              <td colspan="6" class="empty py-10 text-center text-muted-fg">
                <Icon name="work_off" size="lg" className="opacity-40 mb-2 block mx-auto text-4xl" />
                <div class="font-semibold text-fg">Tidak ada lowongan les ditemukan.</div>
                <div class="text-xs text-muted-fg mt-1">
                  {searchQuery || statusFilter
                    ? 'Coba sesuaikan kata kunci pencarian atau filter status.'
                    : 'Belum ada data lowongan les yang terdaftar.'}
                </div>
              </td>
            </tr>
          {:else}
            {#each paginatedJobs as j (j.id)}
              <tr>
                <td>
                  <strong>{j.title}</strong>
                  <div class="sub">
                    <span class="badge {j.mode === 'ONLINE' ? 'b-neutral' : 'b-available'}">
                      {j.mode === 'ONLINE' ? 'Online' : 'Offline'}
                    </span>
                    <span class="badge {j.studentCount > 1 ? 'b-admin' : 'b-interviewed'}">
                      {j.studentCount > 1 ? 'Kelompok' : 'Privat'}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-1 items-start">
                    {#each getClassesList(j) as cls}
                      <span class="badge b-neutral text-xs">
                        <Icon name="stairs" size="xs" />
                        {cls}
                      </span>
                    {/each}
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-1 items-start">
                    {#each getSubjectsList(j) as sub}
                      <span class="badge b-sky text-xs">
                        <Icon name="menu_book" size="xs" />
                        {sub}
                      </span>
                    {/each}
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-1.5 items-start">
                    <div class="flex items-center gap-1 flex-wrap">
                      {#each getScheduleDaysList(j.scheduleDays) as day}
                        <span class="badge b-neutral text-xs font-semibold">
                          <Icon name="calendar_today" size="xs" />
                          {day}
                        </span>
                      {/each}
                    </div>
                    <div class="sub">{j.scheduleTime || '—'}{#if j.scheduleEndTime} – {j.scheduleEndTime}{/if} WIB</div>
                    <div class="sub font-medium">{formatCurrencyIDR(getJobFee(j))}/sesi</div>
                  </div>
                </td>
                <td>
                  <span class="badge {getStatusBadgeClass(j.status)}">
                    {#if j.status === 'ASSIGNED'}
                      <Icon name="check_circle" size="xs" />
                    {:else if j.status === 'AVAILABLE'}
                      <Icon name="event_available" size="xs" />
                    {:else if j.status === 'NEGOTIATING'}
                      <Icon name="handshake" size="xs" />
                    {:else if j.status === 'CANCELLED'}
                      <Icon name="cancel" size="xs" />
                    {/if}
                    {getStatusLabel(j.status, JOB_STATUS_LABEL)}
                  </span>
                  {#if j.assignedTentorId}
                    <div class="text-xs text-muted-fg mt-1 flex items-center gap-1 font-medium">
                      <Icon name="badge" size="xs" />
                      <span>{getUserName(j.assignedTentorId)}</span>
                    </div>
                  {/if}
                </td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Kelola"
                      on:click={() => { assigningJob = j; assignModalOpen = true; }}
                    >
                      <Icon name="tune" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Ubah"
                      on:click={() => { editingJob = j; jobModalOpen = true; }}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      on:click={() => { deletingJobId = j.id; deleteDialogOpen = true; }}
                    >
                      <Icon name="delete" size="sm" />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <!-- PERSISTENT PAGINATION BAR -->
    <div class="page-nav">
      <div class="page-info">
        Menampilkan {filteredJobs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredJobs.length)} dari {filteredJobs.length} data
      </div>
      <div class="page-btns">
        <button
          type="button"
          class="page-btn"
          disabled={currentPage <= 1}
          on:click={() => { currentPage--; }}
          title="Halaman Sebelumnya"
        >
          &laquo;
        </button>
        {#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNumber}
          <button
            type="button"
            class="page-btn {currentPage === pageNumber ? 'active' : ''}"
            on:click={() => { currentPage = pageNumber; }}
          >
            {pageNumber}
          </button>
        {/each}
        <button
          type="button"
          class="page-btn"
          disabled={currentPage >= totalPages}
          on:click={() => { currentPage++; }}
          title="Halaman Berikutnya"
        >
          &raquo;
        </button>
      </div>
    </div>
  </div>
</div>

<JobModal open={jobModalOpen} {editingJob} onClose={() => { jobModalOpen = false; }} />
<JobManageModal
  open={assignModalOpen}
  job={assigningJob}
  onClose={() => { assignModalOpen = false; }}
  onEdit={(j) => { assignModalOpen = false; editingJob = j; jobModalOpen = true; }}
/>
<ConfirmationDialog
  open={deleteDialogOpen}
  title="Hapus Lowongan"
  message="Apakah Anda yakin ingin menghapus lowongan les ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => { deleteDialogOpen = false; }}
/>
