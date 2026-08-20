<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import type * as L from 'leaflet';
  import Icon from '$lib/components/atoms/icon.svelte';

  export let latitude: number = -6.2;
  export let longitude: number = 106.8;
  export let height: string = '300px';
  export let zoom: number = 16;
  export let readonly: boolean = false;
  export let radius: number = 50;

  interface SearchResultItem {
    id: string;
    name: string;
    secondary: string;
    lat: number;
    lng: number;
  }

  let mapEl: HTMLDivElement;
  let map: L.Map | null = null;
  let marker: L.Marker | null = null;
  let circle: L.Circle | null = null;
  let centerPulseMarker: L.Marker | null = null;
  let leaflet: typeof import('leaflet');
  let resizeObserver: ResizeObserver | null = null;
  let intersectionObserver: IntersectionObserver | null = null;
  let invalidateTimers: ReturnType<typeof setTimeout>[] = [];

  // Search state
  let searchQuery: string = '';
  let searchResults: SearchResultItem[] = [];
  let isSearching: boolean = false;
  let showDropdown: boolean = false;
  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  let searchError: string | null = null;

  function invalidateSize() {
    if (map) {
      map.invalidateSize();
    }
  }

  function scheduleInvalidateSize() {
    invalidateTimers.forEach(clearTimeout);
    invalidateTimers = [];
    [50, 150, 300, 500, 800, 1200].forEach((ms) => {
      invalidateTimers.push(setTimeout(invalidateSize, ms));
    });
  }

  function updateMarkerAndCircle(lat: number, lng: number) {
    if (!marker || !circle || !map) return;
    marker.setLatLng([lat, lng]);
    circle.setLatLng([lat, lng]);
    centerPulseMarker?.setLatLng([lat, lng]);
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

  async function performSearch(query: string) {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      searchResults = [];
      showDropdown = false;
      return;
    }

    isSearching = true;
    searchError = null;

    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
      if (response.ok) {
        const jsonRes = await response.json();
        const items = jsonRes.data || [];
        if (Array.isArray(items) && items.length > 0) {
          searchResults = items;
          showDropdown = true;
          isSearching = false;
          return;
        }
      }

      searchResults = [];
      searchError = 'Lokasi tidak ditemukan. Coba gunakan nama jalan, kelurahan, atau kota yang lebih spesifik.';
      showDropdown = true;
    } catch (err) {
      console.warn('Geocoding search error:', err);
      searchError = 'Gagal memuat hasil pencarian. Periksa koneksi internet.';
      showDropdown = true;
    } finally {
      isSearching = false;
    }
  }

  function handleInputSearch() {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    if (!searchQuery.trim()) {
      searchResults = [];
      showDropdown = false;
      return;
    }
    searchDebounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 380);
  }

  function handleSelectResult(item: SearchResultItem) {
    if (isNaN(item.lat) || isNaN(item.lng)) return;

    latitude = Math.round(item.lat * 1000000) / 1000000;
    longitude = Math.round(item.lng * 1000000) / 1000000;
    searchQuery = item.name;
    showDropdown = false;
    searchResults = [];

    if (map) {
      map.setView([item.lat, item.lng], 17);
      marker?.setLatLng([item.lat, item.lng]);
      circle?.setLatLng([item.lat, item.lng]);
      centerPulseMarker?.setLatLng([item.lat, item.lng]);
    }
  }

  function handleCurrentLocation() {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      isSearching = true;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          isSearching = false;
          const lat = Math.round(pos.coords.latitude * 1000000) / 1000000;
          const lng = Math.round(pos.coords.longitude * 1000000) / 1000000;
          latitude = lat;
          longitude = lng;
          searchQuery = 'Lokasi Saya Saat Ini';
          showDropdown = false;
          if (map) {
            map.setView([lat, lng], 17);
            marker?.setLatLng([lat, lng]);
            circle?.setLatLng([lat, lng]);
            centerPulseMarker?.setLatLng([lat, lng]);
          }
        },
        () => {
          isSearching = false;
          searchError = 'Tidak dapat mengakses lokasi perangkat.';
          showDropdown = true;
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }

  function handleClearSearch() {
    searchQuery = '';
    searchResults = [];
    showDropdown = false;
    searchError = null;
  }

  onMount(async () => {
    await tick();
    await new Promise((r) => setTimeout(r, 60));

    leaflet = await import('leaflet');

    const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
    const initialLat = isNaN(lat) || !lat ? -6.2 : lat;
    const initialLng = isNaN(lng) || !lng ? 106.8 : lng;

    if (!mapEl) return;

    map = leaflet.map(mapEl, {
      center: [initialLat, initialLng],
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
      trackResize: true
    });

    // Google Maps Roadmap Style Tile Layer
    leaflet.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    }).addTo(map);

    // Google Maps Style Blue Location Pin Icon
    const bluePinIcon = leaflet.divIcon({
      className: 'gmaps-pin-container',
      html: `
        <div class="gmaps-blue-pin">
          <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 0C7.611 0 0 7.611 0 17C0 29.5 17 44 17 44C17 44 34 29.5 34 17C34 7.611 26.389 0 17 0Z" fill="#1A73E8"/>
            <path d="M17 1.5C8.44 1.5 1.5 8.44 1.5 17C1.5 28.2 17 41.8 17 41.8C17 41.8 32.5 28.2 32.5 17C32.5 8.44 25.56 1.5 17 1.5Z" stroke="#FFFFFF" stroke-width="1.8"/>
            <circle cx="17" cy="17" r="6.5" fill="#FFFFFF"/>
            <circle cx="17" cy="17" r="4" fill="#1A73E8"/>
          </svg>
        </div>
      `,
      iconSize: [34, 44],
      iconAnchor: [17, 44],
      popupAnchor: [0, -44]
    });

    // Google Maps Style Blue Center Pulse Marker
    const pulseDotIcon = leaflet.divIcon({
      className: 'gmaps-pulse-container',
      html: `
        <div class="gmaps-center-dot">
          <div class="gmaps-pulse-ring"></div>
          <div class="gmaps-solid-dot"></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    // 50m Radius Circle around center point (Google Blue Theme)
    circle = leaflet.circle([initialLat, initialLng], {
      radius: radius || 50,
      color: '#1a73e8',
      fillColor: '#4285f4',
      fillOpacity: 0.15,
      weight: 2,
      dashArray: '6 4'
    }).addTo(map);

    // Center Pulse Dot
    centerPulseMarker = leaflet.marker([initialLat, initialLng], {
      icon: pulseDotIcon,
      interactive: false
    }).addTo(map);

    // Blue Pin Marker positioned at center
    marker = leaflet.marker([initialLat, initialLng], {
      icon: bluePinIcon,
      draggable: !readonly
    }).addTo(map);

    if (!readonly) {
      marker.on('dragend', () => {
        if (!marker) return;
        const pos = marker.getLatLng();
        const newLat = Math.round(pos.lat * 1000000) / 1000000;
        const newLng = Math.round(pos.lng * 1000000) / 1000000;
        latitude = newLat;
        longitude = newLng;
        circle?.setLatLng([newLat, newLng]);
        centerPulseMarker?.setLatLng([newLat, newLng]);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker?.setLatLng(e.latlng);
        circle?.setLatLng(e.latlng);
        centerPulseMarker?.setLatLng(e.latlng);
        latitude = Math.round(e.latlng.lat * 1000000) / 1000000;
        longitude = Math.round(e.latlng.lng * 1000000) / 1000000;
      });
    }

    // Invalidate size multiple times to handle modal animations & viewport layout
    scheduleInvalidateSize();

    // Invalidate on element resize
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => invalidateSize());
      resizeObserver.observe(mapEl);
    }

    // Invalidate when element becomes visible
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            scheduleInvalidateSize();
          }
        }
      });
      intersectionObserver.observe(mapEl);
    }
  });

  onDestroy(() => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    invalidateTimers.forEach(clearTimeout);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<div class="leaflet-wrapper" style="height: {height}; min-height: {height};">
  <!-- Google Maps Style Floating Search Bar -->
  {#if !readonly}
    <div class="gmaps-search-bar">
      <div class="search-input-box">
        <span class="search-icon">
          <Icon name="search" size="sm" />
        </span>
        <input
          type="text"
          class="search-input"
          placeholder="Cari lokasi, jalan, atau alamat..."
          bind:value={searchQuery}
          on:input={handleInputSearch}
          on:focus={() => { if (searchResults.length > 0) showDropdown = true; }}
          on:keydown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              performSearch(searchQuery);
            }
            if (e.key === 'Escape') {
              showDropdown = false;
            }
          }}
        />

        {#if isSearching}
          <div class="search-spinner"></div>
        {:else if searchQuery}
          <button
            type="button"
            class="clear-btn"
            on:click={handleClearSearch}
            aria-label="Hapus pencarian"
          >
            <Icon name="close" size="xs" />
          </button>
        {/if}

        <button
          type="button"
          class="gps-btn"
          on:click={handleCurrentLocation}
          title="Gunakan lokasi perangkat saat ini"
          aria-label="Lokasi saya saat ini"
        >
          <Icon name="my_location" size="xs" />
        </button>
      </div>

      <!-- Autocomplete Dropdown -->
      {#if showDropdown}
        <div class="search-dropdown">
          {#if searchResults.length > 0}
            <div class="dropdown-list">
              {#each searchResults as item (item.id)}
                <button
                  type="button"
                  class="dropdown-item"
                  on:click={() => handleSelectResult(item)}
                >
                  <span class="item-icon">
                    <Icon name="location_on" size="sm" />
                  </span>
                  <div class="item-text">
                    <div class="item-name">{item.name}</div>
                    {#if item.secondary}
                      <div class="item-secondary">{item.secondary}</div>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          {:else if searchError}
            <div class="dropdown-empty">
              <Icon name="info" size="sm" />
              <span>{searchError}</span>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Leaflet Map Container -->
  <div bind:this={mapEl} class="leaflet-map"></div>

  {#if !readonly}
    <div class="leaflet-hint">
      Titik tengah lokasi les · Lingkaran radius {radius || 50} meter
    </div>
  {/if}
</div>

<style>
  .leaflet-wrapper {
    position: relative;
    width: 100%;
    border-radius: var(--radius-sm, 12px);
    border: 1px solid var(--color-border, #e2e8f0);
    overflow: visible;
    z-index: 1;
    background-color: #f8fafc;
    box-sizing: border-box;
  }

  .leaflet-map {
    width: 100%;
    height: 100%;
    min-height: 100%;
    position: relative;
    border-radius: var(--radius-sm, 12px);
    overflow: hidden;
    z-index: 1;
  }

  /* Google Maps Style Floating Search Bar */
  .gmaps-search-bar {
    position: absolute;
    top: 10px;
    right: 10px;
    left: auto;
    z-index: 1000;
    width: calc(100% - 20px);
    max-width: 320px;
  }

  .search-input-box {
    display: flex;
    align-items: center;
    background: #ffffff;
    border-radius: 8px;
    border: none !important;
    outline: none !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16) !important;
    padding: 0 8px;
    height: 38px;
    transition: box-shadow 0.15s ease;
  }

  .search-input-box:focus-within {
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.22), 0 0 0 2px #1a73e8 !important;
  }

  .search-icon {
    color: #5f6368;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 6px;
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 0.86rem;
    color: #202124;
    background: transparent;
    padding: 6px 0;
    min-width: 0;
  }

  .search-input::placeholder {
    color: #80868b;
    font-size: 0.84rem;
  }

  .search-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #1a73e8;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    margin-right: 6px;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .clear-btn, .gps-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    color: #5f6368;
    cursor: pointer;
    transition: background-color 0.12s, color 0.12s;
    flex-shrink: 0;
    margin-left: 2px;
  }

  .clear-btn:hover {
    background-color: #f1f3f4;
    color: #202124;
  }

  .gps-btn {
    color: #1a73e8;
  }

  .gps-btn:hover {
    background-color: #e8f0fe;
    color: #174ea6;
  }

  .search-dropdown {
    margin-top: 6px;
    background: #ffffff;
    border-radius: 8px;
    border: none !important;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16) !important;
    overflow: hidden;
    max-height: 220px;
    overflow-y: auto;
  }

  .dropdown-list {
    display: flex;
    flex-direction: column;
  }

  .dropdown-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    background: #ffffff;
    border: none;
    border-bottom: 1px solid #f1f3f4;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.1s ease;
    width: 100%;
  }

  .dropdown-item:last-child {
    border-bottom: none;
  }

  .dropdown-item:hover {
    background-color: #f8f9fa;
  }

  .item-icon {
    color: #1a73e8;
    margin-top: 1px;
    flex-shrink: 0;
  }

  .item-text {
    flex: 1;
    min-width: 0;
  }

  .item-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: #202124;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-secondary {
    font-size: 0.74rem;
    color: #5f6368;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 1px;
  }

  .dropdown-empty {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    font-size: 0.8rem;
    color: #5f6368;
  }

  .leaflet-hint {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: rgba(15, 23, 42, 0.82);
    backdrop-filter: blur(4px);
    color: #fff;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 500;
    pointer-events: none;
    white-space: nowrap;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  :global(.gmaps-pin-container) {
    background: transparent !important;
    border: none !important;
  }

  :global(.gmaps-blue-pin) {
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.35));
    transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: grab;
  }

  :global(.gmaps-blue-pin:active) {
    cursor: grabbing;
    transform: scale(1.12) translateY(-4px);
  }

  :global(.gmaps-pulse-container) {
    background: transparent !important;
    border: none !important;
    pointer-events: none;
  }

  :global(.gmaps-center-dot) {
    position: relative;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :global(.gmaps-solid-dot) {
    width: 8px;
    height: 8px;
    background: #1a73e8;
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    z-index: 2;
  }

  :global(.gmaps-pulse-ring) {
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: rgba(26, 115, 232, 0.35);
    animation: gmapsPulse 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
    z-index: 1;
  }

  @keyframes gmapsPulse {
    0% {
      transform: scale(0.6);
      opacity: 0.9;
    }
    100% {
      transform: scale(2.2);
      opacity: 0;
    }
  }

  :global(.leaflet-container) {
    width: 100% !important;
    height: 100% !important;
    font-family: inherit !important;
    background-color: #f1f5f9 !important;
    outline: none;
  }

  :global(.leaflet-container img),
  :global(.leaflet-tile-container img),
  :global(.leaflet-tile),
  :global(.leaflet-marker-icon),
  :global(.leaflet-marker-shadow) {
    max-width: none !important;
    max-height: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    outline: none !important;
    box-sizing: content-box !important;
  }

  :global(.leaflet-tile) {
    visibility: inherit !important;
  }

  :global(.leaflet-tile-container) {
    pointer-events: none;
  }
</style>
