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

  $: if ($authStore && $authStore.role !== 'WALI_MURID') {
    goto('/login');
  }

  const pageTitleMap: Record<string, string> = {
    '/parent': 'Dashboard Ikhtisar',
    '/parent/dashboard': 'Dashboard Ikhtisar',
    '/parent/children': 'Program Les Anak',
    '/parent/attendance': 'Presensi Anak',
    '/parent/reports': 'Laporan Hasil Belajar',
    '/parent/invoices': 'Tagihan SPP & Pembayaran',
    '/parent/profile': 'Profil Akun Pengguna'
  };

  $: currentPageTitle = pageTitleMap[currentPath] || 'SentraEdu';
</script>

{#if !$dbStore.isLoaded}
  <div class="flex items-center justify-center min-h-screen bg-bg">
    <div class="flex flex-col items-center gap-4 text-muted-fg">
      <Icon name="progress_activity" size="lg" className="animate-spin" />
      <span class="text-[0.88rem]">Memuat data dari server...</span>
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
      <span class="text-[0.88rem]">Mengalihkan ke halaman masuk...</span>
    </div>
  </div>
{/if}
