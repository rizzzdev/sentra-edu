<script lang="ts" module>
  export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'accent' | 'secondary';
</script>

<script lang="ts">
  import { Icon } from '$lib/components/atoms';
  import type { Snippet } from 'svelte';

  let {
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    icon = undefined,
    iconFilled = false,
    fullWidth = false,
    isIconOnly = false,
    className = '',
    ariaLabel = undefined,
    children,
    onclick,
    ...restProps
  }: {
    type?: 'button' | 'submit' | 'reset';
    variant?: ButtonVariant;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    icon?: string | undefined;
    iconFilled?: boolean;
    fullWidth?: boolean;
    isIconOnly?: boolean;
    className?: string;
    ariaLabel?: string | undefined;
    children?: Snippet;
    onclick?: (e: MouseEvent) => void;
    [key: string]: any;
  } = $props();

  const variantClassMap: Record<string, string> = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn-success',
    warning: 'btn-warning',
    accent: 'btn-accent',
    secondary: 'btn-soft'
  };

  const sizeClassMap = $derived<Record<string, string>>({
    sm: isIconOnly ? 'btn btn-sm btn-icon-only' : 'btn btn-sm',
    md: isIconOnly ? 'btn btn-icon-only' : 'btn',
    lg: isIconOnly ? 'btn btn-lg btn-icon-only' : 'btn btn-lg'
  });
</script>

<button
  {type}
  {disabled}
  aria-label={ariaLabel}
  class="{sizeClassMap[size]} {variantClassMap[variant]} {fullWidth ? 'w-full' : ''} {className} disabled:cursor-not-allowed disabled:opacity-60"
  {...restProps}
  {onclick}
>
  {#if icon}
    <Icon name={icon} size={size === 'sm' ? 'xs' : size === 'lg' ? 'lg' : 'md'} filled={iconFilled} />
  {/if}
  {#if children}{@render children()}{/if}
</button>
