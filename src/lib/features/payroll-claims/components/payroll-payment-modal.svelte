<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import type { PayrollClaim } from '$lib/shared/types/common.types';

  export let open: boolean = false;
  export let claim: PayrollClaim | null = null;
  export let onClose: () => void = () => {};

  let transferProofUrl: string = '';

  $: tentor = claim ? $dbStore.users.find((u) => u.id === claim?.tentorId) : null;

  function handleProcessPayment() {
    if (!claim) return;
    const response = dbStore.processPayrollPayment(claim.id, transferProofUrl.trim() || 'https://');
    if (!response.error) {
      if (tentor) {
        dbStore.pushNotification(
          tentor.id,
          'Honor Sesi Telah Ditransfer',
          `Klaim honor ${claim.claimNumber} sebesar ${formatCurrencyIDR(claim.totalAmount)} telah berhasil dibayarkan.`,
          'payments'
        );
      }
      toastStore.success('Pembayaran honor berhasil dikonfirmasi dan diselesaikan.');
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title="Proses Transfer Honor Tentor" icon="account_balance_wallet" maxWidth="500px">
  {#if claim}
    <div class="kv">
      <dt>No. Klaim</dt>
      <dd>{claim.claimNumber}</dd>
      <dt>Tentor</dt>
      <dd>{tentor?.fullName || 'Tentor'}</dd>
      <dt>Total Honor</dt>
      <dd class="text-primary font-bold">{formatCurrencyIDR(claim.totalAmount)}</dd>
      <dt>Jumlah Sesi</dt>
      <dd>{claim.attendanceIds?.length || 0} sesi</dd>
    </div>

    <div class="field">
      <label for="f_transferProof">URL Bukti Transfer Bank</label>
      <input
        id="f_transferProof"
        type="text"
        placeholder="https://..."
        bind:value={transferProofUrl}
      />
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <button type="button" class="btn btn-outline" on:click={onClose}>
      <Icon name="close" size="sm" /> Batal
    </button>
    <button type="button" class="btn btn-primary" on:click={handleProcessPayment}>
      <Icon name="check" size="sm" /> Konfirmasi Telah Ditransfer
    </button>
  </svelte:fragment>
</Modal>
