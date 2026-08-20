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
  import { DAY_OPTIONS, getScheduleDaysList } from '$lib/shared/utils/status-map';

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
  let preferredDays: string[] = ['MONDAY', 'WEDNESDAY'];
  let startTime: string = '16:00';
  let endTime: string = '17:30';
  let transportAllowance: number = 0;
  let location: string = '';
  let latitude: number = -6.2;
  let longitude: number = 106.8;
  let description: string = '';

  // Derived data
  $: enrollments = $dbStore.enrollments.filter((enrollmentItem) => enrollmentItem.deletedAt === null);
  $: selectedPackage = $dbStore.packages.find((packageItem) => packageItem.id === packageId);
  $: isGroupMode = selectedPackage?.mode === 'KELOMPOK';

  // Package options
  $: packageOptions = [
    { value: '', label: '— Pilih paket les —' },
    ...$dbStore.packages
      .filter((packageItem) => packageItem.deletedAt === null && packageItem.active !== false)
      .map((packageItem) => ({
        value: packageItem.id,
        label: `${packageItem.name} (${packageItem.mode === 'PRIVATE' ? 'Privat' : 'Kelompok'} · Rp ${packageItem.price.toLocaleString('id-ID')})`
      }))
  ];

  // Student options (from all active students in database)
  $: studentOptions = $dbStore.users
    .filter((userItem) => userItem.deletedAt === null && userItem.role === 'STUDENT' && userItem.isActive !== false)
    .map((userItem) => {
      const studentEnrollment = enrollments.find((enrollmentItem) => enrollmentItem.studentId === userItem.id);
      const cls = studentEnrollment ? $dbStore.classes.find((classItem) => classItem.id === studentEnrollment.classId) : null;
      const sub = studentEnrollment ? $dbStore.subjects.find((subjectItem) => subjectItem.id === studentEnrollment.subjectId) : null;
      const extra = cls && sub ? ` — ${cls.className} (${sub.name})` : userItem.school ? ` — ${userItem.school}` : userItem.email ? ` — ${userItem.email}` : '';
      return {
        value: userItem.id,
        label: `${userItem.fullName}${extra}`
      };
    });

  $: classOptions = $dbStore.classes
    .filter((classItem) => classItem.deletedAt === null)
    .map((classItem) => ({ value: classItem.id, label: classItem.className }));

  $: subjectOptions = $dbStore.subjects
    .filter((subjectItem) => subjectItem.deletedAt === null)
    .map((subjectItem) => ({ value: subjectItem.id, label: subjectItem.name }));

  let previousOpen = false;
  let previousJobId: string | null = null;

  // Initialize form ONLY when modal opens or when editingJob ID changes
  $: if (open && (!previousOpen || (editingJob?.id !== previousJobId))) {
    previousOpen = true;
    previousJobId = editingJob?.id || null;
    if (editingJob) {
      title = editingJob.title || '';
      packageId = editingJob.packageId || '';
      mode = editingJob.mode || editingJob.jobMode || 'OFFLINE';
      selectedStudentIds = editingJob.studentIds && editingJob.studentIds.length > 0
        ? editingJob.studentIds
        : (editingJob.studentId ? [editingJob.studentId] : []);
      selectedClassIds = editingJob.classIds && editingJob.classIds.length > 0
        ? editingJob.classIds
        : (editingJob.classId ? [editingJob.classId] : []);
      selectedSubjectIds = editingJob.subjectIds && editingJob.subjectIds.length > 0
        ? editingJob.subjectIds
        : (editingJob.subjectId ? [editingJob.subjectId] : []);
      preferredDays = editingJob.scheduleDays && editingJob.scheduleDays.length > 0
        ? editingJob.scheduleDays
        : ['MONDAY', 'WEDNESDAY'];
      startTime = editingJob.scheduleTime || '16:00';
      endTime = editingJob.scheduleEndTime || '17:30';
      transportAllowance = editingJob.transportAllowance || 0;
      location = editingJob.location || '';
      latitude = editingJob.latitude ?? -6.2;
      longitude = editingJob.longitude ?? 106.8;
      description = editingJob.additionalNotes || editingJob.notes || '';
    } else {
      resetForm();
    }
  }

  $: if (!open && previousOpen) {
    previousOpen = false;
    previousJobId = null;
  }

  function resetForm() {
    title = '';
    const activePackages = $dbStore.packages.filter((pkg) => pkg.deletedAt === null && pkg.active !== false);
    packageId = activePackages[0]?.id || '';
    mode = 'OFFLINE';
    selectedStudentIds = [];
    selectedClassIds = [];
    selectedSubjectIds = [];
    preferredDays = ['MONDAY', 'WEDNESDAY'];
    startTime = '16:00';
    endTime = '17:30';
    transportAllowance = 0;
    location = '';
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
    const enrollment = enrollments.find((enr) => enr.studentId === studentId);
    const studentUser = $dbStore.users.find((user) => user.id === studentId);
    const studentLat = enrollment?.latitude ?? studentUser?.latitude;
    const studentLng = enrollment?.longitude ?? studentUser?.longitude;
    if (studentLat && studentLng) {
      latitude = studentLat;
      longitude = studentLng;
      location = studentUser?.address || enrollment?.address || '';
      toastStore.success('Lokasi GPS dan alamat diambil dari data murid.');
    } else if (studentUser?.address || enrollment?.address) {
      location = studentUser?.address || enrollment?.address || '';
      toastStore.info(`Alamat murid: ${location}. Silakan gunakan pencarian pada peta.`);
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
      .map((studentId) => $dbStore.users.find((user) => user.id === studentId))
      .filter((user): user is NonNullable<typeof user> => user !== undefined && user !== null);
    const studentNames = studentUsers.map((user) => user.fullName).join(', ');
    const firstStudentId = selectedStudentIds[0] || null;
    const selectedEnrollment = enrollments.find((enr) => enr.studentId === firstStudentId);

    const payload: Partial<JobPost> = {
      id: editingJob ? editingJob.id : undefined,
      title: title.trim(),
      jobMode: mode as JobMode,
      mode: mode as JobMode,
      classId: selectedClassIds[0],
      classIds: selectedClassIds,
      subjectId: selectedSubjectIds[0],
      subjectIds: selectedSubjectIds,
      packageId,
      studentId: firstStudentId,
      studentIds: selectedStudentIds,
      studentName: studentNames || 'Murid',
      studentNames: studentUsers.map((user) => user.fullName),
      enrollmentId: selectedEnrollment?.id || null,
      scheduleDays: preferredDays,
      scheduleTime: startTime,
      scheduleEndTime: endTime,
      schedulePreference: `${getScheduleDaysList(preferredDays).join(', ')} ${startTime}–${endTime} WIB`,
      tentorFee: selectedPackage ? selectedPackage.tentorFee : 100000,
      transportAllowance,
      sessionDurationMinutes: calculateDuration(startTime, endTime),
      studentCount: selectedStudentIds.length,
      location: location.trim() || selectedEnrollment?.address || studentUsers[0]?.address || 'Lokasi Les',
      latitude: mode === 'ONLINE' ? null : latitude,
      longitude: mode === 'ONLINE' ? null : longitude,
      notes: description.trim(),
      additionalNotes: description.trim()
    };

    const response = dbStore.saveJobPost(payload);
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
        placeholder="— Pilih paket les —"
        options={packageOptions}
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
        options={DAY_OPTIONS}
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
        <div class="quick-actions mb-2">
          <Button variant="outline" size="sm" className="bg-primary-soft text-primary border-primary-soft" on:click={handleTakeFromStudent} icon="home_pin">
            Ambil Lokasi dari Murid
          </Button>
        </div>
        <LeafletMap bind:latitude bind:longitude bind:address={location} height="280px" />
        <div class="mt-2 space-y-1">
          <label for="f_loc_text" class="text-xs font-semibold text-muted-fg block">Alamat / Patokan Lokasi</label>
          <Input
            id="f_loc_text"
            type="text"
            placeholder="Alamat terisi otomatis saat pin digeser atau dapat diedit manual..."
            bind:value={location}
          />
        </div>
        <div class="help mt-1.5">
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
