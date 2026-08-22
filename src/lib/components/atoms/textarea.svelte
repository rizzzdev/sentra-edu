<script lang="ts">
  let {
    value = $bindable(''),
    rows = 3,
    placeholder = '',
    disabled = false,
    readonly = false,
    required = false,
    id = undefined,
    name = undefined,
    className = '',
    oninput,
    onchange,
    ...restProps
  }: {
    value?: string | undefined;
    rows?: number;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    id?: string | undefined;
    name?: string | undefined;
    className?: string;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
    [key: string]: any;
  } = $props();
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
  {oninput}
  {onchange}
  {...restProps}
></textarea>
