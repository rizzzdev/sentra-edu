<script lang="ts">
  let {
    distanceInMeters = null,
    isValidRadius = true,
    isRadiusValid = true,
    maxAllowedRadiusMeters = 200,
    className = ''
  }: {
    distanceInMeters?: number | null;
    isValidRadius?: boolean;
    isRadiusValid?: boolean;
    maxAllowedRadiusMeters?: number;
    className?: string;
  } = $props();
</script>

{#if distanceInMeters !== null}
  <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border {isRadiusValid ? 'bg-success-soft text-success border-success/30' : 'bg-danger-soft text-danger border-danger/30'} {className}">
    <span class="mat text-sm">{isRadiusValid ? 'location_on' : 'location_off'}</span>
    {#if isRadiusValid}
      <span>Dalam radius ({Math.round(distanceInMeters)}m / {maxAllowedRadiusMeters}m)</span>
    {:else}
      <span>Diluar radius ({Math.round(distanceInMeters)}m / {maxAllowedRadiusMeters}m)</span>
    {/if}
  </div>
{/if}
