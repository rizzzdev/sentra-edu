<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { getStudentPrograms, type UnifiedProgram } from '$lib/shared/utils/program-helpers';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import Pagination from '$lib/components/molecules/pagination.svelte';
  import { onMount } from 'svelte';

  $: currentUser = $authStore;
  let isLoading = true;
  let searchQuery = '';
  let statusFilter = '';
  let modeFilter = '';
  let currentPage = 1;
  const itemsPerPage = 10;

  onMount(() => {
    setTimeout(() => { isLoading = false; }, 300);
  });

  $: allPrograms = currentUser
    ? getStudentPrograms($dbStore, currentUser.id, currentUser.fullName)
    : [];

  $: filteredPrograms = allPrograms.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = p.subjectNames.some((s) => s.toLowerCase().includes(q));
      const matchTentor = p.tentorName.toLowerCase().includes(q);
      const matchClass = p.classNames.some((c) => c.toLowerCase().includes(q));
      if (!matchSubject && !matchTentor && !matchClass) return false;
    }
    if (statusFilter) {
      if (statusFilter === 'AKTIF' && p.status !== 'ASSIGNED') return false;
      if (statusFilter === 'MENUNGGU' && p.status !== 'AVAILABLE' && p.status !== 'NEGOTIATING') return false;
    }
    if (modeFilter) {
      if (modeFilter !== p.packageMode) return false;
    }
    return true;
  });

  $: paginatedPrograms = filteredPrograms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  $: if (searchQuery || statusFilter || modeFilter) {
    currentPage = 1;
  }

  function formatSchedule(p: UnifiedProgram): string {
    const days = p.scheduleDays.length <= 2
      ? p.scheduleDays.join(' & ')
      : `${p.scheduleDays[0]}–${p.scheduleDays[p.scheduleDays.length - 1]}`;
    return `${days} · ${p.scheduleTime}${p.scheduleEndTime ? '–' + p.scheduleEndTime : ''}`;
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="school" size="lg" /> Program Les Aktif</h3>
    <div class="desc">Daftar bimbingan belajar yang sedang Anda ikuti.</div>
  </div>
</div>

<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input type="text" placeholder="Cari mapel, tentor, kelas..." bind:value={searchQuery} />
  </div>
  <SelectSearch
    bind:value={statusFilter}
    placeholder="Semua Status"
    options={[
      { value: '', label: 'Semua Status' },
      { value: 'AKTIF', label: 'Aktif' },
      { value: 'MENUNGGU', label: 'Menunggu' }
    ]}
    className="max-w-44"
  />
  <SelectSearch
    bind:value={modeFilter}
    placeholder="Semua Tipe"
    options={[
      { value: '', label: 'Semua Tipe' },
      { value: 'PRIVAT', label: 'Privat' },
      { value: 'KELOMPOK', label: 'Kelompok' }
    ]}
    className="max-w-40"
  />
</div>

<div class="card">
  <div class="card-body flush">
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>No</th>
            <th>Mata Pelajaran</th>
            <th>Kelas</th>
            <th>Tipe · Mode</th>
            <th>Tentor</th>
            <th>Jadwal</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {#if isLoading}
            {#each Array(4) as _}
              <tr>
                {#each Array(7) as _}
                  <td><div class="skel-cell"></div></td>
                {/each}
              </tr>
            {/each}
          {:else if filteredPrograms.length === 0}
            <tr>
              <td colspan="7" class="empty">
                {searchQuery || statusFilter || modeFilter
                  ? 'Tidak ada program yang cocok.'
                  : 'Belum ada program les.'}
              </td>
            </tr>
          {:else}
            {#each paginatedPrograms as prog, i (prog.id)}
              {@const rowNum = (currentPage - 1) * itemsPerPage + i + 1}
              <tr class="clickable" on:click={() => { window.location.href = `/student/program/${prog.id}`; }}>
                <td class="text-muted-fg">{rowNum}</td>
                <td>
                  <div class="font-semibold text-fg">{prog.subjectNames.join(', ')}</div>
                  <div class="sub">{prog.packageName}</div>
                </td>
                <td>{prog.classNames.join(', ')}</td>
                <td>
                  <span class="tag tag-{prog.packageMode === 'PRIVAT' ? 'privat' : 'kelompok'}">
                    {prog.packageMode === 'PRIVAT' ? 'Privat' : 'Kelompok'}
                  </span>
                  <span class="tag tag-{prog.jobMode === 'ONLINE' ? 'online' : 'offline'}">
                    {prog.jobMode === 'ONLINE' ? 'Online' : 'Offline'}
                  </span>
                </td>
                <td>{prog.tentorName}</td>
                <td class="text-sm">{formatSchedule(prog)}</td>
                <td>
                  <span class="badge {prog.statusBadgeClass}">{prog.statusLabel}</span>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <Pagination
      {currentPage}
      totalItems={filteredPrograms.length}
      {itemsPerPage}
      onPageChange={(p) => { currentPage = p; }}
    />
  </div>
</div>

<style>
  .skel-cell {
    height: 14px;
    width: 60%;
    border-radius: 4px;
    background: linear-gradient(90deg, var(--color-surface-hover, #f1f5f9) 25%, #e2e8f0 50%, var(--color-surface-hover, #f1f5f9) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 0.68rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 5px;
    white-space: nowrap;
  }

  .tag-privat { background: #ede9fe; color: #7c3aed; }
  .tag-kelompok { background: #fef3c7; color: #b45309; }
  .tag-online { background: #e0f2fe; color: #0284c7; }
  .tag-offline { background: #ecfdf5; color: #059669; }

  .sub {
    font-size: 0.74rem;
    color: var(--color-fg-muted, #94a3b8);
    margin-top: 2px;
  }

  .clickable { cursor: pointer; }
  .clickable:hover { background: var(--color-surface-hover, #f8fafc); }
</style>
