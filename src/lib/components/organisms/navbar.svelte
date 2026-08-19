<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { themeStore } from '$lib/shared/stores/theme-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import type { User } from '$lib/shared/types/common.types';

  export let currentUser: User;
  export let title: string = 'Dashboard';
  export let onToggleMobileMenu: () => void = () => {};
  export let onOpenNotifications: () => void = () => {};

  const roleDisplayNames: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    TENTOR: 'Tentor',
    STUDENT: 'Siswa',
    WALI_MURID: 'Wali Murid'
  };

  $: unreadCount = ($dbStore.notifications || []).filter(
    (item) => item.userId === currentUser.id && !item.read
  ).length;
</script>

<header class="topbar">
  <div>
    <div class="crumb">{roleDisplayNames[currentUser.role] || currentUser.role}</div>
    <h2>{title}</h2>
  </div>
  <div class="spacer"></div>

  <!-- Notification Top Button -->
  <button
    type="button"
    class="top-btn"
    title="Notifikasi"
    aria-label="Notifikasi"
    on:click={onOpenNotifications}
  >
    <Icon name="notifications" size="md" />
    {#if unreadCount > 0}
      <span class="notif-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>
    {/if}
  </button>

  <!-- Theme Toggle Top Button -->
  <button
    type="button"
    class="top-btn"
    title="Ganti tema"
    aria-label="Ganti tema terang/gelap"
    on:click={themeStore.toggleTheme}
  >
    <Icon name={$themeStore === 'dark' ? 'light_mode' : 'dark_mode'} size="md" />
  </button>

  <!-- Mobile Burger Button -->
  <button
    type="button"
    class="burger"
    aria-label="Buka menu"
    on:click={onToggleMobileMenu}
  >
    <Icon name="menu" size="md" />
  </button>
</header>
