<script lang="ts">
  let {
    width = 'w-full',
    height = 'h-4',
    rounded = 'rounded-lg',
    className = ''
  }: {
    width?: string;
    height?: string;
    rounded?: string;
    className?: string;
  } = $props();
</script>

<div
  class="animate-pulse bg-muted border border-border {width} {height} {rounded} {className}"
  aria-hidden="true"
></div>
