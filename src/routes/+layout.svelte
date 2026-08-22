<script lang="ts">
  import 'leaflet/dist/leaflet.css';
  import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
  import '../styles/app.css';
  import { themeStore } from '$lib/shared/stores';
  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();
</script>

{#if children}{@render children()}{/if}
