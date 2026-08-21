<script lang="ts">
  import { Icon } from '$lib/components/atoms';

  export let distanceInMeters: number | null = null;
  export let isValidRadius: boolean = true;
  export let isRadiusValid: boolean = true;
  export let maxAllowedRadiusMeters: number = 200;
  export let className: string = '';

  $: valid = isRadiusValid && isValidRadius && (distanceInMeters !== null ? distanceInMeters <= maxAllowedRadiusMeters : true);
</script>

{#if distanceInMeters !== null}
  {#if valid}
    <div
      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 {className}"
    >
      <Icon name="verified" size="xs" filled={true} />
      <span>Dalam radius valid ({distanceInMeters} m dari lokasi les)</span>
    </div>
  {:else}
    <div
      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 {className}"
    >
      <Icon name="warning" size="xs" filled={true} />
      <span>Di luar radius {maxAllowedRadiusMeters}m ({distanceInMeters} m) — ditandai untuk verifikasi admin</span>
    </div>
  {/if}
{/if}
