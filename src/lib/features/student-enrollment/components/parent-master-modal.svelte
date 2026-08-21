<script lang="ts">
  import { Icon, Input } from '$lib/components/atoms';
  import { Modal } from '$lib/components/molecules';
  import {toastStore} from '$lib/shared/stores';
  import type { User } from '$lib/shared/types';
  import { Button } from '$lib/components/atoms';
  import { api } from '$lib/api/client';
  import { ParentMasterSchema } from '$lib/features/student-enrollment';
  import { ZodError } from 'zod';

  export let open: boolean = false;
  export let editingParent: User | null = null;
  export let onClose: () => void = () => {};

  let fullName: string = '';
  let email: string = '';
  let phone: string = '';
  let occupation: string = '';
  let address: string = '';

  $: if (open) {
    if (editingParent) {
      fullName = editingParent.fullName;
      email = editingParent.email;
      phone = editingParent.phone || '';
      occupation = editingParent.occupation || '';
      address = editingParent.address || '';
    } else {
      fullName = '';
      email = '';
      phone = '';
      occupation = '';
      address = '';
    }
  }

  async function handleSubmit() {
    try {
      const payload = ParentMasterSchema.parse({
        id: editingParent ? editingParent.id : undefined,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        occupation: occupation.trim(),
        address: address.trim(),
      });

      const response = await api.users.create({
        ...payload,
        email: payload.email.toLowerCase(),
        role: 'PARENT'
      });

      if (!response.error) {
        toastStore.success(response.message);
        onClose();
      } else {
        toastStore.error(response.message);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        toastStore.error(error.errors[0].message);
      } else {
        toastStore.error('Terjadi kesalahan validasi data.');
      }
    }
  }
</script>

<Modal
  {open}
  title={editingParent ? 'Ubah Data Orang Tua' : 'Tambah Data Orang Tua'}
  {onClose}
>
  <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-5 py-2">
    <div class="field">
      <label for="wm-name">Nama Lengkap Orang Tua <i class="req">*</i></label>
      <Input
        type="text"
        id="wm-name"
        placeholder="misal: Bapak Budi Santoso"
        bind:value={fullName}
        required
      />
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="wm-email">Email Orang Tua <i class="req">*</i></label>
        <Input
          type="email"
          id="wm-email"
          placeholder="parent@sentraedu.id"
          bind:value={email}
          required
        />
      </div>

      <div class="field">
        <label for="wm-phone">Nomor Telepon / WhatsApp</label>
        <Input
          type="text"
          id="wm-phone"
          placeholder="081298765432"
          bind:value={phone}
        />
      </div>
    </div>

    <div class="field">
      <label for="wm-occ">Pekerjaan / Jabatan</label>
      <Input
        type="text"
        id="wm-occ"
        placeholder="misal: Pegawai Swasta / Wirausaha"
        bind:value={occupation}
      />
    </div>

    <div class="field">
      <label for="wm-address">Alamat Rumah</label>
      <Input
        type="text"
        id="wm-address"
        placeholder="Alamat tempat tinggal orang tua..."
        bind:value={address}
      />
    </div>

    <div class="modal-foot pt-3.5 border-t-0">
      <Button variant="outline" on:click={onClose}>
        Batal
      </Button>
      <Button type="submit" variant="primary" icon="save">
        {editingParent ? 'Simpan Perubahan' : 'Tambah Orang Tua'}
      </Button>
    </div>
  </form>
</Modal>
