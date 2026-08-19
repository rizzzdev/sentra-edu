<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { User, UserRole } from '$lib/shared/types/common.types';

  export let open: boolean = false;
  export let editingUser: User | null = null;
  export let onClose: () => void = () => {};

  let fullName: string = '';
  let email: string = '';
  let phone: string = '';
  let role: UserRole = 'TENTOR';
  let password: string = '';

  $: if (editingUser) {
    fullName = editingUser.fullName;
    email = editingUser.email;
    phone = editingUser.phone || '';
    role = editingUser.role;
    password = '';
  } else {
    fullName = '';
    email = '';
    phone = '';
    role = 'TENTOR';
    password = '';
  }

  function handleSubmit() {
    if (!fullName.trim() || !email.trim()) {
      toastStore.error('Nama lengkap dan email wajib diisi.');
      return;
    }

    const payload: Partial<User> & { fullName: string; email: string } = {
      id: editingUser ? editingUser.id : undefined,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role
    };

    if (password.trim()) {
      payload.password = password.trim();
    } else if (!editingUser) {
      payload.password = 'password123';
    }

    const response = dbStore.saveUser(payload);
    if (!response.error) {
      toastStore.success(response.message);
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title={editingUser ? 'Ubah Pengguna' : 'Tambah Pengguna'} icon="person_add" maxWidth="500px">
  <form id="form-user" on:submit|preventDefault={handleSubmit}>
    <div class="field">
      <label for="f_fullName">Nama Lengkap <i class="req">*</i></label>
      <input
        id="f_fullName"
        type="text"
        placeholder="Nama lengkap"
        required
        bind:value={fullName}
      />
    </div>

    <div class="field">
      <label for="f_email">Email (untuk login) <i class="req">*</i></label>
      <input
        id="f_email"
        type="email"
        placeholder="email@domain.com"
        required
        bind:value={email}
      />
    </div>

    <div class="field">
      <label for="f_phone">Telepon</label>
      <input
        id="f_phone"
        type="tel"
        placeholder="08xx-xxxx-xxxx"
        bind:value={phone}
      />
    </div>

    <div class="field">
      <label for="f_role">Peran <i class="req">*</i></label>
      <select id="f_role" required bind:value={role}>
        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
        <option value="TENTOR">TENTOR</option>
        <option value="STUDENT">STUDENT</option>
        <option value="WALI_MURID">WALI_MURID</option>
      </select>
    </div>

    <div class="field">
      <label for="f_password">
        {editingUser ? 'Password (kosongkan jika tidak diubah)' : 'Password'}
        {#if !editingUser}<i class="req">*</i>{/if}
      </label>
      <input
        id="f_password"
        type="password"
        placeholder={editingUser ? 'Kosongkan jika tidak diubah' : 'default: password123'}
        bind:value={password}
      />
    </div>
  </form>

  <svelte:fragment slot="footer">
    <button type="button" class="btn btn-outline" on:click={onClose}>
      <Icon name="close" size="sm" /> Batal
    </button>
    <button type="submit" form="form-user" class="btn btn-primary">
      <Icon name="save" size="sm" /> {editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
    </button>
  </svelte:fragment>
</Modal>
