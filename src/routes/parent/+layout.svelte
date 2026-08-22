<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/shared/stores/auth-store';
  import DashboardLayoutTemplate from '$lib/components/templates/dashboard-layout-template.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { fetchAllStores } from '$lib/shared/stores';
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';

  let { children }: { children?: Snippet } = $props();

  onMount(() => {
    fetchAllStores();
  });

  const currentPath = $derived($page.url.pathname);

  $effect(() => {
    if (typeof window !== 'undefined' && !$authStore) {
      goto('/login');
    }
  });

  $effect(() => {
    if ($authStore && $authStore.role !== 'PARENT') {
      goto('/login');
    }
  });

  const pageTitleMap: Record<string, string> = {
    '/parent': 'Dashboard Ikhtisar',
    '/parent/dashboard': 'Dashboard Ikhtisar',
    '/parent/children': 'Program Les Anak',
    '/parent/attendance': 'Presensi Anak',
    '/parent/reports': 'Laporan Hasil Belajar',
    '/parent/invoices': 'Tagihan SPP & Pembayaran',
    '/parent/profile': 'Profil Akun Pengguna'
  };

  const currentPageTitle = $derived((() => {
    if (currentPath.startsWith('/parent/children/')) return 'Detail Program Les Anak';
    return pageTitleMap[currentPath] || 'SentraEdu';
  })());
</script>

{#if $authStore}
  <DashboardLayoutTemplate
    currentUser={$authStore}
    {currentPath}
    pageTitle={currentPageTitle}
  >
    {#if children}{@render children()}{/if}
  </DashboardLayoutTemplate>
{:else}
  <div class="flex items-center justify-center min-h-screen bg-bg">
    <div class="flex flex-col items-center gap-4 text-muted-fg">
      <Icon name="progress_activity" size="lg" className="animate-spin" />
      <span class="text-sm">Mengalihkan ke halaman masuk...</span>
    </div>
  </div>
{/if}
