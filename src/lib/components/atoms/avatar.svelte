<script lang="ts">
  export let name: string = '';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let className: string = '';

  $: initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('') || 'U';

  const sizeClassMap: Record<string, string> = {
    sm: 'w-8 h-8 text-xs',   // 32px
    md: 'w-10 h-10 text-sm', // 40px
    lg: 'w-12 h-12 text-base' // 48px
  };
</script>

<div
  class="flex items-center justify-center font-bold select-none rounded-[var(--radius-sm)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary-soft-hover)] {sizeClassMap[size]} {className}"
  title={name}
>
  {initials}
</div>
