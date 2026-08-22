<script lang="ts">
  import { Navbar, NotificationDropdown, Sidebar } from '$lib/components/organisms';
  import { ToastContainer } from '$lib/components/molecules';
  import type { User } from '$lib/shared/types';

  let {
    currentUser,
    currentPath = '/dashboard',
    pageTitle = 'Dashboard',
    children
  } = $props();

  let mobileSidebarOpen = $state(false);
  let notificationsOpen = $state(false);
</script>

<div class="app">
  <!-- Sidebar -->
  <Sidebar
    {currentUser}
    {currentPath}
    mobileOpen={mobileSidebarOpen}
    onCloseMobile={() => { mobileSidebarOpen = false; }}
  />

  <!-- Main Container -->
  <div class="main">
    <Navbar
      {currentUser}
      title={pageTitle}
      onToggleMobileMenu={() => { mobileSidebarOpen = !mobileSidebarOpen; }}
      onOpenNotifications={() => { notificationsOpen = true; }}
    />

    <main class="content">
      {#if children}{@render children()}{/if}
    </main>
  </div>

  <!-- Mobile Backdrop -->
  <div
    class="backdrop {mobileSidebarOpen ? 'show' : ''}"
    onclick={() => { mobileSidebarOpen = false; }}
    aria-hidden="true"
  ></div>

  <!-- Notifications Modal -->
  <NotificationDropdown
    open={notificationsOpen}
    {currentUser}
    onClose={() => { notificationsOpen = false; }}
  />

  <!-- Global Toasts -->
  <ToastContainer />
</div>
