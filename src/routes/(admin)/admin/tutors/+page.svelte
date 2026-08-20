<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import TentorMasterModal from '$lib/features/master-data/components/tutor-master-modal.svelte';
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

  // Tentor Master Modal State
  let tentorModalOpen: boolean = false;
  let editingTentor: User | null = null;
  let deleteTentorId: string | null = null;

  $: allTentors = $dbStore.users.filter((user) => user.deletedAt === null && user.role === 'TENTOR');

  $: filteredTentors = allTentors.filter((tentor) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      tentor.fullName.toLowerCase().includes(q) ||
      tentor.email.toLowerCase().includes(q) ||
      (tentor.phone || '').toLowerCase().includes(q) ||
      (tentor.education || '').toLowerCase().includes(q)
    );
  });

  $: paginatedTentors = filteredTentors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  $: totalPagesTentors = Math.max(1, Math.ceil(filteredTentors.length / itemsPerPage));

  function getSubjectNames(subjectIds?: string[]): string {
    if (!subjectIds || subjectIds.length === 0) return '—';
    const names = subjectIds
      .map((id) => $dbStore.subjects.find((subject) => subject.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(', ') : '—';
  }

  function handleConfirmDeleteTentor() {
    if (!deleteTentorId) return;
    const res = dbStore.deleteTentorMaster(deleteTentorId);
    deleteTentorId = null;
    if (!res.error) toastStore.success(res.message);
    else toastStore.error(res.message);
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="badge" size="lg" /> Data Master Tentor / Mentor</h3>
    <div class="desc">Kelola data profil master tentor/pengajar, kontak, latar belakang pendidikan, dan keahlian mata pelajaran.</div>
  </div>
  <div>
    <button
      type="button"
      class="btn btn-primary"
      on:click={() => { editingTentor = null; tentorModalOpen = true; }}
    >
      <Icon name="person_add" size="sm" /> Tambah Tentor Master
    </button>
  </div>
</div>

<!-- STAT GRID -->
<div class="stat-grid">
  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="badge" size="lg" /></div>
    <div>
      <div class="s-val">{allTentors.length}</div>
      <div class="s-lbl">Total Master Tentor</div>
    </div>
  </div>

  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="menu_book" size="lg" /></div>
    <div>
      <div class="s-val">{allTentors.filter(tentor => (tentor.subjectIds || []).length > 0).length}</div>
      <div class="s-lbl">Tentor Berkeahlian Pelajaran</div>
    </div>
  </div>
</div>

<!-- FILTER BAR -->
<div class="filter-bar mt-4">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input
      type="text"
      placeholder="Cari nama tentor / email / pendidikan..."
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
            <th>Tentor / Mentor</th>
            <th>Kontak</th>
            <th>Pendidikan / Gelar</th>
            <th>Keahlian Pelajaran</th>
            <th>Tanggal Bergabung</th>
            <th style="text-align:right">Aksi</th>
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
                <td><Skeleton width="w-3/4" height="h-4" /></td>
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
          {:else if paginatedTentors.length === 0}
            <!-- 3. EMPTY STATE -->
            <tr>
              <td colspan="6" class="empty py-12 text-center text-muted-fg">
                <Icon name="inventory_2" size="lg" className="opacity-50 mb-2 block mx-auto text-4xl" />
                <div class="font-medium">{searchQuery ? 'Tidak ada data tentor yang cocok dengan pencarian.' : 'Belum ada Data Master Tentor.'}</div>
                {#if !searchQuery}
                  <button type="button" class="btn btn-outline btn-sm mt-4 inline-flex mx-auto" on:click={() => { editingTentor = null; tentorModalOpen = true; }}>
                    <Icon name="add" size="sm" /> Tambah Tentor
                  </button>
                {/if}
              </td>
            </tr>
          {:else}
            <!-- 4. POPULATED STATE -->
            {#each paginatedTentors as tentor (tentor.id)}
              <tr>
                <td>
                  <strong>{tentor.fullName}</strong>
                  <div class="sub">ID: {tentor.id}</div>
                </td>
                <td>
                  {tentor.email}
                  <div class="sub">{tentor.phone || '—'}</div>
                </td>
                <td>{tentor.education || '—'}</td>
                <td>
                  <span class="text-xs font-medium">{getSubjectNames(tentor.subjectIds)}</span>
                </td>
                <td>{new Date(tentor.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Ubah"
                      on:click={() => { editingTentor = tentor; tentorModalOpen = true; }}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      on:click={() => { deleteTentorId = tentor.id; }}
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

    {#if filteredTentors.length > itemsPerPage}
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredTentors.length)} dari {filteredTentors.length} tentor
        </div>
        <div class="page-btns">
          <button type="button" class="page-btn" disabled={currentPage <= 1} on:click={() => currentPage--}>&laquo;</button>
          {#each Array.from({ length: totalPagesTentors }, (_, i) => i + 1) as p}
            <button type="button" class="page-btn {currentPage === p ? 'active' : ''}" on:click={() => { currentPage = p; }}>{p}</button>
          {/each}
          <button type="button" class="page-btn" disabled={currentPage >= totalPagesTentors} on:click={() => currentPage++}>&raquo;</button>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- MODAL & DIALOG -->
<TentorMasterModal
  open={tentorModalOpen}
  {editingTentor}
  onClose={() => { tentorModalOpen = false; }}
/>

<ConfirmationDialog
  open={!!deleteTentorId}
  title="Hapus Master Data Tentor"
  message="Apakah Anda yakin ingin menghapus data master tentor ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDeleteTentor}
  onCancel={() => { deleteTentorId = null; }}
/>
