import { writable, derived } from 'svelte/store';
import type { User, UserRole, ApiResponse } from '$lib/shared/types/common.types';
import { dbStore } from '$lib/shared/stores/db-store';

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
    }
  };
}

export const authStore = createAuthStore();
