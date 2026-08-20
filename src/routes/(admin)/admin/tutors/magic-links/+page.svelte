<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import MagicLinkModal from '$lib/features/student-enrollment/components/magic-link-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';

  let searchQuery: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;

  // Magic Link Modal & State
  let magicLinkModalOpen: boolean = false;
  let deleteMagicLinkId: string | null = null;

  $: allMagicLinks = ($dbStore.magicLinks || []).filter(
    (l) => l.deletedAt === null && l.targetRole === 'TENTOR'
  );

  $: filteredMagicLinks = allMagicLinks.filter((l) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return l.title.toLowerCase().includes(q) || l.token.toLowerCase().includes(q);
  });

  $: paginatedMagicLinks = filteredMagicLinks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  $: totalPagesMagicLinks = Math.max(1, Math.ceil(filteredMagicLinks.length / itemsPerPage));

  function getFullMagicUrl(token: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    return `${origin}/register-tutor?token=${token}`;
  }

  function handleCopyMagicLink(token: string) {
    const url = getFullMagicUrl(token);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toastStore.success('Magic link pendaftaran tentor berhasil disalin!');
    }
  }

  function isLinkExpired(expiresAt: string): boolean {
    return new Date() > new Date(expiresAt);
  }

  function handleConfirmDeleteMagicLink() {
    if (!deleteMagicLinkId) return;
    const res = dbStore.deleteMagicLink(deleteMagicLinkId);
    deleteMagicLinkId = null;
    if (!res.error) toastStore.success(res.message);
    else toastStore.error(res.message);
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="link" size="lg" /> Magic Link Pendaftaran Tentor</h3>
    <div class="desc">Buat dan bagikan link pendaftaran khusus calon tentor / pengajar dengan batas waktu kadaluarsa (expired days).</div>
  </div>
  <div>
    <button
      type="button"
      class="btn btn-primary"
      on:click={() => { magicLinkModalOpen = true; }}
    >
      <Icon name="add_link" size="sm" /> Buat Magic Link Tentor
    </button>
  </div>
</div>

<!-- STAT GRID -->
<div class="stat-grid">
  <div class="stat">
    <div class="s-icon tone-amber"><Icon name="link" size="lg" /></div>
    <div>
      <div class="s-val">{allMagicLinks.length}</div>
      <div class="s-lbl">Magic Link Tentor</div>
    </div>
  </div>

  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="check_circle" size="lg" /></div>
    <div>
      <div class="s-val">{allMagicLinks.filter(l => l.active && !isLinkExpired(l.expiresAt)).length}</div>
      <div class="s-lbl">Link Aktif Berlaku</div>
    </div>
  </div>

  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="badge" size="lg" /></div>
    <div>
      <div class="s-val">{allMagicLinks.reduce((sum, l) => sum + l.usedCount, 0)}</div>
      <div class="s-lbl">Tentor Mendaftar via Link</div>
    </div>
  </div>
</div>

<!-- FILTER BAR -->
<div class="filter-bar mt-4">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input
      type="text"
      placeholder="Cari judul magic link tentor / token..."
      bind:value={searchQuery}
    />
  </div>
</div>

<!-- DATA TABLE CARD -->
<div class="card">
  <div class="card-body flush">
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Judul Magic Link</th>
            <th>Kadaluarsa (Expired)</th>
            <th>Status</th>
            <th class="num">Pemakaian</th>
            <th style="text-align:right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedMagicLinks.length === 0}
            <tr>
              <td colspan="5" class="empty">
                {searchQuery ? 'Tidak ada magic link tentor yang cocok.' : 'Belum ada Magic Link Tentor. Klik "Buat Magic Link Tentor".'}
              </td>
            </tr>
          {:else}
            {#each paginatedMagicLinks as ml (ml.id)}
              {@const expired = isLinkExpired(ml.expiresAt)}
              <tr>
                <td>
                  <strong>{ml.title}</strong>
                  <div class="sub font-mono text-[0.74rem] text-primary">{ml.token}</div>
                </td>
                <td>
                  <span class="font-bold text-xs">{ml.daysValid} Hari</span>
                  <div class="sub">
                    Expired: {new Date(ml.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td>
                  {#if expired}
                    <span class="badge b-rejected">Expired</span>
                  {:else if ml.active}
                    <span class="badge b-available">Aktif</span>
                  {:else}
                    <span class="badge b-neutral">Nonaktif</span>
                  {/if}
                </td>
                <td class="num">
                  <strong>{ml.usedCount}</strong> Tentor
                </td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Salin Link"
                      on:click={() => handleCopyMagicLink(ml.token)}
                    >
                      <Icon name="content_copy" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip={ml.active ? 'Nonaktifkan' : 'Aktifkan'}
                      on:click={() => {
                        const res = dbStore.toggleMagicLinkStatus(ml.id);
                        if (!res.error) toastStore.success(res.message);
                      }}
                    >
                      <Icon name={ml.active ? 'toggle_on' : 'toggle_off'} size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      on:click={() => { deleteMagicLinkId = ml.id; }}
                    >
                      <Icon name="delete" size="sm" />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    {#if filteredMagicLinks.length > itemsPerPage}
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredMagicLinks.length)} dari {filteredMagicLinks.length} magic link tentor
        </div>
        <div class="page-btns">
          <button type="button" class="page-btn" disabled={currentPage <= 1} on:click={() => currentPage--}>&laquo;</button>
          {#each Array.from({ length: totalPagesMagicLinks }, (_, i) => i + 1) as p}
            <button type="button" class="page-btn {currentPage === p ? 'active' : ''}" on:click={() => { currentPage = p; }}>{p}</button>
          {/each}
          <button type="button" class="page-btn" disabled={currentPage >= totalPagesMagicLinks} on:click={() => currentPage++}>&raquo;</button>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- MODAL & DIALOG -->
<MagicLinkModal
  open={magicLinkModalOpen}
  defaultRole="TENTOR"
  onClose={() => { magicLinkModalOpen = false; }}
/>

<ConfirmationDialog
  open={!!deleteMagicLinkId}
  title="Hapus Magic Link Tentor"
  message="Apakah Anda yakin ingin menghapus Magic Link pendaftaran tentor ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDeleteMagicLink}
  onCancel={() => { deleteMagicLinkId = null; }}
/>
