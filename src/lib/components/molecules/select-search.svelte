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

  let isOpen: boolean = false;
  let searchQuery: string = '';
  let searchInput: HTMLInputElement | undefined;
  let dropdownEl: HTMLDivElement | undefined;

  $: showSearch = searchable ?? options.length > 10;

  $: filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: selectedLabels = multiple
    ? options.filter((opt) => (value as string[]).includes(opt.value)).map((o) => o.label)
    : options.filter((opt) => opt.value === value).map((o) => o.label);

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

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      isOpen = false;
      searchQuery = '';
    }
    if (e.key === 'Enter' && !isOpen) {
      e.preventDefault();
      toggleOpen();
    }
  }

  function handleBlur(e: FocusEvent) {
    // Delay close to allow click on option
    if (dropdownEl && !dropdownEl.contains(e.relatedTarget as Node)) {
      setTimeout(() => {
        isOpen = false;
        searchQuery = '';
      }, 150);
    }
  }

  function removeTag(val: string, e: MouseEvent) {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      value = value.filter((v) => v !== val);
    }
  }
</script>

<div
  class="select-search {className}"
  class:is-open={isOpen}
  class:is-disabled={disabled}
  bind:this={dropdownEl}
  on:blur={handleBlur}
>
  <!-- Hidden native input for form submission -->
  {#if name}
    {#if multiple}
      {#each (Array.isArray(value) ? value : []) as val}
        <input type="hidden" {name} value={val} />
      {/each}
    {:else}
      <input type="hidden" {name} value={value || ''} />
    {/if}
  {/if}

  <!-- Trigger button -->
  <button
    type="button"
    {id}
    {disabled}
    class="select-trigger"
    class:has-value={displayText}
    on:click|preventDefault={toggleOpen}
    on:keydown={handleKeydown}
  >
    {#if displayText}
      {#if multiple && selectedLabels.length > 0}
        <span class="select-tags">
          {#each selectedLabels as label}
            <span class="select-tag">
              {label}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <span class="select-tag-x" role="button" tabindex="-1" on:mousedown={(e) => {
                const opt = options.find((o) => o.label === label);
                if (opt) removeTag(opt.value, e as unknown as MouseEvent);
              }}>&times;</span>
            </span>
          {/each}
        </span>
      {:else}
        <span class="select-text">{displayText}</span>
      {/if}
    {:else}
      <span class="select-placeholder">{placeholder}</span>
    {/if}
    <span class="select-chevron">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </button>

  <!-- Dropdown panel -->
  {#if isOpen}
    <div class="select-dropdown" role="listbox">
      {#if showSearch}
        <div class="select-search-wrap">
          <input
            type="text"
            class="select-search-input"
            placeholder={searchPlaceholder}
            bind:value={searchQuery}
            bind:this={searchInput}
            on:mousedown|stopPropagation
          />
        </div>
      {/if}

      <div class="select-options">
        {#if filteredOptions.length === 0}
          <div class="select-empty">{emptyText}</div>
        {:else}
          {#each filteredOptions as opt (opt.value)}
            <button
              type="button"
              class="select-option"
              class:is-selected={isSelected(opt.value)}
              on:mousedown|preventDefault={() => selectOption(opt.value)}
            >
              {#if multiple}
                <span class="select-check">
                  {#if isSelected(opt.value)}✓{/if}
                </span>
              {/if}
              <span class="select-option-label">{opt.label}</span>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .select-search {
    position: relative;
    width: 100%;
  }

  /* ── Trigger ── */
  .select-trigger {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 40px;
    padding: 6px 32px 6px 12px;
    background: var(--surface);
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: 10px;
    font-size: 0.9rem;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.12s, box-shadow 0.12s;
    gap: 4px;
  }
  .select-trigger:hover:not(:disabled) {
    border-color: var(--primary-soft-2);
  }
  .select-trigger:focus,
  .is-open .select-trigger {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }
  .select-trigger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--muted);
  }

  .select-placeholder {
    color: var(--muted-fg);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .select-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .select-chevron {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted-fg);
    transition: transform 0.15s;
    display: flex;
    align-items: center;
  }
  .is-open .select-chevron {
    transform: translateY(-50%) rotate(180deg);
  }

  /* ── Tags (multi-select) ── */
  .select-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }
  .select-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    background: var(--primary-soft);
    color: var(--primary-strong);
    border-radius: 999px;
    font-size: 0.76rem;
    font-weight: 600;
    white-space: nowrap;
  }
  .select-tag-x {
    background: none;
    border: none;
    color: var(--primary);
    font-size: 1rem;
    line-height: 1;
    padding: 0;
    cursor: pointer;
    opacity: 0.7;
  }
  .select-tag-x:hover {
    opacity: 1;
  }

  /* ── Dropdown ── */
  .select-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    z-index: 50;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    box-shadow: var(--shadow-md);
    overflow: hidden;
    animation: selectIn 0.12s ease;
  }
  @keyframes selectIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── Search ── */
  .select-search-wrap {
    padding: 8px;
    border-bottom: 1px solid var(--muted);
  }
  .select-search-input {
    width: 100%;
    padding: 7px 10px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 0.84rem;
    font-family: inherit;
    background: var(--bg);
    color: var(--fg);
    outline: none;
    transition: border-color 0.12s;
  }
  .select-search-input:focus {
    border-color: var(--primary);
  }

  /* ── Options ── */
  .select-options {
    max-height: 240px;
    overflow-y: auto;
    padding: 4px;
  }
  .select-option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    background: none;
    color: var(--fg);
    font-size: 0.86rem;
    font-family: inherit;
    text-align: left;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.1s;
  }
  .select-option:hover {
    background: var(--muted);
  }
  .select-option.is-selected {
    background: var(--primary-soft);
    color: var(--primary-strong);
    font-weight: 600;
  }
  .select-check {
    width: 18px;
    height: 18px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid var(--border);
    border-radius: 4px;
    font-size: 0.7rem;
    color: var(--primary);
    transition: all 0.1s;
  }
  .select-option.is-selected .select-check {
    background: var(--primary);
    border-color: var(--primary);
    color: #fff;
  }
  .select-option-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .select-empty {
    padding: 16px 10px;
    text-align: center;
    color: var(--muted-fg);
    font-size: 0.84rem;
  }

  /* ── Disabled ── */
  .is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
