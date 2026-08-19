<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import Modal from '$lib/components/molecules/modal.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { User } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import { TentorMasterSchema } from '$lib/features/master-data/schemas/master-data.schema';
  import { ZodError } from 'zod';

  export let open: boolean = false;
  export let editingTentor: User | null = null;
  export let onClose: () => void = () => {};

  let fullName: string = '';
  let email: string = '';
  let phone: string = '';
  let education: string = '';
  let address: string = '';
  let selectedSubjectIds: string[] = [];

  $: if (open) {
    if (editingTentor) {
      fullName = editingTentor.fullName;
      email = editingTentor.email;
      phone = editingTentor.phone || '';
      education = editingTentor.education || '';
      address = editingTentor.address || '';
      selectedSubjectIds = editingTentor.subjectIds || [];
    } else {
      fullName = '';
      email = '';
      phone = '';
      education = '';
      address = '';
      selectedSubjectIds = [];
    }
  }

  function toggleSubject(id: string) {
    if (selectedSubjectIds.includes(id)) {
      selectedSubjectIds = selectedSubjectIds.filter((s) => s !== id);
    } else {
      selectedSubjectIds = [...selectedSubjectIds, id];
    }
  }

  function handleSubmit() {
    try {
      const payload = TentorMasterSchema.parse({
        id: editingTentor ? editingTentor.id : undefined,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        education: education.trim(),
        subjectIds: selectedSubjectIds,
        address: address.trim(),
      });

      const response = dbStore.saveTentorMaster({
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
  title={editingTentor ? 'Ubah Data Master Tentor' : 'Tambah Data Master Tentor'}
  {onClose}
>
  <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-5 py-2">
    <div class="flex flex-col gap-2">
      <label for="tm-name" class="text-xs font-bold text-fg tracking-wide uppercase">Nama Lengkap Tentor / Mentor <span class="text-danger">*</span></label>
      <Input
        type="text"
        id="tm-name"
        placeholder="misal: Dr. Andi Wijaya, M.Pd"
        bind:value={fullName}
        required
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="flex flex-col gap-2">
        <label for="tm-email" class="text-xs font-bold text-fg tracking-wide uppercase">Email Akun Tentor <span class="text-danger">*</span></label>
        <Input
          type="email"
          id="tm-email"
          placeholder="tentor@sentraedu.id"
          bind:value={email}
          required
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="tm-phone" class="text-xs font-bold text-fg tracking-wide uppercase">Nomor HP / WhatsApp</label>
        <Input
          type="text"
          id="tm-phone"
          placeholder="081234567890"
          bind:value={phone}
        />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <label for="tm-edu" class="text-xs font-bold text-fg tracking-wide uppercase">Pendidikan / Gelar Terakhir</label>
      <Input
        type="text"
        id="tm-edu"
        placeholder="misal: S1 Pendidikan Matematika - Universitas Indonesia"
        bind:value={education}
      />
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-xs font-bold text-fg tracking-wide uppercase mb-1">Keahlian Mata Pelajaran</span>
      <div class="flex flex-wrap gap-2 p-3 bg-muted/50 border border-border rounded-xl max-h-40 overflow-y-auto">
        {#each $dbStore.subjects as s}
          {@const isChecked = selectedSubjectIds.includes(s.id)}
          <Button
            variant={isChecked ? 'primary' : 'outline'}
            className="rounded-xl px-3 py-1.5 text-xs h-auto shadow-2xs"
            on:click={() => toggleSubject(s.id)}
          >
            {s.name}
          </Button>
        {/each}
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <label for="tm-address" class="text-xs font-bold text-fg tracking-wide uppercase">Alamat Rumah / Domisili</label>
      <textarea
        id="tm-address"
        rows="2"
        placeholder="Alamat tempat tinggal tentor..."
        bind:value={address}
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium text-fg focus:border-primary focus:ring-2 focus:ring-primary/20 transition outline-none resize-none"
      ></textarea>
    </div>

    <div class="flex justify-end gap-3 mt-4">
      <Button variant="outline" className="py-2.5 px-5 rounded-xl font-bold cursor-pointer" on:click={onClose}>
        Batal
      </Button>
      <Button type="submit" variant="primary" className="py-2.5 px-5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer" icon="save">
        {editingTentor ? 'Simpan Perubahan' : 'Tambah Tentor Master'}
      </Button>
    </div>
  </form>
</Modal>
