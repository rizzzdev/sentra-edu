<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { getStudentPrograms, type UnifiedProgram } from '$lib/shared/utils/program-helpers';
  import { formatDateIndonesian } from '$lib/shared/utils/formatting';
  import { ATTENDANCE_STATUS_LABEL, getStatusLabel, getStatusBadgeClass, getScheduleDaysList, DAY_OPTIONS } from '$lib/shared/utils/status-map';
  import LeafletMap from '$lib/components/molecules/leaflet-map.svelte';

  let isLoading = true;

  import { onMount } from 'svelte';
  onMount(() => {
    setTimeout(() => { isLoading = false; }, 300);
  });

  $: currentUser = $authStore;
  $: programId = $page.params.id;

  $: allPrograms = currentUser
    ? getStudentPrograms($dbStore, currentUser.id, currentUser.fullName)
    : [];

  $: program = allPrograms.find((p: UnifiedProgram) => p.id === programId);

  $: programAttendances = $dbStore.attendances.filter((a) => {
    if (a.deletedAt !== null) return false;
    if (a.enrollmentId === programId) return true;
    if (program && program.enrollmentId && a.enrollmentId === program.enrollmentId) return true;
    return false;
  }).sort((a, b) => (a.sessionDate < b.sessionDate ? 1 : -1));

  $: approvedCount = programAttendances.filter((a) => a.status === 'APPROVED').length;
  $: totalHours = Math.round(approvedCount * 1.5);

  function getUserName(userId: string | null | undefined): string {
    if (!userId) return '—';
    return $dbStore.users.find((u) => u.id === userId)?.fullName || '—';
  }

  function formatScheduleDays(days: string[]): string {
    const list = getScheduleDaysList(days);
    if (list.length === 0) return '—';
    if (list.length <= 2) return list.join(' & ');
    return `${list[0]}–${list[list.length - 1]}`;
  }
</script>

<!-- BREADCRUMB -->
<div class="breadcrumb">
  <a href="/student/program" class="bc-link">
    <Icon name="arrow_back" size="xs" />
    Program Les Aktif
  </a>
  <span class="bc-sep">/</span>
  <span class="bc-current">Detail Program</span>
</div>

{#if isLoading}
  <!-- SKELETON -->
  <div class="skel-hero">
    <div class="skel skel-lg"></div>
    <div class="skel skel-md"></div>
    <div class="skel skel-sm"></div>
  </div>
  <div class="skel-row">
    <div class="skel-card"></div>
    <div class="skel-card"></div>
    <div class="skel-card"></div>
  </div>

{:else if !program}
  <!-- NOT FOUND -->
  <div class="empty-state">
    <div class="empty-icon">
      <Icon name="error_outline" size="xl" />
    </div>
    <h3>Program Tidak Ditemukan</h3>
    <p>Data program ini tidak tersedia atau tidak terhubung dengan akun Anda.</p>
    <a href="/student/program" class="btn-back">
      <Icon name="arrow_back" size="xs" /> Kembali
    </a>
  </div>

{:else}
  <!-- ═══════════════ HERO ═══════════════ -->
  <div class="hero">
    <div class="hero-top">
      <span class="hero-badge {program.packageMode === 'PRIVAT' ? 'badge-purple' : 'badge-amber'}">
        <Icon name={program.packageMode === 'PRIVAT' ? 'person' : 'groups'} size="xs" />
        {program.packageMode === 'PRIVAT' ? 'Privat' : 'Kelompok'}
      </span>
      <span class="hero-badge {program.jobMode === 'ONLINE' ? 'badge-blue' : 'badge-green'}">
        <Icon name={program.jobMode === 'ONLINE' ? 'videocam' : 'home_pin'} size="xs" />
        {program.jobMode === 'ONLINE' ? 'Online' : 'Offline'}
      </span>
      <span class="hero-badge badge-gray">
        {program.packageName}
      </span>
      <span class="hero-badge {getStatusBadgeClass(program.status)}">
        {program.statusLabel}
      </span>
    </div>

    <h1 class="hero-title">{program.title}</h1>
    <p class="hero-sub">
      {program.subjectNames.length} Mapel, {program.classNames.length} Kelas, {program.studentNames.length || program.studentCount || 1} Murid
    </p>

    {#if program.tentorPhone}
      <a
        href="https://wa.me/{program.tentorPhone.replace(/[^0-9]/g, '')}"
        target="_blank"
        rel="noopener noreferrer"
        class="wa-btn"
      >
        <Icon name="chat" size="xs" /> Hubungi Tentor via WhatsApp
      </a>
    {/if}
  </div>

  <!-- ═══════════════ STAT CARDS ═══════════════ -->
  <div class="stat-cards">
    <div class="stat-card sc-sky">
      <div class="sc-icon"><Icon name="fact_check" size="md" /></div>
      <div>
        <div class="sc-val">{programAttendances.length}</div>
        <div class="sc-lbl">Total Sesi</div>
      </div>
    </div>
    <div class="stat-card sc-green">
      <div class="sc-icon"><Icon name="verified" size="md" /></div>
      <div>
        <div class="sc-val">{approvedCount}</div>
        <div class="sc-lbl">Disetujui</div>
      </div>
    </div>
    <div class="stat-card sc-amber">
      <div class="sc-icon"><Icon name="schedule" size="md" /></div>
      <div>
        <div class="sc-val">{totalHours} jam</div>
        <div class="sc-lbl">Total Belajar</div>
      </div>
    </div>
  </div>

  <!-- ═══════════════ 2-COLUMN LAYOUT ═══════════════ -->
  <div class="detail-grid">

    <!-- ─── LEFT COLUMN ─── -->
    <div class="col-left">

      <!-- Jadwal -->
      <div class="section-card">
        <div class="sec-head">
          <Icon name="schedule" size="md" />
          <h3>Jadwal</h3>
        </div>
        <div class="sec-body">
          <div class="info-row">
            <span class="info-label">Hari</span>
            <span class="info-value">{formatScheduleDays(program.scheduleDays)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Jam</span>
            <span class="info-value highlight">
              {program.scheduleTime}{#if program.scheduleEndTime} – {program.scheduleEndTime}{/if} WIB
            </span>
          </div>
        </div>

        <!-- Day chips -->
        <div class="day-chips">
          {#each DAY_OPTIONS as opt}
            <div class="day-chip" class:active={program.scheduleDays.includes(opt.value) || program.scheduleDays.includes(opt.label)}>
              {opt.label.slice(0, 2)}
            </div>
          {/each}
        </div>
      </div>

      <!-- Lokasi -->
      <div class="section-card">
        <div class="sec-head">
          <Icon name="location_on" size="md" />
          <h3>{program.location}</h3>
        </div>

        {#if program.latitude && program.longitude}
          <div class="map-wrap">
            <LeafletMap
              latitude={program.latitude}
              longitude={program.longitude}
              readonly={true}
              height="200px"
              zoom={15}
            />
          </div>
        {:else}
          <div class="sec-body">
            <p class="location-text">{program.location}</p>
          </div>
        {/if}
      </div>

      <!-- Catatan -->
      {#if program.notes}
        <div class="section-card">
          <div class="sec-head">
            <Icon name="notes" size="md" />
            <h3>Catatan</h3>
          </div>
          <div class="sec-body">
            <p class="notes-text">{program.notes}</p>
          </div>
        </div>
      {/if}
    </div>

    <!-- ─── RIGHT COLUMN ─── -->
    <div class="col-right">

      <!-- Tentor -->
      <div class="section-card tentor-card">
        <div class="sec-head">
          <Icon name="badge" size="md" />
          <h3>Tentor</h3>
        </div>
        <div class="sec-body">
          {#if program.tentorName && program.tentorName !== 'Belum Ditugaskan' && program.tentorName !== '—'}
            <div class="tentor-row">
              <div class="tentor-avatar">
                {program.tentorName.charAt(0)}
              </div>
              <div class="tentor-info">
                <div class="tentor-name">{program.tentorName}</div>
                <div class="tentor-role">Pengajar SentraEdu</div>
                {#if program.tentorPhone}
                  <a
                    href="https://wa.me/{program.tentorPhone.replace(/[^0-9]/g, '')}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="tentor-wa"
                  >
                    <Icon name="chat" size="xs" />
                    {program.tentorPhone}
                  </a>
                {/if}
              </div>
            </div>
          {:else}
            <div class="text-sm text-muted-fg italic py-1">
              Tentor belum ditugaskan oleh admin.
            </div>
          {/if}
        </div>
      </div>

      <!-- Teman Belajar (Kelompok only) -->
      {#if program.packageMode === 'KELOMPOK' && program.studentNames.length > 0}
        <div class="section-card">
          <div class="sec-head">
            <Icon name="groups" size="md" />
            <h3>Teman Belajar</h3>
          </div>
          <div class="sec-body">
            <div class="student-list">
              {#each program.studentNames as name, i}
                <div class="student-row">
                  <span class="student-num">{i + 1}</span>
                  <span class="student-name">{name}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      <!-- Ringkasan -->
      <div class="section-card summary-card">
        <div class="sec-head">
          <Icon name="info" size="md" />
          <h3>Ringkasan</h3>
        </div>
        <div class="sec-body">
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Paket</span>
              <span class="summary-val">{program.packageName}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Tipe</span>
              <span class="summary-val">{program.packageMode === 'PRIVAT' ? 'Privat' : 'Kelompok'}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Mode</span>
              <span class="summary-val">{program.jobMode === 'ONLINE' ? 'Online' : 'Offline'}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Siswa</span>
              <span class="summary-val">{program.studentCount} orang</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══════════════ ATTENDANCE ═══════════════ -->
  <div class="section-card attendance-section">
    <div class="sec-head">
      <Icon name="fact_check" size="md" />
      <h3>Riwayat Presensi</h3>
      <a href="/student/attendance" class="sec-action">
        <Icon name="visibility" size="xs" /> Lihat Semua
      </a>
    </div>

    {#if programAttendances.length === 0}
      <div class="sec-body">
        <div class="att-empty">
          <Icon name="event_busy" size="lg" className="opacity-30" />
          <p>Belum ada catatan presensi.</p>
          <span>Presensi akan muncul setelah tentor check-in.</span>
        </div>
      </div>
    {:else}
      <div class="att-timeline">
        {#each programAttendances as att (att.id)}
          <div class="att-item">
            <div class="att-dot {att.status === 'APPROVED' ? 'dot-green' : att.status === 'REJECTED' ? 'dot-red' : 'dot-gray'}"></div>
            <div class="att-content">
              <div class="att-top">
                <span class="att-date">{formatDateIndonesian(att.sessionDate)}</span>
                <span class="att-time">
                  {att.startTime ? att.startTime.slice(11, 16) : ''}
                  {#if att.endTime} – {att.endTime.slice(11, 16)}{/if}
                  WIB
                </span>
                <span class="badge {getStatusBadgeClass(att.status)}">
                  {getStatusLabel(att.status, ATTENDANCE_STATUS_LABEL)}
                </span>
              </div>
              {#if att.topic}
                <div class="att-topic">{att.topic}</div>
              {/if}
              {#if att.studentNotes}
                <div class="att-notes">"{att.studentNotes}"</div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  /* ── Breadcrumb ── */
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    font-size: 0.82rem;
  }

  .bc-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--color-primary, #6366f1);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.15s;
  }

  .bc-link:hover { opacity: 0.75; }

  .bc-sep { color: var(--color-fg-muted, #cbd5e1); }
  .bc-current { color: var(--color-fg, #1e293b); font-weight: 600; }

  /* ── Skeleton ── */
  .skel-hero {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 12px;
    padding: 28px;
    margin-bottom: 16px;
  }

  .skel {
    border-radius: 6px;
    background: linear-gradient(90deg, var(--color-surface-hover, #f1f5f9) 25%, #e2e8f0 50%, var(--color-surface-hover, #f1f5f9) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .skel-lg { width: 45%; height: 24px; margin-bottom: 12px; }
  .skel-md { width: 30%; height: 14px; margin-bottom: 10px; }
  .skel-sm { width: 20%; height: 14px; }

  .skel-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .skel-card {
    height: 64px;
    border-radius: 10px;
    background: linear-gradient(90deg, var(--color-surface-hover, #f1f5f9) 25%, #e2e8f0 50%, var(--color-surface-hover, #f1f5f9) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Empty State ── */
  .empty-state {
    text-align: center;
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 12px;
    padding: 48px 24px;
  }

  .empty-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: #fef3c7;
    color: #d97706;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .empty-state h3 {
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--color-fg, #1e293b);
    margin: 0 0 6px;
  }

  .empty-state p {
    font-size: 0.82rem;
    color: var(--color-fg-muted, #94a3b8);
    margin: 0 0 20px;
  }

  .btn-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-primary, #6366f1);
    background: var(--color-primary-soft, #eef2ff);
    text-decoration: none;
    transition: background 0.15s;
  }

  .btn-back:hover { background: var(--color-primary-soft-2, #e0e7ff); }

  /* ════════════════════════════════════════════
     HERO
     ════════════════════════════════════════════ */
  .hero {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 12px;
    padding: 28px;
    margin-bottom: 16px;
    border-top: 3px solid var(--color-primary, #6366f1);
  }

  .hero-top {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
  }

  .badge-purple { background: #ede9fe; color: #7c3aed; }
  .badge-amber { background: #fef3c7; color: #b45309; }
  .badge-blue { background: #dbeafe; color: #2563eb; }
  .badge-green { background: #dcfce7; color: #16a34a; }
  .badge-gray { background: var(--color-surface-hover, #f1f5f9); color: var(--color-fg-muted, #64748b); }

  .hero-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--color-fg, #0f172a);
    margin: 0 0 4px;
    line-height: 1.25;
  }

  .hero-sub {
    font-size: 0.88rem;
    color: var(--color-fg-muted, #64748b);
    margin: 0 0 16px;
  }

  .wa-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    color: #fff;
    background: #25d366;
    text-decoration: none;
    transition: background 0.15s;
  }

  .wa-btn:hover { background: #1fb855; }

  /* ════════════════════════════════════════════
     STAT CARDS
     ════════════════════════════════════════════ */
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 12px;
    padding: 16px 18px;
  }

  .sc-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sc-sky .sc-icon { background: #e0f2fe; color: #0284c7; }
  .sc-green .sc-icon { background: #dcfce7; color: #16a34a; }
  .sc-amber .sc-icon { background: #fef3c7; color: #d97706; }

  .sc-val {
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--color-fg, #0f172a);
    line-height: 1;
  }

  .sc-lbl {
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--color-fg-muted, #94a3b8);
    margin-top: 2px;
  }

  /* ════════════════════════════════════════════
     2-COLUMN DETAIL GRID
     ════════════════════════════════════════════ */
  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  .col-left, .col-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ── Section Card ── */
  .section-card {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 12px;
    overflow: hidden;
  }

  .sec-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 18px;
    border-bottom: 1px solid var(--color-border, #f1f5f9);
    color: var(--color-fg, #1e293b);
  }

  .sec-head h3 {
    font-size: 0.88rem;
    font-weight: 700;
    margin: 0;
    flex: 1;
  }

  .sec-action {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--color-primary, #6366f1);
    text-decoration: none;
    padding: 4px 8px;
    border-radius: 6px;
    transition: background 0.12s;
  }

  .sec-action:hover {
    background: var(--color-primary-soft, #eef2ff);
  }

  .sec-body {
    padding: 14px 18px;
  }

  /* ── Info Rows ── */
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
  }

  .info-row + .info-row {
    border-top: 1px solid var(--color-border, #f8fafc);
  }

  .info-label {
    font-size: 0.78rem;
    color: var(--color-fg-muted, #94a3b8);
    font-weight: 500;
  }

  .info-value {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-fg, #1e293b);
  }

  .info-value.highlight {
    color: var(--color-primary, #6366f1);
  }

  /* ── Day Chips ── */
  .day-chips {
    display: flex;
    gap: 4px;
    padding: 10px 18px 14px;
  }

  .day-chip {
    flex: 1;
    text-align: center;
    padding: 5px 0;
    border-radius: 6px;
    font-size: 0.68rem;
    font-weight: 600;
    background: var(--color-surface-hover, #f1f5f9);
    color: var(--color-fg-muted, #94a3b8);
    transition: all 0.15s;
  }

  .day-chip.active {
    background: var(--color-primary, #6366f1);
    color: #fff;
  }

  /* ── Location ── */
  .location-text {
    font-size: 0.85rem;
    color: var(--color-fg, #1e293b);
    margin: 0;
    line-height: 1.5;
  }

  .map-wrap {
    border-top: 1px solid var(--color-border, #f1f5f9);
  }

  /* ── Notes ── */
  .notes-text {
    font-size: 0.85rem;
    color: var(--color-fg, #334155);
    margin: 0;
    line-height: 1.6;
    white-space: pre-line;
  }

  /* ── Tentor ── */
  .tentor-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .tentor-avatar {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    color: #059669;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 800;
    flex-shrink: 0;
  }

  .tentor-info { flex: 1; min-width: 0; }

  .tentor-name {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-fg, #1e293b);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tentor-role {
    font-size: 0.72rem;
    color: var(--color-fg-muted, #94a3b8);
    margin-top: 1px;
  }

  .tentor-wa {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 8px;
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 0.74rem;
    font-weight: 600;
    color: #25d366;
    background: #dcfce7;
    text-decoration: none;
    transition: background 0.12s;
  }

  .tentor-wa:hover { background: #bbf7d0; }

  /* ── Student List ── */
  .student-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .student-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
  }

  .student-row + .student-row {
    border-top: 1px solid var(--color-border, #f8fafc);
  }

  .student-num {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: var(--color-surface-hover, #f1f5f9);
    color: var(--color-fg-muted, #64748b);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.68rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .student-name {
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--color-fg, #1e293b);
  }

  /* ── Summary Grid ── */
  .summary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .summary-label {
    font-size: 0.68rem;
    font-weight: 500;
    color: var(--color-fg-muted, #94a3b8);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .summary-val {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-fg, #1e293b);
  }

  /* ════════════════════════════════════════════
     ATTENDANCE
     ════════════════════════════════════════════ */
  .attendance-section {
    margin-bottom: 20px;
  }

  .att-empty {
    text-align: center;
    padding: 24px 16px;
  }

  .att-empty p {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--color-fg, #1e293b);
    margin: 8px 0 4px;
  }

  .att-empty span {
    font-size: 0.78rem;
    color: var(--color-fg-muted, #94a3b8);
  }

  /* ── Timeline ── */
  .att-timeline {
    padding: 0 18px 14px;
  }

  .att-item {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    position: relative;
  }

  .att-item + .att-item {
    border-top: 1px solid var(--color-border, #f1f5f9);
  }

  .att-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-top: 4px;
    flex-shrink: 0;
  }

  .dot-green { background: #22c55e; }
  .dot-gray { background: #94a3b8; }
  .dot-red { background: #ef4444; }

  .att-content {
    flex: 1;
    min-width: 0;
  }

  .att-top {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 2px;
  }

  .att-date {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-fg, #1e293b);
  }

  .att-time {
    font-size: 0.72rem;
    color: var(--color-fg-muted, #94a3b8);
  }

  .badge {
    font-size: 0.62rem;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 999px;
    white-space: nowrap;
  }

  .att-topic {
    font-size: 0.8rem;
    color: var(--color-fg, #334155);
    margin-top: 4px;
  }

  .att-notes {
    font-size: 0.76rem;
    color: var(--color-fg-muted, #64748b);
    font-style: italic;
    margin-top: 3px;
  }

  /* ════════════════════════════════════════════
     RESPONSIVE
     ════════════════════════════════════════════ */
  @media (max-width: 768px) {
    .hero { padding: 20px; }
    .hero-title { font-size: 1.2rem; }

    .detail-grid {
      grid-template-columns: 1fr;
    }

    .stat-cards {
      grid-template-columns: 1fr;
    }

    .day-chips {
      padding: 8px 14px 12px;
    }
  }
</style>
