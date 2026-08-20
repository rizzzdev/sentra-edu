<script lang="ts">
  /**
   * SelectSearch — Reusable dropdown with search & multi-select.
   *
   * Props:
   *   options     – Array of { value: string; label: string }
   *   value       – Selected value (single mode) or array of values (multi mode)
   *   placeholder – Placeholder text when nothing selected
   *   searchPlaceholder – Search input placeholder
   *   multiple    – Enable multi-select mode
   *   required    – HTML required attribute
   *   disabled    – Disable the dropdown
   *   id          – HTML id for the hidden input / label association
   *   name        – HTML name attribute
   *   searchable  – Show search input (auto when options > 10)
   *   emptyText   – Text shown when no options match search
   *   className   – Extra classes for the wrapper
   */

  import { tick } from 'svelte';

  export let options: Array<{ value: string; label: string }> = [];
  export let value: string | string[] = '';
  export let placeholder: string = '— Pilih —';
  export let searchPlaceholder: string = 'Cari…';
  export let multiple: boolean = false;
  export let disabled: boolean = false;
  export let id: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let searchable: boolean | undefined = undefined;
  export let emptyText: string = 'Tidak ada data';
  export let className: string = '';
  export let required: boolean = false;

  let isOpen: boolean = false;
  let searchQuery: string = '';
  let searchInput: HTMLInputElement | undefined;
  let dropdownEl: HTMLDivElement | undefined;

  $: showSearch = searchable ?? options.length > 10;

  $: filteredOptions = options.filter((optionItem) =>
    optionItem.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    optionItem.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: selectedLabels = multiple
    ? options.filter((optionItem) => (value as string[]).includes(optionItem.value)).map((optionItem) => optionItem.label)
    : options.filter((optionItem) => optionItem.value === value).map((optionItem) => optionItem.label);

  $: displayText = selectedLabels.length > 0
    ? multiple
      ? selectedLabels.length <= 2
        ? selectedLabels.join(', ')
        : `${selectedLabels.length} dipilih`
      : selectedLabels[0]
    : '';

  function toggleOpen() {
    if (disabled) return;
    isOpen = !isOpen;
    if (isOpen && showSearch) {
      searchQuery = '';
      tick().then(() => searchInput?.focus());
    }
  }

  function selectOption(optValue: string) {
    if (multiple) {
      const arr = Array.isArray(value) ? [...value] : [];
      const idx = arr.indexOf(optValue);
      if (idx >= 0) {
        arr.splice(idx, 1);
      } else {
        arr.push(optValue);
      }
      value = arr;
      // Keep open for multi-select, re-focus search
      tick().then(() => searchInput?.focus());
    } else {
      value = optValue;
      isOpen = false;
      searchQuery = '';
    }
  }

  function isSelected(optValue: string): boolean {
    return multiple
      ? (value as string[]).includes(optValue)
      : value === optValue;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      isOpen = false;
      searchQuery = '';
    }
    if (event.key === 'Enter' && !isOpen) {
      event.preventDefault();
      toggleOpen();
    }
  }

  function handleBlur(event: FocusEvent) {
    // Delay close to allow click on option
    if (dropdownEl && !dropdownEl.contains(event.relatedTarget as Node)) {
      setTimeout(() => {
        isOpen = false;
        searchQuery = '';
      }, 150);
    }
  }

  function removeTag(targetVal: string, event: MouseEvent) {
    event.stopPropagation();
    if (multiple && Array.isArray(value)) {
      value = value.filter((valItem) => valItem !== targetVal);
    }
  }
</script>

<div
  class="relative w-full {className} {disabled ? 'opacity-50 pointer-events-none' : ''}"
  bind:this={dropdownEl}
  on:blur={handleBlur}
>
  <!-- Hidden native input for form submission -->
  {#if name}
    {#if multiple}
      {#each (Array.isArray(value) ? value : []) as val}
        <input type="hidden" {name} value={val} {required} />
      {/each}
    {:else}
      <input type="hidden" {name} value={value || ''} {required} />
    {/if}
  {/if}

  <!-- Trigger button -->
  <button
    type="button"
    {id}
    {disabled}
    class="flex items-center w-full min-h-10 px-3 pr-8 bg-surface text-fg border rounded-xl text-sm text-left cursor-pointer transition-colors gap-1 outline-none {isOpen ? 'border-primary ring-2 ring-primary-soft' : 'border-border hover:border-primary'} {disabled ? 'bg-muted cursor-not-allowed' : ''}"
    on:click|preventDefault={toggleOpen}
    on:keydown={handleKeydown}
  >
    {#if displayText}
      {#if multiple && selectedLabels.length > 0}
        <span class="flex flex-wrap gap-1 flex-1 min-w-0">
          {#each selectedLabels as label}
            <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-soft text-primary-strong rounded-full text-xs font-semibold whitespace-nowrap">
              {label}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <span class="text-primary text-sm leading-none p-0 cursor-pointer opacity-70 hover:opacity-100 bg-transparent border-0" role="button" tabindex="-1" on:mousedown={(mouseEvent) => {
                const opt = options.find((option) => option.label === label);
                if (opt) removeTag(opt.value, mouseEvent);
              }}>&times;</span>
            </span>
          {/each}
        </span>
      {:else}
        <span class="flex-1 truncate text-fg">{displayText}</span>
      {/if}
    {:else}
      <span class="text-muted-fg flex-1 truncate">{placeholder}</span>
    {/if}
    <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-fg transition-transform flex items-center pointer-events-none {isOpen ? 'rotate-180' : ''}">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </button>

  <!-- Dropdown panel -->
  {#if isOpen}
    <div class="absolute top-full mt-1 left-0 right-0 z-50 bg-surface border border-border rounded-xl shadow-md overflow-hidden" role="listbox">
      {#if showSearch}
        <div class="p-2 border-b border-border">
          <input
            type="text"
            class="w-full px-2.5 py-1.5 border border-border rounded-lg text-xs bg-bg text-fg outline-none transition-colors focus:border-primary"
            placeholder={searchPlaceholder}
            bind:value={searchQuery}
            bind:this={searchInput}
            on:mousedown|stopPropagation
          />
        </div>
      {/if}

      <div class="max-h-60 overflow-y-auto p-1">
        {#if filteredOptions.length === 0}
          <div class="py-4 px-2.5 text-center text-muted-fg text-xs">{emptyText}</div>
        {:else}
          {#each filteredOptions as opt (opt.value)}
            <button
              type="button"
              class="flex items-center gap-2 w-full p-2 border-0 bg-transparent text-fg text-xs text-left rounded-lg cursor-pointer transition-colors hover:bg-muted {isSelected(opt.value) ? 'bg-primary-soft text-primary-strong font-semibold' : ''}"
              on:mousedown|preventDefault={() => selectOption(opt.value)}
            >
              {#if multiple}
                <span class="w-4 h-4 flex-none flex items-center justify-center border rounded text-xs text-primary transition-all {isSelected(opt.value) ? 'bg-primary border-primary text-white' : 'border-border'}">
                  {#if isSelected(opt.value)}✓{/if}
                </span>
              {/if}
              <span class="flex-1 truncate">{opt.label}</span>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>
