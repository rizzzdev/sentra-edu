import { writable } from 'svelte/store';
import type { ComponentType, SvelteComponent } from 'svelte';

export interface ModalConfig {
  title: string;
  icon?: string;
  width?: number;
  component?: ComponentType<SvelteComponent>;
  props?: Record<string, string | number | boolean | null | undefined | object | Function>;
  onClose?: () => void;
}

function createModalStore() {
  const { subscribe, set } = writable<ModalConfig | null>(null);

  return {
    subscribe,
    open: (config: ModalConfig) => {
      set(config);
    },
    close: () => {
      set(null);
    }
  };
}

export const modalStore = createModalStore();
