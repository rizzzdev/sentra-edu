<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import AttendanceCheckinModal from '$lib/features/attendance-tracking/components/attendance-checkin-modal.svelte';
  import AttendanceVerifyModal from '$lib/features/attendance-tracking/components/attendance-verify-modal.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatDateIndonesian } from '$lib/shared/utils/formatting';
  import { ATTENDANCE_STATUS_LABEL, getStatusLabel, getStatusBadgeClass } from '$lib/shared/utils/status-map';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import type { AttendanceRecord } from '$lib/shared/types/common.types';
import { userStore, subjectStore, enrollmentStore, attendanceStore } from '$lib/api';
  import { api } from '$lib/api/client';

  let searchQuery: string = '';
  let statusFilter: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;

  let checkinModalOpen: boolean = false;
  let verifyModalOpen: boolean = false;
  let selectedAttendance: AttendanceRecord | null = null;

  $: currentUser = $authStore;

  $: allAttendances = $attendanceStore.filter((attendanceItem) => {
    if (attendanceItem.deletedAt !== null) return false;
    if (!currentUser) return false;

    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (currentUser.role === 'TENTOR') return attendanceItem.tentorId === currentUser.id;

    // Student or Parent
    const enrollmentItem = $enrollmentStore.find((enrollment) => enrollment.id === attendanceItem.enrollmentId);
    if (!enrollmentItem) return false;
    return enrollmentItem.studentId === currentUser.id || enrollmentItem.parentId === currentUser.id;
  });

  $: nSubmitted = allAttendances.filter((attendanceItem) => attendanceItem.status === 'SUBMITTED').length;
  $: nApproved = allAttendances.filter((attendanceItem) => attendanceItem.status === 'APPROVED').length;
  $: nRejected = allAttendances.filter((attendanceItem) => attendanceItem.status === 'REJECTED').length;

  function getUserName(userId: string | null | undefined): string {
    if (!userId) return '—';
    return $userStore.find((userItem) => userItem.id === userId)?.fullName || '—';
  }

  function getAttendanceStudents(attendanceItem: AttendanceRecord): string {
    if (attendanceItem.studentNames && attendanceItem.studentNames.length > 0) {
      return attendanceItem.studentNames.join(', ');
    }
    if (attendanceItem.studentIds && attendanceItem.studentIds.length > 0) {
      const names = $userStore
        .filter((userItem) => attendanceItem.studentIds?.includes(userItem.id))
        .map((userItem) => userItem.fullName);
      if (names.length > 0) return names.join(', ');
    }
    if (attendanceItem.enrollmentId) {
      const enr = $enrollmentStore.find((enrollmentItem) => enrollmentItem.id === attendanceItem.enrollmentId);
      if (enr) {
        return $userStore.find((userItem) => userItem.id === enr.studentId)?.fullName || '—';
      }
    }
    return '—';
  }

  function getAttendanceSubjects(attendanceItem: AttendanceRecord): string {
    if (attendanceItem.subjectIds && attendanceItem.subjectIds.length > 0) {
      const names = $subjectStore
        .filter((subjectItem) => attendanceItem.subjectIds?.includes(subjectItem.id))
        .map((subjectItem) => subjectItem.name);
      if (names.length > 0) return names.join(', ');
    }
    if (attendanceItem.enrollmentId) {
      const enr = $enrollmentStore.find((enrollmentItem) => enrollmentItem.id === attendanceItem.enrollmentId);
      if (enr) {
        return $subjectStore.find((subjectItem) => subjectItem.id === enr.subjectId)?.name || '—';
      }
    }
    return '—';
  }

  $: filteredAttendances = allAttendances
    .filter((attendanceItem) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        attendanceItem.topic.toLowerCase().includes(query) ||
        getAttendanceStudents(attendanceItem).toLowerCase().includes(query) ||
        getAttendanceSubjects(attendanceItem).toLowerCase().includes(query) ||
        getUserName(attendanceItem.tentorId).toLowerCase().includes(query);
      const matchesStatus = !statusFilter || attendanceItem.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((firstItem, secondItem) => (firstItem.sessionDate < secondItem.sessionDate ? 1 : -1));

  $: paginatedAttendances = filteredAttendances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  $: totalPages = Math.max(1, Math.ceil(filteredAttendances.length / itemsPerPage));

  function handleOpenDetail(attendanceItem: AttendanceRecord) {
    selectedAttendance = attendanceItem;
    verifyModalOpen = true;
  }

  async function handleApprove(attendanceItem: AttendanceRecord) {
    const response = await api.attendances.update(attendanceItem.id, 'APPROVED');
    if (!response.error) {
      toastStore.success('Presensi disetujui.');
    } else {
      toastStore.error(response.message);
    }
  }

  async function handleReject(attendanceItem: AttendanceRecord) {
    const response = await api.attendances.update(attendanceItem.id, 'REJECTED', 'Ditolak oleh admin.');
    if (!response.error) {
      toastStore.success('Presensi ditolak.');
    } else {
      toastStore.error(response.message);
    }
  }
</script>

{#if currentUser?.role === 'SUPER_ADMIN'}
  <div class="page-head">
    <div>
      <h3><Icon name="fact_check" size="lg" /> Verifikasi Presensi</h3>
      <div class="desc">Setujui atau tolak presensi tentor. Sesi yang disetujui masuk penggajian & tagihan SPP.</div>
    </div>
  </div>

  <div class="stat-grid">
    <div class="stat">
      <div class="s-icon tone-amber"><Icon name="fact_check" size="lg" /></div>
      <div>
        <div class="s-val">{nSubmitted}</div>
        <div class="s-lbl">Menunggu Verifikasi</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-emerald"><Icon name="verified" size="lg" /></div>
      <div>
        <div class="s-val">{nApproved}</div>
        <div class="s-lbl">Disetujui</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-rose"><Icon name="cancel" size="lg" /></div>
      <div>
        <div class="s-val">{nRejected}</div>
        <div class="s-lbl">Ditolak</div>
      </div>
    </div>
  </div>

  <div class="filter-bar">
    <div class="filter-search">
      <Icon name="search" size="sm" />
      <input type="text" placeholder="Cari topik / murid / tentor..." bind:value={searchQuery} />
    </div>
    <SelectSearch
      bind:value={statusFilter}
      placeholder="Semua Status"
      options={[
        { value: '', label: 'Semua Status' },
        ...Object.entries(ATTENDANCE_STATUS_LABEL).map(([statusKey, statusLabel]) => ({ value: statusKey, label: statusLabel }))
      ]}
      className="max-w-48"
    />
  </div>

  <div class="card">
    <div class="card-body flush">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Tanggal & Waktu</th>
              <th>Tentor</th>
              <th>Murid</th>
              <th>Mapel · Topik</th>
              <th>Durasi / Sesi</th>
              <th>Status</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#if paginatedAttendances.length === 0}
              <tr>
                <td colspan="7" class="empty">Tidak ada presensi untuk filter ini.</td>
              </tr>
            {:else}
              {#each paginatedAttendances as attendanceItem (attendanceItem.id)}
                <tr>
                  <td>
                    <div class="font-medium">{formatDateIndonesian(attendanceItem.sessionDate)}</div>
                    {#if attendanceItem.startTime && attendanceItem.endTime}
                      <div class="text-xs text-muted-fg">
                        {attendanceItem.startTime.includes('T') ? attendanceItem.startTime.split('T')[1].substring(0, 5) : attendanceItem.startTime} - 
                        {attendanceItem.endTime.includes('T') ? attendanceItem.endTime.split('T')[1].substring(0, 5) : attendanceItem.endTime}
                      </div>
                    {/if}
                  </td>
                  <td class="font-medium">{getUserName(attendanceItem.tentorId)}</td>
                  <td class="font-medium text-fg">{getAttendanceStudents(attendanceItem)}</td>
                  <td>
                    <div class="font-semibold text-xs text-primary">{getAttendanceSubjects(attendanceItem)}</div>
                    <div class="text-sm">{attendanceItem.topic}</div>
                    {#if attendanceItem.latitudeCheckIn !== null && !attendanceItem.isRadiusValid}
                      <div class="sub text-warn text-xs flex items-center gap-1 mt-0.5">
                        <Icon name="warning" size="xs" /> di luar radius
                      </div>
                    {/if}
                  </td>
                  <td>
                    <span class="badge bg-muted text-muted-fg font-medium">
                      {attendanceItem.durationMinutes || 90} mnt ({attendanceItem.sessionsCount || 1} sesi)
                    </span>
                  </td>
                  <td>
                    <span class="badge {getStatusBadgeClass(attendanceItem.status)}">
                      {getStatusLabel(attendanceItem.status, ATTENDANCE_STATUS_LABEL)}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      <button
                        type="button"
                        class="btn-icon"
                        data-tip="Periksa"
                        on:click={() => handleOpenDetail(attendanceItem)}
                      >
                        <Icon name="visibility" size="sm" />
                      </button>
                      {#if attendanceItem.status === 'SUBMITTED'}
                        <button
                          type="button"
                          class="btn-icon"
                          data-tip="Setujui"
                          on:click={() => handleApprove(attendanceItem)}
                        >
                          <Icon name="check" size="sm" />
                        </button>
                        <button
                          type="button"
                          class="btn-icon btn-icon-danger"
                          data-tip="Tolak"
                          on:click={() => handleReject(attendanceItem)}
                        >
                          <Icon name="close" size="sm" />
                        </button>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      {#if filteredAttendances.length > itemsPerPage}
        <div class="page-nav">
          <div class="page-info">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredAttendances.length)} dari {filteredAttendances.length} data
          </div>
          <div class="page-btns">
            <button
              type="button"
              class="page-btn"
              disabled={currentPage <= 1}
              on:click={() => currentPage--}
            >
              &laquo;
            </button>
            {#each Array.from({ length: totalPages }, (_, index) => index + 1) as pageNumber}
              <button
                type="button"
                class="page-btn {currentPage === pageNumber ? 'active' : ''}"
                on:click={() => { currentPage = pageNumber; }}
              >
                {pageNumber}
              </button>
            {/each}
            <button
              type="button"
              class="page-btn"
              disabled={currentPage >= totalPages}
              on:click={() => currentPage++}
            >
              &raquo;
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>

{:else if currentUser?.role === 'TENTOR'}
  <div class="page-head">
    <div>
      <h3><Icon name="location_on" size="lg" /> Presensi Saya</h3>
      <div class="desc">Catatan presensi dan materi belajar sesi les Anda.</div>
    </div>
    <button type="button" class="btn btn-primary" on:click={() => { checkinModalOpen = true; }}>
      <Icon name="location_on" size="sm" /> Check-in Presensi
    </button>
  </div>

  <div class="card">
    <div class="card-body flush">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Tanggal & Waktu</th>
              <th>Murid</th>
              <th>Mapel</th>
              <th>Topik Materi</th>
              <th>Durasi / Sesi</th>
              <th>Status</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#if paginatedAttendances.length === 0}
              <tr>
                <td colspan="7" class="empty">Belum ada catatan presensi. Klik "Check-in Presensi".</td>
              </tr>
            {:else}
              {#each paginatedAttendances as attendanceItem (attendanceItem.id)}
                <tr>
                  <td>
                    <div class="font-medium">{formatDateIndonesian(attendanceItem.sessionDate)}</div>
                    {#if attendanceItem.startTime && attendanceItem.endTime}
                      <div class="text-xs text-muted-fg">
                        {attendanceItem.startTime.includes('T') ? attendanceItem.startTime.split('T')[1].substring(0, 5) : attendanceItem.startTime} - 
                        {attendanceItem.endTime.includes('T') ? attendanceItem.endTime.split('T')[1].substring(0, 5) : attendanceItem.endTime}
                      </div>
                    {/if}
                  </td>
                  <td class="font-medium text-fg">{getAttendanceStudents(attendanceItem)}</td>
                  <td>{getAttendanceSubjects(attendanceItem)}</td>
                  <td>{attendanceItem.topic}</td>
                  <td>
                    <span class="badge bg-muted text-muted-fg font-medium">
                      {attendanceItem.durationMinutes || 90} mnt ({attendanceItem.sessionsCount || 1} sesi)
                    </span>
                  </td>
                  <td>
                    <span class="badge {getStatusBadgeClass(attendanceItem.status)}">
                      {getStatusLabel(attendanceItem.status, ATTENDANCE_STATUS_LABEL)}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      <button
                        type="button"
                        class="btn-icon"
                        data-tip="Periksa"
                        on:click={() => handleOpenDetail(attendanceItem)}
                      >
                        <Icon name="visibility" size="sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      {#if filteredAttendances.length > itemsPerPage}
        <div class="page-nav">
          <div class="page-info">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredAttendances.length)} dari {filteredAttendances.length} data
          </div>
          <div class="page-btns">
            <button
              type="button"
              class="page-btn"
              disabled={currentPage <= 1}
              on:click={() => currentPage--}
            >
              &laquo;
            </button>
            {#each Array.from({ length: totalPages }, (_, index) => index + 1) as pageNumber}
              <button
                type="button"
                class="page-btn {currentPage === pageNumber ? 'active' : ''}"
                on:click={() => { currentPage = pageNumber; }}
              >
                {pageNumber}
              </button>
            {/each}
            <button
              type="button"
              class="page-btn"
              disabled={currentPage >= totalPages}
              on:click={() => currentPage++}
            >
              &raquo;
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>

{:else}
  <!-- STUDENT & PARENT ATTENDANCE -->
  <div class="page-head">
    <div>
      <h3><Icon name="fact_check" size="lg" /> Daftar Presensi</h3>
      <div class="desc">Riwayat kehadiran tentor pada sesi les pembelajaran.</div>
    </div>
  </div>

  <div class="filter-bar">
    <div class="filter-search">
      <Icon name="search" size="sm" />
      <input type="text" placeholder="Cari tentor / topik..." bind:value={searchQuery} />
    </div>
  </div>

  <div class="card">
    <div class="card-body flush">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Tanggal & Waktu</th>
              <th>Tentor</th>
              <th>Murid</th>
              <th>Mapel</th>
              <th>Topik Materi</th>
              <th>Durasi / Sesi</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#if paginatedAttendances.length === 0}
              <tr>
                <td colspan="7" class="empty">Belum ada riwayat presensi.</td>
              </tr>
            {:else}
              {#each paginatedAttendances as attendanceItem (attendanceItem.id)}
                <tr>
                  <td>
                    <div class="font-medium">{formatDateIndonesian(attendanceItem.sessionDate)}</div>
                    {#if attendanceItem.startTime && attendanceItem.endTime}
                      <div class="text-xs text-muted-fg">
                        {attendanceItem.startTime.includes('T') ? attendanceItem.startTime.split('T')[1].substring(0, 5) : attendanceItem.startTime} - 
                        {attendanceItem.endTime.includes('T') ? attendanceItem.endTime.split('T')[1].substring(0, 5) : attendanceItem.endTime}
                      </div>
                    {/if}
                  </td>
                  <td class="font-medium">{getUserName(attendanceItem.tentorId)}</td>
                  <td class="font-medium text-fg">{getAttendanceStudents(attendanceItem)}</td>
                  <td>{getAttendanceSubjects(attendanceItem)}</td>
                  <td>{attendanceItem.topic}</td>
                  <td>
                    <span class="badge bg-muted text-muted-fg font-medium">
                      {attendanceItem.durationMinutes || 90} mnt ({attendanceItem.sessionsCount || 1} sesi)
                    </span>
                  </td>
                  <td>
                    <span class="badge {getStatusBadgeClass(attendanceItem.status)}">
                      {getStatusLabel(attendanceItem.status, ATTENDANCE_STATUS_LABEL)}
                    </span>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      {#if filteredAttendances.length > itemsPerPage}
        <div class="page-nav">
          <div class="page-info">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredAttendances.length)} dari {filteredAttendances.length} data
          </div>
          <div class="page-btns">
            <button
              type="button"
              class="page-btn"
              disabled={currentPage <= 1}
              on:click={() => currentPage--}
            >
              &laquo;
            </button>
            {#each Array.from({ length: totalPages }, (_, index) => index + 1) as pageNumber}
              <button
                type="button"
                class="page-btn {currentPage === pageNumber ? 'active' : ''}"
                on:click={() => { currentPage = pageNumber; }}
              >
                {pageNumber}
              </button>
            {/each}
            <button
              type="button"
              class="page-btn"
              disabled={currentPage >= totalPages}
              on:click={() => currentPage++}
            >
              &raquo;
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

{#if currentUser && currentUser.role === 'TENTOR'}
  <AttendanceCheckinModal
    open={checkinModalOpen}
    tentor={currentUser}
    onClose={() => { checkinModalOpen = false; }}
  />
{/if}

<AttendanceVerifyModal
  open={verifyModalOpen}
  attendance={selectedAttendance}
  onClose={() => { verifyModalOpen = false; }}
/>
