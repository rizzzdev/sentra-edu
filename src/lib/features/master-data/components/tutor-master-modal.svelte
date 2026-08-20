<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import Modal from '$lib/components/molecules/modal.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { User } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
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
  title={editingTentor ? 'Ubah Data Tentor' : 'Tambah Data Tentor'}
  {onClose}
>
  <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-5 py-2">
    <div class="field">
      <label for="tm-name">Nama Lengkap Tentor / Mentor <i class="req">*</i></label>
      <Input
        type="text"
        id="tm-name"
        placeholder="misal: Dr. Andi Wijaya, M.Pd"
        bind:value={fullName}
        required
      />
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="tm-email">Email Akun Tentor <i class="req">*</i></label>
        <Input
          type="email"
          id="tm-email"
          placeholder="tentor@sentraedu.id"
          bind:value={email}
          required
        />
      </div>

      <div class="field">
        <label for="tm-phone">Nomor HP / WhatsApp</label>
        <Input
          type="text"
          id="tm-phone"
          placeholder="081234567890"
          bind:value={phone}
        />
      </div>
    </div>

    <div class="field">
      <label for="tm-edu">Pendidikan / Gelar Terakhir</label>
      <Input
        type="text"
        id="tm-edu"
        placeholder="misal: S1 Pendidikan Matematika - UI"
        bind:value={education}
      />
    </div>

    <div class="field">
      <label for="tm-subjects">Keahlian Mata Pelajaran</label>
      <SelectSearch
        id="tm-subjects"
        multiple
        bind:value={selectedSubjectIds}
        placeholder="Pilih mata pelajaran..."
        options={$dbStore.subjects.map((subjectItem) => ({ value: subjectItem.id, label: subjectItem.name }))}
      />
    </div>

    <div class="field">
      <label for="tm-address">Alamat Rumah / Domisili</label>
      <Input
        type="text"
        id="tm-address"
        placeholder="Alamat tempat tinggal tentor..."
        bind:value={address}
      />
    </div>

    <div class="modal-foot pt-3.5 border-t-0">
      <Button variant="outline" on:click={onClose}>
        Batal
      </Button>
      <Button type="submit" variant="primary" icon="save">
        {editingTentor ? 'Simpan Perubahan' : 'Tambah Tentor'}
      </Button>
    </div>
  </form>
</Modal>
