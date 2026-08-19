<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';

  export let open: boolean = false;
  export let title: string = 'Konfirmasi';
  export let message: string = 'Apakah Anda yakin ingin melanjutkan tindakan ini?';
  export let confirmText: string = 'Ya, Lanjutkan';
  export let cancelText: string = 'Batal';
  export let confirmVariant: 'primary' | 'danger' | 'warning' | 'success' = 'danger';
  export let icon: string = 'help';
  export let onConfirm: () => void = () => {};
  export let onCancel: () => void = () => {};
</script>

<Modal {open} onClose={onCancel} {title} {icon} maxWidth="460px">
  <p class="confirm-msg">{message}</p>

  <svelte:fragment slot="footer">
    <button type="button" class="btn btn-outline" on:click={onCancel}>
      <Icon name="close" size="sm" /> {cancelText}
    </button>
    <button
      type="button"
      class="btn {confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'}"
      on:click={onConfirm}
    >
      <Icon name="check" size="sm" /> {confirmText}
    </button>
  </svelte:fragment>
</Modal>
