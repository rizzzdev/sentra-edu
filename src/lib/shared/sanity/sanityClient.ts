import { createClient } from '@sanity/client';
import {
  PUBLIC_SANITY_PROJECT_ID,
  PUBLIC_SANITY_DATASET,
  PUBLIC_SANITY_API_VERSION
} from '$env/static/public';

export const sanityClient = createClient({
  projectId: PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: PUBLIC_SANITY_DATASET || 'production',
  apiVersion: PUBLIC_SANITY_API_VERSION || '2026-08-20',
  useCdn: true,
  token: undefined // server-side token diatur terpisah
});

// Client tanpa CDN untuk data real-time
export const sanityClientLive = createClient({
  projectId: PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: PUBLIC_SANITY_DATASET || 'production',
  apiVersion: PUBLIC_SANITY_API_VERSION || '2026-08-20',
  useCdn: false
});
