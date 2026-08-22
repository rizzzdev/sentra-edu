<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  let {
    value = $bindable(''),
    type = 'text',
    variant = 'default',
    placeholder = '',
    disabled = false,
    readonly = false,
    required = false,
    id = undefined,
    name = undefined,
    step = undefined,
    min = undefined,
    max = undefined,
    className = '',
    autocomplete = undefined,
    oninput,
    onchange,
    onfocus,
    onblur,
    onkeydown,
    ...restProps
  }: {
    value?: string | number | null | undefined;
    type?: string;
    variant?: 'default' | 'filled' | 'flush';
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    id?: string | undefined;
    name?: string | undefined;
    step?: string | undefined;
    min?: string | number | undefined;
    max?: string | number | undefined;
    className?: string;
    autocomplete?: HTMLInputAttributes['autocomplete'];
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
    onfocus?: (e: FocusEvent) => void;
    onblur?: (e: FocusEvent) => void;
    onkeydown?: (e: KeyboardEvent) => void;
    [key: string]: any;
  } = $props();

  const variantClasses = $derived(
    ({
      default: 'bg-surface text-fg border border-border focus:border-primary focus:ring-2 focus:ring-primary-soft',
      filled: 'bg-muted text-fg border-transparent focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary-soft',
      flush: 'bg-transparent text-fg border-b border-border rounded-none px-0 focus:border-primary'
    } as Record<string, string>)[variant] || ''
  );
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
  class="w-full h-10 px-3 py-2 text-sm rounded-xl outline-none transition-colors duration-150 disabled:opacity-50 disabled:bg-muted disabled:cursor-not-allowed {variantClasses} {className}"
  {oninput}
  {onchange}
  {onfocus}
  {onblur}
  {onkeydown}
  {...restProps}
/>
