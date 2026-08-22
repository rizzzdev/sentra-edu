<script lang="ts">
import { userStore, subjectStore, classStore, enrollmentStore, jobStore } from '$lib/api';
  import { LeafletMap } from '$lib/components/molecules';
  import { Icon, Input } from '$lib/components/atoms';
  import Modal from '$lib/components/molecules/modal.svelte';
  import {toastStore} from '$lib/shared/stores';
  import type { User, JobPost, Enrollment } from '$lib/shared/types';
  import { Button } from '$lib/components/atoms';
  import { SelectSearch } from '$lib/components/molecules';
  import { api } from '$lib/api/client';

  let {
    open = false,
    tentor,
    onClose = () => {}
  }: {
    open?: boolean;
    tentor: User;
    onClose?: () => void;
  } = $props();

  interface JobOptionItem {
    id: string;
    enrollmentId?: string;
    job: JobPost | null;
    enrollment: Enrollment | null;
    label: string;
    isOffline: boolean;
    location: string;
    latitude: number;
    longitude: number;
    scheduleTime: string;
    scheduleEndTime: string;
    subjectIds: string[];
    classIds: string[];
    studentIds: string[];
    studentNames: string[];
  }

  let tentorJobOptions = $derived((() => {
    const list: JobOptionItem[] = [];
    const seenJobIds = new Set<string>();

    const assignedJobs = $jobStore.filter(
      (jobItem) => jobItem.deletedAt === null && jobItem.assignedTentorId === tentor.id && jobItem.status === 'ASSIGNED'
    );

    for (const job of assignedJobs) {
      seenJobIds.add(job.id);

      const subjectIds = Array.isArray(job.subjectIds) && job.subjectIds.length > 0
        ? job.subjectIds
        : (job.subjectId ? [job.subjectId] : []);

      const classIds = Array.isArray(job.classIds) && job.classIds.length > 0
        ? job.classIds
        : (job.classId ? [job.classId] : []);

      const studentIds = Array.isArray(job.studentIds) && job.studentIds.length > 0
        ? job.studentIds
        : (job.studentId ? [job.studentId] : []);
      const studentNames = Array.isArray(job.studentNames) && job.studentNames.length > 0
        ? job.studentNames
        : ($userStore.filter((userItem) => studentIds.includes(userItem.id)).map((userItem) => userItem.fullName));

      const isOfflineMode = Boolean(job.location && !job.location.toLowerCase().includes('online'));

      list.push({
        id: job.id,
        enrollmentId: job.enrollmentId || undefined,
        job,
        enrollment: null,
        label: `${job.title || 'Lowongan'}${studentNames.length > 0 ? ` (${studentNames.join(', ')})` : ''}`,
        isOffline: isOfflineMode,
        location: job.location || '',
        latitude: job.latitude ?? -6.2,
        longitude: job.longitude ?? 106.8,
        scheduleTime: job.scheduleTime || '09:00',
        scheduleEndTime: job.scheduleEndTime || '10:30',
        subjectIds,
        classIds,
        studentIds,
        studentNames
      });
    }

    const directEnrollments = $enrollmentStore.filter(
      (enrollmentItem) => enrollmentItem.deletedAt === null && enrollmentItem.tentorId === tentor.id && enrollmentItem.status === 'ACTIVE'
    );
    for (const enr of directEnrollments) {
      if (enr.id && seenJobIds.has(enr.id)) continue;
      const student = $userStore.find((userItem) => userItem.id === enr.studentId);
      const isOfflineMode = Boolean(enr.latitude !== null && enr.longitude !== null);

      list.push({
        id: enr.id,
        enrollmentId: enr.id,
        job: null,
        enrollment: enr,
        label: `${student?.fullName || 'Murid'} (Privat)`,
        isOffline: isOfflineMode,
        location: enr.address || '',
        latitude: enr.latitude ?? -6.2,
        longitude: enr.longitude ?? 106.8,
        scheduleTime: enr.scheduleTime || '09:00',
        scheduleEndTime: '10:30',
        subjectIds: enr.subjectId ? [enr.subjectId] : [],
        classIds: enr.classId ? [enr.classId] : [],
        studentIds: enr.studentId ? [enr.studentId] : [],
        studentNames: student ? [student.fullName] : []
      });
    }

    return list;
  })());

  let selectedJobId = $state('');
  let selectedSubjectIds = $state<string[]>([]);
  let selectedClassIds = $state<string[]>([]);
  let selectedStudentIds = $state<string[]>([]);
  let sessionDate = $state(new Date().toISOString().split('T')[0]);
  let startTime = $state('09:00');
  let endTime = $state('10:30');
  let topicTaught = $state('');
  let activityNotes = $state('');
  let latitudeCheckIn = $state(-6.2);
  let longitudeCheckIn = $state(106.8);
  let isFetchingGps = $state(false);
  let hasGpsDevice = $state(false);

  $effect(() => {
    if (tentorJobOptions.length > 0 && !selectedJobId) {
      selectedJobId = tentorJobOptions[0].id;
    }
  });

  let currentJobOption = $derived(tentorJobOptions.find((jobOption) => jobOption.id === selectedJobId) || null);

  let lastLoadedJobId = $state('');
  $effect(() => {
    if (currentJobOption && currentJobOption.id !== lastLoadedJobId) {
      lastLoadedJobId = currentJobOption.id;
      selectedSubjectIds = [...currentJobOption.subjectIds];
      selectedClassIds = [...currentJobOption.classIds];
      selectedStudentIds = currentJobOption.studentIds.length > 0
        ? [...currentJobOption.studentIds]
        : (currentJobOption.studentNames.length > 0 ? [...currentJobOption.studentNames] : []);
      
      if (currentJobOption.scheduleTime) startTime = currentJobOption.scheduleTime;
      if (currentJobOption.scheduleEndTime) endTime = currentJobOption.scheduleEndTime;
      
      latitudeCheckIn = currentJobOption.latitude;
      longitudeCheckIn = currentJobOption.longitude;
      hasGpsDevice = false;
    }
  });

  let subjectOptions = $derived((() => {
    if (!currentJobOption) return [];
    if (currentJobOption.subjectIds.length > 0) {
      return $subjectStore
        .filter((subjectItem) => currentJobOption?.subjectIds.includes(subjectItem.id))
        .map((subjectItem) => ({ value: subjectItem.id, label: subjectItem.name }));
    }
    return $subjectStore.map((subjectItem) => ({ value: subjectItem.id, label: subjectItem.name }));
  })());

  let classOptions = $derived((() => {
    if (!currentJobOption) return [];
    if (currentJobOption.classIds.length > 0) {
      return $classStore
        .filter((classItem) => currentJobOption?.classIds.includes(classItem.id))
        .map((classItem) => ({ value: classItem.id, label: classItem.className }));
    }
    return $classStore.map((classItem) => ({ value: classItem.id, label: classItem.className }));
  })());

  let studentOptions = $derived((() => {
    if (!currentJobOption) return [];
    if (currentJobOption.studentIds.length > 0) {
      return $userStore
        .filter((userItem) => currentJobOption?.studentIds.includes(userItem.id))
        .map((userItem) => ({ value: userItem.id, label: userItem.fullName }));
    }
    if (currentJobOption.studentNames.length > 0) {
      return currentJobOption.studentNames.map((name) => ({ value: name, label: name }));
    }
    return [];
  })());

  function time24ToMin(timeString: string): number | null {
    const match = /^([01][0-9]|2[0-3]):([0-5][0-9])$/.exec(String(timeString || '').trim());
    return match ? +match[1] * 60 + +match[2] : null;
  }

  let durationMinutes = $derived((() => {
    const startMinutes = time24ToMin(startTime);
    const endMinutes = time24ToMin(endTime);
    if (startMinutes === null || endMinutes === null || startMinutes === endMinutes) return 90;
    return endMinutes > startMinutes ? endMinutes - startMinutes : endMinutes - startMinutes + 1440;
  })());

  let sessionsCount = $derived(Math.round((durationMinutes / 90) * 10) / 10);

  function handleGetGps() {
    if (!navigator.geolocation) {
      toastStore.error('Browser tidak mendukung akses GPS.');
      return;
    }
    isFetchingGps = true;
    toastStore.info('Mengakses GPS perangkat...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latitudeCheckIn = Number(pos.coords.latitude.toFixed(6));
        longitudeCheckIn = Number(pos.coords.longitude.toFixed(6));
        hasGpsDevice = true;
        isFetchingGps = false;
        toastStore.success('Lokasi GPS perangkat berhasil didapat.');
      },
      () => {
        isFetchingGps = false;
        toastStore.error('Izin lokasi perangkat ditolak atau tidak tersedia. Mohon izinkan akses lokasi di browser.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit() {
    if (!currentJobOption) {
      toastStore.error('Pilih lowongan les terlebih dahulu.');
      return;
    }
    if (selectedSubjectIds.length === 0) {
      toastStore.error('Pilih minimal satu mata pelajaran.');
      return;
    }
    if (selectedClassIds.length === 0) {
      toastStore.error('Pilih minimal satu kelas/jenjang.');
      return;
    }
    if (currentJobOption.isOffline && !hasGpsDevice) {
      toastStore.error('Silakan klik "Ambil GPS Perangkat" untuk mencatat lokasi kehadiran Anda.');
      return;
    }
    if (!topicTaught.trim()) {
      toastStore.error('Topik materi wajib diisi.');
      return;
    }

    const studentNamesResolved: string[] = [];
    const studentIdsResolved: string[] = [];

    for (const val of selectedStudentIds) {
      const userFound = $userStore.find((userItem) => userItem.id === val);
      if (userFound) {
        studentIdsResolved.push(userFound.id);
        studentNamesResolved.push(userFound.fullName);
      } else {
        studentNamesResolved.push(val);
      }
    }

    const payload = {
      jobId: currentJobOption.job ? currentJobOption.job.id : undefined,
      enrollmentId: currentJobOption.enrollmentId || undefined,
      tentorId: tentor.id,
      subjectIds: selectedSubjectIds,
      classIds: selectedClassIds,
      studentIds: studentIdsResolved,
      studentNames: studentNamesResolved,
      sessionDate,
      startTime: `${sessionDate}T${startTime}:00.000Z`,
      endTime: `${sessionDate}T${endTime}:00.000Z`,
      durationMinutes,
      sessionsCount,
      topic: topicTaught.trim(),
      studentNotes: activityNotes.trim(),
      latitudeCheckIn: currentJobOption.isOffline ? Number(latitudeCheckIn) : null,
      longitudeCheckIn: currentJobOption.isOffline ? Number(longitudeCheckIn) : null,
      isRadiusValid: true
    };

    const response = await api.attendances.create(payload);
    if (!response.error) {
      toastStore.success('Presensi les berhasil dikirim untuk verifikasi admin.');
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title="Check-in Presensi" icon="location_on" maxWidth="max-w-2xl">
  <form id="form-checkin" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
    <div class="field">
      <label for="f_job">Data Lowongan <i class="req">*</i></label>
      <SelectSearch
        id="f_job"
        required
        bind:value={selectedJobId}
        options={tentorJobOptions.map((jobOption) => ({ value: jobOption.id, label: jobOption.label }))}
      />
    </div>

    {#if currentJobOption}
      <div class="form-grid">
        <div class="field">
          <label for="f_mode">Mode Pembelajaran</label>
          <Input
            id="f_mode"
            type="text"
            readonly
            value={currentJobOption.isOffline ? 'Offline (Tatap Muka)' : 'Online'}
          />
        </div>

        <div class="field">
          <label for="f_schedule">Jadwal Sesi</label>
          <Input
            id="f_schedule"
            type="text"
            readonly
            value="{currentJobOption.scheduleTime} - {currentJobOption.scheduleEndTime}"
          />
        </div>
      </div>

      {#if currentJobOption.isOffline && currentJobOption.location}
        <div class="field">
          <label for="f_address">Alamat Lokasi Les</label>
          <Input
            id="f_address"
            type="text"
            readonly
            value={currentJobOption.location}
          />
        </div>
      {/if}
    {/if}

    <div class="form-grid">
      <div class="field">
        <label for="f_subjects">Mata Pelajaran <i class="req">*</i></label>
        <SelectSearch
          id="f_subjects"
          multiple={true}
          required
          placeholder="Pilih Mapel..."
          bind:value={selectedSubjectIds}
          options={subjectOptions}
        />
      </div>

      <div class="field">
        <label for="f_classes">Kelas / Jenjang <i class="req">*</i></label>
        <SelectSearch
          id="f_classes"
          multiple={true}
          required
          placeholder="Pilih Kelas..."
          bind:value={selectedClassIds}
          options={classOptions}
        />
      </div>
    </div>

    {#if studentOptions.length > 0}
      <div class="field">
        <label for="f_students">Murid yang Hadir <i class="req">*</i></label>
        <SelectSearch
          id="f_students"
          multiple={true}
          placeholder="Pilih Murid..."
          bind:value={selectedStudentIds}
          options={studentOptions}
        />
      </div>
    {/if}

    <div class="form-grid">
      <div class="field">
        <label for="f_sessionDate">Tanggal Sesi <i class="req">*</i></label>
        <Input id="f_sessionDate" type="date" required bind:value={sessionDate} />
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="field">
          <label for="f_startTime">Jam Mulai <i class="req">*</i></label>
          <Input id="f_startTime" type="text" placeholder="09:00" required bind:value={startTime} />
        </div>

        <div class="field">
          <label for="f_endTime">Jam Selesai <i class="req">*</i></label>
          <Input id="f_endTime" type="text" placeholder="10:30" required bind:value={endTime} />
        </div>
      </div>
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_durationMinutes">Lama Pembelajaran</label>
        <Input id="f_durationMinutes" type="text" readonly value="{durationMinutes} menit" />
      </div>

      <div class="field">
        <label for="f_sessionsCount">Jumlah Sesi</label>
        <Input id="f_sessionsCount" type="text" readonly value="{sessionsCount} sesi" />
      </div>
    </div>

    {#if currentJobOption?.isOffline}
      <div class="field">
        <div class="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <label for="f_map" class="text-sm font-medium">GPS Check-in (Perangkat) <i class="req">*</i></label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isFetchingGps}
            onclick={handleGetGps}
            icon={isFetchingGps ? 'sync' : 'gps_fixed'}
          >
            {isFetchingGps ? 'Mengambil GPS...' : (hasGpsDevice ? 'Perbarui GPS' : 'Ambil GPS Perangkat')}
          </Button>
        </div>
        <div class="rounded-xl overflow-hidden border border-border">
          <LeafletMap
            bind:latitude={latitudeCheckIn}
            bind:longitude={longitudeCheckIn}
            readonly={true}
            height="180px"
            zoom={16}
            radius={100}
          />
        </div>
        {#if hasGpsDevice}
          <div class="text-xs text-success flex items-center gap-1 mt-1 font-medium">
            <Icon name="check_circle" size="xs" />
            <span>GPS perangkat tercatat ({latitudeCheckIn}, {longitudeCheckIn})</span>
          </div>
        {:else}
          <div class="text-xs text-warn flex items-center gap-1 mt-1">
            <Icon name="info" size="xs" />
            <span>Klik tombol "Ambil GPS Perangkat" di atas untuk mencatat koordinat kehadiran Anda.</span>
          </div>
        {/if}
      </div>
    {/if}

    <div class="field">
      <label for="f_topicTaught">Topik Materi <i class="req">*</i></label>
      <Input
        id="f_topicTaught"
        type="text"
        placeholder="cth: Fisika: Hukum Newton"
        required
        bind:value={topicTaught}
      />
    </div>

    <div class="field">
      <label for="f_activityNotes">Catatan Kegiatan</label>
      <textarea
        id="f_activityNotes"
        rows="2"
        class="w-full p-3 border border-border rounded-xl text-sm bg-surface text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y"
        placeholder="cth: Latihan soal dan pembahasan"
        bind:value={activityNotes}
      ></textarea>
    </div>
  </form>

  {#snippet footer()}
    <Button variant="outline" onclick={onClose} icon="close">
      Batal
    </Button>
    <Button type="submit" variant="primary" form="form-checkin" icon="check_circle">
      Kirim Presensi
    </Button>
  {/snippet}
</Modal>
