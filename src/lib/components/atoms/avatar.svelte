<script lang="ts">
  let {
    name = '',
    size = 'md',
    className = ''
  }: {
    name?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
  } = $props();

  const initials = $derived(
    name
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('') || 'U'
  );

  const sizeClassMap: Record<string, string> = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };
</script>

<div
  class="flex items-center justify-center font-bold select-none rounded-xl bg-primary-soft text-primary border border-primary/20 {sizeClassMap[size]} {className}"
  title={name}
>
  {initials}
</div>
