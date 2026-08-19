<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import WaliMasterModal from '$lib/features/student-enrollment/components/wali-master-modal.svelte';
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
  let deleteWaliId: string | null = null;

  $: allStudents = $dbStore.users.filter((u) => u.deletedAt === null && u.role === 'STUDENT');
  $: allWali = $dbStore.users.filter((u) => u.deletedAt === null && u.role === 'WALI_MURID');

  $: filteredWali = allWali.filter((w) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      w.fullName.toLowerCase().includes(q) ||
      w.email.toLowerCase().includes(q) ||
      (w.phone || '').toLowerCase().includes(q) ||
      (w.occupation || '').toLowerCase().includes(q)
    );
  });

  $: paginatedWali = filteredWali.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  $: totalPagesWali = Math.max(1, Math.ceil(filteredWali.length / itemsPerPage));

  function getChildrenOfWali(waliId: string): User[] {
    return allStudents.filter((s) => s.waliUserId === waliId);
  }

  function handleConfirmDeleteWali() {
    if (!deleteWaliId) return;
    const res = dbStore.deleteWaliMaster(deleteWaliId);
    deleteWaliId = null;
    if (!res.error) toastStore.success(res.message);
    else toastStore.error(res.message);
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
      <div class="s-val">{allStudents.filter(s => !!s.waliUserId).length}</div>
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
            <th style="text-align:right">Aksi</th>
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
            {#each paginatedWali as w (w.id)}
              {@const children = getChildrenOfWali(w.id)}
              <tr>
                <td>
                  <strong>{w.fullName}</strong>
                  <div class="sub">ID: {w.id}</div>
                </td>
                <td>
                  {w.email}
                  <div class="sub">{w.phone || '—'}</div>
                </td>
                <td>{w.occupation || '—'}</td>
                <td>
                  {#if children.length === 0}
                    <span class="sub">— Belum ada —</span>
                  {:else}
                    <div class="flex flex-col gap-0.5">
                      {#each children as c}
                        <span class="text-xs font-semibold text-primary">· {c.fullName}</span>
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
                      on:click={() => { editingWali = w; waliModalOpen = true; }}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      on:click={() => { deleteWaliId = w.id; }}
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
          {#each Array.from({ length: totalPagesWali }, (_, i) => i + 1) as p}
            <button type="button" class="page-btn {currentPage === p ? 'active' : ''}" on:click={() => { currentPage = p; }}>{p}</button>
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
  open={!!deleteWaliId}
  title="Hapus Master Data Wali Murid"
  message="Apakah Anda yakin ingin menghapus data master wali murid ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDeleteWali}
  onCancel={() => { deleteWaliId = null; }}
/>
