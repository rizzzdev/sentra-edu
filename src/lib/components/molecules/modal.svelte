<script lang="ts">
  import { Icon } from '$lib/components/atoms';
  import type { Snippet } from 'svelte';

  let {
    title = '',
    icon = 'edit_note',
    maxWidth = 'max-w-lg',
    open = true,
    onClose = () => {},
    children,
    footer
  }: {
    title?: string;
    icon?: string;
    maxWidth?: string;
    open?: boolean;
    onClose?: () => void;
    children?: Snippet;
    footer?: Snippet;
  } = $props();

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  function getMaxWidthClass(width: string): string {
    if (width.startsWith('max-w-')) return width;
    const num = parseInt(width, 10);
    if (isNaN(num)) return 'max-w-lg';
    if (num <= 480) return 'max-w-md';
    if (num <= 560) return 'max-w-lg';
    if (num <= 640) return 'max-w-xl';
    if (num <= 720) return 'max-w-2xl';
    return 'max-w-3xl';
  }

  const maxWidthClass = $derived(getMaxWidthClass(maxWidth));
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="modal-overlay"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="presentation"
    tabindex="-1"
  >
    <div
      class="modal {maxWidthClass}"
      role="dialog"
      aria-modal="true"
      tabindex="0"
    >
      <!-- Header -->
      <div class="modal-head">
        <div class="modal-title">
          <Icon name={icon} size="md" />
          <span>{title}</span>
        </div>
        <button
          type="button"
          class="modal-x"
          onclick={onClose}
          aria-label="Tutup jendela modal"
        >
          <Icon name="close" size="sm" />
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        {#if children}{@render children()}{/if}
      </div>

      <!-- Footer (optional) -->
      {#if footer}
        <div class="modal-foot">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
