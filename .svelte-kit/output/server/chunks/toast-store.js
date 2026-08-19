import { w as writable } from "./index2.js";
function createToastStore() {
  const store = writable([]);
  function show(message, type = "success", durationMs = 3500) {
    const id = "toast-" + Math.random().toString(36).substring(2, 9);
    const newToast = { id, type, message, durationMs };
    store.update((toasts) => [...toasts, newToast]);
    setTimeout(() => {
      store.update((toasts) => toasts.filter((item) => item.id !== id));
    }, durationMs);
  }
  return {
    subscribe: store.subscribe,
    show,
    success: (message, durationMs = 3500) => show(message, "success", durationMs),
    error: (message, durationMs = 4e3) => show(message, "error", durationMs),
    info: (message, durationMs = 3500) => show(message, "info", durationMs),
    warning: (message, durationMs = 3500) => show(message, "warning", durationMs),
    remove: (id) => {
      store.update((toasts) => toasts.filter((item) => item.id !== id));
    }
  };
}
const toastStore = createToastStore();
export {
  toastStore as t
};
