<script lang="ts">
  import { Icon } from '$lib/components/atoms';

  export let currentPage: number = 1;
  export let totalItems: number = 0;
  export let itemsPerPage: number = 10;
  export let onPageChange: (page: number) => void = () => {};

  $: totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  $: startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  $: endItem = Math.min(currentPage * itemsPerPage, totalItems);

  function getPageNumbers(current: number, max: number): (number | string)[] {
    if (max <= 7) {
      return Array.from({ length: max }, (_, index) => index + 1);
    }
    const pages: (number | string)[] = [1];
    const start = Math.max(2, current - 2);
    const end = Math.min(max - 1, current + 2);
    if (start > 2) pages.push('…');
    for (let pageIndex = start; pageIndex <= end; pageIndex++) pages.push(pageIndex);
    if (end < max - 1) pages.push('…');
    pages.push(max);
    return pages;
  }

  function go(page: number) {
    if (page >= 1 && page <= totalPages) onPageChange(page);
  }
</script>

{#if totalItems > 0}
  <div class="flex items-center justify-between p-3 sm:px-4 border-t border-border text-xs text-muted-fg bg-surface">
    <div>
      Menampilkan <strong class="text-fg">{startItem}–{endItem}</strong> dari <strong class="text-fg">{totalItems}</strong> data
    </div>
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="inline-flex items-center justify-center min-w-8 h-8 px-1.5 border border-border rounded-lg bg-surface text-fg text-xs font-semibold cursor-pointer transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={currentPage <= 1}
        on:click={() => go(currentPage - 1)}
        aria-label="Halaman Sebelumnya"
      >
        <Icon name="chevron_left" size="xs" />
      </button>
      {#each getPageNumbers(currentPage, totalPages) as pageNumber}
        {#if pageNumber === '…'}
          <span class="inline-flex items-center justify-center min-w-7 h-8 text-muted-fg text-xs">…</span>
        {:else}
          <button
            type="button"
            class="inline-flex items-center justify-center min-w-8 h-8 px-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition-all {currentPage === pageNumber ? 'bg-primary border-primary text-white font-bold' : 'bg-surface border-border text-fg hover:bg-muted'}"
            on:click={() => go(Number(pageNumber))}
          >{pageNumber}</button>
        {/if}
      {/each}
      <button
        type="button"
        class="inline-flex items-center justify-center min-w-8 h-8 px-1.5 border border-border rounded-lg bg-surface text-fg text-xs font-semibold cursor-pointer transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={currentPage >= totalPages}
        on:click={() => go(currentPage + 1)}
        aria-label="Halaman Berikutnya"
      >
        <Icon name="chevron_right" size="xs" />
      </button>
    </div>
  </div>
{/if}
