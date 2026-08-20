<script lang="ts">
  export let width: string = 'w-full';
  export let height: string = 'h-4'; // 16px (multiple of 4)
  export let rounded: string = 'rounded-lg';
  export let className: string = '';
</script>

<div
  class="animate-pulse bg-muted border border-border {width} {height} {rounded} {className}"
  aria-hidden="true"
></div>
