<script lang="ts">
  let {
    name,
    size = 'md',
    filled = false,
    className = ''
  }: {
    name: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    filled?: boolean;
    className?: string;
  } = $props();

  const sizeClassMap: Record<string, string> = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };
</script>

<span
  class="mat select-none align-middle {filled ? 'filled' : ''} {sizeClassMap[size] || 'text-xl'} {className}"
  aria-hidden="true"
>
  {name}
</span>
