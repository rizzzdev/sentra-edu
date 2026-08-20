<script lang="ts">
  export let value: number = 0;
  export let placeholder: string = '0';
  export let disabled: boolean = false;
  export let readonly: boolean = false;
  export let required: boolean = false;
  export let id: string | undefined = undefined;
  export let className: string = '';

  let displayValue: string = '';
  let isFocused: boolean = false;

  function formatRupiah(num: number): string {
    return num.toLocaleString('id-ID');
  }

  function parseRupiah(str: string): number {
    const cleaned = str.replace(/[^0-9]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  }

  $: if (!isFocused) {
    displayValue = formatRupiah(value);
  }

  function handleFocus() {
    isFocused = true;
    displayValue = String(value || '');
  }

  function handleBlur() {
    isFocused = false;
    value = parseRupiah(displayValue);
    displayValue = formatRupiah(value);
  }

  function handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const raw = input.value.replace(/[^0-9]/g, '');
    displayValue = raw;
    value = raw ? parseInt(raw, 10) : 0;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  }
</script>

<div class="currency-input-wrapper {className}">
  <span class="currency-prefix">Rp</span>
  <input
    {id}
    type="text"
    inputmode="numeric"
    {placeholder}
    {disabled}
    {readonly}
    {required}
    value={displayValue}
    on:focus={handleFocus}
    on:blur={handleBlur}
    on:input={handleInput}
    on:keydown={handleKeydown}
    class="currency-input"
  />
</div>

<style>
  .currency-input-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    height: 2.5rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    transition: border-color 0.15s, box-shadow 0.15s;
    overflow: hidden;
  }

  .currency-input-wrapper:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-soft);
  }

  .currency-prefix {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-fg-muted);
    background: var(--color-surface-hover);
    height: 100%;
    border-right: 1px solid var(--color-border);
    user-select: none;
  }

  .currency-input {
    width: 100%;
    height: 100%;
    padding: 0 0.75rem;
    font-size: 0.875rem;
    color: var(--color-fg);
    background: transparent;
    border: none;
    outline: none;
    text-align: right;
  }

  .currency-input::placeholder {
    color: var(--color-fg-muted);
  }

  .currency-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
