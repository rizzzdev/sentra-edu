<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import Button from '$lib/components/atoms/button.svelte';

  export let variant: 'destructive' | 'warning' | 'info' | 'success' = 'destructive';
  export let title: string | undefined = undefined;
  export let message: string;
  export let icon: string | undefined = undefined;
  export let onRetry: (() => void) | undefined = undefined;
  export let retryText: string = 'Coba Lagi';
  export let className: string = '';

  const variantMap: Record<string, { bg: string; text: string; iconDefault: string }> = {
    destructive: {
      bg: 'bg-[var(--color-destructive-soft)] border-[var(--color-destructive)]',
      text: 'text-[var(--color-destructive)]',
      iconDefault: 'error'
    },
    warning: {
      bg: 'bg-[var(--color-warning-soft)] border-[var(--color-warning)]',
      text: 'text-[var(--color-warning)]',
      iconDefault: 'warning'
    },
    info: {
      bg: 'bg-[var(--color-info-soft)] border-[var(--color-info)]',
      text: 'text-[var(--color-info)]',
      iconDefault: 'info'
    },
    success: {
      bg: 'bg-[var(--color-success-soft)] border-[var(--color-success)]',
      text: 'text-[var(--color-success)]',
      iconDefault: 'check_circle'
    }
  };

  $: currentVariant = variantMap[variant] || variantMap.destructive;
</script>

<div
  class="flex items-start gap-3 p-4 rounded-[var(--radius-sm)] border {currentVariant.bg} {currentVariant.text} {className}"
  role="alert"
>
  <div class="flex-none mt-0.5">
    <Icon name={icon || currentVariant.iconDefault} size="md" filled={true} />
  </div>
  <div class="flex-1 text-sm">
    {#if title}
      <h4 class="font-bold mb-0.5">{title}</h4>
    {/if}
    <p class="leading-relaxed opacity-95">{message}</p>
    <slot />
  </div>
  {#if onRetry}
    <div class="flex-none">
      <Button size="sm" variant="outline" on:click={onRetry}>
        {retryText}
      </Button>
    </div>
  {/if}
</div>
