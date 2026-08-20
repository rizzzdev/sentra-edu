<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';

  export let currentPage: number = 1;
  export let totalItems: number = 0;
  export let itemsPerPage: number = 10;
  export let onPageChange: (page: number) => void = () => {};

  $: totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  $: startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  $: endItem = Math.min(currentPage * itemsPerPage, totalItems);

  function getPageNumbers(current: number, max: number): (number | string)[] {
    if (max <= 7) {
      return Array.from({ length: max }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [1];
    const start = Math.max(2, current - 2);
    const end = Math.min(max - 1, current + 2);
    if (start > 2) pages.push('…');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < max - 1) pages.push('…');
    pages.push(max);
    return pages;
  }

  function go(page: number) {
    if (page >= 1 && page <= totalPages) onPageChange(page);
  }
</script>

{#if totalItems > 0}
  <div class="page-nav">
    <div class="page-info">
      Menampilkan <strong>{startItem}–{endItem}</strong> dari <strong>{totalItems}</strong> data
    </div>
    <div class="page-btns">
      <button type="button" class="page-btn" disabled={currentPage <= 1} on:click={() => go(currentPage - 1)}>
        <Icon name="chevron_left" size="xs" />
      </button>
      {#each getPageNumbers(currentPage, totalPages) as p}
        {#if p === '…'}
          <span class="page-dots">…</span>
        {:else}
          <button
            type="button"
            class="page-btn {currentPage === p ? 'active' : ''}"
            on:click={() => go(Number(p))}
          >{p}</button>
        {/if}
      {/each}
      <button type="button" class="page-btn" disabled={currentPage >= totalPages} on:click={() => go(currentPage + 1)}>
        <Icon name="chevron_right" size="xs" />
      </button>
    </div>
  </div>
{/if}

<style>
  .page-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-top: 1px solid var(--color-border, #e2e8f0);
    font-size: 0.78rem;
    color: var(--color-fg-muted, #64748b);
  }

  .page-info strong {
    color: var(--color-fg, #1e293b);
  }

  .page-btns {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .page-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 6px;
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 6px;
    background: var(--color-surface, #fff);
    color: var(--color-fg, #1e293b);
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.12s;
  }

  .page-btn:hover:not(:disabled):not(.active) {
    background: var(--color-surface-hover, #f1f5f9);
  }

  .page-btn.active {
    background: var(--color-primary, #6366f1);
    border-color: var(--color-primary, #6366f1);
    color: #fff;
  }

  .page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .page-dots {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 32px;
    color: var(--color-fg-muted, #94a3b8);
    font-size: 0.82rem;
  }
</style>
