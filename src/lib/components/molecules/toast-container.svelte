<script lang="ts">
  import { toastStore } from '$lib/shared/stores/toast-store';
  import Icon from '$lib/components/atoms/icon.svelte';

  const iconMap: Record<string, string> = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };
</script>

<div id="toasts">
  {#each $toastStore as toast (toast.id)}
    <div class="toast {toast.type}">
      <Icon name={iconMap[toast.type] || 'info'} size="md" />
      <span>{toast.message}</span>
    </div>
  {/each}
</div>
