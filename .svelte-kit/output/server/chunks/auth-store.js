import { w as writable, d as derived } from "./index2.js";
import { d as dbStore } from "./db-store.js";
const SESSION_STORAGE_KEY = "bms_session_v9";
function loadInitialSession() {
  if (typeof window === "undefined") return { userId: null, loginAt: null };
  try {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawSession) return { userId: null, loginAt: null };
    return JSON.parse(rawSession);
  } catch {
    return { userId: null, loginAt: null };
  }
}
function createAuthStore() {
  const sessionWritable = writable(loadInitialSession());
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
    login: (emailInput, passwordInput) => {
      const database = dbStore.getSnapshot();
      const matchedUser = database.users.find(
        (userItem) => userItem.deletedAt === null && userItem.email.toLowerCase() === emailInput.trim().toLowerCase() && userItem.password === passwordInput
      );
      if (!matchedUser) {
        return {
          error: true,
          statusCode: 401,
          message: "Email atau kata sandi tidak valid.",
          data: null
        };
      }
      const sessionData = {
        userId: matchedUser.id,
        loginAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (typeof window !== "undefined") {
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
    loginAsPersona: (personaEmail) => {
      const database = dbStore.getSnapshot();
      const matchedUser = database.users.find(
        (userItem) => userItem.deletedAt === null && userItem.email.toLowerCase() === personaEmail.trim().toLowerCase()
      );
      if (!matchedUser) {
        return {
          error: true,
          statusCode: 404,
          message: "Akun persona tidak ditemukan dalam basis data.",
          data: null
        };
      }
      const sessionData = {
        userId: matchedUser.id,
        loginAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (typeof window !== "undefined") {
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
    logout: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
      sessionWritable.set({ userId: null, loginAt: null });
    }
  };
}
const authStore = createAuthStore();
export {
  authStore as a
};
