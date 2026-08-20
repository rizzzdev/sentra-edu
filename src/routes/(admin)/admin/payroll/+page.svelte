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
  import Button from '$lib/components/atoms/button.svelte';
  import type { PayrollClaim } from '$lib/shared/types/common.types';

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
  $: allClaims = $dbStore.payrollClaims.filter((c) => {
    if (c.deletedAt !== null) return false;
    if (!currentUser) return false;
    if (isAdmin) return true;
    return c.tentorId === currentUser.id;
  });

  $: requestedClaims = allClaims.filter((c) => c.status === 'REQUESTED');
  $: requestedAmount = requestedClaims.reduce((sum, c) => sum + c.totalAmount, 0);
  $: paidClaims = allClaims.filter((c) => c.status === 'PAID');
  $: paidAmount = paidClaims.reduce((sum, c) => sum + c.totalAmount, 0);

  // ── Tentor summary for admin (pending approved attendances) ──
  $: tentorList = $dbStore.users.filter((u) => u.deletedAt === null && u.role === 'TENTOR' && u.isActive);

  $: tentorSummary = tentorList.map((t) => {
    const existingClaimedIds = $dbStore.payrollClaims
      .filter((c) => c.deletedAt === null && c.status !== 'REJECTED')
      .flatMap((c) => c.attendanceIds);

    const pendingAtts = $dbStore.attendances.filter(
      (a) => a.deletedAt === null && a.tentorId === t.id && a.status === 'APPROVED' && !existingClaimedIds.includes(a.id)
    );

    const pendingTotal = pendingAtts.reduce((sum, a) => {
      const enr = $dbStore.enrollments.find((e) => e.id === a.enrollmentId);
      const pkg = enr ? $dbStore.packages.find((p) => p.id === enr.packageId) : null;
      return sum + (pkg ? pkg.tentorFee : 100000);
    }, 0);

    const tentorPaid = allClaims.filter((c) => c.tentorId === t.id && c.status === 'PAID');
    const tentorPaidTotal = tentorPaid.reduce((sum, c) => sum + c.totalAmount, 0);

    return {
      tentor: t,
      pendingCount: pendingAtts.length,
      pendingTotal,
      paidCount: tentorPaid.length,
      paidTotal: tentorPaidTotal
    };
  }).filter((s) => s.pendingCount > 0 || s.paidCount > 0);

  function getUserName(userId: string | null | undefined): string {
    if (!userId) return '—';
    return $dbStore.users.find((u) => u.id === userId)?.fullName || '—';
  }

  function getMonthLabel(month?: number, year?: number): string {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    if (!month || !year) return '—';
    return `${months[month - 1] || month} ${year}`;
  }

  $: filteredClaims = allClaims.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (tentorFilter && c.tentorId !== tentorFilter) return false;
    return true;
  });
  $: paginatedClaims = filteredClaims.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  $: totalPages = Math.max(1, Math.ceil(filteredClaims.length / itemsPerPage));

  // Reset page when filter changes
  $: if (statusFilter || tentorFilter) currentPage = 1;

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

  // Tentor filter options
  $: tentorFilterOptions = [
    { value: '', label: 'Semua Tentor' },
    ...tentorList.map((t) => ({ value: t.id, label: t.fullName }))
  ];
</script>

<div class="page-head">
  <div>
    <h3><Icon name="payments" size="lg" /> Penggajian</h3>
    <div class="desc">
      {#if isAdmin}
        Buat klaim honor untuk tentor berdasarkan sesi yang telah disetujui, lalu proses pembayaran.
      {:else}
        Lihat riwayat penggajian dari sesi les yang telah diverifikasi.
      {/if}
    </div>
  </div>
  {#if isAdmin}
    <Button variant="primary" icon="add" on:click={() => { claimModalOpen = true; }}>
      Buat Klaim
    </Button>
  {/if}
</div>

{#if isAdmin}
  <!-- STAT CARDS -->
  <div class="stat-grid">
    <div class="stat">
      <div class="s-icon tone-amber"><Icon name="schedule" size="lg" /></div>
      <div>
        <div class="s-val">{requestedClaims.length}</div>
        <div class="s-lbl">Menunggu Diproses</div>
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
        <div class="s-lbl">Telah Dibayar</div>
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

  <!-- TENTOR PENDING SUMMARY -->
  {#if tentorSummary.length > 0}
    <div class="card">
      <div class="card-head">
        <Icon name="school" size="md" /> Ringkasan Per Tentor
      </div>
      <div class="card-body flush">
        <div class="table-wrap">
          <table class="tbl">
            <thead>
              <tr>
                <th>Tentor</th>
                <th class="num">Sesi Belum Diklaim</th>
                <th class="num">Nominal</th>
                <th class="num">Sudah Dibayar</th>
                <th class="num">Total Dibayar</th>
                <th style="text-align:right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {#each tentorSummary as s (s.tentor.id)}
                <tr>
                  <td>
                    <strong>{s.tentor.fullName}</strong>
                    <div class="sub">{s.tentor.email}</div>
                  </td>
                  <td class="num">
                    {#if s.pendingCount > 0}
                      <span class="badge b-submitted">{s.pendingCount} sesi</span>
                    {:else}
                      <span class="sub">0 sesi</span>
                    {/if}
                  </td>
                  <td class="num">
                    {#if s.pendingTotal > 0}
                      <strong>{formatCurrencyIDR(s.pendingTotal)}</strong>
                    {:else}
                      <span class="sub">—</span>
                    {/if}
                  </td>
                  <td class="num">{s.paidCount} klaim</td>
                  <td class="num">{formatCurrencyIDR(s.paidTotal)}</td>
                  <td>
                    <div class="actions">
                      {#if s.pendingCount > 0}
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
            {#if isAdmin}
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
              <td colspan={isAdmin ? 7 : 6} class="empty">
                <Icon name="payments" size="lg" className="opacity-40 block mx-auto mb-2" />
                Belum ada data penggajian.
              </td>
            </tr>
          {:else}
            {#each paginatedClaims as c (c.id)}
              <tr>
                <td>{c.claimNumber}</td>
                {#if isAdmin}
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
                    {#if isAdmin && c.status === 'REQUESTED'}
                      <button
                        type="button"
                        class="btn-icon"
                        data-tip="Proses Bayar"
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

<PayrollClaimModal open={claimModalOpen} onClose={() => { claimModalOpen = false; }} />

<PayrollPaymentModal open={paymentModalOpen} claim={selectedClaim} onClose={() => { paymentModalOpen = false; }} />
