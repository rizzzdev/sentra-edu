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
    ? $dbStore.applications.filter((a) => a.deletedAt === null && a.jobId === job?.id)
    : [];

  function getUserName(userId: string | null | undefined): string {
    if (!userId) return '—';
    return $dbStore.users.find((u) => u.id === userId)?.fullName || '—';
  }

  function getClassName(classId: string): string {
    return $dbStore.classes.find((c) => c.id === classId)?.className || '—';
  }

  function getSubjectName(subjectId: string): string {
    return $dbStore.subjects.find((s) => s.id === subjectId)?.name || '—';
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

    <div class="manage-container">
      <!-- 1. Header Overview & Status -->
      <div class="overview-box">
        <div class="overview-main">
          <h4 class="job-title">{job.title}</h4>
          <div class="badge-row">
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
      <div class="section-card">
        <div class="section-title">
          <Icon name="description" size="sm" /> Informasi & Detail Lowongan
        </div>

        <div class="kv-grid">
          <div class="kv-item">
            <div class="kv-label">Paket Les & Tipe</div>
            <div class="kv-value flex-wrap">
              <strong>{pkg ? pkg.name : '—'}</strong>
              {#if pkg}
                <span class="badge {pkg.mode === 'KELOMPOK' ? 'b-admin' : 'b-interviewed'}">
                  <Icon name={pkg.mode === 'KELOMPOK' ? 'groups' : 'person'} size="xs" />
                  {pkg.mode === 'KELOMPOK' ? 'Kelompok' : 'Privat'}
                </span>
                <span class="kv-sub">· Rp {pkg.price.toLocaleString('id-ID')}</span>
              {/if}
            </div>
          </div>

          <div class="kv-item">
            <div class="kv-label">Siswa Terdaftar</div>
            <div class="kv-value">
              <Icon name="person" size="xs" />
              <strong>{getStudentNames(job)}</strong>
            </div>
          </div>

          <div class="kv-item">
            <div class="kv-label">Kelas</div>
            <div class="kv-value">
              <Icon name="school" size="xs" />
              {getClassNames(job)}
            </div>
          </div>

          <div class="kv-item">
            <div class="kv-label">Mata Pelajaran</div>
            <div class="kv-value">
              <Icon name="menu_book" size="xs" />
              {getSubjectNames(job)}
            </div>
          </div>

          <div class="kv-item">
            <div class="kv-label">Jadwal Les</div>
            <div class="kv-value">
              <Icon name="calendar_month" size="xs" />
              {(job.scheduleDays || []).join(', ') || 'Senin, Rabu'}
            </div>
          </div>

          <div class="kv-item">
            <div class="kv-label">Waktu & Durasi</div>
            <div class="kv-value">
              <Icon name="schedule" size="xs" />
              {job.scheduleTime || '16:00'} – {job.scheduleEndTime || '17:30'} WIB
              <span class="kv-sub">({job.sessionDurationMinutes || 90} menit)</span>
            </div>
          </div>

          <div class="kv-item full-width">
            <div class="kv-label">Rincian Finansial Tentor</div>
            <div class="financial-box">
              <div class="fin-item">
                <span class="fin-lbl">Honor Pokok / Sesi:</span>
                <span class="fin-val">{formatCurrencyIDR(fee)}</span>
              </div>
              <div class="fin-item">
                <span class="fin-lbl">Uang Transport / Sesi:</span>
                <span class="fin-val">{transport > 0 ? formatCurrencyIDR(transport) : 'Rp 0'}</span>
              </div>
              <div class="fin-total">
                <span class="fin-lbl">Total Honor Tentor / Sesi:</span>
                <span class="fin-total-val">{formatCurrencyIDR(totalHonor)}</span>
              </div>
            </div>
          </div>

          <!-- Lokasi Les & Peta -->
          <div class="kv-item full-width">
            <div class="kv-label">Lokasi Les & Titik Koordinat</div>
            <div class="kv-value mb-2">
              <Icon name="place" size="xs" />
              {job.location || 'Lokasi Les'}
              {#if job.latitude && job.longitude}
                <span class="kv-sub">({job.latitude}, {job.longitude})</span>
              {/if}
            </div>

            {#if isOffline && job.latitude && job.longitude}
              <div class="map-preview-box">
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
            <div class="kv-item full-width">
              <div class="kv-label">Deskripsi / Catatan Tambahan</div>
              <div class="notes-box">
                {job.notes || job.additionalNotes}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- 3. Daftar Pelamar (Lamaran Masuk) -->
      <div class="section-card">
        <div class="section-title">
          <Icon name="group" size="sm" /> Lamaran Masuk ({applications.length})
        </div>

        {#if applications.length === 0}
          <div class="empty-state">
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
                  <th style="text-align:right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {#each applications as a (a.id)}
                  <tr>
                    <td>
                      <strong>{getUserName(a.tentorId)}</strong>
                      <div class="sub">{a.notes || 'Tanpa catatan'}</div>
                    </td>
                    <td>
                      <span class="badge {getStatusBadgeClass(a.status)}">
                        {getStatusLabel(a.status, APPLICATION_STATUS_LABEL)}
                      </span>
                    </td>
                    <td>
                      <div class="actions">
                        {#if a.status === 'PENDING' && job.status !== 'ASSIGNED'}
                          <Button
                            variant="primary"
                            size="sm"
                            on:click={() => handleAppApprove(a.id)}
                            icon="check"
                          >
                            Setujui
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            on:click={() => { confirmRejectAppId = a.id; }}
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
      <div class="section-card">
        <div class="section-title">
          <Icon name="tune" size="sm" /> Kelola Status Lowongan
        </div>

        <div class="status-manage-body">
          {#if job.status === 'AVAILABLE'}
            <p class="status-desc">
              Lowongan sedang berstatus <strong>Tersedia</strong>. Tentor aktif dapat melihat dan melamar dari feed lowongan.
            </p>
          {:else if job.status === 'NEGOTIATING'}
            <p class="status-desc">
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
            <p class="status-desc">
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
            <p class="status-desc">
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

<style>
  .manage-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .overview-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }

  .overview-main {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .job-title {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: #0f172a;
  }

  .badge-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  .section-card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #ffffff;
    overflow: hidden;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.85rem;
    font-weight: 600;
    color: #334155;
  }

  .kv-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .kv-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f1f5f9;
  }

  .kv-item:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }

  .kv-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #64748b;
  }

  .kv-value {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.88rem;
    color: #1e293b;
  }

  .kv-sub {
    font-size: 0.78rem;
    color: #64748b;
  }

  .financial-box {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 14px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    margin-top: 4px;
  }

  .fin-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.82rem;
    color: #166534;
  }

  .fin-total {
    display: flex;
    justify-content: space-between;
    padding-top: 6px;
    border-top: 1px dashed #86efac;
    font-size: 0.88rem;
    font-weight: 700;
    color: #15803d;
  }

  .map-preview-box {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    margin-top: 6px;
  }

  .notes-box {
    padding: 10px 12px;
    background: #f8fafc;
    border-radius: 8px;
    font-size: 0.84rem;
    color: #334155;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    color: #94a3b8;
    gap: 6px;
    font-size: 0.84rem;
  }

  .status-manage-body {
    padding: 14px;
  }

  .status-desc {
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 10px;
  }
</style>
