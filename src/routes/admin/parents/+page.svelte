<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import ParentMasterModal from '$lib/features/student-enrollment/components/parent-master-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { User } from '$lib/shared/types/common.types';
import { userStore } from '$lib/api';
import { api } from '$lib/api/client';

  let searchQuery: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;

  // Parent Master Modal State
  let parentModalOpen: boolean = false;
  let editingParent: User | null = null;
  let deleteParentDialogOpen: boolean = false;
  let deleteParentId: string | null = null;

  $: allStudents = $userStore.filter((userItem) => userItem.deletedAt === null && userItem.role === 'STUDENT');
  $: allParents = $userStore.filter((userItem) => userItem.deletedAt === null && userItem.role === 'PARENT');

  $: filteredParents = allParents.filter((parentUser) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    return (
      parentUser.fullName.toLowerCase().includes(query) ||
      parentUser.email.toLowerCase().includes(query) ||
      (parentUser.phone || '').toLowerCase().includes(query) ||
      (parentUser.occupation || '').toLowerCase().includes(query)
    );
  });

  $: paginatedParents = filteredParents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  $: totalPagesParents = Math.max(1, Math.ceil(filteredParents.length / itemsPerPage));

  function getChildrenOfParent(parentId: string): User[] {
    return allStudents.filter((studentUser) => studentUser.parentId === parentId);
  }

  async function handleConfirmDeleteParent() {
    if (!deleteParentId) return;
    const response = await api.users.delete(deleteParentId);
    deleteParentDialogOpen = false;
    deleteParentId = null;
    if (!response.error) toastStore.success(response.message);
    else toastStore.error(response.message);
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="family_restroom" size="lg" /> Data Master Orang Tua</h3>
    <div class="desc">Kelola profil master orang tua (orang tua) beserta penautan anak les.</div>
  </div>
  <div>
    <button
      type="button"
      class="btn btn-primary"
      on:click={() => { editingParent = null; parentModalOpen = true; }}
    >
      <Icon name="person_add" size="sm" /> Tambah Orang Tua
    </button>
  </div>
</div>

<!-- STAT GRID -->
<div class="stat-grid">
  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="family_restroom" size="lg" /></div>
    <div>
      <div class="s-val">{allParents.length}</div>
      <div class="s-lbl">Total Master Orang Tua</div>
    </div>
  </div>

  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="groups" size="lg" /></div>
    <div>
      <div class="s-val">{allStudents.filter((studentUser) => Boolean(studentUser.parentId)).length}</div>
      <div class="s-lbl">Anak Terhubung Orang Tua</div>
    </div>
  </div>
</div>

<!-- FILTER BAR -->
<div class="filter-bar mt-4">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input
      type="text"
      placeholder="Cari nama orang tua / email / pekerjaan..."
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
            <th>Orang Tua</th>
            <th>Kontak</th>
            <th>Pekerjaan</th>
            <th>Anak Terhubung</th>
            <th class="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedParents.length === 0}
            <tr>
              <td colspan="5" class="empty">
                {searchQuery ? 'Tidak ada data orang tua yang cocok dengan pencarian.' : 'Belum ada Data Master Orang Tua. Klik "Tambah Orang Tua".'}
              </td>
            </tr>
          {:else}
            {#each paginatedParents as parent (parent.id)}
              {@const children = getChildrenOfParent(parent.id)}
              <tr>
                <td>
                  <strong>{parent.fullName}</strong>
                  <div class="sub">ID: {parent.id}</div>
                </td>
                <td>
                  {parent.email}
                  <div class="sub">{parent.phone || '—'}</div>
                </td>
                <td>{parent.occupation || '—'}</td>
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
                      on:click={() => { editingParent = parent; parentModalOpen = true; }}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      on:click={() => { deleteParentId = parent.id; deleteParentDialogOpen = true; }}
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

    {#if filteredParents.length > itemsPerPage}
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredParents.length)} dari {filteredParents.length} orang tua
        </div>
        <div class="page-btns">
          <button type="button" class="page-btn" disabled={currentPage <= 1} on:click={() => currentPage--}>&laquo;</button>
          {#each Array.from({ length: totalPagesParents }, (_, index) => index + 1) as pageNumber}
            <button type="button" class="page-btn {currentPage === pageNumber ? 'active' : ''}" on:click={() => { currentPage = pageNumber; }}>{pageNumber}</button>
          {/each}
          <button type="button" class="page-btn" disabled={currentPage >= totalPagesParents} on:click={() => currentPage++}>&raquo;</button>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- MODAL & DIALOG -->
<ParentMasterModal
  open={parentModalOpen}
  {editingParent}
  onClose={() => { parentModalOpen = false; }}
/>

<ConfirmationDialog
  open={deleteParentDialogOpen}
  title="Hapus Master Data Orang Tua"
  message="Apakah Anda yakin ingin menghapus data master orang tua ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDeleteParent}
  onCancel={() => { deleteParentDialogOpen = false; deleteParentId = null; }}
/>
