<script lang="ts">
  import { Icon } from '$lib/components/atoms';

  let {
    title,
    value,
    icon,
    tone = 'sky',
    subtitle = undefined,
    className = ''
  }: {
    title: string;
    value: string | number;
    icon: string;
    tone?: 'sky' | 'emerald' | 'amber' | 'rose' | 'violet';
    subtitle?: string | undefined;
    className?: string;
  } = $props();

  const toneClassMap: Record<string, string> = {
    sky: 'tone-sky',
    emerald: 'tone-emerald',
    amber: 'tone-amber',
    rose: 'tone-rose',
    violet: 'tone-violet'
  };
</script>

<div class="stat {className}">
  <div class="s-icon {toneClassMap[tone]}"><Icon name={icon} size="lg" /></div>
  <div>
    <div class="s-val">{value}</div>
    <div class="s-lbl">{title}</div>
    {#if subtitle}
      <div class="text-xs text-muted-fg mt-0.5">{subtitle}</div>
    {/if}
  </div>
</div>
