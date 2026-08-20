<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { JobPost, JobMode } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import CurrencyInput from '$lib/components/atoms/currency-input.svelte';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import LeafletMap from '$lib/components/molecules/leaflet-map.svelte';

  export let open: boolean = false;
  export let editingJob: JobPost | null = null;
  export let onClose: () => void = () => {};

  // Form fields
  let title: string = '';
  let packageId: string = '';
  let mode: string = 'OFFLINE';
  let selectedStudentIds: string[] = [];
  let selectedClassIds: string[] = [];
  let selectedSubjectIds: string[] = [];
  let preferredDays: string[] = ['Senin', 'Rabu'];
  let startTime: string = '16:00';
  let endTime: string = '17:30';
  let transportAllowance: number = 0;
  let latitude: number = -6.2;
  let longitude: number = 106.8;
  let description: string = '';

  const dayOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  // Derived data
  $: enrollments = $dbStore.enrollments.filter((e) => e.deletedAt === null);
  $: selectedPackage = $dbStore.packages.find((p) => p.id === packageId);
  $: isGroupMode = selectedPackage?.mode === 'KELOMPOK';

  // Student options (from all active students in database)
  $: studentOptions = $dbStore.users
    .filter((u) => u.deletedAt === null && u.role === 'STUDENT' && u.isActive !== false)
    .map((u) => {
      const studentEnrollment = enrollments.find((e) => e.studentId === u.id);
      const cls = studentEnrollment ? $dbStore.classes.find((c) => c.id === studentEnrollment.classId) : null;
      const sub = studentEnrollment ? $dbStore.subjects.find((s) => s.id === studentEnrollment.subjectId) : null;
      const extra = cls && sub ? ` — ${cls.className} (${sub.name})` : u.school ? ` — ${u.school}` : u.email ? ` — ${u.email}` : '';
      return {
        value: u.id,
        label: `${u.fullName}${extra}`
      };
    });

  $: classOptions = $dbStore.classes
    .filter((c) => c.deletedAt === null)
    .map((c) => ({ value: c.id, label: c.className }));

  $: subjectOptions = $dbStore.subjects
    .filter((s) => s.deletedAt === null)
    .map((s) => ({ value: s.id, label: s.name }));

  $: daySelectOptions = dayOptions.map((d) => ({ value: d, label: d }));

  // Initialize from editing job
  $: if (editingJob) {
    title = editingJob.title;
    packageId = editingJob.packageId || '';
    mode = editingJob.mode || editingJob.jobMode || 'OFFLINE';
    selectedStudentIds = (editingJob as any).studentIds && (editingJob as any).studentIds.length > 0
      ? (editingJob as any).studentIds
      : (editingJob.studentId ? [editingJob.studentId] : []);
    selectedClassIds = (editingJob as any).classIds && (editingJob as any).classIds.length > 0
      ? (editingJob as any).classIds
      : (editingJob.classId ? [editingJob.classId] : []);
    selectedSubjectIds = (editingJob as any).subjectIds && (editingJob as any).subjectIds.length > 0
      ? (editingJob as any).subjectIds
      : (editingJob.subjectId ? [editingJob.subjectId] : []);
    preferredDays = editingJob.scheduleDays || ['Senin', 'Rabu'];
    startTime = editingJob.scheduleTime || '16:00';
    endTime = (editingJob as any).scheduleEndTime || '17:30';
    transportAllowance = (editingJob as any).transportAllowance || 0;
    latitude = editingJob.latitude ?? -6.2;
    longitude = editingJob.longitude ?? 106.8;
    description = editingJob.additionalNotes || editingJob.notes || '';
  } else {
    resetForm();
  }

  function resetForm() {
    title = '';
    packageId = $dbStore.packages.filter((p) => p.deletedAt === null && p.active)[0]?.id || '';
    mode = 'OFFLINE';
    selectedStudentIds = [];
    selectedClassIds = [];
    selectedSubjectIds = [];
    preferredDays = ['Senin', 'Rabu'];
    startTime = '16:00';
    endTime = '17:30';
    transportAllowance = 0;
    latitude = -6.2;
    longitude = 106.8;
    description = '';
  }

  function handleTakeFromStudent() {
    if (selectedStudentIds.length === 0) {
      toastStore.error('Pilih murid terlebih dahulu.');
      return;
    }
    const studentId = selectedStudentIds[0];
    const enr = enrollments.find((e) => e.studentId === studentId);
    const stu = $dbStore.users.find((u) => u.id === studentId);
    const lat = enr?.latitude ?? (stu as any)?.latitude;
    const lng = enr?.longitude ?? (stu as any)?.longitude;
    if (lat && lng) {
      latitude = lat;
      longitude = lng;
      toastStore.success('Lokasi GPS diambil dari data murid.');
    } else if (stu?.address || enr?.address) {
      toastStore.info(`Alamat murid: ${stu?.address || enr?.address}. Silakan gunakan pencarian pada peta.`);
    } else {
      toastStore.error('Data koordinat GPS murid belum tersedia.');
    }
  }

  function handleSubmit() {
    if (!title.trim()) {
      toastStore.error('Judul lowongan wajib diisi.');
      return;
    }
    if (!packageId) {
      toastStore.error('Paket les wajib dipilih.');
      return;
    }
    if (selectedStudentIds.length === 0) {
      toastStore.error('Pilih minimal satu murid.');
      return;
    }
    if (selectedClassIds.length === 0) {
      toastStore.error('Pilih minimal satu kelas.');
      return;
    }
    if (selectedSubjectIds.length === 0) {
      toastStore.error('Pilih minimal satu mata pelajaran.');
      return;
    }
    if (preferredDays.length === 0) {
      toastStore.error('Pilih minimal satu hari.');
      return;
    }

    const studentUsers = selectedStudentIds
      .map((id) => $dbStore.users.find((u) => u.id === id))
      .filter(Boolean) as any[];
    const studentNames = studentUsers.map((u) => u.fullName).join(', ');
    const firstStudentId = selectedStudentIds[0] || null;
    const selectedEnr = enrollments.find((e) => e.studentId === firstStudentId);

    const payload: Partial<JobPost> = {
      id: editingJob ? editingJob.id : undefined,
      title: title.trim(),
      jobMode: mode as JobMode,
      mode: mode as JobMode,
      classId: selectedClassIds[0],
      subjectId: selectedSubjectIds[0],
      packageId,
      studentId: firstStudentId,
      enrollmentId: selectedEnr?.id || null,
      studentName: studentNames || 'Murid',
      scheduleDays: preferredDays,
      scheduleTime: startTime,
      schedulePreference: `${preferredDays.join(', ')} ${startTime}–${endTime} WIB`,
      tentorFee: selectedPackage ? selectedPackage.tentorFee : 100000,
      sessionDurationMinutes: calculateDuration(startTime, endTime),
      studentCount: selectedStudentIds.length,
      location: selectedEnr?.address || studentUsers[0]?.address || 'Lokasi Les',
      latitude: mode === 'ONLINE' ? null : latitude,
      longitude: mode === 'ONLINE' ? null : longitude,
      notes: description.trim(),
      additionalNotes: description.trim()
    } as any;

    // Add multi-select fields
    (payload as any).classIds = selectedClassIds;
    (payload as any).subjectIds = selectedSubjectIds;
    (payload as any).studentIds = selectedStudentIds;
    (payload as any).studentNames = studentUsers.map((u) => u.fullName);
    (payload as any).transportAllowance = transportAllowance;
    (payload as any).scheduleEndTime = endTime;

    const response = dbStore.saveJobPost(payload as any);
    if (!response.error) {
      toastStore.success(response.message);
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }

  function calculateDuration(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  }
</script>

<Modal {open} {onClose} title={editingJob ? 'Ubah Lowongan' : 'Buat Lowongan Les'} icon="add_circle" maxWidth="680px">
  <form id="form-job" on:submit|preventDefault={handleSubmit}>
    <!-- 1. Judul -->
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

    <!-- 2. Paket Les -->
    <div class="field">
      <label for="f_packageId">Paket Les <i class="req">*</i></label>
      <SelectSearch
        id="f_packageId"
        required
        bind:value={packageId}
        options={[
          { value: '', label: '— Pilih paket les —' },
          ...$dbStore.packages.filter((p) => p.deletedAt === null && p.active).map(p => ({
            value: p.id,
            label: `${p.name} (${p.mode} · Rp ${p.price.toLocaleString('id-ID')})`
          }))
        ]}
      />
    </div>

    <!-- 3. Mode Les -->
    <div class="field">
      <label for="f_mode">Mode Les <i class="req">*</i></label>
      <SelectSearch
        id="f_mode"
        required
        bind:value={mode}
        options={[
          { value: 'OFFLINE', label: 'Offline (tatap muka langsung)' },
          { value: 'ONLINE', label: 'Online (daring / video call)' }
        ]}
      />
    </div>

    <!-- 4. Siswa (Multi-select by default) -->
    <div class="field">
      <label for="f_students">
        Siswa <i class="req">*</i>
        <span class="help-inline">(bisa pilih satu atau lebih murid)</span>
      </label>
      <SelectSearch
        id="f_students"
        required
        multiple={true}
        bind:value={selectedStudentIds}
        placeholder="— Pilih satu atau lebih siswa —"
        searchable={true}
        options={studentOptions}
      />
    </div>

    <!-- 5. Kelas (multiple) -->
    <div class="field">
      <label for="f_classes">
        Kelas <i class="req">*</i>
        <span class="help-inline">(bisa pilih satu atau lebih kelas)</span>
      </label>
      <SelectSearch
        id="f_classes"
        required
        multiple={true}
        bind:value={selectedClassIds}
        placeholder="— Pilih satu atau lebih kelas —"
        searchable={true}
        options={classOptions}
      />
    </div>

    <!-- 6. Mata Pelajaran (multiple) -->
    <div class="field">
      <label for="f_subjects">
        Mata Pelajaran <i class="req">*</i>
        <span class="help-inline">(bisa pilih satu atau lebih mata pelajaran)</span>
      </label>
      <SelectSearch
        id="f_subjects"
        required
        multiple={true}
        bind:value={selectedSubjectIds}
        placeholder="— Pilih satu atau lebih mata pelajaran —"
        searchable={true}
        options={subjectOptions}
      />
    </div>

    <!-- 7. Hari (multiple dropdown) -->
    <div class="field">
      <label for="f_days">Hari <i class="req">*</i></label>
      <SelectSearch
        id="f_days"
        required
        multiple={true}
        bind:value={preferredDays}
        placeholder="— Pilih hari —"
        options={daySelectOptions}
      />
    </div>

    <!-- 8. Jam Mulai & Jam Berakhir -->
    <div class="form-grid">
      <div class="field">
        <label for="f_startTime">Jam Mulai <i class="req">*</i></label>
        <Input
          id="f_startTime"
          type="time"
          required
          bind:value={startTime}
        />
      </div>

      <div class="field">
        <label for="f_endTime">Jam Berakhir <i class="req">*</i></label>
        <Input
          id="f_endTime"
          type="time"
          required
          bind:value={endTime}
        />
      </div>
    </div>

    <!-- 9. Tunjangan Transport -->
    <div class="field">
      <label for="f_transport">Tunjangan Transport (Rp/sesi)</label>
      <CurrencyInput
        id="f_transport"
        bind:value={transportAllowance}
      />
    </div>

    <!-- 10. Lokasi (Leaflet) -->
    {#if mode !== 'ONLINE'}
      <div class="field">
        <label for="f_map">Lokasi Les <i class="req">*</i></label>
        <div class="quick-actions" style="margin-bottom:8px">
          <Button variant="outline" size="sm" className="bg-primary-soft text-primary border-primary-soft" on:click={handleTakeFromStudent} icon="home_pin">
            Ambil Lokasi dari Murid
          </Button>
        </div>
        <LeafletMap bind:latitude bind:longitude height="280px" />
        <div class="help" style="margin-top:6px">
          Koordinat: {latitude}, {longitude}
        </div>
      </div>
    {/if}

    <!-- 11. Deskripsi -->
    <div class="field">
      <label for="f_description">Deskripsi</label>
      <textarea
        id="f_description"
        rows="3"
        placeholder="cth: Guru ramah, sabar, fokus UTBK. Lokasi dekat tol."
        bind:value={description}
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

<style>
  .help-inline {
    font-weight: 400;
    font-size: 0.78rem;
    color: var(--color-fg-muted);
    margin-left: 4px;
  }
</style>
