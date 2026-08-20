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

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
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

  function handleFocus(event: Event) {
    const input = event.target as HTMLInputElement;
    // Place caret at end
    const len = input.value.length;
    input.setSelectionRange(len, len);
  }

  function handleKeydown(keyboardEvent: KeyboardEvent) {
    if (keyboardEvent.key === 'Enter') {
      (keyboardEvent.target as HTMLInputElement).blur();
    }
  }
</script>

<div class="flex items-center w-full h-10 bg-surface border border-border rounded-xl transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-soft overflow-hidden {className}">
  <span class="flex items-center justify-center flex-none px-3 h-full text-sm font-semibold text-muted-fg bg-muted border-r border-border select-none {disabled ? 'opacity-50' : ''}">
    Rp
  </span>
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
    class="w-full h-full px-3 text-sm text-fg bg-transparent border-0 outline-none text-right tabular-nums placeholder:text-muted-fg disabled:opacity-50 disabled:cursor-not-allowed"
  />
</div>
