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

  $: variantClassMap = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn-success',
    warning: 'btn-warning',
    accent: 'btn-accent',
    secondary: 'btn-soft'
  };

  $: sizeClassMap = {
    sm: isIconOnly ? 'btn btn-sm btn-icon-only' : 'btn btn-sm',
    md: isIconOnly ? 'btn btn-icon-only' : 'btn',
    lg: isIconOnly ? 'btn btn-lg btn-icon-only' : 'btn btn-lg'
  };
</script>

<button
  {type}
  {disabled}
  aria-label={ariaLabel}
  class="{sizeClassMap[size]} {variantClassMap[variant]} {className} disabled:cursor-not-allowed disabled:opacity-60"
  {...$$restProps}
  style={fullWidth ? 'width:100%' : undefined}
  on:click
>
  {#if icon}
    <Icon name={icon} size={size === 'sm' ? 'xs' : size === 'lg' ? 'lg' : 'md'} filled={iconFilled} />
  {/if}
  <slot />
</button>
