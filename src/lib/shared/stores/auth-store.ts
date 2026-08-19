import { writable, derived } from 'svelte/store';
import type { User, UserRole } from '$lib/shared/types/common.types';
import { dbStore } from '$lib/shared/stores/db-store';
import { goto } from '$app/navigation';

export function getRoleDefaultPath(role?: UserRole | null): string {
  switch (role) {
    case 'SUPER_ADMIN': return '/admin';
    case 'TENTOR': return '/tutor';
    case 'STUDENT': return '/student';
    case 'WALI_MURID': return '/parent';
    default: return '/admin';
  }
}

// ── Session cookie reader ────────────────────────────────

function readSessionCookie(): { id: string; email: string; fullName: string; role: UserRole } | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.split('; ').find((c) => c.startsWith('session_user='));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
  } catch {
    return null;
  }
}

function createAuthStore() {
  const currentUser = writable<User | null>(null);

  // On init: read session cookie → load user from db-store
  if (typeof window !== 'undefined') {
    const session = readSessionCookie();
    if (session?.id) {
      const db = dbStore.getSnapshot();
      const user = db.users.find((u) => u.id === session.id && u.deletedAt === null);
      if (user) currentUser.set(user);
    }
  }

  // Re-derive user from db-store when it updates
  dbStore.subscribe((db) => {
    const session = readSessionCookie();
    if (session?.id) {
      const db = dbStore.getSnapshot();
      const user = db.users.find((u) => u.id === session.id && u.deletedAt === null);
      currentUser.set(user || null);
    }
  });

  return {
    subscribe: currentUser.subscribe,

    login: async (emailInput: string, passwordInput: string) => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailInput.trim(), password: passwordInput })
        });
        const json = await res.json();

        if (json.error) {
          return { error: true, statusCode: json.statusCode, message: json.message, data: null };
        }

        // Set current user
        currentUser.set(json.data);

        return {
          error: false,
          statusCode: 200,
          message: `Selamat datang kembali, ${json.data.fullName}!`,
          data: json.data
        };
      } catch (err_raw) { const err = err_raw as Error;
        return { error: true, statusCode: 500, message: err.message, data: null };
      }
    },

    logout: async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch { /* ignore */ }
      currentUser.set(null);
      if (typeof window !== 'undefined') {
        goto('/login');
      }
    },

    refreshFromCookie: () => {
      const session = readSessionCookie();
      if (session?.id) {
        const db = dbStore.getSnapshot();
        const user = db.users.find((u) => u.id === session.id && u.deletedAt === null);
        currentUser.set(user || null);
      } else {
        currentUser.set(null);
      }
    }
  };
}

export const authStore = createAuthStore();
