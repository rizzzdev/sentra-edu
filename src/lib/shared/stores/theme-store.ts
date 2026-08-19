import { writable } from 'svelte/store';

const THEME_STORAGE_KEY = 'bms_theme';

function createThemeStore() {
  const isBrowser = typeof window !== 'undefined';
  const initialTheme = isBrowser ? (localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark') || 'light' : 'light';

  const { subscribe, set, update } = writable<'light' | 'dark'>(initialTheme);

  if (isBrowser) {
    document.documentElement.dataset.theme = initialTheme;
  }

  return {
    subscribe,
    toggleTheme: () => {
      update((currentTheme) => {
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        if (typeof window !== 'undefined') {
          localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
          document.documentElement.dataset.theme = nextTheme;
        }
        return nextTheme;
      });
    },
    setTheme: (theme: 'light' | 'dark') => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        document.documentElement.dataset.theme = theme;
      }
      set(theme);
    }
  };
}

export const themeStore = createThemeStore();
