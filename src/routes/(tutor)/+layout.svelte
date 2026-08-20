<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import DashboardLayoutTemplate from '$lib/components/templates/dashboard-layout-template.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';

  $: currentPath = $page.url.pathname;

  $: if (typeof window !== 'undefined' && !$authStore) {
    goto('/login');
  }

  $: if ($authStore && $authStore.role !== 'TENTOR') {
    goto('/login');
  }

  const pageTitleMap: Record<string, string> = {
    '/tutor': 'Dashboard Ikhtisar',
    '/tutor/dashboard': 'Dashboard Ikhtisar',
    '/tutor/classes': 'Program Les Aktif',
    '/tutor/job-board': 'Bursa Lowongan Mengajar',
    '/tutor/jobboard': 'Bursa Lowongan Mengajar',
    '/tutor/attendance': 'Presensi Saya',
    '/tutor/payroll': 'Penggajian',
    '/tutor/profile': 'Profil Akun Pengguna'
  };

  $: currentPageTitle = pageTitleMap[currentPath] || 'SentraEdu';
</script>

{#if !$dbStore.isLoaded}
  <div class="flex items-center justify-center min-h-screen bg-bg">
    <div class="flex flex-col items-center gap-4 text-muted-fg">
      <Icon name="progress_activity" size="lg" className="animate-spin" />
      <span class="text-sm">Memuat data dari server...</span>
    </div>
  </div>
{:else if $authStore}
  <DashboardLayoutTemplate
    currentUser={$authStore}
    {currentPath}
    pageTitle={currentPageTitle}
  >
    <slot />
  </DashboardLayoutTemplate>
{:else}
  <div class="flex items-center justify-center min-h-screen bg-bg">
    <div class="flex flex-col items-center gap-4 text-muted-fg">
      <Icon name="progress_activity" size="lg" className="animate-spin" />
      <span class="text-sm">Mengalihkan ke halaman masuk...</span>
    </div>
  </div>
{/if}
