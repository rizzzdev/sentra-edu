<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import AttendanceCheckinModal from '$lib/features/attendance-tracking/components/attendance-checkin-modal.svelte';
  import AttendanceVerifyModal from '$lib/features/attendance-tracking/components/attendance-verify-modal.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatDateIndonesian } from '$lib/shared/utils/formatting';
  import { ATTENDANCE_STATUS_LABEL, getStatusLabel, getStatusBadgeClass } from '$lib/shared/utils/status-map';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import type { AttendanceRecord } from '$lib/shared/types/common.types';

  let searchQuery: string = '';
  let statusFilter: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;

  let checkinModalOpen: boolean = false;
  let verifyModalOpen: boolean = false;
  let selectedAttendance: AttendanceRecord | null = null;

  $: currentUser = $authStore;

  $: allAttendances = $dbStore.attendances.filter((a) => {
    if (a.deletedAt !== null) return false;
    if (!currentUser) return false;

    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (currentUser.role === 'TENTOR') return a.tentorId === currentUser.id;

    // Student or Wali
    const enr = $dbStore.enrollments.find((e) => e.id === a.enrollmentId);
    if (!enr) return false;
    return enr.studentId === currentUser.id || enr.waliUserId === currentUser.id;
  });

  $: nSubmitted = allAttendances.filter((a) => a.status === 'SUBMITTED').length;
  $: nApproved = allAttendances.filter((a) => a.status === 'APPROVED').length;
  $: nRejected = allAttendances.filter((a) => a.status === 'REJECTED').length;

  function getUserName(userId: string | null | undefined): string {
    if (!userId) return '—';
    return $dbStore.users.find((u) => u.id === userId)?.fullName || '—';
  }

  function getStudentOf(enrollmentId: string): string {
    const enr = $dbStore.enrollments.find((e) => e.id === enrollmentId);
    if (!enr) return '—';
    return $dbStore.users.find((u) => u.id === enr.studentId)?.fullName || '—';
  }

  function getSubjectName(enrollmentId: string): string {
    const enr = $dbStore.enrollments.find((e) => e.id === enrollmentId);
    if (!enr) return '—';
    return $dbStore.subjects.find((s) => s.id === enr.subjectId)?.name || '—';
  }

  $: filteredAttendances = allAttendances
    .filter((att) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        att.topic.toLowerCase().includes(q) ||
        getStudentOf(att.enrollmentId).toLowerCase().includes(q) ||
        getUserName(att.tentorId).toLowerCase().includes(q);
      const matchesStatus = !statusFilter || att.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => (a.sessionDate < b.sessionDate ? 1 : -1));

  $: paginatedAttendances = filteredAttendances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  $: totalPages = Math.max(1, Math.ceil(filteredAttendances.length / itemsPerPage));

  function handleOpenDetail(att: AttendanceRecord) {
    selectedAttendance = att;
    verifyModalOpen = true;
  }

  function handleApprove(att: AttendanceRecord) {
    const res = dbStore.verifyAttendance(att.id, 'APPROVED');
    if (!res.error) {
      toastStore.success('Presensi disetujui.');
    } else {
      toastStore.error(res.message);
    }
  }

  function handleReject(att: AttendanceRecord) {
    const res = dbStore.verifyAttendance(att.id, 'REJECTED', 'Ditolak oleh admin.');
    if (!res.error) {
      toastStore.success('Presensi ditolak.');
    } else {
      toastStore.error(res.message);
    }
  }
</script>

{#if currentUser?.role === 'SUPER_ADMIN'}
  <div class="page-head">
    <div>
      <h3><Icon name="fact_check" size="lg" /> Verifikasi Presensi</h3>
      <div class="desc">Setujui atau tolak presensi tentor. Sesi yang disetujui masuk klaim gaji & tagihan SPP.</div>
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
    <SelectSearch
      bind:value={statusFilter}
      placeholder="Semua Status"
      options={[
        { value: '', label: 'Semua Status' },
        ...Object.entries(ATTENDANCE_STATUS_LABEL).map(([v, l]) => ({ value: v, label: l }))
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
              <th>Tanggal</th>
              <th>Tentor</th>
              <th>Siswa</th>
              <th>Mode · Topik</th>
              <th>Status</th>
              <th style="text-align:right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#if paginatedAttendances.length === 0}
              <tr>
                <td colspan="6" class="empty">Tidak ada presensi untuk filter ini.</td>
              </tr>
            {:else}
              {#each paginatedAttendances as a (a.id)}
                <tr>
                  <td>{formatDateIndonesian(a.sessionDate)}</td>
                  <td>{getUserName(a.tentorId)}</td>
                  <td>{getStudentOf(a.enrollmentId)}</td>
                  <td>
                    {a.topic}
                    {#if !a.isRadiusValid}
                      <div class="sub" style="color:var(--warn)">⚠ di luar radius</div>
                    {/if}
                  </td>
                  <td>                     <span class="badge {getStatusBadgeClass(a.status)}">
                       {getStatusLabel(a.status, ATTENDANCE_STATUS_LABEL)}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      <button
                        type="button"
                        class="btn-icon"
                        data-tip="Periksa"
                        on:click={() => handleOpenDetail(a)}
                      >
                        <Icon name="visibility" size="sm" />
                      </button>
                      {#if a.status === 'SUBMITTED'}
                        <button
                          type="button"
                          class="btn-icon"
                          data-tip="Setujui"
                          on:click={() => handleApprove(a)}
                        >
                          <Icon name="check" size="sm" />
                        </button>
                        <button
                          type="button"
                          class="btn-icon btn-icon-danger"
                          data-tip="Tolak"
                          on:click={() => handleReject(a)}
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
            {#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
              <button
                type="button"
                class="page-btn {currentPage === p ? 'active' : ''}"
                on:click={() => { currentPage = p; }}
              >
                {p}
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
              <th>Tanggal</th>
              <th>Siswa</th>
              <th>Topik</th>
              <th>Catatan</th>
              <th>Status</th>
              <th style="text-align:right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#if paginatedAttendances.length === 0}
              <tr>
                <td colspan="6" class="empty">Belum ada catatan presensi. Klik "Check-in Presensi".</td>
              </tr>
            {:else}
              {#each paginatedAttendances as a (a.id)}
                <tr>
                  <td>{formatDateIndonesian(a.sessionDate)}</td>
                  <td>{getStudentOf(a.enrollmentId)}</td>
                  <td>{a.topic}</td>
                  <td>{a.studentNotes || '—'}</td>
                  <td>                     <span class="badge {getStatusBadgeClass(a.status)}">
                       {getStatusLabel(a.status, ATTENDANCE_STATUS_LABEL)}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      <button
                        type="button"
                        class="btn-icon"
                        data-tip="Periksa"
                        on:click={() => handleOpenDetail(a)}
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
            {#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
              <button
                type="button"
                class="page-btn {currentPage === p ? 'active' : ''}"
                on:click={() => { currentPage = p; }}
              >
                {p}
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
  <!-- STUDENT & WALI MURID ATTENDANCE -->
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
              <th>Tanggal</th>
              <th>Tentor</th>
              <th>Mapel</th>
              <th>Topik</th>
              <th>Catatan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#if paginatedAttendances.length === 0}
              <tr>
                <td colspan="6" class="empty">Belum ada riwayat presensi.</td>
              </tr>
            {:else}
              {#each paginatedAttendances as a (a.id)}
                <tr>
                  <td>{formatDateIndonesian(a.sessionDate)}</td>
                  <td>{getUserName(a.tentorId)}</td>
                  <td>{getSubjectName(a.enrollmentId)}</td>
                  <td>{a.topic}</td>
                  <td>{a.studentNotes || '—'}</td>
                  <td>                     <span class="badge {getStatusBadgeClass(a.status)}">
                       {getStatusLabel(a.status, ATTENDANCE_STATUS_LABEL)}
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
            {#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
              <button
                type="button"
                class="page-btn {currentPage === p ? 'active' : ''}"
                on:click={() => { currentPage = p; }}
              >
                {p}
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
