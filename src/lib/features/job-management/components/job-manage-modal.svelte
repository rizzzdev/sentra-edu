<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import { JOB_STATUS_LABEL, APPLICATION_STATUS_LABEL, getStatusLabel, getStatusBadgeClass } from '$lib/shared/utils/status-map';
  import type { JobPost } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import LeafletMap from '$lib/components/molecules/leaflet-map.svelte';

  export let open: boolean = false;
  export let job: JobPost | null = null;
  export let onClose: () => void = () => {};
  export let onEdit: ((job: JobPost) => void) | undefined = undefined;

  let confirmCancelOpen: boolean = false;
  let confirmRejectAppId: string | null = null;

  $: applications = job
    ? $dbStore.applications.filter((applicationItem) => applicationItem.deletedAt === null && applicationItem.jobId === job?.id)
    : [];

  function getUserName(userId: string | null | undefined): string {
    if (!userId) return '—';
    return $dbStore.users.find((userItem) => userItem.id === userId)?.fullName || '—';
  }

  function getClassName(classId: string): string {
    return $dbStore.classes.find((classItem) => classItem.id === classId)?.className || '—';
  }

  function getSubjectName(subjectId: string): string {
    return $dbStore.subjects.find((subjectItem) => subjectItem.id === subjectId)?.name || '—';
  }

  function getPackage(packageId?: string) {
    if (!packageId) return null;
    return $dbStore.packages.find((pkg) => pkg.id === packageId) || null;
  }

  function getJobFee(jobPosting: JobPost): number {
    const packagePlan = getPackage(jobPosting.packageId);
    return packagePlan ? packagePlan.tentorFee : (jobPosting.tentorFee || 100000);
  }

  function getTransportAllowance(jobPosting: JobPost): number {
    return jobPosting.transportAllowance || 0;
  }

  function getStudentNames(jobPosting: JobPost): string {
    const studentIds = jobPosting.studentIds;
    if (Array.isArray(studentIds) && studentIds.length > 0) {
      const names = studentIds
        .map((studentId: string) => $dbStore.users.find((user) => user.id === studentId)?.fullName)
        .filter((name): name is string => typeof name === 'string' && name.length > 0);
      if (names.length > 0) return names.join(', ');
    }
    return jobPosting.studentName || getUserName(jobPosting.studentId) || '—';
  }

  function getClassNames(jobPosting: JobPost): string {
    const classIds = jobPosting.classIds;
    if (Array.isArray(classIds) && classIds.length > 0) {
      const names = classIds
        .map((classId: string) => $dbStore.classes.find((classLevel) => classLevel.id === classId)?.className)
        .filter((name): name is string => typeof name === 'string' && name.length > 0);
      if (names.length > 0) return names.join(', ');
    }
    return getClassName(jobPosting.classId);
  }

  function getSubjectNames(jobPosting: JobPost): string {
    const subjectIds = jobPosting.subjectIds;
    if (Array.isArray(subjectIds) && subjectIds.length > 0) {
      const names = subjectIds
        .map((subjectId: string) => $dbStore.subjects.find((subject) => subject.id === subjectId)?.name)
        .filter((name): name is string => typeof name === 'string' && name.length > 0);
      if (names.length > 0) return names.join(', ');
    }
    return getSubjectName(jobPosting.subjectId);
  }

  function handleAppApprove(applicationId: string) {
    const app = applications.find((application) => application.id === applicationId);
    if (!app || !job) return;
    const response = dbStore.assignTentorToJob(job.id, app.tentorId);
    if (!response.error) {
      toastStore.success('Pelamar berhasil disetujui dan ditugaskan.');
    } else {
      toastStore.error(response.message);
    }
  }

  function handleAppRejectConfirm() {
    if (!confirmRejectAppId) return;
    const updatedApps = $dbStore.applications.map((application) =>
      application.id === confirmRejectAppId ? { ...application, status: 'REJECTED' as const } : application
    );
    const snapshot = dbStore.getSnapshot();
    dbStore.importDatabaseJson(JSON.stringify({ ...snapshot, applications: updatedApps }));
    confirmRejectAppId = null;
    toastStore.success('Lamaran ditolak.');
  }

  function handleSetStatus(newStatus: 'AVAILABLE' | 'CANCELLED') {
    if (!job) return;
    const response = dbStore.saveJobPost({
      id: job.id,
      status: newStatus,
      assignedTentorId: newStatus === 'AVAILABLE' ? null : job.assignedTentorId
    });
    if (!response.error) {
      toastStore.success(`Status lowongan diubah menjadi ${newStatus}.`);
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title="Kelola Data Lowongan" icon="tune" maxWidth="720px">
  {#if job}
    {@const pkg = getPackage(job.packageId)}
    {@const fee = getJobFee(job)}
    {@const transport = getTransportAllowance(job)}
    {@const totalHonor = fee + transport}
    {@const isOffline = (job.mode || job.jobMode || 'OFFLINE') !== 'ONLINE'}

    <div class="flex flex-col gap-4">
      <!-- 1. Header Overview & Status -->
      <div class="flex items-center justify-between gap-3 p-3.5 sm:px-4 bg-muted border border-border rounded-xl">
        <div class="flex flex-col gap-1.5">
          <h4 class="m-0 text-base font-bold text-fg">{job.title}</h4>
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="badge {getStatusBadgeClass(job.status)}">
              {getStatusLabel(job.status, JOB_STATUS_LABEL)}
            </span>
            <span class="badge {isOffline ? 'b-available' : 'b-neutral'}">
              <Icon name={isOffline ? 'location_on' : 'videocam'} size="xs" />
              {isOffline ? 'Offline (Tatap Muka)' : 'Online (Daring)'}
            </span>
            {#if pkg}
              <span class="badge {pkg.mode === 'KELOMPOK' ? 'b-admin' : 'b-interviewed'}">
                <Icon name={pkg.mode === 'KELOMPOK' ? 'groups' : 'person'} size="xs" />
                {pkg.mode === 'KELOMPOK' ? 'Kelompok' : 'Privat'}
              </span>
            {/if}
          </div>
        </div>

        {#if onEdit}
          <Button
            variant="outline"
            size="sm"
            icon="edit"
            on:click={() => { if (job && onEdit) onEdit(job); }}
          >
            Ubah Data
          </Button>
        {/if}
      </div>

      <!-- 2. Rincian Data Lowongan Grid -->
      <div class="border border-border rounded-xl bg-surface overflow-hidden">
        <div class="flex items-center gap-2 p-2.5 px-3.5 bg-muted border-b border-border text-xs font-semibold text-fg">
          <Icon name="description" size="sm" /> Informasi & Detail Lowongan
        </div>

        <div class="flex flex-col gap-3 p-4">
          <div class="flex flex-col gap-1 pb-2.5 border-b border-border">
            <div class="text-xs font-semibold uppercase tracking-wider text-muted-fg">Paket Les & Tipe</div>
            <div class="flex items-center gap-1.5 text-sm text-fg flex-wrap">
              <strong>{pkg ? pkg.name : '—'}</strong>
              {#if pkg}
                <span class="badge {pkg.mode === 'KELOMPOK' ? 'b-admin' : 'b-interviewed'}">
                  <Icon name={pkg.mode === 'KELOMPOK' ? 'groups' : 'person'} size="xs" />
                  {pkg.mode === 'KELOMPOK' ? 'Kelompok' : 'Privat'}
                </span>
                <span class="text-xs text-muted-fg">· Rp {pkg.price.toLocaleString('id-ID')}</span>
              {/if}
            </div>
          </div>

          <div class="flex flex-col gap-1 pb-2.5 border-b border-border">
            <div class="text-xs font-semibold uppercase tracking-wider text-muted-fg">Siswa Terdaftar</div>
            <div class="flex items-center gap-1.5 text-sm text-fg">
              <Icon name="person" size="xs" />
              <strong>{getStudentNames(job)}</strong>
            </div>
          </div>

          <div class="flex flex-col gap-1 pb-2.5 border-b border-border">
            <div class="text-xs font-semibold uppercase tracking-wider text-muted-fg">Kelas</div>
            <div class="flex items-center gap-1.5 text-sm text-fg">
              <Icon name="school" size="xs" />
              {getClassNames(job)}
            </div>
          </div>

          <div class="flex flex-col gap-1 pb-2.5 border-b border-border">
            <div class="text-xs font-semibold uppercase tracking-wider text-muted-fg">Mata Pelajaran</div>
            <div class="flex items-center gap-1.5 text-sm text-fg">
              <Icon name="menu_book" size="xs" />
              {getSubjectNames(job)}
            </div>
          </div>

          <div class="flex flex-col gap-1 pb-2.5 border-b border-border">
            <div class="text-xs font-semibold uppercase tracking-wider text-muted-fg">Jadwal Les</div>
            <div class="flex items-center gap-1.5 text-sm text-fg">
              <Icon name="calendar_month" size="xs" />
              {(job.scheduleDays || []).join(', ') || 'Senin, Rabu'}
            </div>
          </div>

          <div class="flex flex-col gap-1 pb-2.5 border-b border-border">
            <div class="text-xs font-semibold uppercase tracking-wider text-muted-fg">Waktu & Durasi</div>
            <div class="flex items-center gap-1.5 text-sm text-fg">
              <Icon name="schedule" size="xs" />
              {job.scheduleTime || '16:00'} – {job.scheduleEndTime || '17:30'} WIB
              <span class="text-xs text-muted-fg">({job.sessionDurationMinutes || 90} menit)</span>
            </div>
          </div>

          <div class="flex flex-col gap-1 pb-2.5 border-b border-border">
            <div class="text-xs font-semibold uppercase tracking-wider text-muted-fg">Rincian Finansial Tentor</div>
            <div class="flex flex-col gap-1.5 p-2.5 px-3.5 bg-success-soft border border-success/30 rounded-lg mt-1">
              <div class="flex justify-between text-xs text-success">
                <span>Honor Pokok / Sesi:</span>
                <span>{formatCurrencyIDR(fee)}</span>
              </div>
              <div class="flex justify-between text-xs text-success">
                <span>Uang Transport / Sesi:</span>
                <span>{transport > 0 ? formatCurrencyIDR(transport) : 'Rp 0'}</span>
              </div>
              <div class="flex justify-between pt-1.5 border-t border-dashed border-success/40 text-sm font-bold text-success">
                <span>Total Honor Tentor / Sesi:</span>
                <span>{formatCurrencyIDR(totalHonor)}</span>
              </div>
            </div>
          </div>

          <!-- Lokasi Les & Peta -->
          <div class="flex flex-col gap-1 pb-2.5 border-b border-border">
            <div class="text-xs font-semibold uppercase tracking-wider text-muted-fg">Lokasi Les & Titik Koordinat</div>
            <div class="flex items-center gap-1.5 text-sm text-fg mb-2">
              <Icon name="place" size="xs" />
              {job.location || 'Lokasi Les'}
              {#if job.latitude && job.longitude}
                <span class="text-xs text-muted-fg">({job.latitude}, {job.longitude})</span>
              {/if}
            </div>

            {#if isOffline && job.latitude && job.longitude}
              <div class="rounded-lg overflow-hidden border border-border mt-1.5">
                <LeafletMap
                  latitude={job.latitude}
                  longitude={job.longitude}
                  height="220px"
                  zoom={16}
                  radius={50}
                  readonly={true}
                />
              </div>
            {/if}
          </div>

          {#if job.notes || job.additionalNotes}
            <div class="flex flex-col gap-1 last:border-b-0 last:pb-0">
              <div class="text-xs font-semibold uppercase tracking-wider text-muted-fg">Deskripsi / Catatan Tambahan</div>
              <div class="p-2.5 px-3 bg-muted rounded-lg text-xs text-fg leading-relaxed whitespace-pre-wrap">
                {job.notes || job.additionalNotes}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- 3. Daftar Pelamar (Lamaran Masuk) -->
      <div class="border border-border rounded-xl bg-surface overflow-hidden">
        <div class="flex items-center gap-2 p-2.5 px-3.5 bg-muted border-b border-border text-xs font-semibold text-fg">
          <Icon name="group" size="sm" /> Lamaran Masuk ({applications.length})
        </div>

        {#if applications.length === 0}
          <div class="flex flex-col items-center justify-center p-6 text-muted-fg gap-1.5 text-xs">
            <Icon name="person_search" size="md" />
            <p>Belum ada tentor yang melamar pada lowongan ini.</p>
          </div>
        {:else}
          <div class="table-wrap">
            <table class="tbl">
              <thead>
                <tr>
                  <th>Tentor</th>
                  <th>Status</th>
                  <th class="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {#each applications as applicationItem (applicationItem.id)}
                  <tr>
                    <td>
                      <strong>{getUserName(applicationItem.tentorId)}</strong>
                      <div class="sub">{applicationItem.notes || 'Tanpa catatan'}</div>
                    </td>
                    <td>
                      <span class="badge {getStatusBadgeClass(applicationItem.status)}">
                        {getStatusLabel(applicationItem.status, APPLICATION_STATUS_LABEL)}
                      </span>
                    </td>
                    <td>
                      <div class="actions">
                        {#if applicationItem.status === 'PENDING' && job.status !== 'ASSIGNED'}
                          <Button
                            variant="primary"
                            size="sm"
                            on:click={() => handleAppApprove(applicationItem.id)}
                            icon="check"
                          >
                            Setujui
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            on:click={() => { confirmRejectAppId = applicationItem.id; }}
                            icon="close"
                          >
                            Tolak
                          </Button>
                        {/if}
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>

      <!-- 4. Ubah Status Lowongan -->
      <div class="border border-border rounded-xl bg-surface overflow-hidden">
        <div class="flex items-center gap-2 p-2.5 px-3.5 bg-muted border-b border-border text-xs font-semibold text-fg">
          <Icon name="tune" size="sm" /> Kelola Status Lowongan
        </div>

        <div class="p-3.5">
          {#if job.status === 'AVAILABLE'}
            <p class="text-xs text-muted-fg mb-2.5">
              Lowongan sedang berstatus <strong>Tersedia</strong>. Tentor aktif dapat melihat dan melamar dari feed lowongan.
            </p>
          {:else if job.status === 'NEGOTIATING'}
            <p class="text-xs text-muted-fg mb-2.5">
              Sedang dalam proses <strong>Negosiasi</strong>. Setujui salah satu pelamar di atas atau kembalikan status ke Tersedia.
            </p>
            <Button
              variant="outline"
              size="sm"
              on:click={() => handleSetStatus('AVAILABLE')}
              icon="undo"
            >
              Kembalikan ke Tersedia
            </Button>
          {:else if job.status === 'ASSIGNED'}
            <p class="text-xs text-muted-fg mb-2.5">
              Lowongan telah <strong>Ditugaskan</strong> kepada <strong>{getUserName(job.assignedTentorId)}</strong>.
            </p>
            <Button
              variant="danger"
              size="sm"
              on:click={() => { confirmCancelOpen = true; }}
              icon="block"
            >
              Batalkan Lowongan
            </Button>
          {:else}
            <p class="text-xs text-muted-fg mb-2.5">
              Lowongan berstatus <strong>Dibatalkan</strong>. Anda dapat mengaktifkannya kembali.
            </p>
            <Button
              variant="outline"
              size="sm"
              on:click={() => handleSetStatus('AVAILABLE')}
              icon="undo"
            >
              Buka Kembali Lowongan
            </Button>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={onClose} icon="close">
      Tutup
    </Button>
  </svelte:fragment>
</Modal>

<ConfirmationDialog
  open={confirmCancelOpen}
  title="Batalkan Lowongan"
  message="Batalkan lowongan ini? Penugasan tentor akan dilepas."
  confirmText="Batalkan"
  confirmVariant="danger"
  onConfirm={() => {
    confirmCancelOpen = false;
    handleSetStatus('CANCELLED');
  }}
  onCancel={() => { confirmCancelOpen = false; }}
/>

<ConfirmationDialog
  open={confirmRejectAppId !== null}
  title="Tolak Lamaran"
  message="Tolak lamaran tentor ini?"
  confirmText="Tolak"
  confirmVariant="danger"
  onConfirm={handleAppRejectConfirm}
  onCancel={() => { confirmRejectAppId = null; }}
/>
