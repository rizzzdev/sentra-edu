<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { User } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';

  export let open: boolean = false;
  export let tentor: User;
  export let onClose: () => void = () => {};

  interface ActiveAssignment {
    id: string;
    label: string;
    latitude: number;
    longitude: number;
    scheduleTime?: string;
    scheduleEndTime?: string;
  }

  $: myActiveAssignments = (() => {
    const list: ActiveAssignment[] = [];
    const seenIds = new Set<string>();

    // 1. Direct Enrollments
    const directEnrollments = $dbStore.enrollments.filter(
      (enrollmentItem) => enrollmentItem.deletedAt === null && enrollmentItem.tentorId === tentor.id && enrollmentItem.status === 'ACTIVE'
    );
    for (const enr of directEnrollments) {
      seenIds.add(enr.id);
      const student = $dbStore.users.find((userItem) => userItem.id === enr.studentId);
      const subject = $dbStore.subjects.find((subjectItem) => subjectItem.id === enr.subjectId);
      const cls = $dbStore.classes.find((classItem) => classItem.id === enr.classId);
      list.push({
        id: enr.id,
        label: `${student?.fullName || 'Murid'} — ${cls?.className || 'Kelas'} ${subject?.name || 'Mapel'} (Privat)`,
        latitude: enr.latitude ?? -6.2,
        longitude: enr.longitude ?? 106.8,
        scheduleTime: enr.scheduleTime
      });
    }

    // 2. Assigned Jobs
    const assignedJobs = $dbStore.jobs.filter(
      (jobItem) => jobItem.deletedAt === null && jobItem.assignedTentorId === tentor.id && jobItem.status === 'ASSIGNED'
    );
    for (const job of assignedJobs) {
      if (job.enrollmentId && seenIds.has(job.enrollmentId)) continue;
      seenIds.add(job.id);
      
      const studentNames = Array.isArray(job.studentNames) && job.studentNames.length > 0
        ? job.studentNames.join(', ')
        : (job.studentName || (job.studentId ? $dbStore.users.find((userItem) => userItem.id === job.studentId)?.fullName : 'Murid'));
      
      const subjectIds = Array.isArray(job.subjectIds) && job.subjectIds.length > 0 ? job.subjectIds : (job.subjectId ? [job.subjectId] : []);
      const subjectNames = $dbStore.subjects.filter((subjectItem) => subjectIds.includes(subjectItem.id)).map((subjectItem) => subjectItem.name).join(', ') || 'Mapel';

      const classIds = Array.isArray(job.classIds) && job.classIds.length > 0 ? job.classIds : (job.classId ? [job.classId] : []);
      const classNames = $dbStore.classes.filter((classItem) => classIds.includes(classItem.id)).map((classItem) => classItem.className).join(', ') || 'Kelas';

      const isGroup = (job.studentCount && job.studentCount > 1) || (Array.isArray(job.studentIds) && job.studentIds.length > 1);

      list.push({
        id: job.id,
        label: `${studentNames || 'Murid'} — ${classNames} ${subjectNames} (${isGroup ? 'Kelompok' : 'Privat'})`,
        latitude: job.latitude ?? -6.2,
        longitude: job.longitude ?? 106.8,
        scheduleTime: job.scheduleTime,
        scheduleEndTime: job.scheduleEndTime
      });
    }

    return list;
  })();

  let selectedEnrollmentId: string = '';
  let sessionDate: string = new Date().toISOString().split('T')[0];
  let startTime: string = '09:00';
  let endTime: string = '10:30';
  let topicTaught: string = '';
  let activityNotes: string = '';
  let latitudeCheckIn: number | string = -6.2;
  let longitudeCheckIn: number | string = 106.8;

  $: if (myActiveAssignments.length > 0 && !selectedEnrollmentId) {
    selectedEnrollmentId = myActiveAssignments[0].id;
  }

  $: selectedAssignment = myActiveAssignments.find((assignmentItem) => assignmentItem.id === selectedEnrollmentId);

  $: if (selectedAssignment) {
    if (selectedAssignment.scheduleTime) startTime = selectedAssignment.scheduleTime;
    if (selectedAssignment.scheduleEndTime) endTime = selectedAssignment.scheduleEndTime;
  }

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
    toastStore.info('Meminta lokasi GPS...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latitudeCheckIn = Number(pos.coords.latitude.toFixed(6));
        longitudeCheckIn = Number(pos.coords.longitude.toFixed(6));
        toastStore.success('Lokasi GPS didapat.');
      },
      () => {
        toastStore.error('Izin lokasi ditolak. Gunakan Simulasi GPS.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleSimulateGps() {
    if (!selectedAssignment || selectedAssignment.latitude === undefined || selectedAssignment.longitude === undefined) {
      latitudeCheckIn = -6.2;
      longitudeCheckIn = 106.8;
      toastStore.success('Simulasi GPS terpasang.');
      return;
    }
    const jitter = 0.0004;
    latitudeCheckIn = Number((selectedAssignment.latitude + (Math.random() - 0.5) * jitter).toFixed(6));
    longitudeCheckIn = Number((selectedAssignment.longitude + (Math.random() - 0.5) * jitter).toFixed(6));
    toastStore.success('Simulasi GPS (lokasi les) terpasang.');
  }

  function handleSubmit() {
    if (!selectedEnrollmentId || !topicTaught.trim()) {
      toastStore.error('Pilih murid dan isi topik materi.');
      return;
    }

    const payload = {
      enrollmentId: selectedEnrollmentId,
      tentorId: tentor.id,
      sessionDate,
      startTime: `${sessionDate}T${startTime}:00.000Z`,
      endTime: `${sessionDate}T${endTime}:00.000Z`,
      topic: topicTaught.trim(),
      studentNotes: activityNotes.trim(),
      latitudeCheckIn: Number(latitudeCheckIn),
      longitudeCheckIn: Number(longitudeCheckIn),
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

<Modal {open} {onClose} title="Check-in Presensi" icon="location_on" maxWidth="620px">
  <div id="gps-box" class="mb-3">
    <div class="quick-actions mb-2.5">
      <Button variant="outline" size="sm" className="bg-primary-soft text-primary border-primary-soft" on:click={handleGetGps} icon="gps_fixed">
        Ambil Lokasi GPS
      </Button>
      <Button variant="outline" size="sm" on:click={handleSimulateGps} icon="my_location">
        Simulasi GPS (lokasi les)
      </Button>
    </div>
  </div>

  <div class="alert alert-info">
    <Icon name="schedule" size="sm" />
    <span>
      Jam mulai & selesai <strong>terisi otomatis</strong> dari preferensi lowongan namun <strong>bisa diubah</strong> dengan format <strong>24 jam</strong> (cth: 14:30). <strong>Lama pembelajaran</strong> & <strong>jumlah sesi</strong> dihitung otomatis.
    </span>
  </div>

  <form id="form-checkin" on:submit|preventDefault={handleSubmit}>
    <div class="field">
      <label for="f_enr">Pilih Murid / Program <i class="req">*</i></label>
      <SelectSearch
        id="f_enr"
        required
        bind:value={selectedEnrollmentId}
        options={myActiveAssignments.map((assignmentItem) => ({ value: assignmentItem.id, label: assignmentItem.label }))}
      />
    </div>

    <div class="field">
      <label for="f_sessionDate">Tanggal Sesi <i class="req">*</i></label>
      <Input id="f_sessionDate" type="date" required bind:value={sessionDate} />
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_startTime">Jam Mulai <i class="req">*</i></label>
        <Input id="f_startTime" type="text" placeholder="09:00" required bind:value={startTime} />
      </div>

      <div class="field">
        <label for="f_endTime">Jam Selesai <i class="req">*</i></label>
        <Input id="f_endTime" type="text" placeholder="10:30" required bind:value={endTime} />
      </div>
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_durationMinutes">Lama Pembelajaran (menit)</label>
        <Input id="f_durationMinutes" type="number" readonly value={durationMinutes} />
        <div class="help">Dihitung otomatis dari jam mulai & selesai.</div>
      </div>

      <div class="field">
        <label for="f_sessionsCount">Jumlah Sesi (90 menit/sesi)</label>
        <Input id="f_sessionsCount" type="number" readonly value={sessionsCount} />
        <div class="help">Dihitung otomatis: lama ÷ 90 menit.</div>
      </div>
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_latitudeCheckIn">Latitude (GPS) <i class="req">*</i></label>
        <Input id="f_latitudeCheckIn" type="number" step="0.000001" required bind:value={latitudeCheckIn} />
      </div>

      <div class="field">
        <label for="f_longitudeCheckIn">Longitude (GPS) <i class="req">*</i></label>
        <Input id="f_longitudeCheckIn" type="number" step="0.000001" required bind:value={longitudeCheckIn} />
      </div>
    </div>

    <div class="field">
      <label for="f_topicTaught">Topik Materi <i class="req">*</i></label>
      <Input
        id="f_topicTaught"
        type="text"
        placeholder="cth: Matematika: Turunan & Aplikasinya"
        required
        bind:value={topicTaught}
      />
    </div>

    <div class="field">
      <label for="f_activityNotes">Catatan Kegiatan</label>
      <textarea
        id="f_activityNotes"
        rows="2"
        placeholder="cth: Latihan soal studi kasus"
        bind:value={activityNotes}
      ></textarea>
    </div>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={onClose} icon="close">
      Batal
    </Button>
    <Button type="submit" variant="primary" form="form-checkin" icon="location_on">
      Kirim Presensi
    </Button>
  </svelte:fragment>
</Modal>
