<script lang="ts">
  export let value: string | number | undefined = '';
  export let disabled: boolean = false;
  export let required: boolean = false;
  export let id: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let className: string = '';
</script>

<select
  {id}
  {name}
  {disabled}
  {required}
  bind:value
  class="w-full h-10 px-3 py-2 text-sm bg-[var(--color-surface)] text-[var(--color-fg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:opacity-50 disabled:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed cursor-pointer {className}"
  on:change
>
  <slot />
</select>
