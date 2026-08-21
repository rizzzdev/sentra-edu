<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import PayrollClaimModal from '$lib/features/payroll-claims/components/payroll-claim-modal.svelte';
  import PayrollPaymentModal from '$lib/features/payroll-claims/components/payroll-payment-modal.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import { PAYROLL_STATUS_LABEL, getStatusLabel, getStatusBadgeClass } from '$lib/shared/utils/status-map';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import Button from '$lib/components/atoms/button.svelte';
  import type { PayrollClaim } from '$lib/shared/types/common.types';
import { userStore, packageStore, enrollmentStore, attendanceStore, payrollStore } from '$lib/api';
  import { api } from '$lib/api/client';

  let statusFilter: string = '';
  let tentorFilter: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;

  let claimModalOpen: boolean = false;
  let paymentModalOpen: boolean = false;
  let selectedClaim: PayrollClaim | null = null;

  $: currentUser = $authStore;
  $: isAdmin = currentUser?.role === 'SUPER_ADMIN';

  // ── Claims ──
  $: allClaims = $payrollStore.filter((claimItem) => {
    if (claimItem.deletedAt !== null) return false;
    if (!currentUser) return false;
    if (isAdmin) return true;
    return claimItem.tentorId === currentUser.id;
  });

  $: requestedClaims = allClaims.filter((claimItem) => claimItem.status === 'REQUESTED');
  $: requestedAmount = requestedClaims.reduce((sum, claimItem) => sum + claimItem.totalAmount, 0);
  $: paidClaims = allClaims.filter((claimItem) => claimItem.status === 'PAID');
  $: paidAmount = paidClaims.reduce((sum, claimItem) => sum + claimItem.totalAmount, 0);

  // ── Tentor summary for admin (pending approved attendances) ──
  $: tentorList = $userStore.filter((userItem) => userItem.deletedAt === null && userItem.role === 'TENTOR' && userItem.isActive);

  $: tentorSummary = tentorList.map((tentorUser) => {
    const existingClaimedIds = $payrollStore
      .filter((claimItem) => claimItem.deletedAt === null && claimItem.status !== 'REJECTED')
      .flatMap((claimItem) => claimItem.attendanceIds);

    const pendingAtts = $attendanceStore.filter(
      (attendanceItem) => attendanceItem.deletedAt === null && attendanceItem.tentorId === tentorUser.id && attendanceItem.status === 'APPROVED' && !existingClaimedIds.includes(attendanceItem.id)
    );

    const pendingTotal = pendingAtts.reduce((sum, attendanceItem) => {
      const enrollmentItem = $enrollmentStore.find((enrollment) => enrollment.id === attendanceItem.enrollmentId);
      const packagePlan = enrollmentItem ? $packageStore.find((packageItem) => packageItem.id === enrollmentItem.packageId) : null;
      return sum + (packagePlan ? packagePlan.tentorFee : 100000);
    }, 0);

    const tentorPaid = allClaims.filter((claimItem) => claimItem.tentorId === tentorUser.id && claimItem.status === 'PAID');
    const tentorPaidTotal = tentorPaid.reduce((sum, claimItem) => sum + claimItem.totalAmount, 0);

    return {
      tentor: tentorUser,
      pendingCount: pendingAtts.length,
      pendingTotal,
      paidCount: tentorPaid.length,
      paidTotal: tentorPaidTotal
    };
  }).filter((summaryItem) => summaryItem.pendingCount > 0 || summaryItem.paidCount > 0);

  function getUserName(userId: string | null | undefined): string {
    if (!userId) return '—';
    return $userStore.find((userItem) => userItem.id === userId)?.fullName || '—';
  }

  function getMonthLabel(month?: number, year?: number): string {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    if (!month || !year) return '—';
    return `${months[month - 1] || month} ${year}`;
  }

  $: filteredClaims = allClaims.filter((claimItem) => {
    if (statusFilter && claimItem.status !== statusFilter) return false;
    if (tentorFilter && claimItem.tentorId !== tentorFilter) return false;
    return true;
  });
  $: paginatedClaims = filteredClaims.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  $: totalPages = Math.max(1, Math.ceil(filteredClaims.length / itemsPerPage));

  // Reset page when filter changes
  $: if (statusFilter || tentorFilter) currentPage = 1;

  function handleOpenPay(claimItem: PayrollClaim) {
    selectedClaim = claimItem;
    paymentModalOpen = true;
  }

  async function handleReject(claimItem: PayrollClaim) {
    const response = await api.payroll.update({
      ...claimItem,
      status: 'REJECTED'
    });
    if (!response.error) {
      toastStore.success('Klaim honor ditolak.');
    } else {
      toastStore.error(response.message);
    }
  }

  $: tentorFilterOptions = [
    { value: '', label: 'Semua Tentor' },
    ...tentorList.map((tentorUser) => ({ value: tentorUser.id, label: tentorUser.fullName }))
  ];
</script>

<div class="page-head">
  <div>
    <h3><Icon name="payments" size="lg" /> {isAdmin ? 'Manajemen Penggajian Tentor' : 'Honor & Penggajian Saya'}</h3>
    <div class="desc">{isAdmin ? 'Kelola dan setujui klaim honor mengajar tentor.' : 'Lihat status pembayaran dan ajukan klaim honor sesi mengajar.'}</div>
  </div>
  {#if !isAdmin}
    <Button variant="primary" icon="add" on:click={() => { claimModalOpen = true; }}>
      Ajukan Klaim Honor
    </Button>
  {/if}
</div>

<!-- STATS -->
<div class="stat-grid">
  <div class="stat">
    <div class="s-icon tone-amber"><Icon name="pending" size="lg" /></div>
    <div>
      <div class="s-val">{formatCurrencyIDR(requestedAmount)}</div>
      <div class="s-lbl">{isAdmin ? 'Menunggu Pembayaran' : 'Klaim Menunggu'} ({requestedClaims.length})</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="check_circle" size="lg" /></div>
    <div>
      <div class="s-val">{formatCurrencyIDR(paidAmount)}</div>
      <div class="s-lbl">Total Sudah Dibayar ({paidClaims.length})</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="receipt_long" size="lg" /></div>
    <div>
      <div class="s-val">{allClaims.length}</div>
      <div class="s-lbl">Total Pengajuan Klaim</div>
    </div>
  </div>
</div>

<!-- ADMIN: PENDING TENTOR HONOR SUMMARY -->
{#if isAdmin}
  {#if tentorSummary.length > 0}
    <div class="card mb-6">
      <div class="card-head">
        <Icon name="account_balance_wallet" size="md" /> Ringkasan Honor Siap Klaim per Tentor
      </div>
      <div class="card-body flush">
        <div class="table-wrap">
          <table class="tbl">
            <thead>
              <tr>
                <th>Tentor</th>
                <th class="num">Sesi Terverifikasi</th>
                <th class="num">Estimasi Honor Belum Diklaim</th>
                <th class="num">Klaim Dibayar</th>
                <th class="num">Total Diterima</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {#each tentorSummary as summaryItem (summaryItem.tentor.id)}
                <tr>
                  <td>
                    <strong>{summaryItem.tentor.fullName}</strong>
                    <div class="sub">{summaryItem.tentor.email}</div>
                  </td>
                  <td class="num">
                    {#if summaryItem.pendingCount > 0}
                      <span class="badge b-pending">{summaryItem.pendingCount} sesi</span>
                    {:else}
                      <span class="sub">0</span>
                    {/if}
                  </td>
                  <td class="num">
                    {#if summaryItem.pendingTotal > 0}
                      <strong>{formatCurrencyIDR(summaryItem.pendingTotal)}</strong>
                    {:else}
                      <span class="sub">—</span>
                    {/if}
                  </td>
                  <td class="num">{summaryItem.paidCount} klaim</td>
                  <td class="num">{formatCurrencyIDR(summaryItem.paidTotal)}</td>
                  <td>
                    <div class="actions">
                      {#if summaryItem.pendingCount > 0}
                        <button
                          type="button"
                          class="btn-icon"
                          data-tip="Buat Klaim"
                          on:click={() => { claimModalOpen = true; }}
                        >
                          <Icon name="add" size="sm" />
                        </button>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {/if}
{/if}

<!-- CLAIMS TABLE -->
<div class="filter-bar">
  {#if isAdmin}
    <SelectSearch
      bind:value={tentorFilter}
      placeholder="Semua Tentor"
      options={tentorFilterOptions}
      className="max-w-56"
    />
  {/if}
  <SelectSearch
    bind:value={statusFilter}
    placeholder="Semua Status"
    options={[
      { value: '', label: 'Semua Status' },
      ...Object.entries(PAYROLL_STATUS_LABEL)
        .map(([statusValue, statusLabel]) => ({ value: statusValue, label: statusLabel }))
        .filter(optionItem => optionItem.value !== 'DRAFT' && optionItem.value !== '')
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
            {#if isAdmin}
              <th>Tentor</th>
            {/if}
            <th>Periode</th>
            <th class="num">Sesi</th>
            <th class="num">Total</th>
            <th>Status</th>
            <th class="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedClaims.length === 0}
            <tr>
              <td colspan={isAdmin ? 7 : 6} class="empty">
                <Icon name="payments" size="lg" className="opacity-40 block mx-auto mb-2" />
                Belum ada data penggajian.
              </td>
            </tr>
          {:else}
            {#each paginatedClaims as claimItem (claimItem.id)}
              <tr>
                <td>{claimItem.claimNumber}</td>
                {#if isAdmin}
                  <td>{getUserName(claimItem.tentorId)}</td>
                {/if}
                <td>{getMonthLabel(claimItem.periodMonth, claimItem.periodYear)}</td>
                <td class="num">{claimItem.attendanceIds.length}</td>
                <td class="num"><strong>{formatCurrencyIDR(claimItem.totalAmount)}</strong></td>
                <td>
                  <span class="badge {getStatusBadgeClass(claimItem.status)}">
                    {getStatusLabel(claimItem.status, PAYROLL_STATUS_LABEL)}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    {#if isAdmin && claimItem.status === 'REQUESTED'}
                      <button
                        type="button"
                        class="btn-icon"
                        data-tip="Proses Bayar"
                        on:click={() => handleOpenPay(claimItem)}
                      >
                        <Icon name="payments" size="sm" />
                      </button>
                      <button
                        type="button"
                        class="btn-icon btn-icon-danger"
                        data-tip="Tolak"
                        on:click={() => handleReject(claimItem)}
                      >
                        <Icon name="close" size="sm" />
                      </button>
                    {:else if claimItem.transferProofUrl}
                      <a
                        href={claimItem.transferProofUrl}
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
          {#each Array.from({ length: totalPages }, (_, index) => index + 1) as pageNumber}
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
            on:click={() => currentPage++}
          >
            &raquo;
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<PayrollClaimModal open={claimModalOpen} onClose={() => { claimModalOpen = false; }} />

<PayrollPaymentModal open={paymentModalOpen} claim={selectedClaim} onClose={() => { paymentModalOpen = false; }} />
