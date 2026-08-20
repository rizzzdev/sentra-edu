<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type * as L from 'leaflet';

  export let latitude: number = -6.2;
  export let longitude: number = 106.8;
  export let height: string = '300px';
  export let zoom: number = 15;
  export let readonly: boolean = false;
  export let radius: number = 50; // meters

  let container: HTMLDivElement;
  let map: L.Map;
  let marker: L.Marker;
  let circle: L.Circle;
  let leaflet: typeof import('leaflet');

  function updateMarkerAndCircle(lat: number, lng: number) {
    if (!marker || !circle || !map) return;
    marker.setLatLng([lat, lng]);
    circle.setLatLng([lat, lng]);
    if (!map.getBounds().contains([lat, lng])) {
      map.setView([lat, lng], zoom);
    }
  }

  $: if (map && latitude !== undefined && longitude !== undefined) {
    const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
    if (!isNaN(lat) && !isNaN(lng)) {
      updateMarkerAndCircle(lat, lng);
    }
  }

  onMount(async () => {
    leaflet = await import('leaflet');
    const geocoderModule = await import('leaflet-control-geocoder');

    // Fix default icon paths
    delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
    leaflet.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

    map = leaflet.map(container, {
      center: [lat || -6.2, lng || 106.8],
      zoom,
      zoomControl: true,
      scrollWheelZoom: true
    });

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

    // Search bar (geocoder)
    const geocoder = geocoderModule.geocoder({
      defaultMarkGeocode: false,
      placeholder: 'Cari lokasi...',
      errorMessage: 'Lokasi tidak ditemukan',
      showResultIcons: true
    }).addTo(map);

    geocoder.on('markgeocode', (e: any) => {
      const center = e.geocode.center;
      if (!readonly) {
        marker.setLatLng(center);
        circle.setLatLng(center);
        latitude = Math.round(center.lat * 1000000) / 1000000;
        longitude = Math.round(center.lng * 1000000) / 1000000;
      }
      map.setView(center, zoom);
    });

    // Marker
    marker = leaflet.marker([lat || -6.2, lng || 106.8], {
      draggable: !readonly
    }).addTo(map);

    // Circle with 50m radius
    circle = leaflet.circle([lat || -6.2, lng || 106.8], {
      radius: radius,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.08,
      weight: 2,
      dashArray: '6 4'
    }).addTo(map);

    if (!readonly) {
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        const newLat = Math.round(pos.lat * 1000000) / 1000000;
        const newLng = Math.round(pos.lng * 1000000) / 1000000;
        latitude = newLat;
        longitude = newLng;
        circle.setLatLng([newLat, newLng]);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        circle.setLatLng(e.latlng);
        latitude = Math.round(e.latlng.lat * 1000000) / 1000000;
        longitude = Math.round(e.latlng.lng * 1000000) / 1000000;
      });
    }

    // Fix map size after render
    setTimeout(() => map.invalidateSize(), 100);
  });

  onDestroy(() => {
    if (map) map.remove();
  });
</script>

<div class="leaflet-wrapper" style="height: {height}">
  <div bind:this={container} class="leaflet-container"></div>
  {#if !readonly}
    <div class="leaflet-hint">
      Klik peta atau geser marker · lingkaran = radius {radius}m
    </div>
  {/if}
</div>

<style>
  .leaflet-wrapper {
    position: relative;
    width: 100%;
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 1px solid var(--color-border);
  }

  .leaflet-container {
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .leaflet-hint {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 0.72rem;
    pointer-events: none;
    white-space: nowrap;
  }

  /* Geocoder search bar styling */
  :global(.leaflet-control-geocoder) {
    border-radius: 10px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  }

  :global(.leaflet-control-geocoder-form input) {
    border-radius: 10px !important;
    padding: 8px 12px !important;
    font-size: 0.85rem !important;
    border: 1px solid var(--color-border) !important;
  }

  :global(.leaflet-control-geocoder-alternatives) {
    max-height: 200px !important;
    overflow-y: auto !important;
  }
</style>
