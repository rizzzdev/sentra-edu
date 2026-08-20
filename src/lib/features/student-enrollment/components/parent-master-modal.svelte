<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import Modal from '$lib/components/molecules/modal.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { User } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import { WaliMasterSchema } from '$lib/features/student-enrollment/schemas/student-enrollment.schema';
  import { ZodError } from 'zod';

  export let open: boolean = false;
  export let editingWali: User | null = null;
  export let onClose: () => void = () => {};

  let fullName: string = '';
  let email: string = '';
  let phone: string = '';
  let occupation: string = '';
  let address: string = '';

  $: if (open) {
    if (editingWali) {
      fullName = editingWali.fullName;
      email = editingWali.email;
      phone = editingWali.phone || '';
      occupation = editingWali.occupation || '';
      address = editingWali.address || '';
    } else {
      fullName = '';
      email = '';
      phone = '';
      occupation = '';
      address = '';
    }
  }

  function handleSubmit() {
    try {
      const payload = WaliMasterSchema.parse({
        id: editingWali ? editingWali.id : undefined,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        occupation: occupation.trim(),
        address: address.trim(),
      });

      const response = dbStore.saveWaliMaster({
        ...payload,
        email: payload.email.toLowerCase(),
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
  title={editingWali ? 'Ubah Data Wali Murid' : 'Tambah Data Wali Murid'}
  {onClose}
>
  <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-5 py-2">
    <div class="field">
      <label for="wm-name">Nama Lengkap Wali Murid <i class="req">*</i></label>
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
        <label for="wm-email">Email Wali Murid <i class="req">*</i></label>
        <Input
          type="email"
          id="wm-email"
          placeholder="wali@sentraedu.id"
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
        placeholder="Alamat tempat tinggal wali murid..."
        bind:value={address}
      />
    </div>

    <div class="modal-foot pt-3.5 border-t-0">
      <Button variant="outline" on:click={onClose}>
        Batal
      </Button>
      <Button type="submit" variant="primary" icon="save">
        {editingWali ? 'Simpan Perubahan' : 'Tambah Wali Murid'}
      </Button>
    </div>
  </form>
</Modal>
