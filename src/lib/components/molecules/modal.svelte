<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';

  export let title: string = '';
  export let icon: string = 'edit_note';
  export let maxWidth: string = 'max-w-lg';
  export let open: boolean = true;
  export let onClose: () => void = () => {};

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

  $: maxWidthClass = getMaxWidthClass(maxWidth);
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div
    class="modal-overlay"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
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
          on:click={onClose}
          aria-label="Tutup jendela modal"
        >
          <Icon name="close" size="sm" />
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <slot />
      </div>

      <!-- Footer (optional slot) -->
      {#if $$slots.footer}
        <div class="modal-foot">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}
