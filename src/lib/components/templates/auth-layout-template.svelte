<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { themeStore } from '$lib/shared/stores/theme-store';
  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();
</script>

<div class="auth-layout">
  <div class="auth-left">
    <div class="auth-brand">
      <div class="auth-logo">
        <Icon name="school" size="xl" />
      </div>
      <h1 class="auth-title">SentraEdu</h1>
      <p class="auth-subtitle">Platform Manajemen Bimbingan Belajar</p>
    </div>

    <button type="button" class="auth-theme-toggle" onclick={themeStore.toggleTheme}>
      <Icon name={$themeStore === 'dark' ? 'light_mode' : 'dark_mode'} size="md" />
    </button>
  </div>

  <div class="auth-right">
    <div class="auth-card">
      {#if children}{@render children()}{/if}
    </div>
  </div>
</div>
