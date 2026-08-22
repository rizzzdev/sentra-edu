<script lang="ts">
  let {
    currentPage = 1,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange = () => {}
  }: {
    currentPage?: number;
    totalItems?: number;
    itemsPerPage?: number;
    onPageChange?: (page: number) => void;
  } = $props();

  const totalPages = $derived(Math.max(1, Math.ceil(totalItems / itemsPerPage)));

  function go(page: number) {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  }
</script>

{#if totalItems > itemsPerPage}
  <div class="page-nav">
    <div class="page-info">
      Menampilkan {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} data
    </div>
    <div class="page-btns">
      <button type="button" class="page-btn" disabled={currentPage <= 1} onclick={() => go(currentPage - 1)}>&laquo;</button>
      {#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNumber}
        <button type="button" class="page-btn {currentPage === pageNumber ? 'active' : ''}" onclick={() => go(Number(pageNumber))}>{pageNumber}</button>
      {/each}
      <button type="button" class="page-btn" disabled={currentPage >= totalPages} onclick={() => go(currentPage + 1)}>&raquo;</button>
    </div>
  </div>
{/if}
