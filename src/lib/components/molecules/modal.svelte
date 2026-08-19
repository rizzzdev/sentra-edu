<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';

  export let title: string = '';
  export let icon: string = 'edit_note';
  export let maxWidth: string = '560px';
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

  $: computedStyle = maxWidth.includes('px')
    ? `max-width: ${maxWidth}`
    : maxWidth.includes('max-w-')
      ? `max-width: ${maxWidth === 'max-w-md' ? '480px' : maxWidth === 'max-w-xl' ? '640px' : maxWidth === 'max-w-2xl' ? '720px' : '560px'}`
      : `max-width: ${maxWidth}`;
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
      class="modal"
      style={computedStyle}
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

      <!-- Footer -->
      <div class="modal-foot">
        <slot name="footer" />
      </div>
    </div>
  </div>
{/if}
