import { writable } from 'svelte/store';
import type { ComponentType } from 'svelte';

export interface ModalConfig {
  title: string;
  icon?: string;
  width?: number;
  component?: ComponentType<any>;
  props?: Record<string, any>;
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
