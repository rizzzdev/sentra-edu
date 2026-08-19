<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import Modal from '$lib/components/molecules/modal.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { User } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
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
  title={editingStudent ? 'Ubah Data Master Siswa' : 'Tambah Data Master Siswa'}
  {onClose}
>
  <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-5 py-2">
    <div class="flex flex-col gap-2">
      <label for="sm-name" class="text-xs font-bold text-fg tracking-wide uppercase">Nama Lengkap Siswa <span class="text-danger">*</span></label>
      <Input
        type="text"
        id="sm-name"
        placeholder="misal: Raka Pratama"
        bind:value={fullName}
        required
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="flex flex-col gap-2">
        <label for="sm-email" class="text-xs font-bold text-fg tracking-wide uppercase">Email Akun Siswa <span class="text-danger">*</span></label>
        <Input
          type="email"
          id="sm-email"
          placeholder="siswa@sentraedu.id"
          bind:value={email}
          required
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="sm-phone" class="text-xs font-bold text-fg tracking-wide uppercase">Nomor HP / WhatsApp</label>
        <Input
          type="text"
          id="sm-phone"
          placeholder="081234567890"
          bind:value={phone}
        />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="flex flex-col gap-2">
        <label for="sm-school" class="text-xs font-bold text-fg tracking-wide uppercase">Sekolah / Asal Instansi</label>
        <Input
          type="text"
          id="sm-school"
          placeholder="misal: SMAN 1 Jakarta"
          bind:value={school}
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="sm-wali" class="text-xs font-bold text-fg tracking-wide uppercase">Wali Murid (Master)</label>
        <select 
          id="sm-wali" 
          bind:value={waliUserId}
          class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium text-fg focus:border-primary focus:ring-2 focus:ring-primary/20 transition outline-none"
        >
          <option value="">-- Tanpa Wali / Belum Ditautkan --</option>
          {#each waliList as w}
            <option value={w.id}>{w.fullName} ({w.phone || w.email})</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <label for="sm-address" class="text-xs font-bold text-fg tracking-wide uppercase">Alamat Domisili Siswa</label>
      <textarea
        id="sm-address"
        rows="2"
        placeholder="Alamat lengkap rumah siswa..."
        bind:value={address}
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium text-fg focus:border-primary focus:ring-2 focus:ring-primary/20 transition outline-none resize-none"
      ></textarea>
    </div>

    <div class="flex justify-end gap-3 mt-4">
      <Button variant="outline" className="py-2.5 px-5 rounded-xl font-bold cursor-pointer" on:click={onClose}>
        Batal
      </Button>
      <Button type="submit" variant="primary" className="py-2.5 px-5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer" icon="save">
        {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa Master'}
      </Button>
    </div>
  </form>
</Modal>
