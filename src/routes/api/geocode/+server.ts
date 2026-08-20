import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface NominatimItem {
  place_id?: number | string;
  display_name?: string;
  name?: string;
  lat: string;
  lon: string;
}

interface PhotonFeature {
  geometry: {
    coordinates: [number, number];
  };
  properties?: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export const GET: RequestHandler = async ({ url }) => {
  const query = (url.searchParams.get('q') || '').trim();
  const latParam = url.searchParams.get('lat');
  const lngParam = url.searchParams.get('lng') || url.searchParams.get('lon');

  // 1. Reverse Geocoding (Lat & Lng -> Address)
  if (latParam && lngParam) {
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(latParam)}&lon=${encodeURIComponent(lngParam)}&addressdetails=1`;
      const nominatimRes = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'SentraEdu-App/1.0 (info@sentraedu.id)',
          'Accept-Language': 'id,en;q=0.9'
        }
      });

      if (nominatimRes.ok) {
        const data = (await nominatimRes.json()) as {
          display_name?: string;
          name?: string;
          lat?: string;
          lon?: string;
          address?: Record<string, string>;
        };

        const parts = (data.display_name || '').split(',');
        const primary = parts[0] ? parts[0].trim() : data.name || 'Lokasi';
        const secondary = parts.slice(1).join(',').trim();

        return json({
          error: false,
          statusCode: 200,
          data: {
            displayName: data.display_name || '',
            name: primary,
            secondary,
            road: data.address?.road || data.address?.neighbourhood || data.address?.suburb || '',
            city: data.address?.city || data.address?.town || data.address?.municipality || data.address?.city_district || '',
            state: data.address?.state || '',
            country: data.address?.country || '',
            lat: parseFloat(data.lat || latParam),
            lng: parseFloat(data.lon || lngParam)
          }
        });
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }
  }

  // 2. Forward Geocoding (Query text -> Coordinates)
  if (!query || query.length < 2) {
    return json({ error: false, statusCode: 200, data: [] });
  }

  try {
    // 1. Try OpenStreetMap Nominatim with Indonesia priority and proper User-Agent
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=8&addressdetails=1`;
    const nominatimRes = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'SentraEdu-App/1.0 (info@sentraedu.id)',
        'Accept-Language': 'id,en;q=0.9'
      }
    });

    if (nominatimRes.ok) {
      const data = (await nominatimRes.json()) as NominatimItem[];
      if (Array.isArray(data) && data.length > 0) {
        const results = data.map((item: NominatimItem) => {
          const parts = (item.display_name || '').split(',');
          const primary = parts[0] ? parts[0].trim() : item.name || 'Lokasi';
          const secondary = parts.slice(1).join(',').trim();
          return {
            id: String(item.place_id || Math.random()),
            name: primary,
            secondary: secondary || item.display_name || '',
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          };
        });

        return json({ error: false, statusCode: 200, data: results });
      }
    }

    // 2. Fallback to Photon (Komoot OSM)
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8`;
    const photonRes = await fetch(photonUrl, {
      headers: {
        'Accept-Language': 'id,en;q=0.9'
      }
    });

    if (photonRes.ok) {
      const photonData = (await photonRes.json()) as { features?: PhotonFeature[] };
      if (photonData.features && photonData.features.length > 0) {
        const results = photonData.features.map((feature: PhotonFeature, index: number) => {
          const props = feature.properties || {};
          const primary = props.name || props.street || 'Lokasi';
          const details = [props.city, props.state, props.country].filter(Boolean).join(', ');
          return {
            id: `photon-${index}-${Math.random()}`,
            name: primary,
            secondary: details,
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0]
          };
        });

        return json({ error: false, statusCode: 200, data: results });
      }
    }

    return json({ error: false, statusCode: 200, data: [] });
  } catch (err_raw) {
    const err = err_raw as Error;
    return json({ error: true, statusCode: 500, message: err.message, data: [] }, { status: 500 });
  }
};
