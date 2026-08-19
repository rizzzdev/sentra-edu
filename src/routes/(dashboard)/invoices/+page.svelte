<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import InvoiceModal from '$lib/features/invoice-management/components/invoice-modal.svelte';
  import InvoicePaymentModal from '$lib/features/invoice-management/components/invoice-payment-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import { INVOICE_STATUS_LABEL, getStatusLabel, getStatusBadgeClass } from '$lib/shared/utils/status-map';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import type { InvoiceRecord } from '$lib/shared/types/common.types';

  let searchQuery: string = '';
  let statusFilter: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;

  let invoiceModalOpen: boolean = false;
  let paymentModalOpen: boolean = false;
  let selectedInvoice: InvoiceRecord | null = null;
  let deleteDialogOpen: boolean = false;
  let deletingInvoiceId: string | null = null;

  $: currentUser = $authStore;

  $: allInvoices = $dbStore.invoices.filter((inv) => {
    if (inv.deletedAt !== null) return false;
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;

    const enr = $dbStore.enrollments.find((e) => e.id === inv.enrollmentId);
    if (!enr) return false;
    return enr.studentId === currentUser.id || enr.waliUserId === currentUser.id;
  });

  $: unpaidInvoices = allInvoices.filter((i) => i.status === 'UNPAID');
  $: unpaidTotal = unpaidInvoices.reduce((s, i) => s + i.amount, 0);
  $: paidInvoices = allInvoices.filter((i) => i.status === 'PAID');
  $: paidTotal = paidInvoices.reduce((s, i) => s + i.amount, 0);

  function getStudentName(enrollmentId: string): string {
    const enr = $dbStore.enrollments.find((e) => e.id === enrollmentId);
    if (!enr) return '—';
    return $dbStore.users.find((u) => u.id === enr.studentId)?.fullName || '—';
  }

  function getPackageName(enrollmentId: string): string {
    const enr = $dbStore.enrollments.find((e) => e.id === enrollmentId);
    if (!enr) return '—';
    return $dbStore.packages.find((p) => p.id === enr.packageId)?.name || '—';
  }

  function getMonthLabel(month?: number, year?: number): string {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    if (!month || !year) return '—';
    return `${months[month - 1] || month} ${year}`;
  }

  $: filteredInvoices = allInvoices.filter((i) => {
    const q = searchQuery.toLowerCase();
    const stuName = getStudentName(i.enrollmentId).toLowerCase();
    const pkgName = getPackageName(i.enrollmentId).toLowerCase();
    const matchesSearch =
      !q ||
      i.invoiceNumber.toLowerCase().includes(q) ||
      stuName.includes(q) ||
      pkgName.includes(q);
    const matchesStatus = !statusFilter || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  $: paginatedInvoices = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  $: totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));

  function handleOpenPay(inv: InvoiceRecord) {
    selectedInvoice = inv;
    paymentModalOpen = true;
  }

  function handleConfirmDelete() {
    if (!deletingInvoiceId) return;
    const res = dbStore.deleteInvoice(deletingInvoiceId);
    deleteDialogOpen = false;
    deletingInvoiceId = null;
    if (!res.error) {
      toastStore.success('Tagihan dihapus.');
    } else {
      toastStore.error(res.message);
    }
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="receipt_long" size="lg" /> Tagihan SPP</h3>
    <div class="desc">
      {#if currentUser?.role === 'SUPER_ADMIN'}
        Invoice tagihan les siswa. Paket BULANAN ditagih flat, paket HARIAN per sesi.
      {:else}
        Daftar tagihan bimbingan belajar dan konfirmasi pelunasan SPP.
      {/if}
    </div>
  </div>
  {#if currentUser?.role === 'SUPER_ADMIN'}
    <button type="button" class="btn btn-primary" on:click={() => { invoiceModalOpen = true; }}>
      <Icon name="receipt_long" size="sm" /> Generate Tagihan
    </button>
  {/if}
</div>

{#if currentUser?.role === 'SUPER_ADMIN'}
  <div class="stat-grid">
    <div class="stat">
      <div class="s-icon tone-amber"><Icon name="schedule" size="lg" /></div>
      <div>
        <div class="s-val">{unpaidInvoices.length} tagihan</div>
        <div class="s-lbl">Piutang</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-rose"><Icon name="payments" size="lg" /></div>
      <div>
        <div class="s-val">{formatCurrencyIDR(unpaidTotal)}</div>
        <div class="s-lbl">Total Piutang</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-emerald"><Icon name="verified" size="lg" /></div>
      <div>
        <div class="s-val">{paidInvoices.length} tagihan</div>
        <div class="s-lbl">Lunas</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-violet"><Icon name="account_balance_wallet" size="lg" /></div>
      <div>
        <div class="s-val">{formatCurrencyIDR(paidTotal)}</div>
        <div class="s-lbl">Total Lunas</div>
      </div>
    </div>
  </div>
{/if}

<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input type="text" placeholder="Cari no. invoice / siswa / paket..." bind:value={searchQuery} />
  </div>
  <SelectSearch
    bind:value={statusFilter}
    placeholder="Semua Status"
    options={[
      { value: '', label: 'Semua Status' },
      ...Object.entries(INVOICE_STATUS_LABEL).map(([v, l]) => ({ value: v, label: l }))
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
            <th>No. Invoice</th>
            <th>Siswa</th>
            <th>Periode</th>
            <th>Paket</th>
            <th class="num">Total</th>
            <th>Status</th>
            <th style="text-align:right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedInvoices.length === 0}
            <tr>
              <td colspan="7" class="empty">Tidak ada tagihan untuk filter ini.</td>
            </tr>
          {:else}
            {#each paginatedInvoices as inv (inv.id)}
              <tr>
                <td>{inv.invoiceNumber}</td>
                <td>{getStudentName(inv.enrollmentId)}</td>
                <td>{getMonthLabel(inv.periodMonth, inv.periodYear)}</td>
                <td>{getPackageName(inv.enrollmentId)}</td>
                <td class="num"><strong>{formatCurrencyIDR(inv.amount)}</strong></td>
                <td>
                  <span class="badge {getStatusBadgeClass(inv.status)}">
                    {getStatusLabel(inv.status, INVOICE_STATUS_LABEL)}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    {#if inv.status !== 'PAID'}
                      <button
                        type="button"
                        class="btn-icon"
                        data-tip={currentUser?.role === 'SUPER_ADMIN' ? 'Konfirmasi Bayar' : 'Bayar Sekarang'}
                        on:click={() => handleOpenPay(inv)}
                      >
                        <Icon name="payments" size="sm" />
                      </button>
                      {#if currentUser?.role === 'SUPER_ADMIN'}
                        <button
                          type="button"
                          class="btn-icon btn-icon-danger"
                          data-tip="Hapus"
                          on:click={() => {
                            deletingInvoiceId = inv.id;
                            deleteDialogOpen = true;
                          }}
                        >
                          <Icon name="delete" size="sm" />
                        </button>
                      {/if}
                    {:else if inv.paymentProofUrl}
                      <a
                        href={inv.paymentProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        class="btn-icon"
                        data-tip="Bukti Bayar"
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

    {#if filteredInvoices.length > itemsPerPage}
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredInvoices.length)} dari {filteredInvoices.length} data
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

<InvoiceModal open={invoiceModalOpen} onClose={() => { invoiceModalOpen = false; }} />
{#if currentUser}
  <InvoicePaymentModal
    open={paymentModalOpen}
    invoice={selectedInvoice}
    {currentUser}
    onClose={() => { paymentModalOpen = false; }}
  />
{/if}

<ConfirmationDialog
  open={deleteDialogOpen}
  title="Hapus Tagihan SPP"
  message="Apakah Anda yakin ingin menghapus tagihan ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => { deleteDialogOpen = false; }}
/>
