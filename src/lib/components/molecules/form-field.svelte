<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    label,
    htmlFor = undefined,
    required = false,
    error = undefined,
    helper = undefined,
    className = '',
    children
  }: {
    label: string;
    htmlFor?: string | undefined;
    required?: boolean;
    error?: string | undefined;
    helper?: string | undefined;
    className?: string;
    children?: Snippet;
  } = $props();
</script>

<div class="field {className}">
  <label for={htmlFor}>
    {label}
    {#if required}<i class="req">*</i>{/if}
  </label>
  {#if children}{@render children()}{/if}
  {#if error}
    <div class="text-xs text-danger mt-1">{error}</div>
  {:else if helper}
    <div class="text-xs text-muted-fg mt-1">{helper}</div>
  {/if}
</div>
