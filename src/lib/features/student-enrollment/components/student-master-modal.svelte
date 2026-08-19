<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import Modal from '$lib/components/molecules/modal.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { User } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import { StudentMasterSchema } from '$lib/features/student-enrollment/schemas/student-enrollment.schema';
  import { ZodError } from 'zod';

  export let open: boolean = false;
  export let editingStudent: User | null = null;
  export let onClose: () => void = () => {};

  let fullName: string = '';
  let email: string = '';
  let phone: string = '';
  let school: string = '';
  let address: string = '';
  let waliUserId: string = '';

  $: waliList = $dbStore.users.filter((u) => u.deletedAt === null && u.role === 'WALI_MURID');

  $: if (open) {
    if (editingStudent) {
      fullName = editingStudent.fullName;
      email = editingStudent.email;
      phone = editingStudent.phone || '';
      school = editingStudent.school || '';
      address = editingStudent.address || '';
      waliUserId = editingStudent.waliUserId || '';
    } else {
      fullName = '';
      email = '';
      phone = '';
      school = '';
      address = '';
      waliUserId = '';
    }
  }

  function handleSubmit() {
    try {
      const payload = StudentMasterSchema.parse({
        id: editingStudent ? editingStudent.id : undefined,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        school: school.trim(),
        address: address.trim(),
        waliUserId: waliUserId || undefined,
      });

      const response = dbStore.saveStudentMaster({
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
  title={editingStudent ? 'Ubah Data Murid' : 'Tambah Data Murid'}
  {onClose}
>
  <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-5 py-2">
    <div class="field">
      <label for="sm-name">Nama Lengkap Murid <i class="req">*</i></label>
      <Input
        type="text"
        id="sm-name"
        placeholder="misal: Raka Pratama"
        bind:value={fullName}
        required
      />
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="sm-email">Email Akun Murid <i class="req">*</i></label>
        <Input
          type="email"
          id="sm-email"
          placeholder="murid@sentraedu.id"
          bind:value={email}
          required
        />
      </div>

      <div class="field">
        <label for="sm-phone">Nomor HP / WhatsApp</label>
        <Input
          type="text"
          id="sm-phone"
          placeholder="081234567890"
          bind:value={phone}
        />
      </div>
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="sm-school">Sekolah / Asal Instansi</label>
        <Input
          type="text"
          id="sm-school"
          placeholder="misal: SMAN 1 Jakarta"
          bind:value={school}
        />
      </div>

      <div class="field">
        <label for="sm-wali">Wali Murid (Master)</label>
        <SelectSearch
          id="sm-wali"
          bind:value={waliUserId}
          placeholder="-- Tanpa Wali / Belum Ditautkan --"
          options={waliList.map((w) => ({ value: w.id, label: `${w.fullName} (${w.phone || w.email})` }))}
        />
      </div>
    </div>

    <div class="field">
      <label for="sm-address">Alamat Domisili Murid</label>
      <Input
        type="text"
        id="sm-address"
        placeholder="Alamat lengkap rumah murid..."
        bind:value={address}
      />
    </div>

    <div class="modal-foot" style="padding: 14px 0 0; border-top: none;">
      <Button variant="outline" on:click={onClose}>
        Batal
      </Button>
      <Button type="submit" variant="primary" icon="save">
        {editingStudent ? 'Simpan Perubahan' : 'Tambah Murid'}
      </Button>
    </div>
  </form>
</Modal>
