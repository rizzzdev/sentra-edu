<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import UserModal from '$lib/features/master-data/components/user-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { User, UserRole } from '$lib/shared/types/common.types';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import { ROLE_LABEL } from '$lib/shared/utils/status-map';

  let searchQuery: string = '';
  let roleFilter: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;

  let userModalOpen: boolean = false;
  let editingUser: User | null = null;
  let deleteDialogOpen: boolean = false;
  let deletingUserId: string | null = null;

  $: currentUser = $authStore;
  $: allUsers = $dbStore.users.filter((u) => u.deletedAt === null);

  $: filteredUsers = allUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  $: paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  $: totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  function getBadgeClass(role: UserRole): string {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'b-admin';
      case 'TENTOR':
        return 'b-tentor';
      case 'STUDENT':
        return 'b-student';
      case 'WALI_MURID':
        return 'b-neutral';
      default:
        return 'b-neutral';
    }
  }

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
    const res = dbStore.deleteUser(deletingUserId);
    deleteDialogOpen = false;
    deletingUserId = null;
    if (!res.error) {
      toastStore.success(res.message);
    } else {
      toastStore.error(res.message);
    }
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="manage_accounts" size="lg" /> Akun Pengguna</h3>
    <div class="desc">Kelola akun Super Admin, Admin, Tentor, dan Siswa/Wali.</div>
  </div>
  <button type="button" class="btn btn-primary" on:click={handleOpenCreate}>
    <Icon name="person_add" size="sm" /> Tambah Pengguna
  </button>
</div>

<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input type="text" placeholder="Cari nama / email..." bind:value={searchQuery} />
  </div>
  <SelectSearch
    bind:value={roleFilter}
    placeholder="Semua Peran"
    options={[
      { value: '', label: 'Semua Peran' },
      ...Object.entries(ROLE_LABEL).map(([v, l]) => ({ value: v, label: l }))
    ]}
    className="max-w-48"
  />
</div>

<div class="card">
  <div class="card-body flush">
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Pengguna</th>
            <th>Telepon</th>
            <th>Peran</th>
            <th style="text-align:right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedUsers.length === 0}
            <tr>
              <td colspan="4" class="empty">Tidak ada pengguna untuk filter ini.</td>
            </tr>
          {:else}
            {#each paginatedUsers as u (u.id)}
              <tr>
                <td>
                  <strong>{u.fullName}</strong>
                  <div class="sub">{u.email}</div>
                </td>
                <td>{u.phone || '—'}</td>
                <td>
                  <span class="badge {getBadgeClass(u.role)}">{u.role}</span>
                </td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Ubah"
                      on:click={() => handleOpenEdit(u)}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    {#if u.id !== currentUser?.id}
                      <button
                        type="button"
                        class="btn-icon btn-icon-danger"
                        data-tip="Hapus"
                        on:click={() => {
                          deletingUserId = u.id;
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

<UserModal open={userModalOpen} {editingUser} onClose={() => { userModalOpen = false; }} />
<ConfirmationDialog
  open={deleteDialogOpen}
  title="Hapus Akun Pengguna"
  message="Apakah Anda yakin ingin menghapus akun pengguna ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => { deleteDialogOpen = false; }}
/>
