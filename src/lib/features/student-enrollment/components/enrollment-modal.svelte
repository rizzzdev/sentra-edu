<script lang="ts">
import { userStore, subjectStore, classStore, packageStore } from '$lib/api';
  import { LeafletMap, Modal, SelectSearch } from '$lib/components/molecules';
  import { Icon, Input } from '$lib/components/atoms';
  import {toastStore} from '$lib/shared/stores';
  import type { Enrollment } from '$lib/shared/types';
  import { Button } from '$lib/components/atoms';
  import { api } from '$lib/api/client';

  export let open: boolean = false;
  export let editingEnrollment: Enrollment | null = null;
  export let onClose: () => void = () => {};

  let studentId: string = '';
  let classId: string = '';
  let subjectId: string = '';
  let packageId: string = '';
  let parentName: string = '';
  let parentPhone: string = '';
  let fullAddress: string = '';
  let latitude: number = -6.2;
  let longitude: number = 106.8;

  $: students = $userStore.filter((userItem) => userItem.deletedAt === null && userItem.role === 'STUDENT');

  let previousOpen = false;
  let previousEnrollmentId: string | null = null;

  $: if (open && (!previousOpen || (editingEnrollment?.id !== previousEnrollmentId))) {
    previousOpen = true;
    previousEnrollmentId = editingEnrollment?.id || null;
    if (editingEnrollment) {
      studentId = editingEnrollment.studentId;
      classId = editingEnrollment.classId;
      subjectId = editingEnrollment.subjectId;
      packageId = editingEnrollment.packageId;
      fullAddress = editingEnrollment.address || '';
      latitude = editingEnrollment.latitude || -6.2;
      longitude = editingEnrollment.longitude || 106.8;
    } else {
      studentId = students[0]?.id || '';
      classId = $classStore.filter((classItem) => classItem.deletedAt === null)[0]?.id || '';
      subjectId = $subjectStore.filter((subjectItem) => subjectItem.deletedAt === null)[0]?.id || '';
      packageId = $packageStore.filter((packageItem) => packageItem.deletedAt === null && packageItem.active !== false)[0]?.id || '';
      parentName = '';
      parentPhone = '';
      fullAddress = '';
      latitude = -6.2;
      longitude = 106.8;
    }
  }

  $: if (!open && previousOpen) {
    previousOpen = false;
    previousEnrollmentId = null;
  }

  async function handleSubmit() {
    if (!studentId || !classId || !subjectId || !packageId || !fullAddress.trim()) {
      toastStore.error('Semua data wajib diisi.');
      return;
    }

    const payload = {
      id: editingEnrollment ? editingEnrollment.id : undefined,
      studentId,
      classId,
      subjectId,
      packageId,
      address: fullAddress.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude)
    };

    const response = await api.enrollments.create(payload);
    if (!response.error) {
      toastStore.success(response.message);
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title={editingEnrollment ? 'Ubah Data Murid' : 'Daftarkan Murid'} icon="person_add" maxWidth="600px">
  <form id="form-enrollment" on:submit|preventDefault={handleSubmit}>
    <div class="field">
      <SelectSearch
        id="f_studentId"
        required
        bind:value={studentId}
        options={[
          { value: '', label: '— Pilih akun murid —' },
          ...students.map((userItem) => ({ value: userItem.id, label: `${userItem.fullName} (${userItem.email})` }))
        ]}
      />
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_classId">Kelas <i class="req">*</i></label>
        <SelectSearch
          id="f_classId"
          required
          bind:value={classId}
          options={[
            { value: '', label: '— Pilih kelas —' },
            ...$classStore.filter((classItem) => classItem.deletedAt === null).map((classItem) => ({ value: classItem.id, label: classItem.className }))
          ]}
        />
      </div>

      <div class="field">
        <label for="f_subjectId">Mata Pelajaran <i class="req">*</i></label>
        <SelectSearch
          id="f_subjectId"
          required
          bind:value={subjectId}
          options={[
            { value: '', label: '— Pilih mapel —' },
            ...$subjectStore.filter((subjectItem) => subjectItem.deletedAt === null).map((subjectItem) => ({ value: subjectItem.id, label: subjectItem.name }))
          ]}
        />
      </div>
    </div>

    <div class="field">
      <label for="f_packageId">Paket Les <i class="req">*</i></label>
      <SelectSearch
        id="f_packageId"
        required
        bind:value={packageId}
        options={[
          { value: '', label: '— Pilih paket les —' },
          ...$packageStore.filter((packageItem) => packageItem.deletedAt === null && packageItem.active).map((packageItem) => ({ value: packageItem.id, label: `${packageItem.name} (${packageItem.mode} · Rp ${packageItem.price.toLocaleString('id-ID')})` }))
        ]}
      />
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_parentName">Nama Orang Tua</label>
        <Input
          id="f_parentName"
          type="text"
          placeholder="Nama orang tua"
          bind:value={parentName}
        />
      </div>

      <div class="field">
        <label for="f_parentPhone">Telepon Orang Tua</label>
        <Input
          id="f_parentPhone"
          type="tel"
          placeholder="08xx-xxxx-xxxx"
          bind:value={parentPhone}
        />
      </div>
    </div>

    <div class="field">
      <label for="f_fullAddress">Lokasi & Alamat Rumah Murid <i class="req">*</i></label>
      <div class="mb-2">
        <LeafletMap bind:latitude bind:longitude bind:address={fullAddress} height="240px" />
      </div>
      <div class="space-y-1">
        <label for="f_fullAddress" class="text-xs font-semibold text-muted-fg block">Alamat Lengkap</label>
        <Input
          id="f_fullAddress"
          type="text"
          placeholder="Alamat terisi otomatis dari peta atau ketik manual..."
          required
          bind:value={fullAddress}
        />
      </div>
      <div class="help mt-1 text-xs text-muted-fg">
        Koordinat: {latitude}, {longitude}
      </div>
    </div>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={onClose} icon="close">
      Batal
    </Button>
    <Button type="submit" variant="primary" form="form-enrollment" icon="save">
      {editingEnrollment ? 'Simpan Perubahan' : 'Daftarkan Murid'}
    </Button>
  </svelte:fragment>
</Modal>
