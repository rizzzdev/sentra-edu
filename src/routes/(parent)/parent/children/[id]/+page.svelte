<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { getParentPrograms, type UnifiedProgram } from '$lib/shared/utils/program-helpers';
  import { formatDateIndonesian } from '$lib/shared/utils/formatting';
  import { ATTENDANCE_STATUS_LABEL, getStatusLabel, getStatusBadgeClass } from '$lib/shared/utils/status-map';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
  import AlertBanner from '$lib/components/molecules/alert-banner.svelte';
  import LeafletMap from '$lib/components/molecules/leaflet-map.svelte';

  let isLoading: boolean = true;

  import { onMount } from 'svelte';
  onMount(() => {
    setTimeout(() => {
      isLoading = false;
    }, 300);
  });

  $: currentUser = $authStore;
  $: programId = $page.params.id;

  $: allPrograms = currentUser
    ? getParentPrograms($dbStore, currentUser.id)
    : [];

  $: program = allPrograms.find((p: UnifiedProgram) => p.id === programId);

  $: programAttendances = $dbStore.attendances.filter((a) => {
    if (a.deletedAt !== null) return false;
    if (a.enrollmentId === programId) return true;
    if (program && program.enrollmentId && a.enrollmentId === program.enrollmentId) return true;
    return false;
  }).sort((a, b) => (a.sessionDate < b.sessionDate ? 1 : -1));

  $: approvedCount = programAttendances.filter((a) => a.status === 'APPROVED').length;

  function getUserName(userId: string | null | undefined): string {
    if (!userId) return '—';
    return $dbStore.users.find((u) => u.id === userId)?.fullName || '—';
  }
</script>

<!-- TOP NAV & BREADCRUMBS -->
<div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
  <div class="flex items-center gap-2 text-sm text-muted-fg">
    <a href="/parent/children" class="text-primary hover:underline font-medium">Program Les Anak</a>
    <span>/</span>
    <span class="text-fg font-semibold">Detail Program</span>
  </div>
  <a href="/parent/children" class="btn btn-sm btn-outline inline-flex items-center gap-1.5">
    <Icon name="arrow_back" size="xs" /> Kembali
  </a>
</div>

{#if isLoading}
  <div class="card p-6 space-y-4">
    <Skeleton height="2rem" width="50%" />
    <Skeleton height="1.25rem" width="30%" />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      <Skeleton height="5rem" width="100%" />
      <Skeleton height="5rem" width="100%" />
      <Skeleton height="5rem" width="100%" />
    </div>
    <Skeleton height="10rem" width="100%" />
  </div>

{:else if !program}
  <div class="card p-8 text-center">
    <Icon name="error_outline" size="xl" className="text-amber-500 mb-3 block mx-auto text-5xl" />
    <h3 class="font-bold text-lg text-fg mb-1">Program Les Tidak Ditemukan</h3>
    <p class="text-muted-fg text-sm max-w-md mx-auto mb-4">
      Data program bimbingan belajar anak dengan ID ini tidak tersedia atau tidak terhubung dengan akun Anda.
    </p>
    <a href="/parent/children" class="btn btn-primary btn-sm inline-flex items-center gap-1">
      <Icon name="arrow_back" size="xs" /> Kembali ke Daftar Program Anak
    </a>
  </div>

{:else}
  <!-- HERO HEADER CARD -->
  <div class="card mb-6">
    <div class="card-body">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="badge {program.packageMode === 'PRIVAT' ? 'b-sky' : 'b-amber'}">
              <Icon name={program.packageMode === 'PRIVAT' ? 'person' : 'groups'} size="xs" />
              {program.packageMode} ({program.studentCount} Siswa)
            </span>
            <span class="badge b-neutral">
              <Icon name={program.jobMode === 'OFFLINE' ? 'home_pin' : 'videocam'} size="xs" />
              {program.jobMode === 'OFFLINE' ? 'Tatap Muka' : 'Online'}
            </span>
            <span class="badge b-open">
              <Icon name="sell" size="xs" />
              {program.packageName}
            </span>
            <span class="badge {program.statusBadgeClass}">
              {#if program.status === 'ASSIGNED'}
                <Icon name="check_circle" size="xs" />
              {:else if program.status === 'AVAILABLE'}
                <Icon name="hourglass_empty" size="xs" />
              {/if}
              {program.statusLabel}
            </span>
          </div>
          <h2 class="text-xl md:text-2xl font-bold text-fg">Program Les: {program.studentNames.join(', ')}</h2>
          <div class="text-sm text-muted-fg flex items-center gap-2 flex-wrap">
            <span>Mata Pelajaran: <strong class="text-fg">{program.subjectNames.join(', ')}</strong></span>
            <span>•</span>
            <span>Tingkat Kelas: <strong class="text-fg">{program.classNames.join(', ')}</strong></span>
          </div>
        </div>

        {#if program.tentorPhone}
          <div class="flex-shrink-0">
            <a
              href="https://wa.me/{program.tentorPhone.replace(/[^0-9]/g, '')}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-success btn-sm inline-flex items-center gap-1.5"
            >
              <Icon name="chat" size="xs" /> Hubungi Tentor
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- STAT METRICS -->
  <div class="stat-grid mb-6">
    <div class="stat">
      <div class="s-icon tone-sky"><Icon name="fact_check" size="lg" /></div>
      <div>
        <div class="s-val">{programAttendances.length} Sesi</div>
        <div class="s-lbl">Total Presensi Masuk</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-emerald"><Icon name="verified" size="lg" /></div>
      <div>
        <div class="s-val">{approvedCount} Sesi</div>
        <div class="s-lbl">Sesi Disetujui</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-amber"><Icon name="schedule" size="lg" /></div>
      <div>
        <div class="s-val">{Math.round(approvedCount * 1.5)} Jam</div>
        <div class="s-lbl">Total Jam Belajar</div>
      </div>
    </div>
  </div>

  <!-- 2-COLUMN STRUCTURED DETAILS -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <!-- LEFT COLUMN -->
    <div class="space-y-6">
      <!-- SISWA PESERTA -->
      <div class="card">
        <div class="card-head">
          <div class="card-title flex items-center gap-2">
            <Icon name="face" size="md" /> Siswa Peserta Les
          </div>
        </div>
        <div class="card-body">
          <div class="flex flex-wrap gap-2">
            {#each program.studentNames as studentName}
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-sm font-semibold text-fg">
                <Icon name="face" size="xs" className="text-primary" />
                <span>{studentName}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- TENTOR PROFILE CARD -->
      <div class="card">
        <div class="card-head">
          <div class="card-title flex items-center gap-2">
            <Icon name="badge" size="md" /> Tentor Pengajar
          </div>
        </div>
        <div class="card-body">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xl font-bold">
              {program.tentorName.charAt(0)}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-base text-fg truncate">{program.tentorName}</h4>
              <p class="text-xs text-muted-fg mt-0.5">Pengajar Bimbingan Belajar SentraEdu</p>
              {#if program.tentorPhone}
                <div class="mt-2.5">
                  <a
                    href="https://wa.me/{program.tentorPhone.replace(/[^0-9]/g, '')}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-sm btn-outline text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 inline-flex items-center gap-1.5"
                  >
                    <Icon name="chat" size="xs" /> WhatsApp ({program.tentorPhone})
                  </a>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <!-- CATATAN TAMBAHAN -->
      {#if program.notes}
        <div class="card">
          <div class="card-head">
            <div class="card-title flex items-center gap-2">
              <Icon name="notes" size="md" /> Catatan Tambahan
            </div>
          </div>
          <div class="card-body">
            <p class="text-sm text-fg leading-relaxed whitespace-pre-line">{program.notes}</p>
          </div>
        </div>
      {/if}
    </div>

    <!-- RIGHT COLUMN -->
    <div class="space-y-6">
      <!-- JADWAL & LOKASI -->
      <div class="card">
        <div class="card-head">
          <div class="card-title flex items-center gap-2">
            <Icon name="schedule" size="md" /> Jadwal & Lokasi Belajar
          </div>
        </div>
        <div class="card-body space-y-4">
          <div>
            <div class="text-xs font-semibold text-muted-fg uppercase tracking-wider mb-1">Hari & Jam Bimbingan</div>
            <div class="text-sm font-bold text-fg">
              {program.scheduleDays.join(', ')}
            </div>
            <div class="text-sm text-primary font-semibold mt-0.5">
              {program.scheduleTime}{#if program.scheduleEndTime} – {program.scheduleEndTime}{/if} WIB
            </div>
          </div>

          <div class="pt-3 border-t border-[var(--color-border)]">
            <div class="text-xs font-semibold text-muted-fg uppercase tracking-wider mb-1">Alamat / Lokasi Belajar</div>
            <div class="text-sm text-fg flex items-start gap-1.5">
              <Icon name="location_on" size="xs" className="text-rose-500 mt-0.5 flex-shrink-0" />
              <span>{program.location}</span>
            </div>
          </div>

          {#if program.latitude && program.longitude}
            <div class="pt-3 border-t border-[var(--color-border)]">
              <div class="text-xs font-semibold text-muted-fg uppercase tracking-wider mb-2">Peta Lokasi Les</div>
              <div class="rounded-xl overflow-hidden border border-[var(--color-border)]">
                <LeafletMap
                  latitude={program.latitude}
                  longitude={program.longitude}
                  readonly={true}
                  height="220px"
                  zoom={15}
                />
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- ATTENDANCE HISTORY FOR THIS PROGRAM -->
  <div class="card mb-6">
    <div class="card-head flex justify-between items-center">
      <div class="card-title flex items-center gap-2">
        <Icon name="fact_check" size="md" /> Riwayat Presensi Program Ini
      </div>
      <a href="/parent/attendance" class="btn btn-sm btn-outline">
        <Icon name="visibility" size="xs" /> Semua Presensi
      </a>
    </div>
    <div class="card-body flush">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Topik Pembelajaran</th>
              <th>Tentor</th>
              <th>Catatan Siswa</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#if programAttendances.length === 0}
              <tr>
                <td colspan="5" class="empty py-8 text-center text-muted-fg">
                  <Icon name="location_off" size="lg" className="opacity-40 mb-2 block mx-auto text-4xl" />
                  <div class="font-medium">Belum ada catatan presensi untuk program ini.</div>
                  <div class="text-xs text-muted-fg mt-1">Presensi akan muncul setelah tentor melakukan check-in mengajar.</div>
                </td>
              </tr>
            {:else}
              {#each programAttendances as att (att.id)}
                <tr>
                  <td>
                    <div class="font-medium">{formatDateIndonesian(att.sessionDate)}</div>
                    <div class="text-xs text-muted-fg">{att.startTime ? att.startTime.slice(11, 16) : ''} – {att.endTime ? att.endTime.slice(11, 16) : ''} WIB</div>
                  </td>
                  <td>
                    <div class="font-semibold text-fg">{att.topic || '—'}</div>
                  </td>
                  <td>{getUserName(att.tentorId)}</td>
                  <td>
                    <div class="text-sm text-muted-fg">{att.studentNotes || '—'}</div>
                  </td>
                  <td>
                    <span class="badge {getStatusBadgeClass(att.status)}">
                      {getStatusLabel(att.status, ATTENDANCE_STATUS_LABEL)}
                    </span>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>
{/if}
