<script lang="ts">
  export let label: string;
  export let htmlFor: string | undefined = undefined;
  export let required: boolean = false;
  export let error: string | undefined = undefined;
  export let helper: string | undefined = undefined;
  export let className: string = '';
</script>

<div class="flex flex-col gap-1.5 {className}">
  {#if label}
    <label for={htmlFor} class="text-xs font-bold uppercase tracking-wider text-muted-fg">
      {label}
      {#if required}
        <span class="text-danger font-bold ml-0.5">*</span>
      {/if}
    </label>
  {/if}

  <slot />

  {#if error}
    <p class="text-xs font-medium text-danger mt-0.5">{error}</p>
  {:else if helper}
    <p class="text-xs text-muted-fg mt-0.5">{helper}</p>
  {/if}
</div>
