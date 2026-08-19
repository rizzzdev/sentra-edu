<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  export let value: string | number | null | undefined = '';
  export let type: string = 'text';
  export let placeholder: string = '';
  export let disabled: boolean = false;
  export let readonly: boolean = false;
  export let required: boolean = false;
  export let id: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let step: string | undefined = undefined;
  export let min: string | number | undefined = undefined;
  export let max: string | number | undefined = undefined;
  export let className: string = '';
  export let autocomplete: HTMLInputAttributes['autocomplete'] = undefined;
</script>

<input
  {id}
  {name}
  {type}
  {placeholder}
  {disabled}
  {readonly}
  {required}
  {step}
  {min}
  {max}
  {autocomplete}
  bind:value
  class="w-full h-10 px-3 py-2 text-sm bg-[var(--color-surface)] text-[var(--color-fg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:opacity-50 disabled:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed {className}"
  on:input
  on:change
  on:focus
  on:blur
  on:keydown
/>
