<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
  import AlertBanner from '$lib/components/molecules/alert-banner.svelte';
  import UserModal from '$lib/features/master-data/components/user-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { User } from '$lib/shared/types/common.types';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import { ROLE_LABEL } from '$lib/shared/utils/status-map';

  const ROLE_BADGE: Record<string, string> = {
    SUPER_ADMIN: 'b-admin',
    TENTOR: 'b-tentor',
    STUDENT: 'b-student',
    WALI_MURID: 'b-neutral'
  };

  let searchQuery: string = '';
  let roleFilter: string = '';
  let statusFilter: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;

  let isLoading: boolean = true;
  let errorMessage: string | null = null;

  let userModalOpen: boolean = false;
  let editingUser: User | null = null;

  let deleteDialogOpen: boolean = false;
  let deletingUserId: string | null = null;

  let activateDialogOpen: boolean = false;
  let activatingUserId: string | null = null;

  let deactivateDialogOpen: boolean = false;
  let deactivatingUserId: string | null = null;

  onMount(() => {
    const timer = setTimeout(() => {
      isLoading = false;
    }, 400);
    return () => clearTimeout(timer);
  });

  $: currentUser = $authStore;
  $: allUsers = $dbStore.users.filter((user) => user.deletedAt === null);

  $: activeUsersCount = allUsers.filter((user) => user.isActive !== false).length;
  $: pendingUsersCount = allUsers.filter((user) => user.isActive === false).length;

  $: filteredUsers = allUsers.filter((user) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone || '').toLowerCase().includes(query);
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'active' && user.isActive !== false) ||
      (statusFilter === 'inactive' && user.isActive === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  $: paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  $: totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  function handleOpenCreate() {
    editingUser = null;
    userModalOpen = true;
  }

  function handleOpenEdit(user: User) {
    editingUser = user;
    userModalOpen = true;
  }

  function handleConfirmDelete() {
    if (!deletingUserId) return;
    const result = dbStore.deleteUser(deletingUserId);
    deleteDialogOpen = false;
    deletingUserId = null;
    if (!result.error) {
      toastStore.success(result.message);
    } else {
      toastStore.error(result.message);
    }
  }

  function handleConfirmActivate() {
    if (!activatingUserId) return;
    const result = dbStore.activateUser(activatingUserId);
    activateDialogOpen = false;
    activatingUserId = null;
    if (!result.error) {
      toastStore.success(result.message);
    } else {
      toastStore.error(result.message);
    }
  }

  function handleConfirmDeactivate() {
    if (!deactivatingUserId) return;
    const result = dbStore.deactivateUser(deactivatingUserId);
    deactivateDialogOpen = false;
    deactivatingUserId = null;
    if (!result.error) {
      toastStore.success(result.message);
    } else {
      toastStore.error(result.message);
    }
  }

  function handleRetry() {
    errorMessage = null;
    isLoading = true;
    setTimeout(() => {
      isLoading = false;
    }, 400);
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="manage_accounts" size="lg" /> Akun Pengguna</h3>
    <div class="desc">Kelola akun Super Admin, Tentor, Murid, dan Wali Murid beserta status aktivasi login.</div>
  </div>
  <button type="button" class="btn btn-primary" on:click={handleOpenCreate}>
    <Icon name="person_add" size="sm" /> Tambah Pengguna
  </button>
</div>

<!-- STAT GRID -->
<div class="stat-grid">
  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="group" size="lg" /></div>
    <div>
      <div class="s-val">{allUsers.length}</div>
      <div class="s-lbl">Total Pengguna</div>
    </div>
  </div>

  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="verified_user" size="lg" /></div>
    <div>
      <div class="s-val">{activeUsersCount}</div>
      <div class="s-lbl">Akun Aktif</div>
    </div>
  </div>

  <div class="stat">
    <div class="s-icon tone-amber"><Icon name="pending_actions" size="lg" /></div>
    <div>
      <div class="s-val">{pendingUsersCount}</div>
      <div class="s-lbl">Menunggu Aktivasi</div>
    </div>
  </div>
</div>

<!-- FILTER BAR -->
<div class="filter-bar mt-4">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input type="text" placeholder="Cari nama / email / telepon..." bind:value={searchQuery} />
  </div>
  <SelectSearch
    bind:value={roleFilter}
    placeholder="Semua Peran"
    options={[
      { value: '', label: 'Semua Peran' },
      ...Object.entries(ROLE_LABEL).map(([roleKey, roleLabel]) => ({ value: roleKey, label: roleLabel }))
    ]}
    className="max-w-48"
  />
  <SelectSearch
    bind:value={statusFilter}
    placeholder="Semua Status"
    options={[
      { value: '', label: 'Semua Status' },
      { value: 'active', label: 'Aktif' },
      { value: 'inactive', label: 'Belum Aktif' }
    ]}
    className="max-w-44"
  />
</div>

<!-- DATA TABLE CARD -->
<div class="card">
  <div class="card-body flush">
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Pengguna</th>
            <th>Kontak & Telepon</th>
            <th>Peran</th>
            <th>Status Akun</th>
            <th class="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if isLoading}
            <!-- 1. LOADING STATE -->
            {#each Array(5) as _}
              <tr>
                <td>
                  <Skeleton width="w-48" height="h-5" />
                  <Skeleton width="w-32" height="h-3" className="mt-2" />
                </td>
                <td>
                  <Skeleton width="w-36" height="h-4" />
                </td>
                <td>
                  <Skeleton width="w-24" height="h-6" />
                </td>
                <td>
                  <Skeleton width="w-20" height="h-6" />
                </td>
                <td>
                  <Skeleton width="w-24" height="h-8" className="ml-auto" />
                </td>
              </tr>
            {/each}
          {:else if errorMessage}
            <!-- 2. ERROR STATE -->
            <tr>
              <td colspan="5" class="!p-4">
                <AlertBanner
                  variant="destructive"
                  message={errorMessage}
                  onRetry={handleRetry}
                />
              </td>
            </tr>
          {:else if paginatedUsers.length === 0}
            <!-- 3. EMPTY STATE -->
            <tr>
              <td colspan="5" class="empty py-12 text-center text-muted-fg">
                <Icon name="manage_accounts" size="lg" className="opacity-50 mb-2 block mx-auto text-4xl" />
                <div class="font-medium">
                  {searchQuery || roleFilter || statusFilter
                    ? 'Tidak ada akun pengguna yang sesuai dengan filter pencarian.'
                    : 'Belum ada data akun pengguna.'}
                </div>
                {#if !searchQuery && !roleFilter && !statusFilter}
                  <button type="button" class="btn btn-outline btn-sm mt-4 inline-flex mx-auto" on:click={handleOpenCreate}>
                    <Icon name="person_add" size="sm" /> Tambah Pengguna Baru
                  </button>
                {/if}
              </td>
            </tr>
          {:else}
            <!-- 4. POPULATED STATE -->
            {#each paginatedUsers as user (user.id)}
              <tr>
                <td>
                  <strong>{user.fullName}</strong>
                  <div class="sub">{user.email}</div>
                </td>
                <td>{user.phone || '—'}</td>
                <td>
                  <span class="badge {ROLE_BADGE[user.role] || 'b-neutral'}">
                    {ROLE_LABEL[user.role] || user.role}
                  </span>
                </td>
                <td>
                  {#if user.isActive !== false}
                    <span class="badge b-student flex items-center gap-1 w-fit">
                      <Icon name="check_circle" size="xs" /> Aktif
                    </span>
                  {:else}
                    <span class="badge b-neutral flex items-center gap-1 w-fit">
                      <Icon name="hourglass_empty" size="xs" /> Belum Aktif
                    </span>
                  {/if}
                </td>
                <td>
                  <div class="actions">
                    {#if user.id !== currentUser?.id}
                      {#if user.isActive === false}
                        <button
                          type="button"
                          class="btn-icon btn-icon-success"
                          data-tip="Aktifkan Akun"
                          aria-label="Aktifkan Akun {user.fullName}"
                          on:click={() => {
                            activatingUserId = user.id;
                            activateDialogOpen = true;
                          }}
                        >
                          <Icon name="check_circle" size="sm" />
                        </button>
                      {:else}
                        <button
                          type="button"
                          class="btn-icon btn-icon-amber"
                          data-tip="Nonaktifkan Akun"
                          aria-label="Nonaktifkan Akun {user.fullName}"
                          on:click={() => {
                            deactivatingUserId = user.id;
                            deactivateDialogOpen = true;
                          }}
                        >
                          <Icon name="pause_circle" size="sm" />
                        </button>
                      {/if}
                    {/if}

                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Ubah"
                      aria-label="Ubah Data {user.fullName}"
                      on:click={() => handleOpenEdit(user)}
                    >
                      <Icon name="edit" size="sm" />
                    </button>

                    {#if user.id !== currentUser?.id}
                      <button
                        type="button"
                        class="btn-icon btn-icon-danger"
                        data-tip="Hapus"
                        aria-label="Hapus Akun {user.fullName}"
                        on:click={() => {
                          deletingUserId = user.id;
                          deleteDialogOpen = true;
                        }}
                      >
                        <Icon name="delete" size="sm" />
                      </button>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    {#if filteredUsers.length > itemsPerPage}
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredUsers.length)} dari {filteredUsers.length} data
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
          {#each Array.from({ length: totalPages }, (_, index) => index + 1) as pageNumber}
            <button
              type="button"
              class="page-btn {currentPage === pageNumber ? 'active' : ''}"
              on:click={() => { currentPage = pageNumber; }}
            >
              {pageNumber}
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

<UserModal
  open={userModalOpen}
  {editingUser}
  onClose={() => { userModalOpen = false; }}
/>

<ConfirmationDialog
  open={activateDialogOpen}
  title="Aktifkan Akun Pengguna"
  message="Apakah Anda yakin ingin mengaktifkan akun pengguna ini? Pengguna akan dapat login ke sistem SentraEdu."
  confirmText="Aktifkan"
  confirmVariant="primary"
  onConfirm={handleConfirmActivate}
  onCancel={() => { activateDialogOpen = false; activatingUserId = null; }}
/>

<ConfirmationDialog
  open={deactivateDialogOpen}
  title="Nonaktifkan Akun Pengguna"
  message="Apakah Anda yakin ingin menonaktifkan akun pengguna ini? Pengguna tidak akan dapat login sampai diaktifkan kembali."
  confirmText="Nonaktifkan"
  confirmVariant="warning"
  onConfirm={handleConfirmDeactivate}
  onCancel={() => { deactivateDialogOpen = false; deactivatingUserId = null; }}
/>

<ConfirmationDialog
  open={deleteDialogOpen}
  title="Hapus Akun Pengguna"
  message="Apakah Anda yakin ingin menghapus akun pengguna ini secara permanen?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => { deleteDialogOpen = false; deletingUserId = null; }}
/>
