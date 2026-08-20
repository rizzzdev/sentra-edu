<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import WaliMasterModal from '$lib/features/student-enrollment/components/parent-master-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { User } from '$lib/shared/types/common.types';

  let searchQuery: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;

  // Wali Master Modal State
  let waliModalOpen: boolean = false;
  let editingWali: User | null = null;
  let deleteWaliDialogOpen: boolean = false;
  let deleteWaliId: string | null = null;

  $: allStudents = $dbStore.users.filter((userItem) => userItem.deletedAt === null && userItem.role === 'STUDENT');
  $: allWali = $dbStore.users.filter((userItem) => userItem.deletedAt === null && userItem.role === 'WALI_MURID');

  $: filteredWali = allWali.filter((waliUser) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    return (
      waliUser.fullName.toLowerCase().includes(query) ||
      waliUser.email.toLowerCase().includes(query) ||
      (waliUser.phone || '').toLowerCase().includes(query) ||
      (waliUser.occupation || '').toLowerCase().includes(query)
    );
  });

  $: paginatedWali = filteredWali.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  $: totalPagesWali = Math.max(1, Math.ceil(filteredWali.length / itemsPerPage));

  function getChildrenOfWali(waliId: string): User[] {
    return allStudents.filter((studentUser) => studentUser.waliUserId === waliId);
  }

  function handleConfirmDeleteWali() {
    if (!deleteWaliId) return;
    const response = dbStore.deleteWaliMaster(deleteWaliId);
    deleteWaliDialogOpen = false;
    deleteWaliId = null;
    if (!response.error) toastStore.success(response.message);
    else toastStore.error(response.message);
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="family_restroom" size="lg" /> Data Master Wali Murid</h3>
    <div class="desc">Kelola profil master wali murid (orang tua) beserta penautan anak les.</div>
  </div>
  <div>
    <button
      type="button"
      class="btn btn-primary"
      on:click={() => { editingWali = null; waliModalOpen = true; }}
    >
      <Icon name="person_add" size="sm" /> Tambah Wali Master
    </button>
  </div>
</div>

<!-- STAT GRID -->
<div class="stat-grid">
  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="family_restroom" size="lg" /></div>
    <div>
      <div class="s-val">{allWali.length}</div>
      <div class="s-lbl">Total Master Wali Murid</div>
    </div>
  </div>

  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="groups" size="lg" /></div>
    <div>
      <div class="s-val">{allStudents.filter((studentUser) => Boolean(studentUser.waliUserId)).length}</div>
      <div class="s-lbl">Anak Terhubung Wali</div>
    </div>
  </div>
</div>

<!-- FILTER BAR -->
<div class="filter-bar mt-4">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input
      type="text"
      placeholder="Cari nama wali murid / email / pekerjaan..."
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
            <th>Wali Murid</th>
            <th>Kontak</th>
            <th>Pekerjaan</th>
            <th>Anak Terhubung</th>
            <th class="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedWali.length === 0}
            <tr>
              <td colspan="5" class="empty">
                {searchQuery ? 'Tidak ada data wali murid yang cocok dengan pencarian.' : 'Belum ada Data Master Wali Murid. Klik "Tambah Wali Master".'}
              </td>
            </tr>
          {:else}
            {#each paginatedWali as wali (wali.id)}
              {@const children = getChildrenOfWali(wali.id)}
              <tr>
                <td>
                  <strong>{wali.fullName}</strong>
                  <div class="sub">ID: {wali.id}</div>
                </td>
                <td>
                  {wali.email}
                  <div class="sub">{wali.phone || '—'}</div>
                </td>
                <td>{wali.occupation || '—'}</td>
                <td>
                  {#if children.length === 0}
                    <span class="sub">— Belum ada —</span>
                  {:else}
                    <div class="flex flex-col gap-0.5">
                      {#each children as child}
                        <span class="text-xs font-semibold text-primary">· {child.fullName}</span>
                      {/each}
                    </div>
                  {/if}
                </td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Ubah"
                      on:click={() => { editingWali = wali; waliModalOpen = true; }}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      on:click={() => { deleteWaliId = wali.id; deleteWaliDialogOpen = true; }}
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

    {#if filteredWali.length > itemsPerPage}
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredWali.length)} dari {filteredWali.length} wali murid
        </div>
        <div class="page-btns">
          <button type="button" class="page-btn" disabled={currentPage <= 1} on:click={() => currentPage--}>&laquo;</button>
          {#each Array.from({ length: totalPagesWali }, (_, index) => index + 1) as pageNumber}
            <button type="button" class="page-btn {currentPage === pageNumber ? 'active' : ''}" on:click={() => { currentPage = pageNumber; }}>{pageNumber}</button>
          {/each}
          <button type="button" class="page-btn" disabled={currentPage >= totalPagesWali} on:click={() => currentPage++}>&raquo;</button>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- MODAL & DIALOG -->
<WaliMasterModal
  open={waliModalOpen}
  {editingWali}
  onClose={() => { waliModalOpen = false; }}
/>

<ConfirmationDialog
  open={deleteWaliDialogOpen}
  title="Hapus Master Data Wali Murid"
  message="Apakah Anda yakin ingin menghapus data master wali murid ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDeleteWali}
  onCancel={() => { deleteWaliDialogOpen = false; deleteWaliId = null; }}
/>
