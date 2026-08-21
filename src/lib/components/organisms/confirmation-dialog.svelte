<script lang="ts">
  import { Modal } from '$lib/components/molecules';
  import { Button, Icon } from '$lib/components/atoms';

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
    <Button variant="outline" on:click={onCancel} icon="close">
      {cancelText}
    </Button>
    <Button
      variant={confirmVariant}
      on:click={onConfirm}
      icon="check"
    >
      {confirmText}
    </Button>
  </svelte:fragment>
</Modal>
