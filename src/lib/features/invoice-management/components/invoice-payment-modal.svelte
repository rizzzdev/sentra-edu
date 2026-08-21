<script lang="ts">
import { userStore, subjectStore, enrollmentStore } from '$lib/api';
  import { Modal } from '$lib/components/molecules';
  import { Icon, Input } from '$lib/components/atoms';
  import {toastStore} from '$lib/shared/stores';
  import { formatCurrencyIDR } from '$lib/shared/utils';
  import type { InvoiceRecord, User } from '$lib/shared/types';
  import { Button } from '$lib/components/atoms';
  import { api } from '$lib/api/client';

  export let open: boolean = false;
  export let invoice: InvoiceRecord | null = null;
  export let currentUser: User;
  export let onClose: () => void = () => {};

  let paymentProofUrl: string = '';

  $: enrollment = invoice ? $enrollmentStore.find((enrollmentItem) => enrollmentItem.id === invoice?.enrollmentId) : null;
  $: student = enrollment ? $userStore.find((userItem) => userItem.id === enrollment?.studentId) : null;
  $: subject = enrollment ? $subjectStore.find((subjectItem) => subjectItem.id === enrollment?.subjectId) : null;

  async function handleConfirmPayment() {
    if (!invoice) return;
    const response = await api.invoices.update(invoice.id, paymentProofUrl.trim() || 'https://');
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
      <Input
        id="f_paymentProof"
        type="text"
        placeholder="https://..."
        bind:value={paymentProofUrl}
      />
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={onClose} icon="close">
      Tutup
    </Button>
    {#if currentUser.role === 'SUPER_ADMIN'}
      <Button variant="primary" on:click={handleConfirmPayment} icon="check_circle">
        Konfirmasi Lunas (Admin)
      </Button>
    {:else}
      <Button variant="primary" on:click={handleConfirmPayment} icon="upload">
        Kirim Bukti Pembayaran
      </Button>
    {/if}
  </svelte:fragment>
</Modal>
