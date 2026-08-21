<script lang="ts">
  import { Navbar, NotificationDropdown, Sidebar } from '$lib/components/organisms';
  import { ToastContainer } from '$lib/components/molecules';
  import type { User } from '$lib/shared/types';

  export let currentUser: User;
  export let currentPath: string = '/dashboard';
  export let pageTitle: string = 'Dashboard';

  let mobileSidebarOpen: boolean = false;
  let notificationsOpen: boolean = false;
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
      <slot />
    </main>
  </div>

  <!-- Mobile Backdrop -->
  <div
    class="backdrop {mobileSidebarOpen ? 'show' : ''}"
    on:click={() => { mobileSidebarOpen = false; }}
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
