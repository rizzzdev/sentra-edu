<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import ClassModal from '$lib/features/master-data/components/class-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import type { ClassLevel } from '$lib/shared/types/common.types';

  let searchQuery: string = '';
  let levelFilter: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;

  let classModalOpen: boolean = false;
  let editingClass: ClassLevel | null = null;
  let deleteDialogOpen: boolean = false;
  let deletingClassId: string | null = null;

  $: allLevels = $dbStore.educationLevels.filter((l) => l.deletedAt === null);

  $: levelFilterOptions = [
    { value: '', label: 'Semua Jenjang' },
    ...allLevels.map((l) => ({ value: l.id, label: l.levelName }))
  ];

  $: allClasses = $dbStore.classes.filter((c) => c.deletedAt === null);

  $: filteredClasses = allClasses.filter((c) => {
    if (levelFilter && c.educationLevelId !== levelFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.className.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        getLevelName(c.educationLevelId).toLowerCase().includes(q)
      );
    }
    return true;
  });

  $: paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  $: totalPages = Math.max(1, Math.ceil(filteredClasses.length / itemsPerPage));

  function getLevelName(levelId: string): string {
    return $dbStore.educationLevels.find((l) => l.id === levelId)?.levelName || '—';
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  function getStudentCount(classId: string): number {
    return $dbStore.enrollments.filter((e) => e.deletedAt === null && e.classId === classId).length;
  }

  function handleOpenCreate() {
    editingClass = null;
    classModalOpen = true;
  }

  function handleOpenEdit(cls: ClassLevel) {
    editingClass = cls;
    classModalOpen = true;
  }

  function handleConfirmDelete() {
    if (!deletingClassId) return;
    const response = dbStore.deleteClassLevel(deletingClassId);
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
  <button type="button" class="btn btn-primary" on:click={handleOpenCreate}>
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
            <th class="num">Tarif/90min</th>
            <th class="num">Siswa Aktif</th>
            <th>Deskripsi</th>
            <th style="text-align:right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedClasses.length === 0}
            <tr>
              <td colspan="6" class="empty">
                {searchQuery || levelFilter ? 'Tidak ada kelas yang cocok.' : 'Belum ada data kelas.'}
              </td>
            </tr>
          {:else}
            {#each paginatedClasses as cls (cls.id)}
              <tr>
                <td><strong>{cls.className}</strong></td>
                <td>
                  <span class="badge b-neutral">{getLevelName(cls.educationLevelId)}</span>
                </td>
                <td class="num">{formatCurrency(cls.baseRatePer90Min)}</td>
                <td class="num">{getStudentCount(cls.id)} siswa</td>
                <td>{cls.description || '—'}</td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Ubah"
                      on:click={() => handleOpenEdit(cls)}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      on:click={() => {
                        deletingClassId = cls.id;
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
