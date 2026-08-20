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
  class="w-full p-3 text-sm bg-surface text-fg border border-border rounded-xl outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary-soft disabled:opacity-50 disabled:bg-muted disabled:cursor-not-allowed resize-y {className}"
  on:input
  on:change
></textarea>
