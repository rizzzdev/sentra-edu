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

  $: myEnrollments = $dbStore.enrollments.filter(
    (e) => e.deletedAt === null && e.tentorId === tentor.id && e.status === 'ACTIVE'
  );

  let selectedEnrollmentId: string = '';
  let sessionDate: string = new Date().toISOString().split('T')[0];
  let startTime: string = '09:00';
  let endTime: string = '10:30';
  let topicTaught: string = '';
  let activityNotes: string = '';
  let latitudeCheckIn: number | string = -6.2;
  let longitudeCheckIn: number | string = 106.8;

  $: if (myEnrollments.length > 0 && !selectedEnrollmentId) {
    selectedEnrollmentId = myEnrollments[0].id;
  }

  $: selectedEnrollment = $dbStore.enrollments.find((e) => e.id === selectedEnrollmentId);

  // Duration calculation
  function time24ToMin(t: string): number | null {
    const m = /^([01][0-9]|2[0-3]):([0-5][0-9])$/.exec(String(t || '').trim());
    return m ? +m[1] * 60 + +m[2] : null;
  }

  $: durationMinutes = (() => {
    const s = time24ToMin(startTime);
    const e = time24ToMin(endTime);
    if (s === null || e === null || s === e) return 90;
    return e > s ? e - s : e - s + 1440;
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
    if (!selectedEnrollment || selectedEnrollment.latitude === undefined || selectedEnrollment.longitude === undefined) {
      latitudeCheckIn = -6.2;
      longitudeCheckIn = 106.8;
      toastStore.success('Simulasi GPS terpasang.');
      return;
    }
    const jitter = 0.0004;
    latitudeCheckIn = Number((selectedEnrollment.latitude + (Math.random() - 0.5) * jitter).toFixed(6));
    longitudeCheckIn = Number((selectedEnrollment.longitude + (Math.random() - 0.5) * jitter).toFixed(6));
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
  <div id="gps-box" style="margin-bottom:12px">
    <div class="quick-actions" style="margin-bottom:10px">
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
        options={myEnrollments.map(e => {
          const student = $dbStore.users.find((u) => u.id === e.studentId);
          const subject = $dbStore.subjects.find((s) => s.id === e.subjectId);
          const cls = $dbStore.classes.find((c) => c.id === e.classId);
          return { value: e.id, label: `${student?.fullName || 'Murid'} — ${cls?.className} ${subject?.name}` };
        })}
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
