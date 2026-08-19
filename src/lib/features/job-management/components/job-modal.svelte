<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { JobPost, JobType, JobMode } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';

  export let open: boolean = false;
  export let editingJob: JobPost | null = null;
  export let onClose: () => void = () => {};

  let title: string = '';
  let jobType: JobType = 'REGULAR';
  let studentEnrollmentId: string = '';
  let classId: string = '';
  let subjectId: string = '';
  let mode: JobMode = 'OFFLINE';
  let packageId: string = '';
  let preferredDays: string[] = ['Senin', 'Rabu'];
  let preferredTime: string = '16:00';
  let transportAllowance: number = 0;
  let latitude: number | string = -6.2;
  let longitude: number | string = 106.8;
  let additionalNotes: string = '';

  const dayOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  $: enrollments = $dbStore.enrollments.filter((e) => e.deletedAt === null);

  function getEnrollmentLabel(e: any): string {
    const u = $dbStore.users.find((user) => user.id === e.studentId);
    const cls = $dbStore.classes.find((c) => c.id === e.classId);
    const sub = $dbStore.subjects.find((s) => s.id === e.subjectId);
    return `${u?.fullName || 'Siswa'} — ${cls?.className || ''} ${sub?.name || ''}`;
  }

  $: if (editingJob) {
    title = editingJob.title;
    jobType = editingJob.jobType;
    studentEnrollmentId = editingJob.enrollmentId || enrollments[0]?.id || '';
    classId = editingJob.classId;
    subjectId = editingJob.subjectId;
    mode = editingJob.mode || editingJob.jobMode || 'OFFLINE';
    packageId = editingJob.packageId || $dbStore.packages[0]?.id || '';
    preferredDays = editingJob.scheduleDays || ['Senin', 'Rabu'];
    preferredTime = editingJob.scheduleTime || '16:00';
    latitude = editingJob.latitude ?? -6.2;
    longitude = editingJob.longitude ?? 106.8;
    additionalNotes = editingJob.additionalNotes || editingJob.notes || '';
  } else {
    title = '';
    jobType = 'REGULAR';
    studentEnrollmentId = enrollments[0]?.id || '';
    classId = $dbStore.classes.filter((c) => c.deletedAt === null)[0]?.id || '';
    subjectId = $dbStore.subjects.filter((s) => s.deletedAt === null)[0]?.id || '';
    mode = 'OFFLINE';
    packageId = $dbStore.packages.filter((p) => p.deletedAt === null && p.active)[0]?.id || '';
    preferredDays = ['Senin', 'Rabu'];
    preferredTime = '16:00';
    transportAllowance = 0;
    latitude = -6.2;
    longitude = 106.8;
    additionalNotes = '';
  }

  function handleTakeFromStudent() {
    const enr = enrollments.find((e) => e.id === studentEnrollmentId);
    if (enr && enr.latitude && enr.longitude) {
      latitude = enr.latitude;
      longitude = enr.longitude;
      toastStore.success('Lokasi GPS diambil dari data siswa.');
    } else {
      toastStore.error('Pilih siswa terlebih dahulu.');
    }
  }

  function handleToggleDay(d: string) {
    if (preferredDays.includes(d)) {
      preferredDays = preferredDays.filter((day) => day !== d);
    } else {
      preferredDays = [...preferredDays, d];
    }
  }

  function handleSubmit() {
    if (!title.trim() || !studentEnrollmentId || !classId || !subjectId || !packageId) {
      toastStore.error('Semua data wajib diisi.');
      return;
    }

    const selectedEnr = enrollments.find((e) => e.id === studentEnrollmentId);
    const studentUser = selectedEnr ? $dbStore.users.find((u) => u.id === selectedEnr.studentId) : null;
    const selectedPkg = $dbStore.packages.find((p) => p.id === packageId);

    const payload: Partial<JobPost> = {
      id: editingJob ? editingJob.id : undefined,
      title: title.trim(),
      jobType,
      jobMode: mode,
      mode,
      classId,
      subjectId,
      packageId,
      studentId: selectedEnr?.studentId || null,
      enrollmentId: studentEnrollmentId,
      studentName: studentUser?.fullName || 'Siswa',
      scheduleDays: preferredDays,
      scheduleTime: preferredTime,
      schedulePreference: `${preferredDays.join(' & ')} ${preferredTime} WIB`,
      tentorFee: selectedPkg ? selectedPkg.tentorFee : 100000,
      sessionDurationMinutes: 90,
      studentCount: selectedPkg?.mode === 'KELOMPOK' ? selectedPkg.maxStudents : 1,
      location: selectedEnr?.address || 'Lokasi Les',
      latitude: mode === 'ONLINE' ? null : Number(latitude),
      longitude: mode === 'ONLINE' ? null : Number(longitude),
      notes: additionalNotes.trim(),
      additionalNotes: additionalNotes.trim()
    };

    const response = dbStore.saveJobPost(payload as any);
    if (!response.error) {
      toastStore.success(response.message);
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title={editingJob ? 'Ubah Lowongan' : 'Buat Lowongan Les'} icon="add_circle" maxWidth="640px">
  {#if mode !== 'ONLINE'}
    <div id="job-gps-box" style="margin-bottom:14px">
      <div class="quick-actions" style="margin-bottom:8px">
        <Button variant="outline" size="sm" className="bg-primary-soft text-primary border-primary-soft" on:click={handleTakeFromStudent} icon="home_pin">
          Ambil Lokasi dari Siswa
        </Button>
      </div>
      <div id="job-gps-status">
        {#if latitude && longitude}
          <span class="gps-pill gps-ok">
            <Icon name="verified" size="xs" /> Lokasi les terpasang: {latitude}, {longitude}
          </span>
        {:else}
          <span class="gps-pill gps-warn">
            <Icon name="warning" size="xs" /> Koordinat GPS lokasi les wajib diisi
          </span>
        {/if}
      </div>
    </div>
  {/if}

  <form id="form-job" on:submit|preventDefault={handleSubmit}>
    <div class="field">
      <label for="f_title">Judul Lowongan <i class="req">*</i></label>
      <Input
        id="f_title"
        type="text"
        placeholder="cth: Les Privat Matematika Kelas 12 SMA"
        required
        bind:value={title}
      />
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_jobType">Tipe Lowongan <i class="req">*</i></label>
        <select id="f_jobType" required bind:value={jobType}>
          <option value="REGULAR">Reguler</option>
          <option value="TEMPORARY_REPLACEMENT">Pengganti Sementara</option>
        </select>
      </div>

      <div class="field">
        <label for="f_mode">Mode Les <i class="req">*</i></label>
        <select id="f_mode" required bind:value={mode}>
          <option value="OFFLINE">Offline (tatap muka langsung)</option>
          <option value="ONLINE">Online (daring / video call)</option>
        </select>
      </div>
    </div>

    <div class="field">
      <label for="f_studentEnrollmentId">Siswa <i class="req">*</i></label>
      <select id="f_studentEnrollmentId" required bind:value={studentEnrollmentId}>
        <option value="">— Pilih siswa SentraEdu —</option>
        {#each enrollments as e}
          <option value={e.id}>{getEnrollmentLabel(e)}</option>
        {/each}
      </select>
      <div class="help">Private — satu siswa per lowongan.</div>
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
      <label for="f_packageId">Paket Les (mode & harga SPP) <i class="req">*</i></label>
      <select id="f_packageId" required bind:value={packageId}>
        <option value="">— Pilih paket les —</option>
        {#each $dbStore.packages.filter((p) => p.deletedAt === null && p.active) as p}
          <option value={p.id}>{p.name} ({p.mode} · Rp {p.price.toLocaleString('id-ID')})</option>
        {/each}
      </select>
    </div>

    <div class="field">
      <div style="font-size:.82rem;font-weight:600;margin-bottom:5px">
        Hari Preferensi (boleh pilih beberapa) <i class="req">*</i>
      </div>
      <div class="multi-group">
        {#each dayOptions as d}
          <label class="multi-opt">
            <input
              type="checkbox"
              value={d}
              checked={preferredDays.includes(d)}
              on:change={() => handleToggleDay(d)}
            /> {d}
          </label>
        {/each}
      </div>
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_preferredTime">Jam Mulai <i class="req">*</i></label>
        <Input
          id="f_preferredTime"
          type="text"
          placeholder="16:00"
          required
          bind:value={preferredTime}
        />
      </div>

      <div class="field">
        <label for="f_transportAllowance">Tunjangan Transport (Rp/sesi)</label>
        <Input
          id="f_transportAllowance"
          type="number"
          min="0"
          step="5000"
          bind:value={transportAllowance}
        />
      </div>
    </div>

    {#if mode !== 'ONLINE'}
      <div class="form-grid">
        <div class="field">
          <label for="f_latitude">Latitude — Lokasi Les (GPS) <i class="req">*</i></label>
          <Input
            id="f_latitude"
            type="number"
            step="0.000001"
            required
            bind:value={latitude}
          />
        </div>

        <div class="field">
          <label for="f_longitude">Longitude — Lokasi Les (GPS) <i class="req">*</i></label>
          <Input
            id="f_longitude"
            type="number"
            step="0.000001"
            required
            bind:value={longitude}
          />
        </div>
      </div>
    {/if}

    <div class="field">
      <label for="f_additionalNotes">Catatan Tambahan</label>
      <textarea
        id="f_additionalNotes"
        rows="2"
        placeholder="cth: Guru ramah, sabar, fokus UTBK"
        bind:value={additionalNotes}
      ></textarea>
    </div>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={onClose} icon="close">
      Batal
    </Button>
    <Button type="submit" variant="primary" form="form-job" icon="save">
      {editingJob ? 'Simpan Perubahan' : 'Buat Lowongan'}
    </Button>
  </svelte:fragment>
</Modal>
