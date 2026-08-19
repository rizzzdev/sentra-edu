<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { Enrollment } from '$lib/shared/types/common.types';

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

  $: students = $dbStore.users.filter((u) => u.deletedAt === null && u.role === 'STUDENT');

  $: if (editingEnrollment) {
    studentId = editingEnrollment.studentId;
    classId = editingEnrollment.classId;
    subjectId = editingEnrollment.subjectId;
    packageId = editingEnrollment.packageId;
    fullAddress = editingEnrollment.address || '';
    latitude = editingEnrollment.latitude || -6.2;
    longitude = editingEnrollment.longitude || 106.8;
  } else {
    studentId = students[0]?.id || '';
    classId = $dbStore.classes.filter((c) => c.deletedAt === null)[0]?.id || '';
    subjectId = $dbStore.subjects.filter((s) => s.deletedAt === null)[0]?.id || '';
    packageId = $dbStore.packages.filter((p) => p.deletedAt === null && p.active)[0]?.id || '';
    parentName = '';
    parentPhone = '';
    fullAddress = '';
    latitude = -6.2;
    longitude = 106.8;
  }

  function handleSubmit() {
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

    const response = dbStore.saveEnrollment(payload as any);
    if (!response.error) {
      toastStore.success(response.message);
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title={editingEnrollment ? 'Ubah Data Siswa' : 'Daftarkan Siswa'} icon="person_add" maxWidth="600px">
  <form id="form-enrollment" on:submit|preventDefault={handleSubmit}>
    <div class="field">
      <label for="f_studentId">Akun Siswa <i class="req">*</i></label>
      <select id="f_studentId" required bind:value={studentId}>
        <option value="">— Pilih akun siswa —</option>
        {#each students as u}
          <option value={u.id}>{u.fullName} ({u.email})</option>
        {/each}
      </select>
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_classId">Kelas <i class="req">*</i></label>
        <select id="f_classId" required bind:value={classId}>
          <option value="">— Pilih kelas —</option>
          {#each $dbStore.classes.filter((c) => c.deletedAt === null) as c}
            <option value={c.id}>{c.className}</option>
          {/each}
        </select>
      </div>

      <div class="field">
        <label for="f_subjectId">Mata Pelajaran <i class="req">*</i></label>
        <select id="f_subjectId" required bind:value={subjectId}>
          <option value="">— Pilih mapel —</option>
          {#each $dbStore.subjects.filter((s) => s.deletedAt === null) as s}
            <option value={s.id}>{s.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="field">
      <label for="f_packageId">Paket Les <i class="req">*</i></label>
      <select id="f_packageId" required bind:value={packageId}>
        <option value="">— Pilih paket les —</option>
        {#each $dbStore.packages.filter((p) => p.deletedAt === null && p.active) as p}
          <option value={p.id}>{p.name} ({p.mode} · Rp {p.price.toLocaleString('id-ID')})</option>
        {/each}
      </select>
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_parentName">Nama Wali</label>
        <input
          id="f_parentName"
          type="text"
          placeholder="Nama orang tua / wali"
          bind:value={parentName}
        />
      </div>

      <div class="field">
        <label for="f_parentPhone">Telepon Wali</label>
        <input
          id="f_parentPhone"
          type="tel"
          placeholder="08xx-xxxx-xxxx"
          bind:value={parentPhone}
        />
      </div>
    </div>

    <div class="field">
      <label for="f_fullAddress">Alamat Rumah (lokasi les) <i class="req">*</i></label>
      <input
        id="f_fullAddress"
        type="text"
        placeholder="Alamat lengkap rumah siswa"
        required
        bind:value={fullAddress}
      />
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_latitude">Latitude <i class="req">*</i></label>
        <input
          id="f_latitude"
          type="number"
          step="0.0001"
          required
          bind:value={latitude}
        />
      </div>

      <div class="field">
        <label for="f_longitude">Longitude <i class="req">*</i></label>
        <input
          id="f_longitude"
          type="number"
          step="0.0001"
          required
          bind:value={longitude}
        />
      </div>
    </div>
  </form>

  <svelte:fragment slot="footer">
    <button type="button" class="btn btn-outline" on:click={onClose}>
      <Icon name="close" size="sm" /> Batal
    </button>
    <button type="submit" form="form-enrollment" class="btn btn-primary">
      <Icon name="save" size="sm" /> {editingEnrollment ? 'Simpan Perubahan' : 'Daftarkan Siswa'}
    </button>
  </svelte:fragment>
</Modal>
