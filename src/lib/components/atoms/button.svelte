<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';

  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let variant: 'primary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'accent' | 'secondary' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled: boolean = false;
  export let icon: string | undefined = undefined;
  export let iconFilled: boolean = false;
  export let fullWidth: boolean = false;
  export let isIconOnly: boolean = false;
  export let className: string = '';
  export let ariaLabel: string | undefined = undefined;

  const variantClassMap: Record<string, string> = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] border-transparent shadow-sm',
    outline: 'bg-[var(--color-surface)] text-[var(--color-fg)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]',
    ghost: 'bg-transparent text-[var(--color-fg)] border-transparent hover:bg-[var(--color-surface-hover)]',
    danger: 'bg-[var(--color-destructive)] text-white hover:bg-[var(--color-destructive-hover)] border-transparent shadow-sm',
    success: 'bg-[var(--color-success)] text-white hover:bg-[var(--color-success-hover)] border-transparent shadow-sm',
    warning: 'bg-[var(--color-warning)] text-white hover:bg-[var(--color-warning-hover)] border-transparent shadow-sm',
    accent: 'bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)] border-transparent font-bold shadow-sm',
    secondary: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)] hover:bg-[var(--color-primary-soft-hover)] border-transparent'
  };

  $: sizeClassMap = {
    sm: isIconOnly ? 'h-8 w-8 text-xs rounded-[var(--radius-xs)] p-0' : 'h-8 px-3 text-xs gap-1.5 rounded-[var(--radius-xs)]',
    md: isIconOnly ? 'h-10 w-10 text-sm rounded-[var(--radius-sm)] p-0' : 'h-10 px-4 text-sm gap-2 rounded-[var(--radius-sm)]',
    lg: isIconOnly ? 'h-12 w-12 text-base rounded-[var(--radius-md)] p-0' : 'h-12 px-6 text-base gap-2.5 rounded-[var(--radius-md)]'
  };
</script>

<button
  {type}
  {disabled}
  aria-label={ariaLabel}
  class="inline-flex items-center justify-center font-semibold border transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none {variantClassMap[variant]} {sizeClassMap[size]} {fullWidth ? 'w-full' : ''} {className}"
  {...$$restProps}
  on:click
>
  {#if icon}
    <Icon name={icon} size={size === 'sm' ? 'xs' : size === 'lg' ? 'lg' : 'md'} filled={iconFilled} />
  {/if}
  <slot />
</button>
