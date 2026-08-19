<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import PackageModal from '$lib/features/master-data/components/package-modal.svelte';
  import ClassModal from '$lib/features/master-data/components/class-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import type { PackagePlan, ClassLevel } from '$lib/shared/types/common.types';

  let searchQuery: string = '';
  let modeFilter: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;

  let packageModalOpen: boolean = false;
  let editingPackage: PackagePlan | null = null;
  let classModalOpen: boolean = false;
  let editingClass: ClassLevel | null = null;
  let deleteDialogOpen: boolean = false;
  let deletingPackageId: string | null = null;

  $: allPackages = $dbStore.packages.filter((p) => p.deletedAt === null);

  $: filteredPackages = allPackages.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q);
    const matchesMode = !modeFilter || p.mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  $: paginatedPackages = filteredPackages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  $: totalPages = Math.max(1, Math.ceil(filteredPackages.length / itemsPerPage));

  function getLevelName(levelId: string): string {
    return $dbStore.educationLevels.find((l) => l.id === levelId)?.levelName || '—';
  }

  function handleOpenCreatePackage() {
    editingPackage = null;
    packageModalOpen = true;
  }

  function handleOpenEditPackage(pkg: PackagePlan) {
    editingPackage = pkg;
    packageModalOpen = true;
  }

  function handleOpenEditClass(cls: ClassLevel) {
    editingClass = cls;
    classModalOpen = true;
  }

  function handleConfirmDelete() {
    if (!deletingPackageId) return;
    const res = dbStore.deletePackage(deletingPackageId);
    deleteDialogOpen = false;
    deletingPackageId = null;
    if (!res.error) {
      toastStore.success('Paket les berhasil dihapus.');
    } else {
      toastStore.error(res.message);
    }
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="sell" size="lg" /> Paket Les</h3>
    <div class="desc">
      Master paket les: mode Private/Kelompok x periode Bulanan/Harian. Biaya wali murid (SPP) dan honor tentor per sesi dikonfigurasi di sini.
    </div>
  </div>
  <button type="button" class="btn btn-primary" on:click={handleOpenCreatePackage}>
    <Icon name="add" size="sm" /> Tambah Paket
  </button>
</div>

<div class="alert alert-info">
  <Icon name="info" size="sm" />
  <span>
    <strong>Biaya Wali Murid</strong> = harga paket (SPP). <strong>Honor Tentor per Sesi</strong> = yang diterima tentor per sesi (sudah termasuk transport); bila tidak diisi, memakai honor dasar kelas + transport.
  </span>
</div>

<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input type="text" placeholder="Cari nama paket..." bind:value={searchQuery} />
  </div>
  <select class="filter-select" bind:value={modeFilter}>
    <option value="">Semua Mode</option>
    <option value="PRIVATE">Private</option>
    <option value="KELOMPOK">Kelompok</option>
  </select>
</div>

<!-- Table 1: Master Paket Les -->
<div class="card">
  <div class="card-body flush">
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Paket</th>
            <th>Mode</th>
            <th>Periode</th>
            <th class="num">Sesi/Periode</th>
            <th class="num">Kapasitas</th>
            <th class="num">Harga (Wali)</th>
            <th class="num">Honor Tentor/Sesi</th>
            <th>Status</th>
            <th style="text-align:right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedPackages.length === 0}
            <tr>
              <td colspan="9" class="empty">
                {searchQuery || modeFilter ? 'Tidak ada paket yang cocok.' : 'Belum ada paket. Klik "Tambah Paket".'}
              </td>
            </tr>
          {:else}
            {#each paginatedPackages as p (p.id)}
              <tr>
                <td>
                  <strong>{p.name}</strong>
                  <div class="sub">{p.description || '—'}</div>
                </td>
                <td>
                  <span class="badge {p.mode === 'KELOMPOK' ? 'b-negotiating' : 'b-available'}">{p.mode}</span>
                </td>
                <td>{p.period === 'BULANAN' ? 'Bulanan' : 'Harian'}</td>
                <td class="num">{p.sessionsPerPeriod} sesi</td>
                <td class="num">{p.mode === 'KELOMPOK' ? 'maks ' + p.maxStudents + ' siswa' : '1 siswa'}</td>
                <td class="num"><strong>{formatCurrencyIDR(p.price)}</strong></td>
                <td class="num">{p.tentorFee > 0 ? formatCurrencyIDR(p.tentorFee) + '/sesi' : '—'}</td>
                <td>
                  <span class="badge {p.active ? 'b-available' : 'b-cancelled'}">
                    {p.active ? 'Tersedia' : 'Nonaktif'}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Ubah"
                      on:click={() => handleOpenEditPackage(p)}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      on:click={() => {
                        deletingPackageId = p.id;
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

    {#if filteredPackages.length > itemsPerPage}
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredPackages.length)} dari {filteredPackages.length} data
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
          {#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNum}
            <button
              type="button"
              class="page-btn {currentPage === pageNum ? 'active' : ''}"
              on:click={() => { currentPage = pageNum; }}
            >
              {pageNum}
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

<!-- Table 2: Honor Dasar per Kelas -->
<div class="card">
  <div class="card-head">
    <Icon name="school" size="md" /> Honor Dasar Tentor per Kelas (per 90 menit)
  </div>
  <div class="card-body flush">
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Kelas</th>
            <th>Jenjang</th>
            <th class="num">Honor Dasar</th>
            <th style="text-align:right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#each $dbStore.classes.filter((c) => c.deletedAt === null) as c (c.id)}
            <tr>
              <td><strong>{c.className}</strong></td>
              <td>{getLevelName(c.educationLevelId)}</td>
              <td class="num">{formatCurrencyIDR(c.baseRatePer90Min)}</td>
              <td>
                <div class="actions">
                  <button
                    type="button"
                    class="btn-icon"
                    data-tip="Ubah honor dasar"
                    on:click={() => handleOpenEditClass(c)}
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<PackageModal open={packageModalOpen} {editingPackage} onClose={() => { packageModalOpen = false; }} />
<ClassModal open={classModalOpen} {editingClass} onClose={() => { classModalOpen = false; }} />
<ConfirmationDialog
  open={deleteDialogOpen}
  title="Hapus Paket Les"
  message="Apakah Anda yakin ingin menghapus paket les ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => { deleteDialogOpen = false; }}
/>
