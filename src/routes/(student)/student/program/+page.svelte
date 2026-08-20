<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { getStudentPrograms, type UnifiedProgram } from '$lib/shared/utils/program-helpers';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';

  $: currentUser = $authStore;

  let searchQuery: string = '';
  let modeFilter: string = 'ALL';
  let isLoading: boolean = true;

  import { onMount } from 'svelte';
  onMount(() => {
    setTimeout(() => {
      isLoading = false;
    }, 400);
  });

  $: allPrograms = currentUser
    ? getStudentPrograms($dbStore, currentUser.id, currentUser.fullName)
    : [];

  $: filteredPrograms = allPrograms.filter((program: UnifiedProgram) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      program.title.toLowerCase().includes(query) ||
      program.subjectNames.some((subject) => subject.toLowerCase().includes(query)) ||
      program.classNames.some((className) => className.toLowerCase().includes(query)) ||
      program.tentorName.toLowerCase().includes(query) ||
      program.packageName.toLowerCase().includes(query) ||
      program.location.toLowerCase().includes(query);

    const matchesMode =
      modeFilter === 'ALL' ||
      (modeFilter === 'PRIVAT' && program.packageMode === 'PRIVAT') ||
      (modeFilter === 'KELOMPOK' && program.packageMode === 'KELOMPOK');

    return matchesSearch && matchesMode;
  });

  $: privateCount = allPrograms.filter((p) => p.packageMode === 'PRIVAT').length;
  $: groupCount = allPrograms.filter((p) => p.packageMode === 'KELOMPOK').length;
</script>

<div class="page-head">
  <div>
    <h3><Icon name="school" size="lg" /> Program Les Aktif</h3>
    <div class="desc">Daftar program bimbingan belajar Privat dan Kelompok yang sedang Anda ikuti.</div>
  </div>
</div>

<!-- STATS SUMMARY -->
<div class="stat-grid mb-6">
  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="school" size="lg" /></div>
    <div>
      <div class="s-val">{allPrograms.length}</div>
      <div class="s-lbl">Total Program Les</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="person" size="lg" /></div>
    <div>
      <div class="s-val">{privateCount}</div>
      <div class="s-lbl">Les Privat (1 Murid)</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-amber"><Icon name="groups" size="lg" /></div>
    <div>
      <div class="s-val">{groupCount}</div>
      <div class="s-lbl">Les Kelompok (Grup)</div>
    </div>
  </div>
</div>

<!-- FILTERS & SEARCH -->
<div class="filter-bar mb-6">
  <div class="search-box">
    <Icon name="search" size="sm" />
    <input
      type="text"
      placeholder="Cari mata pelajaran, kelas, atau tentor..."
      bind:value={searchQuery}
    />
    {#if searchQuery}
      <button type="button" class="clear-btn" on:click={() => (searchQuery = '')}>
        <Icon name="close" size="xs" />
      </button>
    {/if}
  </div>

  <div class="mode-tabs">
    <button
      type="button"
      class="tab-btn"
      class:active={modeFilter === 'ALL'}
      on:click={() => (modeFilter = 'ALL')}
    >
      Semua ({allPrograms.length})
    </button>
    <button
      type="button"
      class="tab-btn"
      class:active={modeFilter === 'PRIVAT'}
      on:click={() => (modeFilter = 'PRIVAT')}
    >
      <Icon name="person" size="xs" /> Privat ({privateCount})
    </button>
    <button
      type="button"
      class="tab-btn"
      class:active={modeFilter === 'KELOMPOK'}
      on:click={() => (modeFilter = 'KELOMPOK')}
    >
      <Icon name="groups" size="xs" /> Kelompok ({groupCount})
    </button>
  </div>
</div>

<!-- PROGRAM LIST -->
{#if isLoading}
  <div class="program-grid">
    {#each Array(3) as _}
      <div class="program-card">
        <Skeleton height="1.5rem" width="60%" className="mb-4" />
        <Skeleton height="1rem" width="40%" className="mb-3" />
        <Skeleton height="3rem" width="100%" className="mb-3" />
        <Skeleton height="1rem" width="80%" />
      </div>
    {/each}
  </div>
{:else if filteredPrograms.length === 0}
  <div class="empty-state">
    <div class="empty-icon-wrap">
      <Icon name="school" size="xl" />
    </div>
    <h4>Tidak Ada Program Les Ditemukan</h4>
    <p>
      {#if searchQuery || modeFilter !== 'ALL'}
        Tidak ada program les yang cocok dengan filter pencarian Anda.
      {:else}
        Belum ada program bimbingan belajar aktif yang terdaftar untuk akun Anda.
      {/if}
    </p>
    {#if searchQuery || modeFilter !== 'ALL'}
      <button
        type="button"
        class="btn btn-outline mt-3"
        on:click={() => {
          searchQuery = '';
          modeFilter = 'ALL';
        }}
      >
        Reset Filter
      </button>
    {/if}
  </div>
{:else}
  <div class="program-grid">
    {#each filteredPrograms as program (program.id)}
      <div class="program-card">
        <!-- HEADER -->
        <div class="p-header">
          <div class="p-title-area">
            <h4 class="p-title">{program.title}</h4>
            <div class="p-subtitle">
              <span class="subject-tag">
                <Icon name="menu_book" size="xs" />
                {program.subjectNames.join(', ')}
              </span>
              <span class="dot-separator">•</span>
              <span class="class-tag">
                <Icon name="school" size="xs" />
                {program.classNames.join(', ')}
              </span>
            </div>
          </div>
          <span class="badge {program.statusBadgeClass}">
            {#if program.status === 'ASSIGNED'}
              <Icon name="check_circle" size="xs" />
            {:else if program.status === 'AVAILABLE'}
              <Icon name="hourglass_empty" size="xs" />
            {/if}
            {program.statusLabel}
          </span>
        </div>

        <!-- BADGES -->
        <div class="p-badges">
          <span class="badge-mode {program.packageMode === 'PRIVAT' ? 'mode-privat' : 'mode-kelompok'}">
            <Icon name={program.packageMode === 'PRIVAT' ? 'person' : 'groups'} size="xs" />
            {program.packageMode} ({program.studentCount} Murid)
          </span>
          <span class="badge-type {program.jobMode === 'OFFLINE' ? 'type-offline' : 'type-online'}">
            <Icon name={program.jobMode === 'OFFLINE' ? 'home_pin' : 'videocam'} size="xs" />
            {program.jobMode === 'OFFLINE' ? 'Tatap Muka (Offline)' : 'Online (Daring)'}
          </span>
          <span class="badge-pkg">
            <Icon name="sell" size="xs" />
            {program.packageName}
          </span>
        </div>

        <!-- DETAILS SECTION -->
        <div class="p-details">
          <!-- TENTOR INFO -->
          <div class="detail-row">
            <div class="d-icon tone-emerald">
              <Icon name="badge" size="sm" />
            </div>
            <div class="d-content">
              <div class="d-label">Tentor Pengajar</div>
              <div class="d-value font-medium">
                {program.tentorName}
                {#if program.tentorPhone}
                  <a
                    href="https://wa.me/{program.tentorPhone.replace(/[^0-9]/g, '')}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="wa-link"
                    title="Hubungi via WhatsApp"
                  >
                    <Icon name="chat" size="xs" /> WhatsApp
                  </a>
                {/if}
              </div>
            </div>
          </div>

          <!-- SCHEDULE -->
          <div class="detail-row">
            <div class="d-icon tone-sky">
              <Icon name="schedule" size="sm" />
            </div>
            <div class="d-content">
              <div class="d-label">Jadwal Belajar</div>
              <div class="d-value">
                {program.scheduleDays.join(', ')} · {program.scheduleTime}{#if program.scheduleEndTime} – {program.scheduleEndTime}{/if} WIB
              </div>
            </div>
          </div>

          <!-- STUDENTS IN GROUP -->
          {#if program.packageMode === 'KELOMPOK' && program.studentNames.length > 0}
            <div class="detail-row">
              <div class="d-icon tone-amber">
                <Icon name="group" size="sm" />
              </div>
              <div class="d-content">
                <div class="d-label">Daftar Teman Kelompok ({program.studentNames.length} Siswa)</div>
                <div class="d-value group-students">
                  {#each program.studentNames as sName}
                    <span class="student-pill">{sName}</span>
                  {/each}
                </div>
              </div>
            </div>
          {/if}

          <!-- LOCATION -->
          <div class="detail-row">
            <div class="d-icon tone-violet">
              <Icon name="location_on" size="sm" />
            </div>
            <div class="d-content">
              <div class="d-label">Lokasi Belajar</div>
              <div class="d-value">{program.location}</div>
            </div>
          </div>

          <!-- NOTES -->
          {#if program.notes}
            <div class="detail-row">
              <div class="d-icon tone-rose">
                <Icon name="notes" size="sm" />
              </div>
              <div class="d-content">
                <div class="d-label">Catatan Tambahan</div>
                <div class="d-value text-muted">{program.notes}</div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .program-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  @media (min-width: 768px) {
    .program-grid {
      grid-template-columns: repeat(auto-fill, minmax(460px, 1fr));
    }
  }

  .program-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    padding: 1.25rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .program-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .p-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .p-title-area {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .p-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .p-subtitle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #64748b;
    flex-wrap: wrap;
  }

  .subject-tag, .class-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .dot-separator {
    color: #cbd5e1;
  }

  .p-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .badge-mode, .badge-type, .badge-pkg {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.65rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .mode-privat {
    background: #e0f2fe;
    color: #0369a1;
    border: 1px solid #bae6fd;
  }

  .mode-kelompok {
    background: #fef3c7;
    color: #b45309;
    border: 1px solid #fde68a;
  }

  .type-offline {
    background: #f1f5f9;
    color: #334155;
    border: 1px solid #e2e8f0;
  }

  .type-online {
    background: #f3e8ff;
    color: #7e22ce;
    border: 1px solid #e9d5ff;
  }

  .badge-pkg {
    background: #ecfdf5;
    color: #047857;
    border: 1px solid #a7f3d0;
  }

  .p-details {
    background: #f8fafc;
    border-radius: 0.75rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    border: 1px solid #f1f5f9;
  }

  .detail-row {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .d-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .d-content {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    flex: 1;
  }

  .d-label {
    font-size: 0.75rem;
    color: #64748b;
  }

  .d-value {
    font-size: 0.875rem;
    color: #1e293b;
    word-break: break-word;
  }

  .wa-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    margin-left: 0.5rem;
    font-size: 0.75rem;
    color: #16a34a;
    background: #dcfce7;
    padding: 0.15rem 0.45rem;
    border-radius: 0.25rem;
    font-weight: 600;
    text-decoration: none;
  }

  .wa-link:hover {
    background: #bbf7d0;
  }

  .group-students {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.25rem;
  }

  .student-pill {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    color: #475569;
  }

  .filter-bar {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .filter-bar {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    flex: 1;
    max-width: 400px;
  }

  .search-box input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 0.875rem;
    color: #1e293b;
  }

  .clear-btn {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0;
  }

  .mode-tabs {
    display: flex;
    background: #f1f5f9;
    padding: 0.25rem;
    border-radius: 0.5rem;
    gap: 0.25rem;
  }

  .tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.75rem;
    border-radius: 0.375rem;
    border: none;
    background: transparent;
    font-size: 0.8rem;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tab-btn.active {
    background: #ffffff;
    color: #0f172a;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .empty-state {
    background: #ffffff;
    border: 1px dashed #cbd5e1;
    border-radius: 1rem;
    padding: 3rem 1.5rem;
    text-align: center;
    color: #64748b;
  }

  .empty-icon-wrap {
    width: 4rem;
    height: 4rem;
    margin: 0 auto 1rem;
    border-radius: 9999px;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
  }

  .empty-state h4 {
    color: #1e293b;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
</style>

