<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import JobModal from '$lib/features/job-management/components/job-modal.svelte';
  import JobManageModal from '$lib/features/job-management/components/job-manage-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import { JOB_STATUS_LABEL, getStatusLabel, getStatusBadgeClass, getScheduleDaysList } from '$lib/shared/utils/status-map';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
  import type { JobPosting } from '$lib/shared/types/common.types';
  import { onMount } from 'svelte';

  let searchQuery: string = '';
  let statusFilter: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 10;
  let isLoading: boolean = true;

  let jobModalOpen: boolean = false;
  let editingJob: JobPosting | null = null;
  let assignModalOpen: boolean = false;
  let assigningJob: JobPosting | null = null;
  let deleteDialogOpen: boolean = false;
  let deletingJobId: string | null = null;

  onMount(() => {
    setTimeout(() => {
      isLoading = false;
    }, 250);
  });

  $: allJobs = $dbStore.jobs.filter((jobItem) => jobItem.deletedAt === null);

  $: totalJobsCount = allJobs.length;
  $: availableJobsCount = allJobs.filter((jobItem) => jobItem.status === 'AVAILABLE').length;
  $: negotiatingJobsCount = allJobs.filter((jobItem) => jobItem.status === 'NEGOTIATING').length;
  $: assignedJobsCount = allJobs.filter((jobItem) => jobItem.status === 'ASSIGNED').length;

  function getClassesList(jobPosting: JobPosting): string[] {
    const classIds = Array.isArray(jobPosting.classIds) && jobPosting.classIds.length > 0
      ? jobPosting.classIds
      : (jobPosting.classId ? [jobPosting.classId] : []);
    const names = classIds
      .map((classIdentifier) => $dbStore.classes.find((classItem) => classItem.id === classIdentifier)?.className)
      .filter((name): name is string => Boolean(name));
    return names.length > 0 ? names : ['—'];
  }

  function getSubjectsList(jobPosting: JobPosting): string[] {
    const subjectIds = Array.isArray(jobPosting.subjectIds) && jobPosting.subjectIds.length > 0
      ? jobPosting.subjectIds
      : (jobPosting.subjectId ? [jobPosting.subjectId] : []);
    const names = subjectIds
      .map((subjectIdentifier) => $dbStore.subjects.find((subjectItem) => subjectItem.id === subjectIdentifier)?.name)
      .filter((name): name is string => Boolean(name));
    return names.length > 0 ? names : ['—'];
  }

  function getUserName(userId: string | null | undefined): string {
    if (!userId) return '';
    return $dbStore.users.find((userItem) => userItem.id === userId)?.fullName || '';
  }

  function getJobFee(jobPosting: JobPosting): number {
    const packagePlan = $dbStore.packages.find((packageItem) => packageItem.id === jobPosting.packageId);
    return packagePlan ? packagePlan.tentorFee : (jobPosting.tentorFee || 0);
  }

  $: filteredJobs = allJobs.filter((jobPosting) => {
    const query = searchQuery.trim().toLowerCase();
    const classNames = getClassesList(jobPosting).join(' ').toLowerCase();
    const subjectNames = getSubjectsList(jobPosting).join(' ').toLowerCase();

    const matchesSearch = !query ||
      jobPosting.title.toLowerCase().includes(query) ||
      classNames.includes(query) ||
      subjectNames.includes(query);

    const matchesStatus = !statusFilter || jobPosting.status === statusFilter;
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
    <div><div class="s-val">{totalJobsCount}</div><div class="s-lbl">Total Lowongan</div></div>
  </div>
  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="event_available" size="lg" /></div>
    <div><div class="s-val">{availableJobsCount}</div><div class="s-lbl">Tersedia</div></div>
  </div>
  <div class="stat">
    <div class="s-icon tone-amber"><Icon name="handshake" size="lg" /></div>
    <div><div class="s-val">{negotiatingJobsCount}</div><div class="s-lbl">Negosiasi</div></div>
  </div>
  <div class="stat">
    <div class="s-icon tone-violet"><Icon name="lock" size="lg" /></div>
    <div><div class="s-val">{assignedJobsCount}</div><div class="s-lbl">Ditugaskan</div></div>
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
      ...Object.entries(JOB_STATUS_LABEL).map(([val, label]) => ({ value: val, label }))
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
            <th class="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if isLoading}
            {#each Array(4) as _}
              <tr>
                <td><Skeleton width="w-36" height="h-4" /></td>
                <td><Skeleton width="w-20" height="h-6" className="rounded-full" /></td>
                <td><Skeleton width="w-24" height="h-6" className="rounded-full" /></td>
                <td><Skeleton width="w-32" height="h-4" /></td>
                <td><Skeleton width="w-28" height="h-6" className="rounded-full" /></td>
                <td><Skeleton width="w-20" height="h-8" className="ml-auto rounded-md" /></td>
              </tr>
            {/each}
          {:else if paginatedJobs.length === 0}
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
            {#each paginatedJobs as jobItem (jobItem.id)}
              <tr>
                <td>
                  <strong>{jobItem.title}</strong>
                  <div class="sub">
                    <span class="badge {jobItem.mode === 'ONLINE' ? 'b-neutral' : 'b-available'}">
                      {jobItem.mode === 'ONLINE' ? 'Online' : 'Offline'}
                    </span>
                    <span class="badge {jobItem.studentCount > 1 ? 'b-admin' : 'b-interviewed'}">
                      {jobItem.studentCount > 1 ? 'Kelompok' : 'Privat'}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-1 items-start">
                    {#each getClassesList(jobItem) as className}
                      <span class="badge b-neutral text-xs">
                        <Icon name="stairs" size="xs" />
                        {className}
                      </span>
                    {/each}
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-1 items-start">
                    {#each getSubjectsList(jobItem) as subjectName}
                      <span class="badge b-sky text-xs">
                        <Icon name="menu_book" size="xs" />
                        {subjectName}
                      </span>
                    {/each}
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-1.5 items-start">
                    <div class="flex items-center gap-1 flex-wrap">
                      {#each getScheduleDaysList(jobItem.scheduleDays) as day}
                        <span class="badge b-neutral text-xs font-semibold">
                          <Icon name="calendar_today" size="xs" />
                          {day}
                        </span>
                      {/each}
                    </div>
                    <div class="sub">{jobItem.scheduleTime || '—'}{#if jobItem.scheduleEndTime} – {jobItem.scheduleEndTime}{/if} WIB</div>
                    <div class="sub font-medium">{formatCurrencyIDR(getJobFee(jobItem))}/sesi</div>
                  </div>
                </td>
                <td>
                  <span class="badge {getStatusBadgeClass(jobItem.status)}">
                    {#if jobItem.status === 'ASSIGNED'}
                      <Icon name="check_circle" size="xs" />
                    {:else if jobItem.status === 'AVAILABLE'}
                      <Icon name="event_available" size="xs" />
                    {:else if jobItem.status === 'NEGOTIATING'}
                      <Icon name="handshake" size="xs" />
                    {:else if jobItem.status === 'CANCELLED'}
                      <Icon name="cancel" size="xs" />
                    {/if}
                    {getStatusLabel(jobItem.status, JOB_STATUS_LABEL)}
                  </span>
                  {#if jobItem.assignedTentorId}
                    <div class="text-xs text-muted-fg mt-1 flex items-center gap-1 font-medium">
                      <Icon name="badge" size="xs" />
                      <span>{getUserName(jobItem.assignedTentorId)}</span>
                    </div>
                  {/if}
                </td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Kelola"
                      on:click={() => { assigningJob = jobItem; assignModalOpen = true; }}
                    >
                      <Icon name="tune" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Ubah"
                      on:click={() => { editingJob = jobItem; jobModalOpen = true; }}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      on:click={() => { deletingJobId = jobItem.id; deleteDialogOpen = true; }}
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
        {#each Array.from({ length: totalPages }, (_, index) => index + 1) as pageNumber}
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

<JobModal
  open={jobModalOpen}
  editingJob={editingJob}
  onClose={() => { jobModalOpen = false; editingJob = null; }}
/>

<JobManageModal
  open={assignModalOpen}
  job={assigningJob}
  onClose={() => { assignModalOpen = false; assigningJob = null; }}
  onEdit={(jobToEdit) => {
    assignModalOpen = false;
    assigningJob = null;
    editingJob = jobToEdit;
    jobModalOpen = true;
  }}
/>

<ConfirmationDialog
  open={deleteDialogOpen}
  title="Hapus Lowongan"
  message="Apakah Anda yakin ingin menghapus data lowongan ini? Tindakan ini tidak dapat dibatalkan."
  confirmText="Hapus"
  cancelText="Batal"
  confirmVariant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => { deleteDialogOpen = false; deletingJobId = null; }}
/>
