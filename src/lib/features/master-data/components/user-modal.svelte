<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { User, UserRole } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import { ROLE_LABEL } from '$lib/shared/utils/status-map';

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
      <Input
        id="f_fullName"
        type="text"
        placeholder="Nama lengkap"
        required
        bind:value={fullName}
      />
    </div>

    <div class="field">
      <label for="f_email">Email (untuk login) <i class="req">*</i></label>
      <Input
        id="f_email"
        type="email"
        placeholder="email@domain.com"
        required
        bind:value={email}
      />
    </div>

    <div class="field">
      <label for="f_phone">Telepon</label>
      <Input
        id="f_phone"
        type="tel"
        placeholder="08xx-xxxx-xxxx"
        bind:value={phone}
      />
    </div>

    <div class="field">
      <label for="f_role">Peran <i class="req">*</i></label>
      <SelectSearch
        id="f_role"
        name="role"
        bind:value={role}
        options={Object.entries(ROLE_LABEL).map(([v, l]) => ({ value: v, label: l }))}
        placeholder="— Pilih peran —"
      />
    </div>

    <div class="field">
      <label for="f_password">
        {editingUser ? 'Password (kosongkan jika tidak diubah)' : 'Password'}
        {#if !editingUser}<i class="req">*</i>{/if}
      </label>
      <Input
        id="f_password"
        type="password"
        placeholder={editingUser ? 'Kosongkan jika tidak diubah' : 'default: password123'}
        bind:value={password}
      />
    </div>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={onClose} icon="close">
      Batal
    </Button>
    <Button type="submit" variant="primary" form="form-user" icon="save">
      {editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
    </Button>
  </svelte:fragment>
</Modal>
