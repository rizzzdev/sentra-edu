<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import type { AttendanceRecord } from '$lib/shared/types/common.types';

  export let open: boolean = false;
  export let attendance: AttendanceRecord | null = null;
  export let onClose: () => void = () => {};

  let rejectionModalOpen: boolean = false;
  let rejectionReason: string = '';

  $: enrollment = attendance ? $dbStore.enrollments.find((e) => e.id === attendance?.enrollmentId) : null;
  $: student = enrollment ? $dbStore.users.find((u) => u.id === enrollment?.studentId) : null;
  $: tentor = attendance ? $dbStore.users.find((u) => u.id === attendance?.tentorId) : null;
  $: subject = enrollment ? $dbStore.subjects.find((s) => s.id === enrollment?.subjectId) : null;
  $: cls = enrollment ? $dbStore.classes.find((c) => c.id === enrollment?.classId) : null;
  $: pkg = enrollment ? $dbStore.packages.find((p) => p.id === enrollment?.packageId) : null;

  function handleApprove() {
    if (!attendance) return;
    const response = dbStore.verifyAttendance(attendance.id, 'APPROVED');
    if (!response.error) {
      toastStore.success('Presensi berhasil diverifikasi dan disetujui.');
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }

  function handleRejectSubmit() {
    if (!attendance || !rejectionReason.trim()) {
      toastStore.error('Alasan penolakan wajib diisi.');
      return;
    }
    const response = dbStore.verifyAttendance(attendance.id, 'REJECTED', rejectionReason.trim());
    if (!response.error) {
      toastStore.success('Presensi ditolak.');
      rejectionModalOpen = false;
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

{#if !rejectionModalOpen}
  <Modal {open} {onClose} title="Detail Presensi" icon="fact_check" maxWidth="560px">
    {#if attendance}
      <div class="kv">
        <dt>Tanggal</dt>
        <dd>{attendance.sessionDate}</dd>
        <dt>Lowongan / Mapel</dt>
        <dd>{subject?.name || '—'} ({cls?.className || '—'})</dd>
        <dt>Tentor</dt>
        <dd>{tentor?.fullName || '—'}</dd>
        <dt>Siswa</dt>
        <dd>{student?.fullName || '—'}</dd>
        <dt>Mode Les</dt>
        <dd>
          <span class="badge b-available">OFFLINE</span>
        </dd>
        <dt>Durasi</dt>
        <dd>90 menit</dd>
        <dt>Jumlah Sesi</dt>
        <dd>1 sesi (90 menit/sesi)</dd>
        <dt>Estimasi Fee Sesi</dt>
        <dd>{formatCurrencyIDR(pkg?.tentorFee || 100000)}</dd>
        <dt>Topik Materi</dt>
        <dd>{attendance.topic}</dd>
        <dt>Catatan</dt>
        <dd>{attendance.studentNotes || '—'}</dd>
        <dt>Koordinat Check-in</dt>
        <dd>
          {attendance.latitudeCheckIn ?? '—'}, {attendance.longitudeCheckIn ?? '—'}
        </dd>
        <dt>Status Radius</dt>
        <dd>
          {#if attendance.isRadiusValid}
            <span class="gps-pill gps-ok"><Icon name="verified" size="xs" /> dalam radius</span>
          {:else}
            <span class="gps-pill gps-warn"><Icon name="warning" size="xs" /> di luar radius 200m</span>
          {/if}
        </dd>
        <dt>Status</dt>
        <dd>
          <span class="badge {attendance.status === 'APPROVED' ? 'b-approved' : attendance.status === 'REJECTED' ? 'b-rejected' : 'b-submitted'}">
            {attendance.status}
          </span>
        </dd>
      </div>
    {/if}

    <svelte:fragment slot="footer">
      {#if attendance?.status === 'SUBMITTED'}
        <button type="button" class="btn btn-danger" on:click={() => { rejectionModalOpen = true; }}>
          <Icon name="close" size="sm" /> Tolak
        </button>
        <button type="button" class="btn btn-primary" on:click={handleApprove}>
          <Icon name="check" size="sm" /> Setujui
        </button>
      {:else}
        <button type="button" class="btn btn-outline" on:click={onClose}>
          <Icon name="close" size="sm" /> Tutup
        </button>
      {/if}
    </svelte:fragment>
  </Modal>
{:else}
  <Modal open={true} onClose={() => { rejectionModalOpen = false; }} title="Tolak Presensi" icon="close" maxWidth="480px">
    <div class="field">
      <label for="f_reason">Alasan Penolakan <i class="req">*</i></label>
      <textarea
        id="f_reason"
        rows="3"
        placeholder="cth: Koordinat tidak sesuai lokasi siswa"
        required
        bind:value={rejectionReason}
      ></textarea>
    </div>

    <svelte:fragment slot="footer">
      <button type="button" class="btn btn-outline" on:click={() => { rejectionModalOpen = false; }}>
        <Icon name="close" size="sm" /> Batal
      </button>
      <button type="button" class="btn btn-danger" on:click={handleRejectSubmit}>
        <Icon name="close" size="sm" /> Tolak Presensi
      </button>
    </svelte:fragment>
  </Modal>
{/if}
