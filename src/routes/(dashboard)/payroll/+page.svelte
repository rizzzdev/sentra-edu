<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import PayrollClaimModal from '$lib/features/payroll-claims/components/payroll-claim-modal.svelte';
  import PayrollPaymentModal from '$lib/features/payroll-claims/components/payroll-payment-modal.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import { PAYROLL_STATUS_LABEL, getStatusLabel, getStatusBadgeClass } from '$lib/shared/utils/status-map';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import type { PayrollClaim } from '$lib/shared/types/common.types';

  let statusFilter: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;

  let claimModalOpen: boolean = false;
  let paymentModalOpen: boolean = false;
  let selectedClaim: PayrollClaim | null = null;

  $: currentUser = $authStore;

  $: allClaims = $dbStore.payrollClaims.filter((c) => {
    if (c.deletedAt !== null) return false;
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;
    return c.tentorId === currentUser.id;
  });

  $: requestedClaims = allClaims.filter((c) => c.status === 'REQUESTED');
  $: requestedAmount = requestedClaims.reduce((sum, c) => sum + c.totalAmount, 0);
  $: paidClaims = allClaims.filter((c) => c.status === 'PAID');
  $: paidAmount = paidClaims.reduce((sum, c) => sum + c.totalAmount, 0);

  function getUserName(userId: string | null | undefined): string {
    if (!userId) return '—';
    return $dbStore.users.find((u) => u.id === userId)?.fullName || '—';
  }

  function getMonthLabel(month?: number, year?: number): string {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    if (!month || !year) return '—';
    return `${months[month - 1] || month} ${year}`;
  }

  $: filteredClaims = allClaims.filter((c) => !statusFilter || c.status === statusFilter);
  $: paginatedClaims = filteredClaims.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  $: totalPages = Math.max(1, Math.ceil(filteredClaims.length / itemsPerPage));

  function handleOpenPay(claim: PayrollClaim) {
    selectedClaim = claim;
    paymentModalOpen = true;
  }

  function handleReject(claim: PayrollClaim) {
    const res = dbStore.savePayrollClaim({
      ...claim,
      status: 'REJECTED'
    });
    if (!res.error) {
      toastStore.success('Klaim honor ditolak.');
    } else {
      toastStore.error(res.message);
    }
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="payments" size="lg" /> Klaim Gaji</h3>
    <div class="desc">
      {#if currentUser?.role === 'SUPER_ADMIN'}
        Proses klaim honor tentor. Honor dihitung otomatis dari sesi APPROVED.
      {:else}
        Ajukan klaim honor mengajar dari sesi les yang telah diverifikasi.
      {/if}
    </div>
  </div>
  {#if currentUser?.role === 'TENTOR'}
    <button type="button" class="btn btn-primary" on:click={() => { claimModalOpen = true; }}>
      <Icon name="payments" size="sm" /> Ajukan Klaim
    </button>
  {/if}
</div>

{#if currentUser?.role === 'SUPER_ADMIN'}
  <div class="stat-grid">
    <div class="stat">
      <div class="s-icon tone-amber"><Icon name="schedule" size="lg" /></div>
      <div>
        <div class="s-val">{requestedClaims.length}</div>
        <div class="s-lbl">Menunggu Proses</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-rose"><Icon name="payments" size="lg" /></div>
      <div>
        <div class="s-val">{formatCurrencyIDR(requestedAmount)}</div>
        <div class="s-lbl">Nominal Menunggu</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-emerald"><Icon name="verified" size="lg" /></div>
      <div>
        <div class="s-val">{paidClaims.length}</div>
        <div class="s-lbl">Klaim Dibayar</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-violet"><Icon name="account_balance_wallet" size="lg" /></div>
      <div>
        <div class="s-val">{formatCurrencyIDR(paidAmount)}</div>
        <div class="s-lbl">Total Dibayar</div>
      </div>
    </div>
  </div>
{/if}

<div class="filter-bar">
  <SelectSearch
    bind:value={statusFilter}
    placeholder="Semua Status"
    options={[
      { value: '', label: 'Semua Status' },
      ...Object.entries(PAYROLL_STATUS_LABEL)
        .map(([v, l]) => ({ value: v, label: l }))
        .filter(o => o.value !== 'DRAFT' && o.value !== '')
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
            <th>No. Klaim</th>
            {#if currentUser?.role === 'SUPER_ADMIN'}
              <th>Tentor</th>
            {/if}
            <th>Periode</th>
            <th class="num">Sesi</th>
            <th class="num">Total</th>
            <th>Status</th>
            <th style="text-align:right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedClaims.length === 0}
            <tr>
              <td colspan={currentUser?.role === 'SUPER_ADMIN' ? 7 : 6} class="empty">
                Tidak ada klaim untuk filter ini.
              </td>
            </tr>
          {:else}
            {#each paginatedClaims as c (c.id)}
              <tr>
                <td>{c.claimNumber}</td>
                {#if currentUser?.role === 'SUPER_ADMIN'}
                  <td>{getUserName(c.tentorId)}</td>
                {/if}
                <td>{getMonthLabel(c.periodMonth, c.periodYear)}</td>
                <td class="num">{c.attendanceIds.length}</td>
                <td class="num"><strong>{formatCurrencyIDR(c.totalAmount)}</strong></td>
                <td>
                  <span class="badge {getStatusBadgeClass(c.status)}">
                    {getStatusLabel(c.status, PAYROLL_STATUS_LABEL)}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    {#if currentUser?.role === 'SUPER_ADMIN' && c.status === 'REQUESTED'}
                      <button
                        type="button"
                        class="btn-icon"
                        data-tip="Proses Cair"
                        on:click={() => handleOpenPay(c)}
                      >
                        <Icon name="payments" size="sm" />
                      </button>
                      <button
                        type="button"
                        class="btn-icon btn-icon-danger"
                        data-tip="Tolak"
                        on:click={() => handleReject(c)}
                      >
                        <Icon name="close" size="sm" />
                      </button>
                    {:else if c.transferProofUrl}
                      <a
                        href={c.transferProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        class="btn-icon"
                        data-tip="Bukti Transfer"
                      >
                        <Icon name="receipt" size="sm" />
                      </a>
                    {:else}
                      <span class="sub">—</span>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    {#if filteredClaims.length > itemsPerPage}
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredClaims.length)} dari {filteredClaims.length} data
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

{#if currentUser && currentUser.role === 'TENTOR'}
  <PayrollClaimModal open={claimModalOpen} tentor={currentUser} onClose={() => { claimModalOpen = false; }} />
{/if}

<PayrollPaymentModal open={paymentModalOpen} claim={selectedClaim} onClose={() => { paymentModalOpen = false; }} />
