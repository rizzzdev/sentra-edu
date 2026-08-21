<script lang="ts">
  import { Icon } from '$lib/components/atoms';

  export let value: string = '';
  export let placeholder: string = 'Cari data...';
  export let className: string = '';
</script>

<div class="relative flex items-center w-full max-w-sm {className}">
  <div class="absolute left-3 flex items-center pointer-events-none text-muted-fg">
    <Icon name="search" size="sm" />
  </div>
  <input
    type="text"
    bind:value
    {placeholder}
    class="w-full h-10 pl-9 pr-8 text-sm bg-surface text-fg border border-border rounded-xl outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary-soft"
    on:input
  />
  {#if value}
    <button
      type="button"
      class="absolute right-2.5 flex items-center justify-center w-5 h-5 text-muted-fg hover:text-fg transition-colors cursor-pointer"
      on:click={() => { value = ''; }}
      aria-label="Bersihkan pencarian"
    >
      <Icon name="close" size="xs" />
    </button>
  {/if}
</div>
