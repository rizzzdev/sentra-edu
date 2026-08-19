import { writable, derived } from 'svelte/store';
import type { User, UserRole, ApiResponse } from '$lib/shared/types/common.types';
import { dbStore } from '$lib/shared/stores/db-store';
import { goto } from '$app/navigation';

export function getRoleDefaultPath(role?: UserRole | null): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin';
    case 'TENTOR':
      return '/tentor';
    case 'STUDENT':
      return '/student';
    case 'WALI_MURID':
      return '/wali';
    default:
      return '/admin';
  }
}

const SESSION_STORAGE_KEY = 'bms_session_v9';

interface SessionState {
  userId: string | null;
  loginAt: string | null;
}

function loadInitialSession(): SessionState {
  if (typeof window === 'undefined') return { userId: null, loginAt: null };
  try {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawSession) return { userId: null, loginAt: null };
    return JSON.parse(rawSession);
  } catch {
    return { userId: null, loginAt: null };
  }
}

function createAuthStore() {
  const sessionWritable = writable<SessionState>(loadInitialSession());

  const currentUser = derived([sessionWritable, dbStore], ([$session, $db]) => {
    if (!$session.userId || !$db.users) return null;
    const userFound = $db.users.find(
      (userItem) => userItem.id === $session.userId && userItem.deletedAt === null
    );
    return userFound || null;
  });

  return {
    subscribe: currentUser.subscribe,
    session: sessionWritable,
    login: (emailInput: string, passwordInput: string): ApiResponse<User> => {
      const database = dbStore.getSnapshot();
      const matchedUser = database.users.find(
        (userItem) =>
          userItem.deletedAt === null &&
          userItem.email.toLowerCase() === emailInput.trim().toLowerCase() &&
          userItem.password === passwordInput
      );

      if (!matchedUser) {
        return {
          error: true,
          statusCode: 401,
          message: 'Email atau kata sandi tidak valid.',
          data: null
        };
      }

      if (matchedUser.isActive === false) {
        return {
          error: true,
          statusCode: 403,
          message: 'Akun Anda belum aktif. Silakan tunggu verifikasi dari admin.',
          data: null
        };
      }

      const sessionData: SessionState = {
        userId: matchedUser.id,
        loginAt: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      }
      sessionWritable.set(sessionData);

      return {
        error: false,
        statusCode: 200,
        message: `Selamat datang kembali, ${matchedUser.fullName}!`,
        data: matchedUser
      };
    },
    loginAsPersona: (personaEmail: string): ApiResponse<User> => {
      const database = dbStore.getSnapshot();
      const matchedUser = database.users.find(
        (userItem) =>
          userItem.deletedAt === null &&
          userItem.email.toLowerCase() === personaEmail.trim().toLowerCase()
      );

      if (!matchedUser) {
        return {
          error: true,
          statusCode: 404,
          message: 'Akun persona tidak ditemukan dalam basis data.',
          data: null
        };
      }

      const sessionData: SessionState = {
        userId: matchedUser.id,
        loginAt: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      }
      sessionWritable.set(sessionData);

      return {
        error: false,
        statusCode: 200,
        message: `Masuk sebagai ${matchedUser.fullName} (${matchedUser.role}).`,
        data: matchedUser
      };
    },
    logout: (): void => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
      sessionWritable.set({ userId: null, loginAt: null });
      if (typeof window !== 'undefined') {
        goto('/login');
      }
    }
  };
}

export const authStore = createAuthStore();

