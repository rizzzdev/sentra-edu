<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';

  export let variant:
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral'
    | 'role-admin'
    | 'role-tentor'
    | 'role-student'
    | 'role-wali' = 'neutral';
  export let size: 'sm' | 'md' = 'sm';
  export let icon: string | undefined = undefined;
  export let className: string = '';

  const variantClassMap: Record<string, string> = {
    primary: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)] border-transparent',
    success: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border-transparent',
    warning: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-transparent',
    danger: 'bg-[var(--color-destructive-soft)] text-[var(--color-destructive)] border-transparent',
    info: 'bg-[var(--color-info-soft)] text-[var(--color-info)] border-transparent',
    neutral: 'bg-[var(--color-surface-hover)] text-[var(--color-fg-muted)] border-[var(--color-border)]',
    'role-admin': 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold',
    'role-tentor': 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold',
    'role-student': 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold',
    'role-wali': 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold'
  };

  const sizeClassMap: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs gap-1 rounded-[var(--radius-xs)]',
    md: 'px-2.5 py-1 text-xs gap-1.5 rounded-[var(--radius-sm)]'
  };
</script>

<span
  class="inline-flex items-center font-semibold tracking-wide border {variantClassMap[variant]} {sizeClassMap[size]} {className}"
>
  {#if icon}
    <Icon name={icon} size="xs" />
  {/if}
  <slot />
</span>
