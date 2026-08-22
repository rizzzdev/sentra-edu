<script lang="ts">
  import { Icon } from '$lib/components/atoms';
  import { Button } from '$lib/components/atoms';

  let {
    variant = 'destructive',
    title = undefined,
    message,
    icon = undefined,
    onRetry = undefined,
    retryText = 'Coba Lagi',
    className = ''
  }: {
    variant?: 'destructive' | 'warning' | 'info' | 'success';
    title?: string | undefined;
    message: string;
    icon?: string | undefined;
    onRetry?: (() => void) | undefined;
    retryText?: string;
    className?: string;
  } = $props();

  const variantMap: Record<string, { bg: string; border: string; text: string; iconColor: string; defaultIcon: string }> = {
    destructive: { bg: 'bg-danger-soft', border: 'border-danger/30', text: 'text-danger', iconColor: 'text-danger', defaultIcon: 'error' },
    warning: { bg: 'bg-warn-soft', border: 'border-warn/30', text: 'text-warn', iconColor: 'text-warn', defaultIcon: 'warning' },
    info: { bg: 'bg-primary-soft', border: 'border-primary/30', text: 'text-primary', iconColor: 'text-primary', defaultIcon: 'info' },
    success: { bg: 'bg-success-soft', border: 'border-success/30', text: 'text-success', iconColor: 'text-success', defaultIcon: 'check_circle' }
  };

  const style = $derived(variantMap[variant] || variantMap.destructive);
</script>

<div class="flex items-start gap-3 p-3.5 rounded-xl border {style.bg} {style.border} {className}">
  <Icon name={icon || style.defaultIcon} size="md" className="{style.iconColor} mt-0.5 flex-shrink-0" />
  <div class="flex-1 min-w-0">
    {#if title}
      <div class="text-sm font-bold {style.text}">{title}</div>
    {/if}
    <div class="text-xs {style.text} opacity-80 mt-0.5">{message}</div>
    {#if onRetry}
      <div class="mt-2">
        <Button size="sm" variant="outline" onclick={onRetry}>
          {retryText}
        </Button>
      </div>
    {/if}
  </div>
</div>
