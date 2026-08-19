import { w as writable } from "./index2.js";
const THEME_STORAGE_KEY = "bms_theme";
function createThemeStore() {
  const isBrowser = typeof window !== "undefined";
  const initialTheme = isBrowser ? localStorage.getItem(THEME_STORAGE_KEY) || "light" : "light";
  const { subscribe, set, update } = writable(initialTheme);
  if (isBrowser) {
    document.documentElement.dataset.theme = initialTheme;
  }
  return {
    subscribe,
    toggleTheme: () => {
      update((currentTheme) => {
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        if (typeof window !== "undefined") {
          localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
          document.documentElement.dataset.theme = nextTheme;
        }
        return nextTheme;
      });
    },
    setTheme: (theme) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        document.documentElement.dataset.theme = theme;
      }
      set(theme);
    }
  };
}
const themeStore = createThemeStore();
export {
  themeStore as t
};
