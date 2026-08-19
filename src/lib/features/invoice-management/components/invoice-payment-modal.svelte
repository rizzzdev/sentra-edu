<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import type { InvoiceRecord, User } from '$lib/shared/types/common.types';

  export let open: boolean = false;
  export let invoice: InvoiceRecord | null = null;
  export let currentUser: User;
  export let onClose: () => void = () => {};

  let paymentProofUrl: string = '';

  $: enrollment = invoice ? $dbStore.enrollments.find((e) => e.id === invoice?.enrollmentId) : null;
  $: student = enrollment ? $dbStore.users.find((u) => u.id === enrollment?.studentId) : null;
  $: subject = enrollment ? $dbStore.subjects.find((s) => s.id === enrollment?.subjectId) : null;

  function handleConfirmPayment() {
    if (!invoice) return;
    const response = dbStore.confirmInvoicePayment(invoice.id, paymentProofUrl.trim() || 'https://');
    if (!response.error) {
      toastStore.success('Pembayaran tagihan SPP berhasil dikonfirmasi lunas!');
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title="Pembayaran & Konfirmasi SPP" icon="payments" maxWidth="540px">
  {#if invoice}
    <div class="kv">
      <dt>No. Tagihan</dt>
      <dd>{invoice.invoiceNumber}</dd>
      <dt>Siswa</dt>
      <dd>{student?.fullName || 'Siswa'}</dd>
      <dt>Mata Pelajaran</dt>
      <dd>{subject?.name || '—'}</dd>
      <dt>Jatuh Tempo</dt>
      <dd>{invoice.dueDate}</dd>
      <dt>Total Tagihan</dt>
      <dd class="text-primary font-bold">{formatCurrencyIDR(invoice.amount)}</dd>
    </div>

    <div class="alert alert-info mb-3.5">
      <Icon name="account_balance" size="sm" />
      <span>
        <strong>Rekening Resmi SentraEdu</strong><br />
        BCA VA: <strong>8890 0812 0001</strong> &nbsp;|&nbsp; Mandiri: <strong>1420 0012 3456</strong>
      </span>
    </div>

    <div class="field">
      <label for="f_paymentProof">URL Bukti Transfer / Pembayaran</label>
      <input
        id="f_paymentProof"
        type="text"
        placeholder="https://..."
        bind:value={paymentProofUrl}
      />
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <button type="button" class="btn btn-outline" on:click={onClose}>
      <Icon name="close" size="sm" /> Tutup
    </button>
    {#if currentUser.role === 'SUPER_ADMIN'}
      <button type="button" class="btn btn-primary" on:click={handleConfirmPayment}>
        <Icon name="check_circle" size="sm" /> Konfirmasi Lunas (Admin)
      </button>
    {:else}
      <button type="button" class="btn btn-primary" on:click={handleConfirmPayment}>
        <Icon name="upload" size="sm" /> Kirim Bukti Pembayaran
      </button>
    {/if}
  </svelte:fragment>
</Modal>
