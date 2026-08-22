<script lang="ts">
  import { Button } from '$lib/components/atoms';
  import Icon from '$lib/components/atoms/icon.svelte';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
  import AlertBanner from '../molecules/alert-banner.svelte';
  import type { Snippet } from 'svelte';

  interface DataTableProps {
    loading?: boolean;
    error?: string | null;
    emptyMessage?: string;
    emptyIcon?: string;
    onRetry?: () => void;
    emptyActionText?: string;
    onEmptyAction?: () => void;
    totalItems?: number;
    currentPage?: number;
    dataPerPage?: number;
    onPageChange?: (page: number) => void;
    header?: Snippet;
    body?: Snippet;
  }

  let {
    loading = false,
    error = null,
    emptyMessage = 'Belum ada data.',
    emptyIcon = 'inventory_2',
    onRetry = undefined,
    emptyActionText = undefined,
    onEmptyAction = undefined,
    totalItems = 0,
    currentPage = 1,
    dataPerPage = 10,
    onPageChange = () => {},
    header,
    body
  }: DataTableProps = $props();

  const totalPages = $derived(Math.max(1, Math.ceil(totalItems / dataPerPage)));
  const startItem = $derived(totalItems === 0 ? 0 : (currentPage - 1) * dataPerPage + 1);
  const endItem = $derived(Math.min(currentPage * dataPerPage, totalItems));

  function getPageNumbers(current: number, total: number): (number | string)[] {
    if (total <= 5) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, '…', total];
    }
    if (current >= total - 2) {
      return [1, '…', total - 3, total - 2, total - 1, total];
    }
    return [1, '…', current - 1, current, current + 1, '…', total];
  }
</script>

<div class="w-full bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
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
      <div class="flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-fg mb-3">
        <Icon name={emptyIcon} size="xl" />
      </div>
      <h4 class="font-bold text-base text-fg mb-1">{emptyMessage}</h4>
      <p class="text-xs text-muted-fg max-w-sm mb-4">
        Tidak ada catatan yang ditemukan untuk kriteria atau filter saat ini.
      </p>
      {#if emptyActionText && onEmptyAction}
        <Button variant="primary" size="sm" onclick={onEmptyAction}>
          {emptyActionText}
        </Button>
      {/if}
    </div>

  <!-- 4-State UI: 4. Populated State -->
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm border-collapse">
        <thead class="bg-muted border-b border-border text-xs font-bold uppercase tracking-wider text-muted-fg">
          {#if header}{@render header()}{/if}
        </thead>
        <tbody class="divide-y divide-border">
          {#if body}{@render body()}{/if}
        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-surface text-xs text-muted-fg">
      <div>
        Menampilkan <span class="font-bold text-fg">{startItem}–{endItem}</span> dari <span class="font-bold text-fg">{totalItems}</span> data
      </div>
      <div class="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage <= 1}
          ariaLabel="Halaman sebelumnya"
          onclick={() => onPageChange(currentPage - 1)}
        >
          <Icon name="chevron_left" size="xs" />
        </Button>

        {#each getPageNumbers(currentPage, totalPages) as pageNum}
          {#if pageNum === '…'}
            <span class="px-2 py-1 select-none">…</span>
          {:else}
            <button
              type="button"
              class="w-8 h-8 rounded-lg font-semibold text-xs border transition-colors duration-150 cursor-pointer {currentPage === pageNum ? 'bg-primary text-white border-primary' : 'bg-surface text-fg border-border hover:bg-muted'}"
              onclick={() => onPageChange(Number(pageNum))}
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
          onclick={() => onPageChange(currentPage + 1)}
        >
          <Icon name="chevron_right" size="xs" />
        </Button>
      </div>
    </div>
  {/if}
</div>
