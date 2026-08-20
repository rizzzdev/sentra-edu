import { writable } from 'svelte/store';
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
  const cookieMatch = document.cookie.split('; ').find((cookieItem) => cookieItem.startsWith('session_user='));
  if (!cookieMatch) return null;
  try {
    return JSON.parse(decodeURIComponent(cookieMatch.split('=').slice(1).join('=')));
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
      // Use partial session data first to prevent premature login redirects
      currentUser.set(session as User);
      
      const dbSnapshot = dbStore.getSnapshot();
      const user = dbSnapshot.users.find((userItem) => userItem.id === session.id && userItem.deletedAt === null);
      if (user) currentUser.set(user);
    }
  }

  // Re-derive user from db-store when it updates
  dbStore.subscribe((databaseSnapshot) => {
    const session = readSessionCookie();
    if (session?.id) {
      const user = databaseSnapshot.users.find((userItem) => userItem.id === session.id && userItem.deletedAt === null);
      currentUser.set(user || (session as User));
    }
  });

  return {
    subscribe: currentUser.subscribe,

    login: async (emailInput: string, passwordInput: string) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailInput.trim(), password: passwordInput })
        });
        const result = await response.json();

        if (result.error) {
          return { error: true, statusCode: result.statusCode, message: result.message, data: null };
        }

        // Set current user
        currentUser.set(result.data);

        return {
          error: false,
          statusCode: 200,
          message: `Selamat datang kembali, ${result.data.fullName}!`,
          data: result.data
        };
      } catch (errorRaw) {
        const error = errorRaw as Error;
        return { error: true, statusCode: 500, message: error.message, data: null };
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
        const dbSnapshot = dbStore.getSnapshot();
        const user = dbSnapshot.users.find((userItem) => userItem.id === session.id && userItem.deletedAt === null);
        currentUser.set(user || (session as User));
      } else {
        currentUser.set(null);
      }
    }
  };
}

export const authStore = createAuthStore();
