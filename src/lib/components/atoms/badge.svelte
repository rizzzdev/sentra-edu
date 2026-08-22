<script lang="ts">
  import { Icon } from '$lib/components/atoms';
  import type { Snippet } from 'svelte';

  let {
    variant = 'neutral',
    size = 'sm',
    icon = undefined,
    className = '',
    children
  }: {
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'role-admin' | 'role-tentor' | 'role-student' | 'role-parent';
    size?: 'sm' | 'md';
    icon?: string | undefined;
    className?: string;
    children?: Snippet;
  } = $props();

  const variantClassMap: Record<string, string> = {
    primary: 'bg-primary-soft text-primary border-transparent',
    success: 'bg-success-soft text-success border-transparent',
    warning: 'bg-warn-soft text-warn border-transparent',
    danger: 'bg-danger-soft text-danger border-transparent',
    info: 'bg-primary-soft text-primary border-transparent',
    neutral: 'bg-muted text-muted-fg border-border',
    'role-admin': 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold',
    'role-tentor': 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold',
    'role-student': 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold',
    'role-parent': 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold'
  };

  const sizeClassMap: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs gap-1 rounded-lg',
    md: 'px-2.5 py-1 text-xs gap-1.5 rounded-xl'
  };
</script>

<span
  class="inline-flex items-center font-semibold tracking-wide border {variantClassMap[variant]} {sizeClassMap[size]} {className}"
>
  {#if icon}
    <Icon name={icon} size="xs" />
  {/if}
  {#if children}{@render children()}{/if}
</span>
