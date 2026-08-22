<script lang="ts">
  import { notificationStore } from '$lib/api';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { themeStore } from '$lib/shared/stores';
  import type { User } from '$lib/shared/types';
  import { ROLE_LABEL } from '$lib/shared/utils';

  interface NavbarProps {
    currentUser: User;
    title?: string;
    onToggleMobileMenu?: () => void;
    onOpenNotifications?: () => void;
  }

  let {
    currentUser,
    title = 'Dashboard',
    onToggleMobileMenu = () => {},
    onOpenNotifications = () => {}
  }: NavbarProps = $props();

  let unreadCount = $derived(
    ($notificationStore || []).filter(
      (notificationItem) => notificationItem.userId === currentUser.id && !notificationItem.read
    ).length
  );
</script>

<header class="topbar">
  <div>
    <div class="crumb">{ROLE_LABEL[currentUser.role] || currentUser.role}</div>
    <h2>{title}</h2>
  </div>
  <div class="spacer"></div>

  <!-- Notification Top Button -->
  <button
    type="button"
    class="top-btn"
    title="Notifikasi"
    aria-label="Notifikasi"
    onclick={onOpenNotifications}
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
    onclick={themeStore.toggleTheme}
  >
    <Icon name={$themeStore === 'dark' ? 'light_mode' : 'dark_mode'} size="md" />
  </button>

  <!-- Mobile Burger Button -->
  <button
    type="button"
    class="burger"
    aria-label="Buka menu"
    onclick={onToggleMobileMenu}
  >
    <Icon name="menu" size="md" />
  </button>
</header>
