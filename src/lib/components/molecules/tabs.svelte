<script lang="ts">
  import { Icon } from '$lib/components/atoms';

  interface TabItem {
    id: string;
    label: string;
    icon?: string;
    count?: number;
  }

  let {
    items = [],
    activeId = '',
    variant = 'pills',
    onSelect = () => {}
  }: {
    items?: TabItem[];
    activeId?: string;
    variant?: 'pills' | 'underline' | 'cards';
    onSelect?: (id: string) => void;
  } = $props();

  function handleClick(id: string) {
    onSelect(id);
  }
</script>

<div class="tabs {variant}">
  {#each items as item}
    <button
      type="button"
      class="tab {activeId === item.id ? 'active' : ''}"
      onclick={() => handleClick(item.id)}
    >
      {#if item.icon}
        <Icon name={item.icon} size="xs" />
      {/if}
      <span>{item.label}</span>
      {#if item.count !== undefined}
        <span class="tab-count">{item.count}</span>
      {/if}
    </button>
  {/each}
</div>
