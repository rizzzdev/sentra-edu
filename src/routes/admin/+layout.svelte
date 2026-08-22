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
    if ($authStore && $authStore.role !== 'SUPER_ADMIN') {
      goto('/login');
    }
  });

  const pageTitleMap: Record<string, string> = {
    '/admin': 'Dashboard Ikhtisar',
    '/admin/dashboard': 'Dashboard Ikhtisar',
    '/admin/jobs': 'Lowongan Les Privat',
    '/admin/students': 'Data Master Murid',
    '/admin/parents': 'Data Master Orang Tua',
    '/admin/student-parent-magic-links': 'Magic Link Pendaftaran Murid',
    '/admin/tutors': 'Data Master Tentor / Mentor',
    '/admin/tutor-magic-links': 'Magic Link Pendaftaran Tentor',
    '/admin/attendance': 'Presensi & Laporan Materi',
    '/admin/payroll': 'Penggajian Tentor',
    '/admin/invoices': 'Tagihan SPP & Pembayaran',
    '/admin/candidates': 'Rekrutmen & Seleksi Tentor',
    '/admin/subjects': 'Data Master Mata Pelajaran',
    '/admin/classes': 'Data Master Kelas',
    '/admin/levels': 'Data Master Jenjang & Kelas',
    '/admin/packages': 'Data Master Paket Les',
    '/admin/analytics': 'Analitik Operasional & Finansial',
    '/admin/reports-admin': 'Laporan & Ekspor Data',
    '/admin/profile': 'Profil Akun Pengguna'
  };

  const currentPageTitle = $derived(pageTitleMap[currentPath] || 'SentraEdu');
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
