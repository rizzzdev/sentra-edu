<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$lib/components/atoms/icon.svelte';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { getTutorPrograms, type UnifiedProgram } from '$lib/shared/utils/program-helpers';
  import { formatDateIndonesian } from '$lib/shared/utils/formatting';
  import { ATTENDANCE_STATUS_LABEL, getStatusLabel, getStatusBadgeClass, getScheduleDaysList, DAY_OPTIONS } from '$lib/shared/utils/status-map';
  import LeafletMap from '$lib/components/molecules/leaflet-map.svelte';
  import { onMount } from 'svelte';

  let isLoading = true;

  onMount(() => {
    setTimeout(() => { isLoading = false; }, 300);
  });

  $: currentUser = $authStore;
  $: programId = $page.params.id;

  $: allPrograms = currentUser
    ? getTutorPrograms($dbStore, currentUser.id)
    : [];

  $: program = allPrograms.find((programItem: UnifiedProgram) => programItem.id === programId);

  $: programAttendances = $dbStore.attendances.filter((attendanceItem) => {
    if (attendanceItem.deletedAt !== null) return false;
    if (currentUser && attendanceItem.tentorId !== currentUser.id) return false;
    if (attendanceItem.enrollmentId === programId) return true;
    if (program && program.enrollmentId && attendanceItem.enrollmentId === program.enrollmentId) return true;
    return false;
  }).sort((firstItem, secondItem) => (firstItem.sessionDate < secondItem.sessionDate ? 1 : -1));

  $: approvedCount = programAttendances.filter((attendanceItem) => attendanceItem.status === 'APPROVED').length;
  $: totalHours = Math.round(approvedCount * 1.5);

  function getStudentUser(studentId: string | null) {
    if (!studentId) return null;
    return $dbStore.users.find((userItem) => userItem.id === studentId) || null;
  }

  function formatScheduleDays(days: string[]): string {
    const list = getScheduleDaysList(days);
    if (list.length === 0) return '—';
    if (list.length <= 2) return list.join(' & ');
    return `${list[0]}–${list[list.length - 1]}`;
  }
</script>

<!-- BREADCRUMB -->
<div class="flex items-center gap-2 mb-5 text-xs">
  <a href="/tutor/classes" class="inline-flex items-center gap-1 text-primary font-medium hover:underline">
    <Icon name="arrow_back" size="xs" />
    Program Les Aktif
  </a>
  <span class="text-muted-fg">/</span>
  <span class="text-fg font-semibold">Detail Program</span>
</div>

{#if isLoading}
  <!-- SKELETON -->
  <div class="card mb-4 p-6 space-y-3">
    <Skeleton width="w-1/2" height="h-7" />
    <Skeleton width="w-1/3" height="h-4" />
    <Skeleton width="w-1/4" height="h-4" />
  </div>
  <div class="stat-grid mb-6">
    <Skeleton height="h-20" className="rounded-xl" />
    <Skeleton height="h-20" className="rounded-xl" />
    <Skeleton height="h-20" className="rounded-xl" />
  </div>

{:else if !program}
  <!-- NOT FOUND -->
  <div class="card p-12 text-center">
    <div class="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 inline-flex items-center justify-center mb-4 mx-auto">
      <Icon name="error_outline" size="xl" />
    </div>
    <h3 class="font-bold text-lg text-fg mb-1">Program Tidak Ditemukan</h3>
    <p class="text-xs text-muted-fg mb-5">Data program bimbingan belajar ini tidak tersedia atau tidak terhubung dengan akun Anda.</p>
    <a href="/tutor/classes" class="btn btn-outline btn-sm inline-flex items-center gap-1.5 mx-auto">
      <Icon name="arrow_back" size="xs" /> Kembali
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
              {program.packageName}
            </span>
            <span class="badge {getStatusBadgeClass(program.status)}">
              {program.statusLabel}
            </span>
          </div>
          <h1 class="text-xl md:text-2xl font-bold text-fg">{program.title}</h1>
          <p class="text-xs text-muted-fg">
            {program.subjectNames.length} Mapel, {program.classNames.length} Kelas, {program.studentNames.length || program.studentCount || 1} Murid
          </p>
        </div>

        {#if program.studentIds[0]}
          {@const primaryStudent = getStudentUser(program.studentIds[0])}
          {#if primaryStudent?.phone}
            <div class="flex-shrink-0">
              <a
                href="https://wa.me/{primaryStudent.phone.replace(/[^0-9]/g, '')}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-success btn-sm inline-flex items-center gap-1.5"
              >
                <Icon name="chat" size="xs" /> Hubungi Murid via WhatsApp
              </a>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>

  <!-- STAT METRICS -->
  <div class="stat-grid mb-6">
    <div class="stat">
      <div class="s-icon tone-sky"><Icon name="fact_check" size="lg" /></div>
      <div>
        <div class="s-val">{programAttendances.length}</div>
        <div class="s-lbl">Total Sesi Presensi</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-emerald"><Icon name="verified" size="lg" /></div>
      <div>
        <div class="s-val">{approvedCount}</div>
        <div class="s-lbl">Sesi Disetujui</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-amber"><Icon name="schedule" size="lg" /></div>
      <div>
        <div class="s-val">{totalHours} jam</div>
        <div class="s-lbl">Total Jam Mengajar</div>
      </div>
    </div>
  </div>

  <!-- 2-COLUMN STRUCTURED DETAILS -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <!-- LEFT COLUMN -->
    <div class="space-y-6">
      <!-- JADWAL -->
      <div class="card">
        <div class="card-head flex items-center gap-2">
          <Icon name="schedule" size="md" />
          <h3 class="font-bold text-base">Jadwal Bimbingan</h3>
        </div>
        <div class="card-body space-y-3">
          <div class="flex justify-between items-center text-sm py-1 border-b border-border">
            <span class="text-muted-fg">Hari</span>
            <span class="font-semibold text-fg">{formatScheduleDays(program.scheduleDays)}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-1 border-b border-border">
            <span class="text-muted-fg">Jam</span>
            <span class="font-semibold text-primary">
              {program.scheduleTime}{#if program.scheduleEndTime} – {program.scheduleEndTime}{/if} WIB
            </span>
          </div>

          <!-- Day chips -->
          <div class="flex items-center gap-1.5 flex-wrap pt-2">
            {#each DAY_OPTIONS as opt}
              {@const isActive = program.scheduleDays.includes(opt.value) || program.scheduleDays.includes(opt.label)}
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors {isActive ? 'bg-primary text-white' : 'bg-muted text-muted-fg'}">
                {opt.label.slice(0, 2)}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- LOKASI -->
      <div class="card">
        <div class="card-head flex items-center gap-2">
          <Icon name="location_on" size="md" />
          <h3 class="font-bold text-base">Lokasi Bimbingan Belajar</h3>
        </div>
        <div class="card-body">
          {#if program.jobMode === 'ONLINE'}
            <p class="text-sm text-fg">Bimbingan belajar dilaksanakan secara daring (online).</p>
          {:else if program.latitude && program.longitude}
            <div class="rounded-xl overflow-hidden border border-border">
              <LeafletMap
                latitude={program.latitude}
                longitude={program.longitude}
                readonly={true}
                height="200px"
                zoom={15}
              />
            </div>
            <p class="text-xs text-muted-fg mt-2 flex items-center gap-1">
              <Icon name="pin_drop" size="xs" className="text-rose-500" />
              {program.location}
            </p>
          {:else}
            <p class="text-sm text-fg">{program.location}</p>
          {/if}
        </div>
      </div>

      <!-- CATATAN -->
      {#if program.notes}
        <div class="card">
          <div class="card-head flex items-center gap-2">
            <Icon name="notes" size="md" />
            <h3 class="font-bold text-base">Catatan Tambahan</h3>
          </div>
          <div class="card-body">
            <p class="text-sm text-fg leading-relaxed whitespace-pre-line">{program.notes}</p>
          </div>
        </div>
      {/if}
    </div>

    <!-- RIGHT COLUMN -->
    <div class="space-y-6">
      <!-- MURID -->
      <div class="card">
        <div class="card-head flex items-center gap-2">
          <Icon name="person" size="md" />
          <h3 class="font-bold text-base">Data Murid</h3>
        </div>
        <div class="card-body">
          <div class="space-y-3">
            {#each program.studentNames as studentName, index}
              {@const studentId = program.studentIds[index]}
              {@const studentUser = getStudentUser(studentId)}
              <div class="flex items-center gap-3.5 p-3 rounded-xl bg-muted border border-border">
                <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {studentName.charAt(0).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-sm text-fg truncate">{studentName}</div>
                  <div class="text-xs text-muted-fg mt-0.5">{studentUser?.school || 'Siswa SentraEdu'}</div>
                  {#if studentUser?.phone}
                    <div class="mt-1.5">
                      <a
                        href="https://wa.me/{studentUser.phone.replace(/[^0-9]/g, '')}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-1 text-xs text-success font-semibold hover:underline"
                      >
                        <Icon name="chat" size="xs" /> WhatsApp ({studentUser.phone})
                      </a>
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- RINGKASAN -->
      <div class="card">
        <div class="card-head flex items-center gap-2">
          <Icon name="info" size="md" />
          <h3 class="font-bold text-base">Ringkasan Paket</h3>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-2 gap-3">
            <div class="p-2.5 bg-muted rounded-lg">
              <span class="text-xs text-muted-fg block">Paket</span>
              <span class="text-sm font-bold text-fg">{program.packageName}</span>
            </div>
            <div class="p-2.5 bg-muted rounded-lg">
              <span class="text-xs text-muted-fg block">Tipe</span>
              <span class="text-sm font-bold text-fg">{program.packageMode === 'PRIVAT' ? 'Privat' : 'Kelompok'}</span>
            </div>
            <div class="p-2.5 bg-muted rounded-lg">
              <span class="text-xs text-muted-fg block">Mode</span>
              <span class="text-sm font-bold text-fg">{program.jobMode === 'ONLINE' ? 'Online' : 'Tatap Muka'}</span>
            </div>
            <div class="p-2.5 bg-muted rounded-lg">
              <span class="text-xs text-muted-fg block">Jumlah Siswa</span>
              <span class="text-sm font-bold text-fg">{program.studentCount} orang</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- RIWAYAT PRESENSI -->
  <div class="card">
    <div class="card-head flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Icon name="fact_check" size="md" />
        <h3 class="font-bold text-base">Riwayat Presensi</h3>
      </div>
      <a href="/tutor/attendance" class="btn btn-xs btn-outline inline-flex items-center gap-1">
        <Icon name="edit_calendar" size="xs" /> Catat Presensi
      </a>
    </div>

    {#if programAttendances.length === 0}
      <div class="card-body text-center py-12 text-muted-fg">
        <Icon name="event_busy" size="xl" className="opacity-30 mb-2 block mx-auto text-4xl" />
        <p class="font-semibold text-fg">Belum ada catatan presensi.</p>
        <span class="text-xs">Anda belum mencatat sesi presensi untuk program ini.</span>
      </div>
    {:else}
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Tanggal & Sesi</th>
              <th>Topik Pembelajaran</th>
              <th>Catatan Siswa</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#each programAttendances as attendanceItem (attendanceItem.id)}
              <tr>
                <td>
                  <strong>{formatDateIndonesian(attendanceItem.sessionDate)}</strong>
                  <div class="sub">
                    {attendanceItem.startTime ? attendanceItem.startTime.slice(11, 16) : ''}
                    {#if attendanceItem.endTime} – {attendanceItem.endTime.slice(11, 16)}{/if}
                    WIB
                  </div>
                </td>
                <td>
                  <span class="text-sm font-medium">{attendanceItem.topic || '—'}</span>
                </td>
                <td>
                  <span class="text-xs text-muted-fg italic">{attendanceItem.studentNotes ? `"${attendanceItem.studentNotes}"` : '—'}</span>
                </td>
                <td>
                  <span class="badge {getStatusBadgeClass(attendanceItem.status)}">
                    {getStatusLabel(attendanceItem.status, ATTENDANCE_STATUS_LABEL)}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
{/if}
