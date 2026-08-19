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

  export let open: boolean = false;
  export let job: JobPost | null = null;
  export let onClose: () => void = () => {};

  let confirmCancelOpen: boolean = false;
  let confirmRejectAppId: string | null = null;

  $: applications = job
    ? $dbStore.applications.filter((a) => a.deletedAt === null && a.jobId === job?.id)
    : [];
  $: pendingApps = applications.filter((a) => a.status === 'PENDING');

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

  function getPackageName(packageId?: string): string {
    if (!packageId) return '—';
    return $dbStore.packages.find((p) => p.id === packageId)?.name || '—';
  }

  function getJobFee(j: JobPost): number {
    const pkg = $dbStore.packages.find((p) => p.id === j.packageId);
    return pkg ? pkg.tentorFee : 100000;
  }

  function handleAppApprove(appId: string) {
    const app = applications.find((a) => a.id === appId);
    if (!app || !job) return;
    const res = dbStore.assignTentorToJob(job.id, app.tentorId);
    if (!res.error) {
      toastStore.success('Pelamar berhasil disetujui dan ditugaskan.');
    } else {
      toastStore.error(res.message);
    }
  }

  function handleAppRejectConfirm() {
    if (!confirmRejectAppId) return;
    const updatedApps = $dbStore.applications.map((a) =>
      a.id === confirmRejectAppId ? { ...a, status: 'REJECTED' as const } : a
    );
    // Persist via dbStore snapshot
    const snap = dbStore.getSnapshot();
    dbStore.importDatabaseJson(JSON.stringify({ ...snap, applications: updatedApps }));
    confirmRejectAppId = null;
    toastStore.success('Lamaran ditolak.');
  }

  function handleSetStatus(newStatus: 'AVAILABLE' | 'CANCELLED') {
    if (!job) return;
    const res = dbStore.saveJobPost({
      id: job.id,
      status: newStatus,
      assignedTentorId: newStatus === 'AVAILABLE' ? null : job.assignedTentorId
    });
    if (!res.error) {
      toastStore.success(`Status lowongan diubah menjadi ${newStatus}.`);
    } else {
      toastStore.error(res.message);
    }
  }
</script>

<Modal {open} {onClose} title="Kelola Lowongan" icon="tune" maxWidth="680px">
  {#if job}
    <div class="kv">
      <dt>Judul</dt>
      <dd>{job.title}</dd>
      <dt>Siswa</dt>
      <dd>{job.studentName || '—'}</dd>
      <dt>Kelas · Mapel</dt>
      <dd>{getClassName(job.classId)} · {getSubjectName(job.subjectId)}</dd>
      <dt>Mode</dt>
      <dd>
        <span class="badge {job.mode === 'ONLINE' ? 'b-neutral' : 'b-available'}">{job.mode || 'OFFLINE'}</span>
      </dd>
      <dt>Paket Les</dt>
      <dd>{getPackageName(job.packageId)}</dd>
      <dt>Jadwal</dt>
      <dd>{job.schedulePreference || `${(job.scheduleDays || []).join(' & ')} ${job.scheduleTime} WIB`}</dd>
      <dt>Estimasi Honor/Sesi</dt>
      <dd>{formatCurrencyIDR(getJobFee(job))}</dd>
      <dt>Lokasi Les (GPS)</dt>
      <dd>
        {job.latitude !== null && job.latitude !== undefined && job.longitude !== null && job.longitude !== undefined
          ? `${job.latitude}, ${job.longitude}`
          : '—'}
      </dd>
      <dt>Status</dt>
      <dd>
        <span class="badge {getStatusBadgeClass(job.status)}">
          {getStatusLabel(job.status, JOB_STATUS_LABEL)}
        </span>
      </dd>
    </div>

    <!-- Lamaran Masuk Card -->
    <div class="card" style="border:1px solid var(--border);border-radius:12px;margin-bottom:14px">
      <div class="card-head" style="padding:10px 14px;font-size:.85rem">
        <Icon name="group" size="sm" /> Lamaran Masuk ({applications.length})
      </div>
      <div class="card-body flush">
        {#if applications.length === 0}
          <div style="padding:14px;font-size:.84rem;color:var(--muted-fg)">
            Belum ada tentor yang melamar.
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
                      <div class="sub">{a.notes || '—'}</div>
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
    </div>

    <!-- Ubah Status Lowongan Card -->
    <div class="card" style="border:1px solid var(--border);border-radius:12px">
      <div class="card-head" style="padding:10px 14px;font-size:.85rem">
        <Icon name="tune" size="sm" /> Ubah Status Lowongan
      </div>
      <div class="card-body">
        {#if job.status === 'AVAILABLE'}
          <p style="font-size:.85rem;color:var(--muted-fg);margin-bottom:10px">
            Lowongan tersedia. Tentor bisa melamar dari feed lowongan.
          </p>
        {:else if job.status === 'NEGOTIATING'}
          <p style="font-size:.85rem;color:var(--muted-fg);margin-bottom:10px">
            Sedang dinegosiasikan. Setujui salah satu pelamar, atau kembalikan ke status Tersedia.
          </p>
          <div class="quick-actions">
            <Button
              variant="outline"
              size="sm"
              on:click={() => handleSetStatus('AVAILABLE')}
              icon="undo"
            >
              Kembalikan ke Tersedia
            </Button>
          </div>
        {:else if job.status === 'ASSIGNED'}
          <p style="font-size:.85rem;color:var(--muted-fg);margin-bottom:10px">
            Ditugaskan ke <strong>{getUserName(job.assignedTentorId)}</strong>. Job terkunci — tidak bisa dilamar tentor lain.
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
          <p style="font-size:.85rem;color:var(--muted-fg);margin-bottom:10px">
            Lowongan dibatalkan. Buka kembali lowongan ini agar tentor bisa melamar lagi.
          </p>
          <div class="quick-actions">
            <Button
              variant="outline"
              size="sm"
              on:click={() => handleSetStatus('AVAILABLE')}
              icon="undo"
            >
              Kembalikan ke Tersedia
            </Button>
          </div>
        {/if}
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
