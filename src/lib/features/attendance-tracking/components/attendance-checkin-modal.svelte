<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { User, JobPost, Enrollment } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import LeafletMap from '$lib/components/molecules/leaflet-map.svelte';

  export let open: boolean = false;
  export let tentor: User;
  export let onClose: () => void = () => {};

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

  // Extract all jobs and active assignments for this tentor
  $: tentorJobOptions = (() => {
    const list: JobOptionItem[] = [];
    const seenJobIds = new Set<string>();

    // 1. Assigned Jobs
    const assignedJobs = $dbStore.jobs.filter(
      (jobItem) => jobItem.deletedAt === null && jobItem.assignedTentorId === tentor.id && jobItem.status === 'ASSIGNED'
    );

    for (const job of assignedJobs) {
      seenJobIds.add(job.id);

      const subjectIds = Array.isArray(job.subjectIds) && job.subjectIds.length > 0
        ? job.subjectIds
        : (job.subjectId ? [job.subjectId] : []);
      const subjectNames = $dbStore.subjects
        .filter((subjectItem) => subjectIds.includes(subjectItem.id))
        .map((subjectItem) => subjectItem.name)
        .join(', ') || 'Mapel';

      const classIds = Array.isArray(job.classIds) && job.classIds.length > 0
        ? job.classIds
        : (job.classId ? [job.classId] : []);
      const classNames = $dbStore.classes
        .filter((classItem) => classIds.includes(classItem.id))
        .map((classItem) => classItem.className)
        .join(', ') || 'Kelas';

      const studentIds = Array.isArray(job.studentIds) && job.studentIds.length > 0
        ? job.studentIds
        : (job.studentId ? [job.studentId] : []);
      const studentNames = Array.isArray(job.studentNames) && job.studentNames.length > 0
        ? job.studentNames
        : ($dbStore.users.filter((userItem) => studentIds.includes(userItem.id)).map((userItem) => userItem.fullName));

      const isOfflineMode = Boolean(job.location && !job.location.toLowerCase().includes('online'));
      const isGroup = (job.studentCount && job.studentCount > 1) || studentIds.length > 1;

      list.push({
        id: job.id,
        enrollmentId: job.enrollmentId || undefined,
        job,
        enrollment: null,
        label: `${job.title || 'Lowongan'} — ${studentNames.join(', ') || 'Murid'} (${classNames} · ${subjectNames}) [${isOfflineMode ? 'OFFLINE' : 'ONLINE'}]`,
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

    // 2. Direct Active Enrollments
    const directEnrollments = $dbStore.enrollments.filter(
      (enrollmentItem) => enrollmentItem.deletedAt === null && enrollmentItem.tentorId === tentor.id && enrollmentItem.status === 'ACTIVE'
    );
    for (const enr of directEnrollments) {
      if (enr.id && seenJobIds.has(enr.id)) continue;
      const student = $dbStore.users.find((userItem) => userItem.id === enr.studentId);
      const subject = $dbStore.subjects.find((subjectItem) => subjectItem.id === enr.subjectId);
      const cls = $dbStore.classes.find((classItem) => classItem.id === enr.classId);
      const isOfflineMode = Boolean(enr.latitude !== null && enr.longitude !== null);

      list.push({
        id: enr.id,
        enrollmentId: enr.id,
        job: null,
        enrollment: enr,
        label: `${student?.fullName || 'Murid'} — ${cls?.className || 'Kelas'} ${subject?.name || 'Mapel'} (Privat) [${isOfflineMode ? 'OFFLINE' : 'ONLINE'}]`,
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
  })();

  let selectedJobId: string = '';
  let selectedSubjectIds: string[] = [];
  let selectedClassIds: string[] = [];
  let selectedStudentIds: string[] = [];
  let sessionDate: string = new Date().toISOString().split('T')[0];
  let startTime: string = '09:00';
  let endTime: string = '10:30';
  let topicTaught: string = '';
  let activityNotes: string = '';
  let latitudeCheckIn: number = -6.2;
  let longitudeCheckIn: number = 106.8;

  $: if (tentorJobOptions.length > 0 && !selectedJobId) {
    selectedJobId = tentorJobOptions[0].id;
  }

  $: currentJobOption = tentorJobOptions.find((jobOption) => jobOption.id === selectedJobId) || null;

  // Whenever selected job changes, auto-populate multi-selects and schedule
  let lastLoadedJobId: string = '';
  $: if (currentJobOption && currentJobOption.id !== lastLoadedJobId) {
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
  }

  // Available options for current job
  $: subjectOptions = (() => {
    if (!currentJobOption) return [];
    if (currentJobOption.subjectIds.length > 0) {
      return $dbStore.subjects
        .filter((subjectItem) => currentJobOption?.subjectIds.includes(subjectItem.id))
        .map((subjectItem) => ({ value: subjectItem.id, label: subjectItem.name }));
    }
    return $dbStore.subjects.map((subjectItem) => ({ value: subjectItem.id, label: subjectItem.name }));
  })();

  $: classOptions = (() => {
    if (!currentJobOption) return [];
    if (currentJobOption.classIds.length > 0) {
      return $dbStore.classes
        .filter((classItem) => currentJobOption?.classIds.includes(classItem.id))
        .map((classItem) => ({ value: classItem.id, label: classItem.className }));
    }
    return $dbStore.classes.map((classItem) => ({ value: classItem.id, label: classItem.className }));
  })();

  $: studentOptions = (() => {
    if (!currentJobOption) return [];
    if (currentJobOption.studentIds.length > 0) {
      return $dbStore.users
        .filter((userItem) => currentJobOption?.studentIds.includes(userItem.id))
        .map((userItem) => ({ value: userItem.id, label: userItem.fullName }));
    }
    if (currentJobOption.studentNames.length > 0) {
      return currentJobOption.studentNames.map((name) => ({ value: name, label: name }));
    }
    return [];
  })();

  // Duration calculation
  function time24ToMin(timeString: string): number | null {
    const match = /^([01][0-9]|2[0-3]):([0-5][0-9])$/.exec(String(timeString || '').trim());
    return match ? +match[1] * 60 + +match[2] : null;
  }

  $: durationMinutes = (() => {
    const startMinutes = time24ToMin(startTime);
    const endMinutes = time24ToMin(endTime);
    if (startMinutes === null || endMinutes === null || startMinutes === endMinutes) return 90;
    return endMinutes > startMinutes ? endMinutes - startMinutes : endMinutes - startMinutes + 1440;
  })();

  $: sessionsCount = Math.round((durationMinutes / 90) * 10) / 10;

  function handleGetGps() {
    if (!navigator.geolocation) {
      toastStore.error('Browser tidak mendukung geolocation.');
      return;
    }
    toastStore.info('Meminta lokasi GPS perangkat...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latitudeCheckIn = Number(pos.coords.latitude.toFixed(6));
        longitudeCheckIn = Number(pos.coords.longitude.toFixed(6));
        toastStore.success('Lokasi GPS perangkat berhasil didapat.');
      },
      () => {
        toastStore.error('Izin lokasi ditolak. Anda dapat menggunakan tombol Simulasi GPS.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleSimulateGps() {
    if (!currentJobOption) {
      latitudeCheckIn = -6.2;
      longitudeCheckIn = 106.8;
      toastStore.success('Simulasi GPS terpasang.');
      return;
    }
    const jitter = 0.0002;
    latitudeCheckIn = Number((currentJobOption.latitude + (Math.random() - 0.5) * jitter).toFixed(6));
    longitudeCheckIn = Number((currentJobOption.longitude + (Math.random() - 0.5) * jitter).toFixed(6));
    toastStore.success('Simulasi GPS di lokasi lowongan terpasang.');
  }

  function handleSubmit() {
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
    if (!topicTaught.trim()) {
      toastStore.error('Topik materi wajib diisi.');
      return;
    }

    // Resolve student names from IDs or raw strings
    const studentNamesResolved: string[] = [];
    const studentIdsResolved: string[] = [];

    for (const val of selectedStudentIds) {
      const userFound = $dbStore.users.find((userItem) => userItem.id === val);
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

    const response = dbStore.submitAttendance(payload);
    if (!response.error) {
      toastStore.success('Presensi les berhasil dikirim untuk verifikasi admin.');
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title="Check-in Presensi Les" icon="location_on" maxWidth="max-w-2xl">
  <form id="form-checkin" on:submit|preventDefault={handleSubmit} class="space-y-4">
    <!-- 1. Lowongan Selection -->
    <div class="field">
      <label for="f_job">Pilih Data Lowongan Mengajar <i class="req">*</i></label>
      <SelectSearch
        id="f_job"
        required
        bind:value={selectedJobId}
        options={tentorJobOptions.map((jobOption) => ({ value: jobOption.id, label: jobOption.label }))}
      />
    </div>

    <!-- Info Banner for Selected Job -->
    {#if currentJobOption}
      <div class="p-3 rounded-xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div class="flex items-center gap-2">
          <span class="badge {currentJobOption.isOffline ? 'bg-success-soft text-success' : 'bg-primary-soft text-primary-strong'} font-bold">
            {currentJobOption.isOffline ? 'MODE OFFLINE (Tatap Muka)' : 'MODE ONLINE'}
          </span>
          {#if currentJobOption.location}
            <span class="text-muted-fg flex items-center gap-1">
              <Icon name="location_on" size="xs" />
              {currentJobOption.location}
            </span>
          {/if}
        </div>
        <div class="text-muted-fg font-semibold">
          Jadwal: {currentJobOption.scheduleTime} - {currentJobOption.scheduleEndTime}
        </div>
      </div>
    {/if}

    <!-- 2. Multiple Dropdown Mapel & Kelas from Job -->
    <div class="form-grid">
      <div class="field">
        <label for="f_subjects">Mata Pelajaran (Bisa Multiple) <i class="req">*</i></label>
        <SelectSearch
          id="f_subjects"
          multiple={true}
          required
          placeholder="Pilih Mapel..."
          bind:value={selectedSubjectIds}
          options={subjectOptions}
        />
        <div class="help">Sesuai mata pelajaran yang terdaftar pada lowongan ini.</div>
      </div>

      <div class="field">
        <label for="f_classes">Kelas / Jenjang (Bisa Multiple) <i class="req">*</i></label>
        <SelectSearch
          id="f_classes"
          multiple={true}
          required
          placeholder="Pilih Kelas..."
          bind:value={selectedClassIds}
          options={classOptions}
        />
        <div class="help">Sesuai kelas/jenjang yang terdaftar pada lowongan ini.</div>
      </div>
    </div>

    <!-- 3. Multiple Dropdown Murid from Job -->
    {#if studentOptions.length > 0}
      <div class="field">
        <label for="f_students">Murid yang Hadir (Bisa Multiple) <i class="req">*</i></label>
        <SelectSearch
          id="f_students"
          multiple={true}
          placeholder="Pilih Murid Hadir..."
          bind:value={selectedStudentIds}
          options={studentOptions}
        />
      </div>
    {/if}

    <!-- 4. Tanggal & Waktu -->
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

    <!-- 5. Durasi & Sesi Otomatis -->
    <div class="form-grid">
      <div class="field">
        <label for="f_durationMinutes">Lama Pembelajaran (Menit)</label>
        <Input id="f_durationMinutes" type="number" readonly value={durationMinutes} />
        <div class="help">Dihitung otomatis dari selisih jam mulai & selesai.</div>
      </div>

      <div class="field">
        <label for="f_sessionsCount">Jumlah Sesi (90 mnt/sesi)</label>
        <Input id="f_sessionsCount" type="number" readonly value={sessionsCount} />
        <div class="help">Dihitung otomatis: lama ÷ 90 menit.</div>
      </div>
    </div>

    <!-- 6. GPS dengan Leaflet jika Program Offline -->
    {#if currentJobOption?.isOffline}
      <div class="p-4 rounded-xl border border-border bg-surface space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <Icon name="map" size="sm" className="text-primary" />
            <span class="font-bold text-sm">Lokasi & GPS Check-in (Program Tatap Muka)</span>
          </div>
          <div class="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" on:click={handleGetGps} icon="gps_fixed">
              GPS Perangkat
            </Button>
            <Button type="button" variant="primary" size="sm" on:click={handleSimulateGps} icon="my_location">
              Lokasi Lowongan
            </Button>
          </div>
        </div>

        <div class="rounded-xl overflow-hidden border border-border">
          <LeafletMap
            bind:latitude={latitudeCheckIn}
            bind:longitude={longitudeCheckIn}
            height="220px"
            zoom={16}
            radius={100}
          />
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs text-muted-fg">
          <div>Latitude: <strong class="text-fg">{latitudeCheckIn}</strong></div>
          <div>Longitude: <strong class="text-fg">{longitudeCheckIn}</strong></div>
        </div>
      </div>
    {:else if currentJobOption}
      <div class="p-3 rounded-xl border border-primary/20 bg-primary-soft text-primary-strong text-xs flex items-center gap-2">
        <Icon name="videocam" size="sm" />
        <span>Program ini berlangsung secara <strong>ONLINE</strong>. Perekaman koordinat GPS tidak diperlukan.</span>
      </div>
    {/if}

    <!-- 7. Topik Materi & Catatan Kegiatan -->
    <div class="field">
      <label for="f_topicTaught">Topik Materi Pembelajaran <i class="req">*</i></label>
      <Input
        id="f_topicTaught"
        type="text"
        placeholder="cth: Fisika: Hukum Newton & Pembahasan Soal Latihan"
        required
        bind:value={topicTaught}
      />
    </div>

    <div class="field">
      <label for="f_activityNotes">Catatan Kegiatan / Evaluasi Murid</label>
      <textarea
        id="f_activityNotes"
        rows="3"
        class="w-full p-3 border border-border rounded-xl text-sm bg-surface text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y"
        placeholder="cth: Murid memahami konsep dasar dengan baik, perlu latihan tambahan di soal aplikasi numerik."
        bind:value={activityNotes}
      ></textarea>
    </div>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={onClose} icon="close">
      Batal
    </Button>
    <Button type="submit" variant="primary" form="form-checkin" icon="check_circle">
      Kirim Presensi
    </Button>
  </svelte:fragment>
</Modal>
