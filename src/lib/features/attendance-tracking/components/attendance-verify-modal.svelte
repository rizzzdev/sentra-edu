<script lang="ts">
import { userStore, subjectStore, classStore, enrollmentStore, jobStore } from '$lib/api';
  import Modal from '$lib/components/molecules/modal.svelte';
  import {authStore, toastStore} from '$lib/shared/stores';
  import { ATTENDANCE_STATUS_LABEL, getStatusLabel, getStatusBadgeClass } from '$lib/shared/utils';
  import type { AttendanceRecord } from '$lib/shared/types';
  import { Button } from '$lib/components/atoms';
  import { LeafletMap } from '$lib/components/molecules';
  import { api } from '$lib/api/client';

  let {
    open = false,
    attendance = null,
    onClose = () => {}
  }: {
    open?: boolean;
    attendance?: AttendanceRecord | null;
    onClose?: () => void;
  } = $props();

  let rejectionModalOpen = $state(false);
  let rejectionReason = $state('');

  let canVerify = $derived($authStore?.role === 'SUPER_ADMIN');
  let job = $derived(attendance?.jobId
    ? $jobStore.find((jobItem) => jobItem.id === attendance?.jobId)
    : (attendance?.enrollmentId ? $jobStore.find((jobItem) => jobItem.enrollmentId === attendance?.enrollmentId) : null));

  let enrollment = $derived(attendance?.enrollmentId ? $enrollmentStore.find((enrollmentItem) => enrollmentItem.id === attendance?.enrollmentId) : null);
  let tentor = $derived(attendance ? $userStore.find((userItem) => userItem.id === attendance?.tentorId) : null);

  let subjectNames = $derived((() => {
    if (!attendance) return '—';
    if (attendance.subjectIds && attendance.subjectIds.length > 0) {
      return $subjectStore
        .filter((subjectItem) => attendance?.subjectIds?.includes(subjectItem.id))
        .map((subjectItem) => subjectItem.name)
        .join(', ') || '—';
    }
    if (enrollment?.subjectId) {
      return $subjectStore.find((subjectItem) => subjectItem.id === enrollment?.subjectId)?.name || '—';
    }
    return '—';
  })());

  let classNames = $derived((() => {
    if (!attendance) return '—';
    if (attendance.classIds && attendance.classIds.length > 0) {
      return $classStore
        .filter((classItem) => attendance?.classIds?.includes(classItem.id))
        .map((classItem) => classItem.className)
        .join(', ') || '—';
    }
    if (enrollment?.classId) {
      return $classStore.find((classItem) => classItem.id === enrollment?.classId)?.className || '—';
    }
    return '—';
  })());

  let studentNames = $derived((() => {
    if (!attendance) return '—';
    if (attendance.studentNames && attendance.studentNames.length > 0) {
      return attendance.studentNames.join(', ');
    }
    if (attendance.studentIds && attendance.studentIds.length > 0) {
      return $userStore
        .filter((userItem) => attendance?.studentIds?.includes(userItem.id))
        .map((userItem) => userItem.fullName)
        .join(', ') || '—';
    }
    if (enrollment?.studentId) {
      return $userStore.find((userItem) => userItem.id === enrollment?.studentId)?.fullName || '—';
    }
    return '—';
  })());

  let isOffline = $derived(Boolean(
    attendance?.latitudeCheckIn !== null &&
    attendance?.longitudeCheckIn !== null
  ));

  function formatDisplayTime(isoOrTimeString: string): string {
    if (!isoOrTimeString) return '';
    if (isoOrTimeString.includes('T')) {
      const dateObj = new Date(isoOrTimeString);
      return `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
    }
    return isoOrTimeString;
  }

  async function handleApprove() {
    if (!attendance || !canVerify) return;
    const response = await api.attendances.update(attendance.id, 'APPROVED');
    if (!response.error) {
      toastStore.success('Presensi berhasil diverifikasi dan disetujui.');
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }

  async function handleRejectSubmit() {
    if (!attendance || !canVerify || !rejectionReason.trim()) {
      toastStore.error('Alasan penolakan wajib diisi.');
      return;
    }
    const response = await api.attendances.update(attendance.id, 'REJECTED', rejectionReason.trim());
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
  <Modal {open} {onClose} title="Detail Presensi" icon="fact_check" maxWidth="max-w-xl">
    {#if attendance}
      <div class="space-y-3">
        {#if job?.title}
          <div class="field">
            <span class="text-xs text-muted-fg block">Lowongan</span>
            <div class="font-bold text-fg">{job.title}</div>
          </div>
        {/if}

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="p-2.5 rounded-lg border border-border bg-surface">
            <span class="text-xs text-muted-fg block">Tentor</span>
            <strong class="text-fg">{tentor?.fullName || '—'}</strong>
          </div>

          <div class="p-2.5 rounded-lg border border-border bg-surface">
            <span class="text-xs text-muted-fg block">Murid</span>
            <strong class="text-fg">{studentNames}</strong>
          </div>

          <div class="p-2.5 rounded-lg border border-border bg-surface">
            <span class="text-xs text-muted-fg block">Mata Pelajaran</span>
            <strong class="text-fg">{subjectNames}</strong>
          </div>

          <div class="p-2.5 rounded-lg border border-border bg-surface">
            <span class="text-xs text-muted-fg block">Kelas</span>
            <strong class="text-fg">{classNames}</strong>
          </div>

          <div class="p-2.5 rounded-lg border border-border bg-surface">
            <span class="text-xs text-muted-fg block">Waktu Sesi</span>
            <strong class="text-fg">
              {attendance.sessionDate} ({formatDisplayTime(attendance.startTime)} - {formatDisplayTime(attendance.endTime)})
            </strong>
          </div>

          <div class="p-2.5 rounded-lg border border-border bg-surface">
            <span class="text-xs text-muted-fg block">Durasi</span>
            <strong class="text-fg">
              {attendance.durationMinutes || 90} menit ({attendance.sessionsCount || 1} sesi)
            </strong>
          </div>
        </div>

        <div class="p-2.5 rounded-lg border border-border bg-surface space-y-1.5 text-sm">
          <div>
            <span class="text-xs text-muted-fg block font-medium">Topik Materi:</span>
            <div class="text-fg font-medium">{attendance.topic}</div>
          </div>
          {#if attendance.studentNotes}
            <div class="pt-1.5 border-t border-border">
              <span class="text-xs text-muted-fg block font-medium">Catatan Kegiatan:</span>
              <div class="text-muted-fg whitespace-pre-line">{attendance.studentNotes}</div>
            </div>
          {/if}
        </div>

        {#if isOffline && attendance.latitudeCheckIn !== null && attendance.longitudeCheckIn !== null}
          <div class="space-y-1.5">
            <span class="text-xs text-muted-fg font-medium">Lokasi GPS Check-in</span>
            <div class="rounded-lg overflow-hidden border border-border">
              <LeafletMap
                latitude={attendance.latitudeCheckIn}
                longitude={attendance.longitudeCheckIn}
                readonly={true}
                height="150px"
                zoom={16}
                radius={100}
              />
            </div>
          </div>
        {/if}

        <div class="flex items-center justify-between pt-1">
          <span class="text-xs text-muted-fg">Status</span>
          <span class="badge {getStatusBadgeClass(attendance.status)}">
            {getStatusLabel(attendance.status, ATTENDANCE_STATUS_LABEL)}
          </span>
        </div>
      </div>
    {/if}

    {#snippet footer()}
      {#if canVerify && attendance?.status === 'SUBMITTED'}
        <Button variant="danger" onclick={() => { rejectionModalOpen = true; }} icon="close">
          Tolak
        </Button>
        <Button variant="primary" onclick={handleApprove} icon="check">
          Setujui
        </Button>
      {:else}
        <Button variant="outline" onclick={onClose} icon="close">
          Tutup
        </Button>
      {/if}
    {/snippet}
  </Modal>
{:else}
  <Modal open={true} onClose={() => { rejectionModalOpen = false; }} title="Tolak Presensi" icon="close" maxWidth="max-w-md">
    <div class="field">
      <label for="f_reason">Alasan Penolakan <i class="req">*</i></label>
      <textarea
        id="f_reason"
        rows="3"
        class="w-full p-3 border border-border rounded-xl text-sm bg-surface text-fg outline-none focus:border-danger focus:ring-2 focus:ring-danger/10 resize-y"
        placeholder="cth: Materi belum sesuai target"
        required
        bind:value={rejectionReason}
      ></textarea>
    </div>

    {#snippet footer()}
      <Button variant="outline" onclick={() => { rejectionModalOpen = false; }} icon="close">
        Batal
      </Button>
      <Button variant="danger" onclick={handleRejectSubmit} icon="close">
        Tolak Presensi
      </Button>
    {/snippet}
  </Modal>
{/if}
