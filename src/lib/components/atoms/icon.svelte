<script lang="ts">
  export let name: string;
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let filled: boolean = false;
  export let className: string = '';

  const sizeClassMap: Record<string, string> = {
    xs: 'text-base', // 16px
    sm: 'text-lg',   // 18px
    md: 'text-xl',   // 20px
    lg: 'text-2xl',  // 24px
    xl: 'text-4xl'   // 32px/36px
  };
</script>

<span
  class="mat select-none align-middle {filled ? 'filled' : ''} {sizeClassMap[size] || 'text-xl'} {className}"
  aria-hidden="true"
>
  {name}
</span>
