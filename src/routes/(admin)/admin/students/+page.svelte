<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import StudentMasterModal from '$lib/features/student-enrollment/components/student-master-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { User } from '$lib/shared/types/common.types';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
  import AlertBanner from '$lib/components/molecules/alert-banner.svelte';

  let searchQuery: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;
  let isLoading: boolean = true;
  let errorMessage: string | null = null;

  import { onMount } from 'svelte';
  onMount(() => {
    // Simulasi loading state fetching data
    setTimeout(() => {
      isLoading = false;
    }, 600);
  });

  // Student Master Modal State
  let studentModalOpen: boolean = false;
  let editingStudent: User | null = null;
  let deleteStudentDialogOpen: boolean = false;
  let deleteStudentId: string | null = null;

  $: allStudents = $dbStore.users.filter((userItem) => userItem.deletedAt === null && userItem.role === 'STUDENT');

  $: filteredStudents = allStudents.filter((studentUser) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    const waliName = studentUser.waliUserId ? ($dbStore.users.find((waliUser) => waliUser.id === studentUser.waliUserId)?.fullName || '') : '';
    return (
      studentUser.fullName.toLowerCase().includes(query) ||
      studentUser.email.toLowerCase().includes(query) ||
      (studentUser.phone || '').toLowerCase().includes(query) ||
      (studentUser.school || '').toLowerCase().includes(query) ||
      waliName.toLowerCase().includes(query)
    );
  });

  $: paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  $: totalPagesStudents = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));

  function getWaliName(waliId?: string): string {
    if (!waliId) return '—';
    return $dbStore.users.find((waliUser) => waliUser.id === waliId)?.fullName || '—';
  }

  function getWaliPhone(waliId?: string): string {
    if (!waliId) return '';
    return $dbStore.users.find((waliUser) => waliUser.id === waliId)?.phone || '';
  }

  function handleConfirmDeleteStudent() {
    if (!deleteStudentId) return;
    const response = dbStore.deleteStudentMaster(deleteStudentId);
    deleteStudentDialogOpen = false;
    deleteStudentId = null;
    if (!response.error) toastStore.success(response.message);
    else toastStore.error(response.message);
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="school" size="lg" /> Data Master Murid</h3>
    <div class="desc">Kelola data master profil murid, kontak, asal sekolah, dan penautan wali murid.</div>
  </div>
  <div>
    <button
      type="button"
      class="btn btn-primary"
      on:click={() => { editingStudent = null; studentModalOpen = true; }}
    >
      <Icon name="person_add" size="sm" /> Tambah Murid Master
    </button>
  </div>
</div>

<!-- STAT GRID -->
<div class="stat-grid">
  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="school" size="lg" /></div>
    <div>
      <div class="s-val">{allStudents.length}</div>
      <div class="s-lbl">Total Master Murid</div>
    </div>
  </div>

  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="family_restroom" size="lg" /></div>
    <div>
      <div class="s-val">{allStudents.filter((studentUser) => Boolean(studentUser.waliUserId)).length}</div>
      <div class="s-lbl">Murid Ditautkan Wali</div>
    </div>
  </div>
</div>

<!-- FILTER BAR -->
<div class="filter-bar mt-4">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input
      type="text"
      placeholder="Cari nama murid / email / sekolah / wali..."
      bind:value={searchQuery}
    />
  </div>
</div>

<!-- DATA TABLE CARD -->
<div class="card">
  <div class="card-body flush">
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Murid</th>
            <th>Kontak</th>
            <th>Sekolah / Instansi</th>
            <th>Wali Murid</th>
            <th>Tanggal Daftar</th>
            <th class="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if isLoading}
            <!-- 1. LOADING STATE -->
            {#each Array(5) as _}
              <tr>
                <td><Skeleton width="w-3/4" height="h-5" /><Skeleton width="w-1/2" height="h-3" className="mt-2" /></td>
                <td><Skeleton width="w-full" height="h-4" /><Skeleton width="w-2/3" height="h-3" className="mt-2" /></td>
                <td><Skeleton width="w-full" height="h-4" /></td>
                <td><Skeleton width="w-3/4" height="h-4" /><Skeleton width="w-1/2" height="h-3" className="mt-2" /></td>
                <td><Skeleton width="w-24" height="h-4" /></td>
                <td><Skeleton width="w-16" height="h-8" className="ml-auto" /></td>
              </tr>
            {/each}
          {:else if errorMessage}
            <!-- 2. ERROR STATE -->
            <tr>
              <td colspan="6" class="!p-4">
                <AlertBanner variant="destructive" message={errorMessage} onRetry={() => { errorMessage = null; isLoading = true; setTimeout(() => isLoading = false, 600); }} />
              </td>
            </tr>
          {:else if paginatedStudents.length === 0}
            <!-- 3. EMPTY STATE -->
            <tr>
              <td colspan="6" class="empty py-12 text-center text-muted-fg">
                <Icon name="inventory_2" size="lg" className="opacity-50 mb-2 block mx-auto text-4xl" />
                <div class="font-medium">{searchQuery ? 'Tidak ada data murid yang cocok dengan pencarian.' : 'Belum ada Data Master Murid.'}</div>
                {#if !searchQuery}
                  <button type="button" class="btn btn-outline btn-sm mt-4 inline-flex mx-auto" on:click={() => { editingStudent = null; studentModalOpen = true; }}>
                    <Icon name="add" size="sm" /> Tambah Murid
                  </button>
                {/if}
              </td>
            </tr>
          {:else}
            <!-- 4. POPULATED STATE -->
            {#each paginatedStudents as student (student.id)}
              <tr>
                <td>
                  <strong>{student.fullName}</strong>
                  <div class="sub">ID: {student.id}</div>
                </td>
                <td>
                  {student.email}
                  <div class="sub">{student.phone || '—'}</div>
                </td>
                <td>{student.school || '—'}</td>
                <td>
                  {getWaliName(student.waliUserId)}
                  {#if getWaliPhone(student.waliUserId)}
                    <div class="sub">{getWaliPhone(student.waliUserId)}</div>
                  {/if}
                </td>
                <td>{new Date(student.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Ubah"
                      on:click={() => { editingStudent = student; studentModalOpen = true; }}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      on:click={() => { deleteStudentId = student.id; deleteStudentDialogOpen = true; }}
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

    {#if filteredStudents.length > itemsPerPage}
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredStudents.length)} dari {filteredStudents.length} murid
        </div>
        <div class="page-btns">
          <button type="button" class="page-btn" disabled={currentPage <= 1} on:click={() => currentPage--}>&laquo;</button>
          {#each Array.from({ length: totalPagesStudents }, (_, index) => index + 1) as pageNumber}
            <button type="button" class="page-btn {currentPage === pageNumber ? 'active' : ''}" on:click={() => { currentPage = pageNumber; }}>{pageNumber}</button>
          {/each}
          <button type="button" class="page-btn" disabled={currentPage >= totalPagesStudents} on:click={() => currentPage++}>&raquo;</button>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- MODAL & DIALOG -->
<StudentMasterModal
  open={studentModalOpen}
  {editingStudent}
  onClose={() => { studentModalOpen = false; }}
/>

<ConfirmationDialog
  open={deleteStudentDialogOpen}
  title="Hapus Master Data Murid"
  message="Apakah Anda yakin ingin menghapus data master murid ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDeleteStudent}
  onCancel={() => { deleteStudentDialogOpen = false; deleteStudentId = null; }}
/>
