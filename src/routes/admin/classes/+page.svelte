<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import ClassModal from '$lib/features/master-data/components/class-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import type { ClassLevel } from '$lib/shared/types/common.types';
import { educationLevelStore, classStore, enrollmentStore } from '$lib/api';
  import { api } from '$lib/api/client';

  let searchQuery = $state('');
  let levelFilter = $state('');
  let currentPage = $state(1);
  const itemsPerPage = 8;

  let classModalOpen = $state(false);
  let editingClass = $state<ClassLevel | null>(null);
  let deleteDialogOpen = $state(false);
  let deletingClassId = $state<string | null>(null);

  const allLevels = $derived($educationLevelStore.filter((levelItem) => levelItem.deletedAt === null));

  const levelFilterOptions = $derived([
    { value: '', label: 'Semua Jenjang' },
    ...allLevels.map((levelItem) => ({ value: levelItem.id, label: levelItem.levelName }))
  ]);

  const allClasses = $derived($classStore.filter((classItem) => classItem.deletedAt === null));

  const filteredClasses = $derived(allClasses.filter((classItem) => {
    if (levelFilter && classItem.educationLevelId !== levelFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        classItem.className.toLowerCase().includes(query) ||
        (classItem.description || '').toLowerCase().includes(query) ||
        getLevelName(classItem.educationLevelId).toLowerCase().includes(query)
      );
    }
    return true;
  }));

  const paginatedClasses = $derived(filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ));
  const totalPages = $derived(Math.max(1, Math.ceil(filteredClasses.length / itemsPerPage)));

  function getLevelName(levelId: string): string {
    return $educationLevelStore.find((levelItem) => levelItem.id === levelId)?.levelName || '—';
  }

  function getStudentCount(classId: string): number {
    return $enrollmentStore.filter((enrollmentItem) => enrollmentItem.deletedAt === null && enrollmentItem.classId === classId).length;
  }

  function handleOpenCreate() {
    editingClass = null;
    classModalOpen = true;
  }

  function handleOpenEdit(classItem: ClassLevel) {
    editingClass = classItem;
    classModalOpen = true;
  }

  async function handleConfirmDelete() {
    if (!deletingClassId) return;
    const response = await api.classes.delete(deletingClassId);
    deleteDialogOpen = false;
    deletingClassId = null;
    if (!response.error) {
      toastStore.success(response.message);
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="stairs" size="lg" /> Kelas</h3>
    <div class="desc">Daftar kelas per jenjang beserta tarif dasar per 90 menit.</div>
  </div>
  <button type="button" class="btn btn-primary" onclick={handleOpenCreate}>
    <Icon name="add" size="sm" /> Tambah Kelas
  </button>
</div>

<div class="filter-bar">
  <SelectSearch
    bind:value={levelFilter}
    placeholder="Semua Jenjang"
    options={levelFilterOptions}
    className="max-w-48"
  />
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input type="text" placeholder="Cari kelas..." bind:value={searchQuery} />
  </div>
</div>

<div class="card">
  <div class="card-body flush">
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Nama Kelas</th>
            <th>Jenjang</th>
            <th class="num">Siswa Aktif</th>
            <th>Deskripsi</th>
            <th class="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedClasses.length === 0}
            <tr>
              <td colspan="5" class="empty">
                {searchQuery || levelFilter ? 'Tidak ada kelas yang cocok.' : 'Belum ada data kelas.'}
              </td>
            </tr>
          {:else}
            {#each paginatedClasses as classItem (classItem.id)}
              <tr>
                <td><strong>{classItem.className}</strong></td>
                <td>
                  <span class="badge b-neutral">{getLevelName(classItem.educationLevelId)}</span>
                </td>
                <td class="num">{getStudentCount(classItem.id)} siswa</td>
                <td>{classItem.description || '—'}</td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Ubah"
                      onclick={() => handleOpenEdit(classItem)}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      onclick={() => {
                        deletingClassId = classItem.id;
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

    {#if filteredClasses.length > itemsPerPage}
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredClasses.length)} dari {filteredClasses.length} data
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

<ClassModal open={classModalOpen} {editingClass} onClose={() => { classModalOpen = false; }} />
<ConfirmationDialog
  open={deleteDialogOpen}
  title="Hapus Kelas"
  message="Apakah Anda yakin ingin menghapus kelas ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => { deleteDialogOpen = false; }}
/>
