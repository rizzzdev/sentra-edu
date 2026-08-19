<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';

  export let title: string;
  export let value: string | number;
  export let icon: string;
  export let tone: 'sky' | 'emerald' | 'amber' | 'rose' | 'violet' = 'sky';
  export let subtitle: string | undefined = undefined;
  export let className: string = '';

  const toneClassMap: Record<string, { bg: string; text: string; border: string }> = {
    sky: {
      bg: 'bg-sky-50 dark:bg-sky-950/40',
      text: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-200 dark:border-sky-800'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800'
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800'
    },
    violet: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800'
    }
  };

  $: currentTone = toneClassMap[tone] || toneClassMap.sky;
</script>

<div
  class="flex items-center gap-4 p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-150 {className}"
>
  <div class="flex items-center justify-center w-12 h-12 rounded-[var(--radius-sm)] border {currentTone.bg} {currentTone.text} {currentTone.border} flex-none">
    <Icon name={icon} size="lg" filled={true} />
  </div>
  <div class="flex flex-col min-w-0">
    <span class="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] truncate">{title}</span>
    <span class="text-2xl font-extrabold text-[var(--color-fg)] mt-0.5 tracking-tight">{value}</span>
    {#if subtitle}
      <span class="text-xs text-[var(--color-fg-muted)] mt-0.5">{subtitle}</span>
    {/if}
  </div>
</div>
