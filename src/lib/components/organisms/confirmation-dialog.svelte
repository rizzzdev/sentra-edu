<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import { Button } from '$lib/components/atoms';
  import type { ButtonVariant } from '$lib/components/atoms/button.svelte';

  interface Props {
    open?: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: ButtonVariant;
    icon?: string;
    onConfirm?: (e?: MouseEvent) => void;
    onCancel?: (e?: MouseEvent) => void;
  }

  let {
    open = false,
    title = 'Konfirmasi',
    message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    confirmVariant = 'danger',
    icon = 'help',
    onConfirm = () => {},
    onCancel = () => {}
  }: Props = $props();
</script>

<Modal {open} onClose={onCancel} {title} {icon} maxWidth="460px">
  <p class="text-sm text-fg leading-relaxed">{message}</p>

  {#snippet footer()}
    <Button variant="outline" onclick={onCancel} icon="close">
      {cancelText}
    </Button>
    <Button
      variant={confirmVariant}
      onclick={onConfirm}
      icon="check"
    >
      {confirmText}
    </Button>
  {/snippet}
</Modal>
