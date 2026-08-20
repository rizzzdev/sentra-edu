<script lang="ts">
  export let value: number = 0;
  export let placeholder: string = '0';
  export let disabled: boolean = false;
  export let readonly: boolean = false;
  export let required: boolean = false;
  export let id: string | undefined = undefined;
  export let className: string = '';

  let rawDigits: string = '';

  function formatDisplay(digits: string): string {
    if (!digits) return '';
    // Add thousand separators using id-ID locale
    return Number(digits).toLocaleString('id-ID');
  }

  function initFromValue() {
    rawDigits = value ? String(Math.floor(value)) : '';
  }

  // Sync when value changes externally (e.g. editing mode)
  $: value, initFromValue();

  function handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    // Strip everything that isn't a digit
    const caretPos = input.selectionStart || 0;
    const oldLen = rawDigits.length;
    rawDigits = input.value.replace(/[^0-9]/g, '');
    value = rawDigits ? parseInt(rawDigits, 10) : 0;

    // Reformat display
    const formatted = formatDisplay(rawDigits);
    input.value = formatted;

    // Restore caret position adjusted for added separators
    const newLen = formatted.length;
    const diff = newLen - oldLen;
    const newPos = Math.max(0, caretPos + diff);
    input.setSelectionRange(newPos, newPos);
  }

  function handleFocus(e: Event) {
    const input = e.target as HTMLInputElement;
    // Place caret at end
    const len = input.value.length;
    input.setSelectionRange(len, len);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  }
</script>

<div class="currency-wrapper {className}">
  <span class="currency-prefix" class:disabled>Rp</span>
  <input
    {id}
    type="text"
    inputmode="numeric"
    {placeholder}
    {disabled}
    {readonly}
    {required}
    value={formatDisplay(rawDigits)}
    on:input={handleInput}
    on:focus={handleFocus}
    on:keydown={handleKeydown}
    class="currency-field"
  />
</div>

<style>
  .currency-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    height: 2.5rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .currency-wrapper:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-soft);
  }

  .currency-prefix {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0 0.75rem;
    height: 100%;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-fg-muted);
    background: var(--color-surface-hover);
    border-right: 1px solid var(--color-border);
    border-radius: var(--radius-sm) 0 0 var(--radius-sm);
    user-select: none;
  }

  .currency-prefix.disabled {
    opacity: 0.5;
  }

  .currency-field {
    width: 100%;
    height: 100%;
    padding: 0 0.75rem;
    font-size: 0.875rem;
    color: var(--color-fg);
    background: transparent;
    border: none;
    outline: none;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .currency-field::placeholder {
    color: var(--color-fg-muted);
  }

  .currency-field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
