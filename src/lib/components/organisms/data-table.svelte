<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import Button from '$lib/components/atoms/button.svelte';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
  import AlertBanner from '$lib/components/molecules/alert-banner.svelte';

  export let loading: boolean = false;
  export let error: string | null = null;
  export let emptyMessage: string = 'Belum ada data.';
  export let emptyIcon: string = 'inventory_2';
  export let onRetry: (() => void) | undefined = undefined;
  export let emptyActionText: string | undefined = undefined;
  export let onEmptyAction: (() => void) | undefined = undefined;
  export let totalItems: number = 0;
  export let currentPage: number = 1;
  export let dataPerPage: number = 10;
  export let onPageChange: (newPage: number) => void = () => {};

  $: totalPages = Math.max(1, Math.ceil(totalItems / dataPerPage));
  $: startItem = totalItems === 0 ? 0 : (currentPage - 1) * dataPerPage + 1;
  $: endItem = Math.min(currentPage * dataPerPage, totalItems);

  function getPageNumbers(current: number, max: number): (number | string)[] {
    if (max <= 7) {
      return Array.from({ length: max }, (_, index) => index + 1);
    }
    const pageItems: (number | string)[] = [1];
    const startRange = Math.max(2, current - 2);
    const endRange = Math.min(max - 1, current + 2);

    if (startRange > 2) pageItems.push('…');
    for (let i = startRange; i <= endRange; i++) {
      pageItems.push(i);
    }
    if (endRange < max - 1) pageItems.push('…');
    pageItems.push(max);
    return pageItems;
  }
</script>

<div class="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] overflow-hidden">
  <!-- 4-State UI: 1. Loading State -->
  {#if loading}
    <div class="p-6 space-y-4">
      <Skeleton height="h-8" width="w-48" />
      <div class="space-y-3">
        {#each Array(5) as _}
          <div class="grid grid-cols-4 gap-4">
            <Skeleton height="h-6" width="w-full" />
            <Skeleton height="h-6" width="w-full" />
            <Skeleton height="h-6" width="w-full" />
            <Skeleton height="h-6" width="w-full" />
          </div>
        {/each}
      </div>
    </div>

  <!-- 4-State UI: 2. Error State -->
  {:else if error}
    <div class="p-6">
      <AlertBanner message={error} {onRetry} />
    </div>

  <!-- 4-State UI: 3. Empty State -->
  {:else if totalItems === 0}
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-fg-muted)] mb-3">
        <Icon name={emptyIcon} size="xl" />
      </div>
      <h4 class="font-bold text-base text-[var(--color-fg)] mb-1">{emptyMessage}</h4>
      <p class="text-xs text-[var(--color-fg-muted)] max-w-sm mb-4">
        Tidak ada catatan yang ditemukan untuk kriteria atau filter saat ini.
      </p>
      {#if emptyActionText && onEmptyAction}
        <Button variant="primary" size="sm" on:click={onEmptyAction}>
          {emptyActionText}
        </Button>
      {/if}
    </div>

  <!-- 4-State UI: 4. Populated State -->
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm border-collapse">
        <thead class="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">
          <slot name="header" />
        </thead>
        <tbody class="divide-y divide-[var(--color-border)]">
          <slot name="body" />
        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-fg-muted)]">
      <div>
        Menampilkan <span class="font-bold text-[var(--color-fg)]">{startItem}–{endItem}</span> dari <span class="font-bold text-[var(--color-fg)]">{totalItems}</span> data
      </div>
      <div class="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage <= 1}
          ariaLabel="Halaman sebelumnya"
          on:click={() => onPageChange(currentPage - 1)}
        >
          <Icon name="chevron_left" size="xs" />
        </Button>

        {#each getPageNumbers(currentPage, totalPages) as pageNum}
          {#if pageNum === '…'}
            <span class="px-2 py-1 select-none">…</span>
          {:else}
            <button
              type="button"
              class="w-8 h-8 rounded-[var(--radius-xs)] font-semibold text-xs border transition-colors duration-150 cursor-pointer {currentPage === pageNum ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-[var(--color-surface)] text-[var(--color-fg)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'}"
              on:click={() => onPageChange(Number(pageNum))}
            >
              {pageNum}
            </button>
          {/if}
        {/each}

        <Button
          size="sm"
          variant="outline"
          disabled={currentPage >= totalPages}
          ariaLabel="Halaman berikutnya"
          on:click={() => onPageChange(currentPage + 1)}
        >
          <Icon name="chevron_right" size="xs" />
        </Button>
      </div>
    </div>
  {/if}
</div>
