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

  $: allInvoices = $dbStore.invoices.filter((invoiceItem) => {
    if (invoiceItem.deletedAt !== null) return false;
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;

    const enrollmentItem = $dbStore.enrollments.find((enrollment) => enrollment.id === invoiceItem.enrollmentId);
    if (!enrollmentItem) return false;
    return enrollmentItem.studentId === currentUser.id || enrollmentItem.waliUserId === currentUser.id;
  });

  $: unpaidInvoices = allInvoices.filter((invoiceItem) => invoiceItem.status === 'UNPAID');
  $: unpaidTotal = unpaidInvoices.reduce((sum, invoiceItem) => sum + invoiceItem.amount, 0);
  $: paidInvoices = allInvoices.filter((invoiceItem) => invoiceItem.status === 'PAID');
  $: paidTotal = paidInvoices.reduce((sum, invoiceItem) => sum + invoiceItem.amount, 0);

  function getStudentName(enrollmentId: string): string {
    const enrollmentItem = $dbStore.enrollments.find((enrollment) => enrollment.id === enrollmentId);
    if (!enrollmentItem) return '—';
    return $dbStore.users.find((userItem) => userItem.id === enrollmentItem.studentId)?.fullName || '—';
  }

  function getPackageName(enrollmentId: string): string {
    const enrollmentItem = $dbStore.enrollments.find((enrollment) => enrollment.id === enrollmentId);
    if (!enrollmentItem) return '—';
    return $dbStore.packages.find((packageItem) => packageItem.id === enrollmentItem.packageId)?.name || '—';
  }

  function getMonthLabel(month?: number, year?: number): string {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    if (!month || !year) return '—';
    return `${months[month - 1] || month} ${year}`;
  }

  $: filteredInvoices = allInvoices.filter((invoiceItem) => {
    const query = searchQuery.toLowerCase();
    const studentName = getStudentName(invoiceItem.enrollmentId).toLowerCase();
    const packageName = getPackageName(invoiceItem.enrollmentId).toLowerCase();
    const matchesSearch =
      !query ||
      invoiceItem.invoiceNumber.toLowerCase().includes(query) ||
      studentName.includes(query) ||
      packageName.includes(query);
    const matchesStatus = !statusFilter || invoiceItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  $: paginatedInvoices = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  $: totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));

  function handleOpenPay(invoiceItem: InvoiceRecord) {
    selectedInvoice = invoiceItem;
    paymentModalOpen = true;
  }

  function handleConfirmDelete() {
    if (!deletingInvoiceId) return;
    const response = dbStore.deleteInvoice(deletingInvoiceId);
    deleteDialogOpen = false;
    deletingInvoiceId = null;
    if (!response.error) {
      toastStore.success('Tagihan dihapus.');
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="receipt" size="lg" /> {currentUser?.role === 'SUPER_ADMIN' ? 'Manajemen Tagihan SPP' : 'Tagihan & Pembayaran SPP'}</h3>
    <div class="desc">{currentUser?.role === 'SUPER_ADMIN' ? 'Kelola dan buat tagihan SPP bulanan siswa.' : 'Riwayat tagihan biaya les bimbingan belajar anak Anda.'}</div>
  </div>
  {#if currentUser?.role === 'SUPER_ADMIN'}
    <button type="button" class="btn btn-primary" on:click={() => { invoiceModalOpen = true; }}>
      <Icon name="add" size="sm" /> Buat Tagihan
    </button>
  {/if}
</div>

<!-- STATS -->
<div class="stat-grid">
  <div class="stat">
    <div class="s-icon tone-amber"><Icon name="pending" size="lg" /></div>
    <div>
      <div class="s-val">{formatCurrencyIDR(unpaidTotal)}</div>
      <div class="s-lbl">Belum Dibayar ({unpaidInvoices.length})</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="check_circle" size="lg" /></div>
    <div>
      <div class="s-val">{formatCurrencyIDR(paidTotal)}</div>
      <div class="s-lbl">Sudah Dibayar ({paidInvoices.length})</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="receipt_long" size="lg" /></div>
    <div>
      <div class="s-val">{allInvoices.length}</div>
      <div class="s-lbl">Total Tagihan</div>
    </div>
  </div>
</div>

<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input type="text" placeholder="Cari no. tagihan / siswa / paket..." bind:value={searchQuery} />
  </div>

  <SelectSearch
    bind:value={statusFilter}
    placeholder="Semua Status"
    options={[
      { value: '', label: 'Semua Status' },
      ...Object.entries(INVOICE_STATUS_LABEL).map(([value, label]) => ({ value, label }))
    ]}
    className="max-w-44"
  />
</div>

<div class="card">
  <div class="card-body flush">
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>No. Tagihan</th>
            <th>Siswa & Paket</th>
            <th>Periode</th>
            <th>Jatuh Tempo</th>
            <th>Jumlah</th>
            <th>Status</th>
            <th class="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedInvoices.length === 0}
            <tr>
              <td colspan="7" class="empty">Tidak ada data tagihan.</td>
            </tr>
          {:else}
            {#each paginatedInvoices as invoiceItem (invoiceItem.id)}
              <tr>
                <td>
                  <strong>{invoiceItem.invoiceNumber}</strong>
                </td>
                <td>
                  <strong>{getStudentName(invoiceItem.enrollmentId)}</strong>
                  <div class="sub">{getPackageName(invoiceItem.enrollmentId)}</div>
                </td>
                <td>{getMonthLabel(invoiceItem.periodMonth, invoiceItem.periodYear)}</td>
                <td class="sub">{invoiceItem.dueDate}</td>
                <td>
                  <strong>{formatCurrencyIDR(invoiceItem.amount)}</strong>
                </td>
                <td>
                  <span class="badge {getStatusBadgeClass(invoiceItem.status)}">
                    {getStatusLabel(invoiceItem.status, INVOICE_STATUS_LABEL)}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    {#if invoiceItem.status === 'UNPAID' || invoiceItem.status === 'OVERDUE'}
                      <button
                        type="button"
                        class="btn-icon"
                        data-tip={currentUser?.role === 'SUPER_ADMIN' ? 'Konfirmasi Bayar' : 'Bayar Sekarang'}
                        on:click={() => handleOpenPay(invoiceItem)}
                      >
                        <Icon name="payments" size="sm" />
                      </button>
                      {#if currentUser?.role === 'SUPER_ADMIN'}
                        <button
                          type="button"
                          class="btn-icon btn-icon-danger"
                          data-tip="Hapus"
                          on:click={() => {
                            deletingInvoiceId = invoiceItem.id;
                            deleteDialogOpen = true;
                          }}
                        >
                          <Icon name="delete" size="sm" />
                        </button>
                      {/if}
                    {:else if invoiceItem.paymentProofUrl}
                      <a
                        href={invoiceItem.paymentProofUrl}
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
