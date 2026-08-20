<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { getTutorPrograms, type UnifiedProgram } from '$lib/shared/utils/program-helpers';
  import { getScheduleDaysList } from '$lib/shared/utils/status-map';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import Pagination from '$lib/components/molecules/pagination.svelte';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
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
    ? getTutorPrograms($dbStore, currentUser.id)
    : [];

  $: filteredPrograms = allPrograms.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = p.subjectNames.some((s) => s.toLowerCase().includes(q));
      const matchStudent = p.studentNames.some((st) => st.toLowerCase().includes(q));
      const matchClass = p.classNames.some((c) => c.toLowerCase().includes(q));
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchLocation = p.location.toLowerCase().includes(q);
      if (!matchSubject && !matchStudent && !matchClass && !matchTitle && !matchLocation) return false;
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
</script>

<div class="page-head">
  <div>
    <h3><Icon name="school" size="lg" /> Program Les Aktif</h3>
    <div class="desc">Daftar bimbingan belajar yang sedang Anda ampu.</div>
  </div>
</div>

<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input type="text" placeholder="Cari mapel, murid, kelas, lokasi..." bind:value={searchQuery} />
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
            <th>Program Les</th>
            <th>Kelas</th>
            <th>Mata Pelajaran</th>
            <th>Jadwal Belajar</th>
            <th>Murid & Status</th>
            <th style="text-align:right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if isLoading}
            {#each Array(4) as _}
              <tr>
                <td><Skeleton width="w-36" height="h-4" /></td>
                <td><Skeleton width="w-20" height="h-6" className="rounded-full" /></td>
                <td><Skeleton width="w-24" height="h-6" className="rounded-full" /></td>
                <td><Skeleton width="w-32" height="h-4" /></td>
                <td><Skeleton width="w-28" height="h-6" className="rounded-full" /></td>
                <td><Skeleton width="w-8" height="h-8" className="ml-auto rounded-md" /></td>
              </tr>
            {/each}
          {:else if filteredPrograms.length === 0}
            <tr>
              <td colspan="6" class="empty py-10 text-center text-muted-fg">
                <Icon name="school" size="lg" className="opacity-40 mb-2 block mx-auto text-4xl" />
                <div class="font-semibold text-fg">
                  {searchQuery || statusFilter || modeFilter
                    ? 'Tidak ada program les yang cocok.'
                    : 'Belum ada program les yang Anda ampu.'}
                </div>
                <div class="text-xs text-muted-fg mt-1">
                  {searchQuery || statusFilter || modeFilter
                    ? 'Coba sesuaikan kata kunci pencarian atau filter.'
                    : 'Anda dapat melamar bimbingan belajar baru melalui bursa lowongan.'}
                </div>
                {#if !searchQuery && !statusFilter && !modeFilter}
                  <a href="/tutor/job-board" class="btn btn-sm btn-primary inline-flex items-center gap-1.5 mt-3">
                    <Icon name="search" size="xs" /> Cari Lowongan Les
                  </a>
                {/if}
              </td>
            </tr>
          {:else}
            {#each paginatedPrograms as prog (prog.id)}
              <tr>
                <td>
                  <strong>{prog.title}</strong>
                  <div class="sub">
                    <span class="badge {prog.jobMode === 'ONLINE' ? 'b-neutral' : 'b-available'}">
                      {prog.jobMode === 'ONLINE' ? 'Online' : 'Offline'}
                    </span>
                    <span class="badge {prog.packageMode === 'KELOMPOK' ? 'b-admin' : 'b-interviewed'}">
                      {prog.packageMode === 'KELOMPOK' ? 'Kelompok' : 'Privat'}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-1 items-start">
                    {#each prog.classNames as cls}
                      <span class="badge b-neutral text-xs">
                        <Icon name="stairs" size="xs" />
                        {cls}
                      </span>
                    {/each}
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-1 items-start">
                    {#each prog.subjectNames as sub}
                      <span class="badge b-sky text-xs">
                        <Icon name="menu_book" size="xs" />
                        {sub}
                      </span>
                    {/each}
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-1.5 items-start">
                    <div class="flex items-center gap-1 flex-wrap">
                      {#each getScheduleDaysList(prog.scheduleDays) as day}
                        <span class="badge b-neutral text-xs font-semibold">
                          <Icon name="calendar_today" size="xs" />
                          {day}
                        </span>
                      {/each}
                    </div>
                    <div class="sub">{prog.scheduleTime || '—'}{#if prog.scheduleEndTime} – {prog.scheduleEndTime}{/if} WIB</div>
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-1 items-start">
                    <span class="badge {prog.statusBadgeClass}">
                      {#if prog.status === 'ASSIGNED'}
                        <Icon name="check_circle" size="xs" />
                      {:else if prog.status === 'AVAILABLE'}
                        <Icon name="event_available" size="xs" />
                      {:else if prog.status === 'NEGOTIATING'}
                        <Icon name="handshake" size="xs" />
                      {:else if prog.status === 'CANCELLED'}
                        <Icon name="cancel" size="xs" />
                      {/if}
                      {prog.statusLabel}
                    </span>
                    {#if prog.studentNames.length > 0}
                      <div class="text-xs font-medium text-fg flex items-center gap-1 mt-0.5">
                        <Icon name="person" size="xs" />
                        <span>{prog.studentNames.join(', ')}</span>
                      </div>
                    {/if}
                  </div>
                </td>
                <td>
                  <div class="actions">
                    <a
                      href="/tutor/classes/{prog.id}"
                      class="btn-icon"
                      data-tip="Detail"
                    >
                      <Icon name="visibility" size="sm" />
                    </a>
                  </div>
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
