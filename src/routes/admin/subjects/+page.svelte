<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import SubjectModal from '$lib/features/master-data/components/subject-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { Subject } from '$lib/shared/types/common.types';
import { subjectStore } from '$lib/api';
  import { api } from '$lib/api/client';

  let searchQuery = $state('');
  let currentPage = $state(1);
  const itemsPerPage = 8;

  let subjectModalOpen = $state(false);
  let editingSubject = $state<Subject | null>(null);
  let deleteDialogOpen = $state(false);
  let deletingSubjectId = $state<string | null>(null);

  const allSubjects = $derived($subjectStore.filter((subjectItem) => subjectItem.deletedAt === null));

  const filteredSubjects = $derived(allSubjects.filter(
    (subjectItem) =>
      !searchQuery ||
      subjectItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subjectItem.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  ));

  const paginatedSubjects = $derived(filteredSubjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ));
  const totalPages = $derived(Math.max(1, Math.ceil(filteredSubjects.length / itemsPerPage)));

  function handleOpenCreate() {
    editingSubject = null;
    subjectModalOpen = true;
  }

  function handleOpenEdit(subject: Subject) {
    editingSubject = subject;
    subjectModalOpen = true;
  }

  async function handleConfirmDelete() {
    if (!deletingSubjectId) return;
    const response = await api.subjects.delete(deletingSubjectId);
    deleteDialogOpen = false;
    deletingSubjectId = null;
    if (!response.error) {
      toastStore.success(response.message);
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="menu_book" size="lg" /> Mata Pelajaran</h3>
    <div class="desc">Daftar mapel yang tersedia untuk lowongan les.</div>
  </div>
  <button type="button" class="btn btn-primary" onclick={handleOpenCreate}>
    <Icon name="add" size="sm" /> Tambah Mapel
  </button>
</div>

<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input type="text" placeholder="Cari nama mapel..." bind:value={searchQuery} />
  </div>
</div>

<div class="card">
  <div class="card-body flush">
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Deskripsi</th>
            <th class="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedSubjects.length === 0}
            <tr>
              <td colspan="3" class="empty">
                {searchQuery ? 'Tidak ada mapel yang cocok.' : 'Belum ada mapel.'}
              </td>
            </tr>
          {:else}
            {#each paginatedSubjects as subjectItem (subjectItem.id)}
              <tr>
                <td><strong>{subjectItem.name}</strong></td>
                <td>{subjectItem.description || '—'}</td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Ubah"
                      onclick={() => handleOpenEdit(subjectItem)}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      onclick={() => {
                        deletingSubjectId = subjectItem.id;
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

    {#if filteredSubjects.length > itemsPerPage}
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredSubjects.length)} dari {filteredSubjects.length} data
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

<SubjectModal open={subjectModalOpen} {editingSubject} onClose={() => { subjectModalOpen = false; }} />
<ConfirmationDialog
  open={deleteDialogOpen}
  title="Hapus Mata Pelajaran"
  message="Apakah Anda yakin ingin menghapus mata pelajaran ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => { deleteDialogOpen = false; }}
/>
