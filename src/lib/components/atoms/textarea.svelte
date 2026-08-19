<script lang="ts">
  export let value: string | undefined = '';
  export let rows: number = 3;
  export let placeholder: string = '';
  export let disabled: boolean = false;
  export let readonly: boolean = false;
  export let required: boolean = false;
  export let id: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let className: string = '';
</script>

<textarea
  {id}
  {name}
  {rows}
  {placeholder}
  {disabled}
  {readonly}
  {required}
  bind:value
  class="w-full p-3 text-sm bg-[var(--color-surface)] text-[var(--color-fg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:opacity-50 disabled:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed resize-y {className}"
  on:input
  on:change
></textarea>
