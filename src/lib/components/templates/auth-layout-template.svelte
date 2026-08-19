<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import ToastContainer from '$lib/components/molecules/toast-container.svelte';
  import { themeStore } from '$lib/shared/stores/theme-store';
</script>

<div class="flex items-center justify-center min-h-screen p-4 sm:p-6 bg-[var(--color-bg)] transition-colors">
  <div class="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] p-6 sm:p-8">
    <!-- Top Brand & Theme Toggle -->
    <div class="flex items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <img
          src="/logo-sentraedu.jpg"
          alt="SentraEdu"
          class="w-10 h-10 rounded-[var(--radius-sm)] object-cover shadow-sm"
        />
        <div class="flex flex-col">
          <span class="font-extrabold text-xl tracking-tight leading-none">
            <span class="text-[var(--color-primary)]">Sentra</span><span class="text-[var(--color-accent)]">Edu</span>
          </span>
          <span class="text-[10px] font-semibold text-[var(--color-fg-muted)] tracking-wider uppercase mt-0.5">
            Sistem Manajemen Bimbel
          </span>
        </div>
      </div>

      <button
        type="button"
        class="flex items-center justify-center w-9 h-9 rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
        on:click={themeStore.toggleTheme}
        title="Ganti tema"
        aria-label="Ganti tema"
      >
        <Icon name={$themeStore === 'dark' ? 'light_mode' : 'dark_mode'} size="sm" />
      </button>
    </div>

    <!-- Slot for Form & Personas -->
    <slot />
  </div>

  <ToastContainer />
</div>
