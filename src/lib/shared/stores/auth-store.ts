import { writable } from 'svelte/store';
import type { User, UserRole } from '$lib/shared/types';
import { goto } from '$app/navigation';

export function getRoleDefaultPath(role?: UserRole | null): string {
  switch (role) {
    case 'SUPER_ADMIN': return '/admin';
    case 'TENTOR': return '/tutor';
    case 'STUDENT': return '/student';
    case 'PARENT': return '/parent';
    default: return '/admin';
  }
}

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

  // On init: read session cookie → fetch user from API
  if (typeof window !== 'undefined') {
    const session = readSessionCookie();
    if (session?.id) {
      currentUser.set(session as User);

      // Fetch full user data from API
      fetch('/api/users', { credentials: 'include' })
        .then((r) => r.json())
        .then((result) => {
          if (!result.error && result.data) {
            const user = result.data.find((u: any) => u.id === session.id && u.deletedAt === null);
            if (user) currentUser.set(user);
          }
        });
    }
  }

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

    refreshFromCookie: async () => {
      const session = readSessionCookie();
      if (session?.id) {
        const result = await fetch('/api/users', { credentials: 'include' }).then((r) => r.json());
        if (!result.error && result.data) {
          const user = result.data.find((u: any) => u.id === session.id && u.deletedAt === null);
          currentUser.set(user || (session as User));
        }
      } else {
        currentUser.set(null);
      }
    }
  };
}

export const authStore = createAuthStore();
