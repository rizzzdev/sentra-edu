<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { getParentPrograms, type UnifiedProgram } from '$lib/shared/utils/program-helpers';
  import { getScheduleDaysList } from '$lib/shared/utils/status-map';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
  import AlertBanner from '$lib/components/molecules/alert-banner.svelte';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';

  $: currentUser = $authStore;

  let searchQuery: string = '';
  let modeFilter: string = 'ALL';
  let typeFilter: string = 'ALL';
  let statusFilter: string = 'ALL';
  let isLoading: boolean = true;
  let errorMessage: string | null = null;

  // Pagination states
  let currentPage: number = 1;
  const itemsPerPage: number = 6;

  import { onMount } from 'svelte';
  onMount(() => {
    setTimeout(() => {
      isLoading = false;
    }, 400);
  });

  $: allPrograms = currentUser
    ? getParentPrograms($dbStore, currentUser.id)
    : [];

  $: filteredPrograms = allPrograms.filter((program: UnifiedProgram) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      program.title.toLowerCase().includes(query) ||
      program.studentNames.some((student) => student.toLowerCase().includes(query)) ||
      program.subjectNames.some((subject) => subject.toLowerCase().includes(query)) ||
      program.classNames.some((className) => className.toLowerCase().includes(query)) ||
      program.tentorName.toLowerCase().includes(query) ||
      program.packageName.toLowerCase().includes(query) ||
      program.location.toLowerCase().includes(query);

    const matchesMode =
      !modeFilter ||
      modeFilter === 'ALL' ||
      (modeFilter === 'PRIVAT' && program.packageMode === 'PRIVAT') ||
      (modeFilter === 'KELOMPOK' && program.packageMode === 'KELOMPOK');

    const matchesType =
      !typeFilter ||
      typeFilter === 'ALL' ||
      (typeFilter === 'OFFLINE' && program.jobMode === 'OFFLINE') ||
      (typeFilter === 'ONLINE' && program.jobMode === 'ONLINE');

    const matchesStatus =
      !statusFilter ||
      statusFilter === 'ALL' ||
      (statusFilter === 'ASSIGNED' && program.status === 'ASSIGNED') ||
      (statusFilter === 'AVAILABLE' && program.status === 'AVAILABLE') ||
      (statusFilter === 'NEGOTIATING' && program.status === 'NEGOTIATING');

    return matchesSearch && matchesMode && matchesType && matchesStatus;
  });

  $: totalPages = Math.max(1, Math.ceil(filteredPrograms.length / itemsPerPage));

  // Reset to page 1 when filters change
  $: if (searchQuery || modeFilter || typeFilter || statusFilter) {
    if (currentPage > totalPages) {
      currentPage = 1;
    }
  }

  $: paginatedPrograms = filteredPrograms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  $: privateCount = allPrograms.filter((p) => p.packageMode === 'PRIVAT').length;
  $: groupCount = allPrograms.filter((p) => p.packageMode === 'KELOMPOK').length;
  $: hasActiveFilter = Boolean(searchQuery || (modeFilter && modeFilter !== 'ALL') || (typeFilter && typeFilter !== 'ALL') || (statusFilter && statusFilter !== 'ALL'));

  function handleResetFilters() {
    searchQuery = '';
    modeFilter = 'ALL';
    typeFilter = 'ALL';
    statusFilter = 'ALL';
    currentPage = 1;
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="school" size="lg" /> Program Les Anak</h3>
    <div class="desc">Daftar lengkap program bimbingan belajar anak Anda yang sedang berjalan.</div>
  </div>
</div>

<!-- STATS SUMMARY -->
<div class="stat-grid">
  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="school" size="lg" /></div>
    <div>
      <div class="s-val">{allPrograms.length}</div>
      <div class="s-lbl">Total Program Anak</div>
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

<!-- STANDARD FILTER BAR -->
<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input
      type="text"
      placeholder="Cari anak / mapel / kelas / tentor..."
      bind:value={searchQuery}
      on:input={() => { currentPage = 1; }}
    />
  </div>

  <SelectSearch
    bind:value={modeFilter}
    placeholder="Semua Mode"
    options={[
      { value: 'ALL', label: 'Semua Mode' },
      { value: 'PRIVAT', label: 'Privat (1 Murid)' },
      { value: 'KELOMPOK', label: 'Kelompok (Grup)' }
    ]}
    className="max-w-48"
  />

  <SelectSearch
    bind:value={typeFilter}
    placeholder="Semua Tipe"
    options={[
      { value: 'ALL', label: 'Semua Tipe' },
      { value: 'OFFLINE', label: 'Tatap Muka (Offline)' },
      { value: 'ONLINE', label: 'Online (Daring)' }
    ]}
    className="max-w-48"
  />

  <SelectSearch
    bind:value={statusFilter}
    placeholder="Semua Status"
    options={[
      { value: 'ALL', label: 'Semua Status' },
      { value: 'ASSIGNED', label: 'Aktif Berjalan' },
      { value: 'AVAILABLE', label: 'Menunggu Tentor' },
      { value: 'NEGOTIATING', label: 'Proses Jadwal' }
    ]}
    className="max-w-48"
  />

  {#if hasActiveFilter}
    <button
      type="button"
      class="btn btn-sm btn-outline"
      on:click={handleResetFilters}
      title="Reset semua filter"
    >
      <Icon name="restart_alt" size="xs" /> Reset
    </button>
  {/if}
</div>

<!-- 4-STATE DETERMINISTIC UI MATRIX (TABLE) -->
<div class="card mb-6">
  <div class="card-body flush">
    {#if errorMessage}
      <div class="p-4">
        <AlertBanner
          variant="destructive"
          message={errorMessage}
          onRetry={() => {
            errorMessage = null;
            isLoading = true;
            setTimeout(() => { isLoading = false; }, 400);
          }}
        />
      </div>
    {:else}
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Anak / Program</th>
              <th>Mode & Paket</th>
              <th>Tentor Pengajar</th>
              <th>Jadwal Belajar</th>
              <th>Status</th>
              <th style="text-align:right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#if isLoading}
              {#each Array(itemsPerPage) as _}
                <tr>
                  <td><Skeleton width="w-36" height="h-4" /></td>
                  <td><Skeleton width="w-28" height="h-4" /></td>
                  <td><Skeleton width="w-28" height="h-4" /></td>
                  <td><Skeleton width="w-32" height="h-4" /></td>
                  <td><Skeleton width="w-20" height="h-6" className="rounded-full" /></td>
                  <td style="text-align:right"><Skeleton width="w-16" height="h-8" className="ml-auto rounded-md" /></td>
                </tr>
              {/each}
            {:else if filteredPrograms.length === 0}
              <tr>
                <td colspan="6" class="empty py-10 text-center text-muted-fg">
                  <Icon name="school" size="lg" className="opacity-40 mb-2 block mx-auto text-4xl" />
                  <div class="font-semibold text-fg">Tidak ada program les ditemukan.</div>
                  <div class="text-xs text-muted-fg mt-1">
                    {#if hasActiveFilter}
                      Coba ubah filter atau kata kunci pencarian Anda.
                    {:else}
                      Belum ada bimbingan belajar aktif yang terdaftar untuk anak Anda.
                    {/if}
                  </div>
                </td>
              </tr>
            {:else}
              {#each paginatedPrograms as prog (prog.id)}
                <tr>
                  <td>
                    <div class="font-bold text-fg">{prog.studentNames.join(', ')}</div>
                    <div class="text-xs text-muted-fg mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{prog.title}</span>
                      <span>•</span>
                      <span>{prog.classNames.join(', ')}</span>
                    </div>
                  </td>
                  <td>
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="badge {prog.packageMode === 'PRIVAT' ? 'b-sky' : 'b-amber'}">
                        <Icon name={prog.packageMode === 'PRIVAT' ? 'person' : 'groups'} size="xs" />
                        {prog.packageMode}
                      </span>
                      <span class="badge b-neutral">
                        <Icon name={prog.jobMode === 'OFFLINE' ? 'home_pin' : 'videocam'} size="xs" />
                        {prog.jobMode === 'OFFLINE' ? 'Tatap Muka' : 'Online'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="font-medium text-fg">{prog.tentorName}</div>
                    {#if prog.tentorPhone}
                      <a
                        href="https://wa.me/{prog.tentorPhone.replace(/[^0-9]/g, '')}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="wa-link"
                        title="Hubungi Tentor via WhatsApp"
                      >
                        <Icon name="chat" size="xs" /> WA
                      </a>
                    {/if}
                  </td>
                  <td>
                    <div class="text-sm font-medium">{getScheduleDaysList(prog.scheduleDays).join(', ')}</div>
                    <div class="text-xs text-muted-fg">{prog.scheduleTime}{#if prog.scheduleEndTime} – {prog.scheduleEndTime}{/if} WIB</div>
                  </td>
                  <td>
                    <span class="badge {prog.statusBadgeClass}">
                      {#if prog.status === 'ASSIGNED'}
                        <Icon name="check_circle" size="xs" />
                      {:else if prog.status === 'AVAILABLE'}
                        <Icon name="hourglass_empty" size="xs" />
                      {/if}
                      {prog.statusLabel}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      <a
                        href="/parent/children/{prog.id}"
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

      <!-- PAGINATION BAR (DIRECTLY VISIBLE FROM THE START) -->
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {filteredPrograms.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredPrograms.length)} dari {filteredPrograms.length} data
        </div>
        <div class="page-btns">
          <button
            type="button"
            class="page-btn"
            disabled={currentPage <= 1}
            on:click={() => { currentPage--; }}
            title="Halaman Sebelumnya"
          >
            &laquo;
          </button>
          {#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNumber}
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
            on:click={() => { currentPage++; }}
            title="Halaman Berikutnya"
          >
            &raquo;
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .wa-link {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 0.72rem;
    color: var(--success);
    font-weight: 600;
    margin-top: 2px;
    text-decoration: none;
  }

  .wa-link:hover {
    text-decoration: underline;
  }
</style>
