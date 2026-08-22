<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import LevelModal from '$lib/features/master-data/components/level-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { EducationLevel } from '$lib/shared/types/common.types';
  import { educationLevelStore, classStore } from '$lib/api';
  import { api } from '$lib/api/client';

  onMount(() => {
    educationLevelStore.fetch();
    classStore.fetch();
  });

  let searchQuery = $state('');
  let currentPage = $state(1);
  const itemsPerPage = 8;

  let levelModalOpen = $state(false);
  let editingLevel = $state<EducationLevel | null>(null);
  let deleteDialogOpen = $state(false);
  let deletingLevelId = $state<string | null>(null);

  const allLevels = $derived($educationLevelStore.filter((levelItem) => levelItem.deletedAt === null));

  const filteredLevels = $derived(allLevels.filter(
    (levelItem) =>
      !searchQuery ||
      levelItem.levelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (levelItem.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  ));

  const paginatedLevels = $derived(filteredLevels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ));
  const totalPages = $derived(Math.max(1, Math.ceil(filteredLevels.length / itemsPerPage)));

  function getClassCount(levelId: string): number {
    return $classStore.filter((classItem) => classItem.deletedAt === null && classItem.educationLevelId === levelId).length;
  }

  function handleOpenCreate() {
    editingLevel = null;
    levelModalOpen = true;
  }

  function handleOpenEdit(level: EducationLevel) {
    editingLevel = level;
    levelModalOpen = true;
  }

  async function handleConfirmDelete() {
    if (!deletingLevelId) return;
    const response = await api.educationLevels.delete(deletingLevelId);
    deleteDialogOpen = false;
    deletingLevelId = null;
    if (!response.error) {
      toastStore.success(response.message || 'Jenjang berhasil dihapus.');
      await educationLevelStore.fetch();
    } else {
      toastStore.error(response.message || 'Gagal menghapus jenjang.');
    }
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="school" size="lg" /> Jenjang</h3>
    <div class="desc">Master jenjang pendidikan. Tarif honor diatur per kelas pada menu Paket Les.</div>
  </div>
  <button type="button" class="btn btn-primary" onclick={handleOpenCreate}>
    <Icon name="add" size="sm" /> Tambah Jenjang
  </button>
</div>

<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input type="text" placeholder="Cari jenjang..." bind:value={searchQuery} />
  </div>
</div>

<div class="card">
  <div class="card-body flush">
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Jenjang</th>
            <th class="num">Jumlah Kelas</th>
            <th>Deskripsi</th>
            <th class="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedLevels.length === 0}
            <tr>
              <td colspan="4" class="empty">
                {searchQuery ? 'Tidak ada jenjang yang cocok.' : 'Belum ada jenjang.'}
              </td>
            </tr>
          {:else}
            {#each paginatedLevels as levelItem (levelItem.id)}
              <tr>
                <td><strong>{levelItem.levelName}</strong></td>
                <td class="num">{getClassCount(levelItem.id)} kelas</td>
                <td>{levelItem.description || '—'}</td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Ubah"
                      onclick={() => handleOpenEdit(levelItem)}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      onclick={() => {
                        deletingLevelId = levelItem.id;
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

    {#if filteredLevels.length > itemsPerPage}
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredLevels.length)} dari {filteredLevels.length} data
        </div>
        <div class="page-btns">
          <button
            type="button"
            class="page-btn"
            disabled={currentPage <= 1}
            onclick={() => currentPage--}
          >
            &laquo;
          </button>
          {#each Array.from({ length: totalPages }, (_, index) => index + 1) as pageNumber}
            <button
              type="button"
              class="page-btn {currentPage === pageNumber ? 'active' : ''}"
              onclick={() => { currentPage = pageNumber; }}
            >
              {pageNumber}
            </button>
          {/each}
          <button
            type="button"
            class="page-btn"
            disabled={currentPage >= totalPages}
            onclick={() => currentPage++}
          >
            &raquo;
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<LevelModal open={levelModalOpen} {editingLevel} onClose={() => { levelModalOpen = false; }} />
<ConfirmationDialog
  open={deleteDialogOpen}
  title="Hapus Jenjang"
  message="Apakah Anda yakin ingin menghapus jenjang ini? Kelas yang terkait harus dihapus terlebih dahulu."
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => { deleteDialogOpen = false; }}
/>
