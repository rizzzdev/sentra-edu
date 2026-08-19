<script lang="ts">
  export let width: string = 'w-full';
  export let height: string = 'h-4'; // 16px (multiple of 4)
  export let rounded: string = 'rounded-[var(--radius-xs)]';
  export let className: string = '';
</script>

<div
  class="animate-pulse bg-[var(--color-surface-hover)] border border-[var(--color-border)] {width} {height} {rounded} {className}"
  aria-hidden="true"
></div>
