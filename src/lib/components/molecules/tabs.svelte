<script context="module" lang="ts">
  export interface TabItem {
    id: string;
    label: string;
    icon?: string;
    badge?: number | string;
  }
</script>

<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';

  export let items: TabItem[] = [];
  export let activeId: string = '';
  export let variant: 'pills' | 'underline' | 'cards' = 'pills';
  export let onSelect: (id: string) => void = () => {};

  function handleClick(id: string) {
    if (id !== activeId) {
      onSelect(id);
    }
  }
</script>

{#if variant === 'pills'}
  <div class="inline-flex items-center gap-2 p-2 bg-muted/90 border border-border rounded-2xl max-w-full overflow-x-auto select-none shadow-xs" role="tablist">
    {#each items as item (item.id)}
      {@const isActive = activeId === item.id}
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        class="inline-flex items-center gap-2.5 px-5 py-2.5 text-sm rounded-xl transition-all cursor-pointer border whitespace-nowrap {isActive ? 'bg-surface text-primary border-primary/20 shadow-sm font-extrabold ring-1 ring-primary/10' : 'bg-transparent text-muted-fg border-transparent font-semibold hover:bg-surface/70 hover:text-fg'}"
        on:click={() => handleClick(item.id)}
      >
        {#if item.icon}
          <Icon name={item.icon} size="sm" />
        {/if}
        <span>{item.label}</span>
        {#if item.badge !== undefined && item.badge !== null}
          <span class="ml-1 px-2.5 py-0.5 text-xs font-black rounded-full transition-colors {isActive ? 'bg-primary text-white shadow-2xs' : 'bg-surface text-muted-fg border border-border'}">
            {item.badge}
          </span>
        {/if}
      </button>
    {/each}
  </div>

{:else if variant === 'underline'}
  <div class="flex items-center gap-3 border-b-2 border-border w-full overflow-x-auto select-none" role="tablist">
    {#each items as item (item.id)}
      {@const isActive = activeId === item.id}
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        class="inline-flex items-center gap-2.5 px-5 py-3.5 text-base transition-all cursor-pointer whitespace-nowrap border-b-2 -mb-0.5 {isActive ? 'border-primary text-primary font-extrabold' : 'border-transparent text-muted-fg font-semibold hover:text-fg hover:border-border'}"
        on:click={() => handleClick(item.id)}
      >
        {#if item.icon}
          <Icon name={item.icon} size="sm" />
        {/if}
        <span>{item.label}</span>
        {#if item.badge !== undefined && item.badge !== null}
          <span class="ml-1 px-2.5 py-0.5 text-xs font-bold rounded-full {isActive ? 'bg-primary-soft text-primary-strong' : 'bg-muted text-muted-fg'}">
            {item.badge}
          </span>
        {/if}
      </button>
    {/each}
  </div>

{:else}
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full" role="tablist">
    {#each items as item (item.id)}
      {@const isActive = activeId === item.id}
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        class="flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer {isActive ? 'bg-surface border-primary ring-2 ring-primary/15 shadow-md' : 'bg-surface/60 border-border hover:bg-surface hover:border-primary-soft-2'}"
        on:click={() => handleClick(item.id)}
      >
        <div class="flex items-center gap-3">
          {#if item.icon}
            <span class="w-9 h-9 rounded-xl flex items-center justify-center {isActive ? 'bg-primary text-white shadow-xs' : 'bg-muted text-muted-fg'}">
              <Icon name={item.icon} size="sm" />
            </span>
          {/if}
          <span class="text-base font-extrabold {isActive ? 'text-primary' : 'text-fg'}">{item.label}</span>
        </div>
        {#if item.badge !== undefined && item.badge !== null}
          <span class="px-3 py-1 text-xs font-black rounded-full {isActive ? 'bg-primary text-white' : 'bg-muted text-muted-fg'}">
            {item.badge}
          </span>
        {/if}
      </button>
    {/each}
  </div>
{/if}
