<script lang="ts">
import { userStore } from '$lib/api';
  import { Input } from '$lib/components/atoms';
  import { SelectSearch } from '$lib/components/molecules';
  import Modal from '$lib/components/molecules/modal.svelte';
  import {toastStore} from '$lib/shared/stores';
  import type { User } from '$lib/shared/types';
  import { Button } from '$lib/components/atoms';
  import { StudentMasterSchema } from '$lib/features/student-enrollment';
  import { api } from '$lib/api/client';
  import { ZodError } from 'zod';

  let {
    open = false,
    editingStudent = null,
    onClose = () => {}
  }: {
    open?: boolean;
    editingStudent?: User | null;
    onClose?: () => void;
  } = $props();

  let fullName = $state('');
  let email = $state('');
  let phone = $state('');
  let school = $state('');
  let address = $state('');
  let parentId = $state('');

  let parentList = $derived($userStore.filter((userItem) => userItem.deletedAt === null && userItem.role === 'PARENT'));

  $effect(() => {
    if (open) {
      if (editingStudent) {
        fullName = editingStudent.fullName;
        email = editingStudent.email;
        phone = editingStudent.phone || '';
        school = editingStudent.school || '';
        address = editingStudent.address || '';
        parentId = editingStudent.parentId || '';
      } else {
        fullName = '';
        email = '';
        phone = '';
        school = '';
        address = '';
        parentId = '';
      }
    }
  });

  async function handleSubmit() {
    try {
      const payload = StudentMasterSchema.parse({
        id: editingStudent ? editingStudent.id : undefined,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        school: school.trim(),
        address: address.trim(),
        parentId: parentId || undefined,
      });

      const response = await api.users.create({
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
  title={editingStudent ? 'Ubah Data Murid' : 'Tambah Data Murid'}
  {onClose}
>
  <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="flex flex-col gap-5 py-2">
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
        <label for="sm-parent">Orang Tua (Master)</label>
        <SelectSearch
          id="sm-parent"
          bind:value={parentId}
          placeholder="-- Tanpa Orang Tua / Belum Ditautkan --"
          options={parentList.map((parentUser) => ({ value: parentUser.id, label: `${parentUser.fullName} (${parentUser.phone || parentUser.email})` }))}
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

    <div class="modal-foot pt-3.5 border-t-0">
      <Button variant="outline" onclick={onClose}>
        Batal
      </Button>
      <Button type="submit" variant="primary" icon="save">
        {editingStudent ? 'Simpan Perubahan' : 'Tambah Murid'}
      </Button>
    </div>
  </form>
</Modal>
