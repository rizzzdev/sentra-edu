<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import MagicLinkModal from '$lib/features/student-enrollment/components/magic-link-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { magicLinkStore } from '$lib/api';
  import { api } from '$lib/api/client';

  onMount(() => {
    magicLinkStore.fetch();
  });

  let searchQuery = $state('');
  let currentPage = $state(1);
  const itemsPerPage = 8;

  // Magic Link Modal & State
  let magicLinkModalOpen = $state(false);
  let deleteMagicLinkDialogOpen = $state(false);
  let deleteMagicLinkId = $state<string | null>(null);

  const allMagicLinks = $derived(($magicLinkStore || []).filter(
    (magicLinkItem) => magicLinkItem.deletedAt === null && magicLinkItem.targetRole === 'TENTOR'
  ));

  const filteredMagicLinks = $derived(allMagicLinks.filter((magicLinkItem) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    return magicLinkItem.title.toLowerCase().includes(query) || magicLinkItem.token.toLowerCase().includes(query);
  }));

  const paginatedMagicLinks = $derived(filteredMagicLinks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));
  const totalPagesMagicLinks = $derived(Math.max(1, Math.ceil(filteredMagicLinks.length / itemsPerPage)));

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

  async function handleConfirmDeleteMagicLink() {
    if (!deleteMagicLinkId) return;
    const response = await api.magicLinks.delete(deleteMagicLinkId);
    deleteMagicLinkDialogOpen = false;
    deleteMagicLinkId = null;
    if (!response.error) {
      toastStore.success(response.message);
      await magicLinkStore.fetch();
    } else {
      toastStore.error(response.message);
    }
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
      onclick={() => { magicLinkModalOpen = true; }}
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
      <div class="s-val">{allMagicLinks.filter((magicLinkItem) => magicLinkItem.active && !isLinkExpired(magicLinkItem.expiresAt)).length}</div>
      <div class="s-lbl">Link Aktif Berlaku</div>
    </div>
  </div>

  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="badge" size="lg" /></div>
    <div>
      <div class="s-val">{allMagicLinks.reduce((sum, magicLinkItem) => sum + magicLinkItem.usedCount, 0)}</div>
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
            <th class="text-right">Aksi</th>
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
            {#each paginatedMagicLinks as magicLinkItem (magicLinkItem.id)}
              {@const expired = isLinkExpired(magicLinkItem.expiresAt)}
              <tr>
                <td>
                  <strong>{magicLinkItem.title}</strong>
                  <div class="sub font-mono text-xs text-primary">{magicLinkItem.token}</div>
                </td>
                <td>
                  <span class="font-bold text-xs">{magicLinkItem.daysValid} Hari</span>
                  <div class="sub">
                    Expired: {new Date(magicLinkItem.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td>
                  {#if expired}
                    <span class="badge b-rejected">Expired</span>
                  {:else if magicLinkItem.active}
                    <span class="badge b-available">Aktif</span>
                  {:else}
                    <span class="badge b-neutral">Nonaktif</span>
                  {/if}
                </td>
                <td class="num">
                  <strong>{magicLinkItem.usedCount}</strong> Tentor
                </td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Salin Link"
                      onclick={() => handleCopyMagicLink(magicLinkItem.token)}
                    >
                      <Icon name="content_copy" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip={magicLinkItem.active ? 'Nonaktifkan' : 'Aktifkan'}
                      onclick={async () => {
                        const toggleResponse = await api.magicLinks.update(magicLinkItem.id);
                        if (!toggleResponse.error) toastStore.success(toggleResponse.message);
                      }}
                    >
                      <Icon name={magicLinkItem.active ? 'toggle_on' : 'toggle_off'} size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      onclick={() => { deleteMagicLinkId = magicLinkItem.id; deleteMagicLinkDialogOpen = true; }}
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
          <button type="button" class="page-btn" disabled={currentPage <= 1} onclick={() => currentPage--}>&laquo;</button>
          {#each Array.from({ length: totalPagesMagicLinks }, (_, index) => index + 1) as pageNumber}
            <button type="button" class="page-btn {currentPage === pageNumber ? 'active' : ''}" onclick={() => { currentPage = pageNumber; }}>{pageNumber}</button>
          {/each}
          <button type="button" class="page-btn" disabled={currentPage >= totalPagesMagicLinks} onclick={() => currentPage++}>&raquo;</button>
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
  open={deleteMagicLinkDialogOpen}
  title="Hapus Magic Link Tentor"
  message="Apakah Anda yakin ingin menghapus Magic Link pendaftaran tentor ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDeleteMagicLink}
  onCancel={() => { deleteMagicLinkDialogOpen = false; deleteMagicLinkId = null; }}
/>
