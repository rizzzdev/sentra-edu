<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import EnrollmentModal from '$lib/features/student-enrollment/components/enrollment-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import type { StudentEnrollment } from '$lib/shared/types/common.types';

  let searchQuery: string = '';
  let levelFilter: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;

  let enrollmentModalOpen: boolean = false;
  let editingEnrollment: StudentEnrollment | null = null;
  let deleteDialogOpen: boolean = false;
  let deletingEnrollmentId: string | null = null;

  $: allEnrollments = $dbStore.enrollments.filter((e) => e.deletedAt === null);

  $: nTotal = allEnrollments.length;
  $: nKelompok = allEnrollments.filter((e) => {
    const p = $dbStore.packages.find((pkg) => pkg.id === e.packageId);
    return p && p.mode === 'KELOMPOK';
  }).length;
  $: nPrivate = nTotal - nKelompok;

  function getUserName(userId: string): string {
    return $dbStore.users.find((u) => u.id === userId)?.fullName || '—';
  }

  function getClassName(classId: string): string {
    return $dbStore.classes.find((c) => c.id === classId)?.className || '—';
  }

  function getSubjectName(subjectId: string): string {
    return $dbStore.subjects.find((s) => s.id === subjectId)?.name || '—';
  }

  function getPackageName(packageId: string): string {
    return $dbStore.packages.find((p) => p.id === packageId)?.name || '—';
  }

  function getPackage(packageId: string) {
    return $dbStore.packages.find((p) => p.id === packageId);
  }

  $: filteredEnrollments = allEnrollments.filter((e) => {
    const cls = $dbStore.classes.find((c) => c.id === e.classId);
    const lvl = cls ? cls.educationLevelId : null;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      getUserName(e.studentId).toLowerCase().includes(q) ||
      getClassName(e.classId).toLowerCase().includes(q) ||
      getSubjectName(e.subjectId).toLowerCase().includes(q) ||
      getPackageName(e.packageId).toLowerCase().includes(q) ||
      (e.address || '').toLowerCase().includes(q);

    const matchesLevel = !levelFilter || lvl === levelFilter;
    return matchesSearch && matchesLevel;
  });

  $: paginatedEnrollments = filteredEnrollments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  $: totalPages = Math.max(1, Math.ceil(filteredEnrollments.length / itemsPerPage));

  function handleOpenCreate() {
    editingEnrollment = null;
    enrollmentModalOpen = true;
  }

  function handleOpenEdit(enr: StudentEnrollment) {
    editingEnrollment = enr;
    enrollmentModalOpen = true;
  }

  function handleConfirmDelete() {
    if (!deletingEnrollmentId) return;
    const response = dbStore.deleteEnrollment(deletingEnrollmentId);
    deleteDialogOpen = false;
    deletingEnrollmentId = null;
    if (!response.error) {
      toastStore.success(response.message);
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="group" size="lg" /> Siswa</h3>
    <div class="desc">Siswa terdaftar beserta paket les yang dilanggan.</div>
  </div>
  <button type="button" class="btn btn-primary" on:click={handleOpenCreate}>
    <Icon name="person_add" size="sm" /> Daftarkan Siswa
  </button>
</div>

<div class="stat-grid">
  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="group" size="lg" /></div>
    <div>
      <div class="s-val">{nTotal}</div>
      <div class="s-lbl">Siswa Terdaftar</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="person" size="lg" /></div>
    <div>
      <div class="s-val">{nPrivate}</div>
      <div class="s-lbl">Paket Private</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-amber"><Icon name="groups" size="lg" /></div>
    <div>
      <div class="s-val">{nKelompok}</div>
      <div class="s-lbl">Paket Kelompok</div>
    </div>
  </div>
</div>

<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input type="text" placeholder="Cari siswa / kelas / mapel / paket / alamat..." bind:value={searchQuery} />
  </div>
  <select class="filter-select" bind:value={levelFilter}>
    <option value="">Semua Jenjang</option>
    {#each $dbStore.educationLevels as lvl}
      <option value={lvl.id}>{lvl.levelName}</option>
    {/each}
  </select>
</div>

<div class="card">
  <div class="card-body flush">
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Siswa</th>
            <th>Kelas · Mapel</th>
            <th>Paket Les</th>
            <th>Wali</th>
            <th style="text-align:right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedEnrollments.length === 0}
            <tr>
              <td colspan="5" class="empty">
                {searchQuery || levelFilter
                  ? 'Tidak ada siswa yang cocok dengan filter.'
                  : 'Belum ada pendaftaran siswa. Klik "Daftarkan Siswa".'}
              </td>
            </tr>
          {:else}
            {#each paginatedEnrollments as e (e.id)}
              {@const pkg = getPackage(e.packageId)}
              {@const wali = e.waliUserId ? $dbStore.users.find((u) => u.id === e.waliUserId) : null}
              <tr>
                <td>
                  <strong>{getUserName(e.studentId)}</strong>
                </td>
                <td>
                  {getClassName(e.classId)} · {getSubjectName(e.subjectId)}
                </td>
                <td>
                  <span class="sub">{pkg?.mode || 'PRIVATE'}</span> {pkg?.name || '—'}
                  {#if pkg}
                    <div class="sub">
                      {formatCurrencyIDR(pkg.price)}/{pkg.period === 'BULANAN' ? 'bulan' : 'sesi'}
                    </div>
                  {/if}
                </td>
                <td>
                  {#if wali}
                    {wali.fullName}
                    <div class="sub">{wali.phone || '—'}</div>
                  {:else}
                    —
                  {/if}
                </td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Ubah"
                      on:click={() => handleOpenEdit(e)}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      on:click={() => {
                        deletingEnrollmentId = e.id;
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

    {#if filteredEnrollments.length > itemsPerPage}
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredEnrollments.length)} dari {filteredEnrollments.length} data
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

<EnrollmentModal open={enrollmentModalOpen} {editingEnrollment} onClose={() => { enrollmentModalOpen = false; }} />
<ConfirmationDialog
  open={deleteDialogOpen}
  title="Hapus Pendaftaran Siswa"
  message="Apakah Anda yakin ingin menghapus pendaftaran siswa ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => { deleteDialogOpen = false; }}
/>
