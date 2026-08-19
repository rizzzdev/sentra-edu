<script lang="ts">
  export let name: string;
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let filled: boolean = false;
  export let className: string = '';

  const sizeClassMap: Record<string, string> = {
    xs: 'text-[16px]', // 16px (4px multiple)
    sm: 'text-[18px]',
    md: 'text-[20px]', // 20px (4px multiple)
    lg: 'text-[24px]', // 24px (4px multiple)
    xl: 'text-[32px]'  // 32px (4px multiple)
  };
</script>

<span
  class="mat select-none align-middle {filled ? 'filled' : ''} {sizeClassMap[size] || 'text-[20px]'} {className}"
  aria-hidden="true"
>
  {name}
</span>
