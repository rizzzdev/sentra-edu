import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  durationMs?: number;
}

function createToastStore() {
  const store = writable<ToastMessage[]>([]);

  function show(message: string, type: ToastType = 'success', durationMs = 3500) {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, message, durationMs };

    store.update((toasts) => [...toasts, newToast]);

    setTimeout(() => {
      store.update((toasts) => toasts.filter((item) => item.id !== id));
    }, durationMs);
  }

  return {
    subscribe: store.subscribe,
    show,
    success: (message: string, durationMs = 3500) => show(message, 'success', durationMs),
    error: (message: string, durationMs = 4000) => show(message, 'error', durationMs),
    info: (message: string, durationMs = 3500) => show(message, 'info', durationMs),
    warning: (message: string, durationMs = 3500) => show(message, 'warning', durationMs),
    remove: (id: string) => {
      store.update((toasts) => toasts.filter((item) => item.id !== id));
    }
  };
}

export const toastStore = createToastStore();
