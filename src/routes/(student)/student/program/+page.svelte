<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { getStudentPrograms, type UnifiedProgram } from '$lib/shared/utils/program-helpers';
  import { getScheduleDaysList } from '$lib/shared/utils/status-map';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import Pagination from '$lib/components/molecules/pagination.svelte';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
  import { onMount } from 'svelte';

  $: currentUser = $authStore;
  let isLoading: boolean = true;
  let searchQuery: string = '';
  let statusFilter: string = '';
  let modeFilter: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 10;

  onMount(() => {
    setTimeout(() => { isLoading = false; }, 300);
  });

  $: allPrograms = currentUser
    ? getStudentPrograms($dbStore, currentUser.id, currentUser.fullName)
    : [];

  $: filteredPrograms = allPrograms.filter((programItem) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchSubject = programItem.subjectNames.some((subjectName) => subjectName.toLowerCase().includes(query));
      const matchTentor = programItem.tentorName.toLowerCase().includes(query);
      const matchClass = programItem.classNames.some((className) => className.toLowerCase().includes(query));
      const matchTitle = programItem.title.toLowerCase().includes(query);
      if (!matchSubject && !matchTentor && !matchClass && !matchTitle) return false;
    }
    if (statusFilter) {
      if (statusFilter === 'AKTIF' && programItem.status !== 'ASSIGNED') return false;
      if (statusFilter === 'MENUNGGU' && programItem.status !== 'AVAILABLE' && programItem.status !== 'NEGOTIATING') return false;
    }
    if (modeFilter) {
      if (modeFilter !== programItem.packageMode) return false;
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
            <th>Program Les</th>
            <th>Kelas</th>
            <th>Mata Pelajaran</th>
            <th>Jadwal Belajar</th>
            <th>Tentor & Status</th>
            <th class="text-right">Aksi</th>
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
                    : 'Belum ada program les terdaftar.'}
                </div>
                <div class="text-xs text-muted-fg mt-1">
                  {searchQuery || statusFilter || modeFilter
                    ? 'Coba sesuaikan kata kunci pencarian atau filter.'
                    : 'Hubungi admin untuk memulai bimbingan belajar.'}
                </div>
              </td>
            </tr>
          {:else}
            {#each paginatedPrograms as programItem (programItem.id)}
              <tr>
                <td>
                  <strong>{programItem.title}</strong>
                  <div class="sub">
                    <span class="badge {programItem.jobMode === 'ONLINE' ? 'b-neutral' : 'b-available'}">
                      {programItem.jobMode === 'ONLINE' ? 'Online' : 'Offline'}
                    </span>
                    <span class="badge {programItem.packageMode === 'KELOMPOK' ? 'b-admin' : 'b-interviewed'}">
                      {programItem.packageMode === 'KELOMPOK' ? 'Kelompok' : 'Privat'}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-1 items-start">
                    {#each programItem.classNames as className}
                      <span class="badge b-neutral text-xs">
                        <Icon name="stairs" size="xs" />
                        {className}
                      </span>
                    {/each}
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-1 items-start">
                    {#each programItem.subjectNames as subjectName}
                      <span class="badge b-sky text-xs">
                        <Icon name="menu_book" size="xs" />
                        {subjectName}
                      </span>
                    {/each}
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-1.5 items-start">
                    <div class="flex items-center gap-1 flex-wrap">
                      {#each getScheduleDaysList(programItem.scheduleDays) as day}
                        <span class="badge b-neutral text-xs font-semibold">
                          <Icon name="calendar_today" size="xs" />
                          {day}
                        </span>
                      {/each}
                    </div>
                    <div class="sub">{programItem.scheduleTime || '—'}{#if programItem.scheduleEndTime} – {programItem.scheduleEndTime}{/if} WIB</div>
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-1 items-start">
                    <span class="badge {programItem.statusBadgeClass}">
                      {#if programItem.status === 'ASSIGNED'}
                        <Icon name="check_circle" size="xs" />
                      {:else if programItem.status === 'AVAILABLE'}
                        <Icon name="event_available" size="xs" />
                      {:else if programItem.status === 'NEGOTIATING'}
                        <Icon name="handshake" size="xs" />
                      {:else if programItem.status === 'CANCELLED'}
                        <Icon name="cancel" size="xs" />
                      {/if}
                      {programItem.statusLabel}
                    </span>
                    {#if programItem.tentorName && programItem.tentorName !== 'Belum Ditugaskan' && programItem.tentorName !== '—'}
                      <div class="text-xs font-medium text-fg flex items-center gap-1 mt-0.5">
                        <Icon name="badge" size="xs" />
                        <span>{programItem.tentorName}</span>
                      </div>
                      {#if programItem.tentorPhone}
                        <a
                          href="https://wa.me/{programItem.tentorPhone.replace(/[^0-9]/g, '')}"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-xs text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <Icon name="chat" size="xs" /> WA
                        </a>
                      {/if}
                    {/if}
                  </div>
                </td>
                <td>
                  <div class="actions">
                    <a
                      href="/student/program/{programItem.id}"
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
      onPageChange={(pageNumber) => { currentPage = pageNumber; }}
    />
  </div>
</div>
