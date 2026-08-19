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
    } catch (err) {
      if (err instanceof ZodError) {
        toastStore.error(err.errors[0].message);
      } else {
        toastStore.error('Terjadi kesalahan validasi data.');
      }
    }
  }
</script>

<Modal
  {open}
  title={editingWali ? 'Ubah Data Master Wali Murid' : 'Tambah Data Master Wali Murid'}
  {onClose}
>
  <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-5 py-2">
    <div class="flex flex-col gap-2">
      <label for="wm-name" class="text-xs font-bold text-fg tracking-wide uppercase">Nama Lengkap Wali Murid <span class="text-danger">*</span></label>
      <Input
        type="text"
        id="wm-name"
        placeholder="misal: Bapak Budi Santoso"
        bind:value={fullName}
        required
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="flex flex-col gap-2">
        <label for="wm-email" class="text-xs font-bold text-fg tracking-wide uppercase">Email Wali Murid <span class="text-danger">*</span></label>
        <Input
          type="email"
          id="wm-email"
          placeholder="wali@sentraedu.id"
          bind:value={email}
          required
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="wm-phone" class="text-xs font-bold text-fg tracking-wide uppercase">Nomor Telepon / WhatsApp</label>
        <Input
          type="text"
          id="wm-phone"
          placeholder="081298765432"
          bind:value={phone}
        />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <label for="wm-occ" class="text-xs font-bold text-fg tracking-wide uppercase">Pekerjaan / Jabatan</label>
      <Input
        type="text"
        id="wm-occ"
        placeholder="misal: Pegawai Swasta / Wirausaha"
        bind:value={occupation}
      />
    </div>

    <div class="flex flex-col gap-2">
      <label for="wm-address" class="text-xs font-bold text-fg tracking-wide uppercase">Alamat Rumah</label>
      <textarea
        id="wm-address"
        rows="2"
        placeholder="Alamat tempat tinggal wali murid..."
        bind:value={address}
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium text-fg focus:border-primary focus:ring-2 focus:ring-primary/20 transition outline-none resize-none"
      ></textarea>
    </div>

    <div class="flex justify-end gap-3 mt-4">
      <Button variant="outline" className="py-2.5 px-5 rounded-xl font-bold cursor-pointer" on:click={onClose}>
        Batal
      </Button>
      <Button type="submit" variant="primary" className="py-2.5 px-5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer" icon="save">
        {editingWali ? 'Simpan Perubahan' : 'Tambah Wali Master'}
      </Button>
    </div>
  </form>
</Modal>
