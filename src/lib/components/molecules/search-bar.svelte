<script lang="ts">
  let {
    value = $bindable(''),
    placeholder = 'Cari data...',
    className = '',
    oninput
  }: {
    value?: string;
    placeholder?: string;
    className?: string;
    oninput?: (e: Event) => void;
  } = $props();
</script>

<div class="relative {className}">
  <div class="filter-search">
    <span class="mat text-base text-muted-fg">search</span>
    <input
      type="text"
      {placeholder}
      bind:value
      {oninput}
    />
    {#if value}
      <button type="button" class="filter-clear" onclick={() => { value = ''; }}>
        <span class="mat text-base">close</span>
      </button>
    {/if}
  </div>
</div>
