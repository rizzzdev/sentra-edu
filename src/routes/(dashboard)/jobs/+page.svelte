<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import JobModal from '$lib/features/job-management/components/job-modal.svelte';
  import JobManageModal from '$lib/features/job-management/components/job-manage-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import type { JobPosting } from '$lib/shared/types/common.types';

  let searchQuery: string = '';
  let statusFilter: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;

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

  function getPackageMode(packageId?: string): string {
    if (!packageId) return 'PRIVATE';
    return $dbStore.packages.find((p) => p.id === packageId)?.mode || 'PRIVATE';
  }

  function getUserName(userId: string | null | undefined): string {
    if (!userId) return '';
    return $dbStore.users.find((u) => u.id === userId)?.fullName || '';
  }

  function getJobFee(job: JobPosting): number {
    const pkg = $dbStore.packages.find((p) => p.id === job.packageId);
    return pkg ? pkg.tentorFee : 0;
  }

  $: filteredJobs = allJobs.filter((j) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      j.title.toLowerCase().includes(q) ||
      getClassName(j.classId).toLowerCase().includes(q) ||
      getSubjectName(j.subjectId).toLowerCase().includes(q) ||
      getPackageName(j.packageId).toLowerCase().includes(q) ||
      (j.studentName || '').toLowerCase().includes(q);

    const matchesStatus = !statusFilter || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  $: paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  $: totalPages = Math.max(1, Math.ceil(filteredJobs.length / itemsPerPage));

  function handleOpenCreate() {
    editingJob = null;
    jobModalOpen = true;
  }

  function handleOpenEdit(job: JobPosting) {
    editingJob = job;
    jobModalOpen = true;
  }

  function handleOpenAssign(job: JobPosting) {
    assigningJob = job;
    assignModalOpen = true;
  }

  function handleConfirmDelete() {
    if (!deletingJobId) return;
    const response = dbStore.deleteJob(deletingJobId);
    deleteDialogOpen = false;
    deletingJobId = null;
    if (!response.error) {
      toastStore.success(response.message);
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="work" size="lg" /> Lowongan Les</h3>
    <div class="desc">Daftar lowongan les dengan mode Offline/Online, jenis Private/Kelompok, dan paket les.</div>
  </div>
  <button type="button" class="btn btn-primary" on:click={handleOpenCreate}>
    <Icon name="add" size="sm" /> Buat Lowongan
  </button>
</div>

<div class="stat-grid">
  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="work" size="lg" /></div>
    <div>
      <div class="s-val">{nTotal}</div>
      <div class="s-lbl">Total Lowongan</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="event_available" size="lg" /></div>
    <div>
      <div class="s-val">{nTersedia}</div>
      <div class="s-lbl">Tersedia</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-amber"><Icon name="handshake" size="lg" /></div>
    <div>
      <div class="s-val">{nNegosiasi}</div>
      <div class="s-lbl">Sedang Negosiasi</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-violet"><Icon name="lock" size="lg" /></div>
    <div>
      <div class="s-val">{nDitugaskan}</div>
      <div class="s-lbl">Ditugaskan</div>
    </div>
  </div>
</div>

<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input type="text" placeholder="Cari judul / kelas / mapel / paket / siswa..." bind:value={searchQuery} />
  </div>
  <select class="filter-select" bind:value={statusFilter}>
    <option value="">Semua Status</option>
    <option value="AVAILABLE">Tersedia</option>
    <option value="NEGOTIATING">Sedang Negosiasi</option>
    <option value="ASSIGNED">Ditugaskan</option>
    <option value="CANCELLED">Dibatalkan</option>
  </select>
</div>

<div class="card">
  <div class="card-body flush">
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Lowongan</th>
            <th>Kelas · Mapel</th>
            <th>Paket Les</th>
            <th class="num">Honor/Sesi</th>
            <th>Status</th>
            <th style="text-align:right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedJobs.length === 0}
            <tr>
              <td colspan="6" class="empty">
                {searchQuery || statusFilter
                  ? 'Tidak ada lowongan yang cocok dengan filter.'
                  : 'Belum ada lowongan. Klik "Buat Lowongan".'}
              </td>
            </tr>
          {:else}
            {#each paginatedJobs as j (j.id)}
              <tr>
                <td>
                  <strong>{j.title}</strong>
                  <div class="sub">
                    <span class="badge {j.mode === 'ONLINE' ? 'b-neutral' : 'b-available'}">{j.mode}</span>
                    · {j.schedulePreference}
                  </div>
                  <div class="sub">
                    <Icon name="group" size="xs" /> {j.studentName}
                  </div>
                </td>
                <td>
                  {getClassName(j.classId)} · {getSubjectName(j.subjectId)}
                </td>
                <td>
                  <span class="sub">{getPackageMode(j.packageId)}</span> {getPackageName(j.packageId)}
                </td>
                <td class="num">
                  {formatCurrencyIDR(getJobFee(j))}
                </td>
                <td>
                  <span class="badge {j.status === 'AVAILABLE' ? 'b-available' : j.status === 'NEGOTIATING' ? 'b-negotiating' : j.status === 'ASSIGNED' ? 'b-assigned' : 'b-cancelled'}">
                    {j.status}
                  </span>
                  {#if j.assignedTentorId}
                    <div class="sub">{getUserName(j.assignedTentorId)}</div>
                  {/if}
                </td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Kelola"
                      on:click={() => handleOpenAssign(j)}
                    >
                      <Icon name="tune" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Ubah"
                      on:click={() => handleOpenEdit(j)}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      on:click={() => {
                        deletingJobId = j.id;
                        deleteDialogOpen = true;
                      }}
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

    {#if filteredJobs.length > itemsPerPage}
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredJobs.length)} dari {filteredJobs.length} data
        </div>
        <div class="page-btns">
          <button
            type="button"
            class="page-btn"
            disabled={currentPage <= 1}
            on:click={() => currentPage--}
          >
            &laquo;
          </button>
          {#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
            <button
              type="button"
              class="page-btn {currentPage === p ? 'active' : ''}"
              on:click={() => { currentPage = p; }}
            >
              {p}
            </button>
          {/each}
          <button
            type="button"
            class="page-btn"
            disabled={currentPage >= totalPages}
            on:click={() => currentPage++}
          >
            &raquo;
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<JobModal open={jobModalOpen} {editingJob} onClose={() => { jobModalOpen = false; }} />
<JobManageModal open={assignModalOpen} job={assigningJob} onClose={() => { assignModalOpen = false; }} />
<ConfirmationDialog
  open={deleteDialogOpen}
  title="Hapus Lowongan"
  message="Apakah Anda yakin ingin menghapus lowongan les ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => { deleteDialogOpen = false; }}
/>
