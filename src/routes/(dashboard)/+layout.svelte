<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/shared/stores/auth-store';
  import DashboardLayoutTemplate from '$lib/components/templates/dashboard-layout-template.svelte';

  $: currentPath = $page.url.pathname;

  onMount(() => {
    if (!$authStore) {
      goto('/login');
    }
  });

  const pageTitleMap: Record<string, string> = {
    '/dashboard': 'Dashboard Ikhtisar',
    '/jobs': 'Lowongan Les Privat',
    '/students': 'Data Siswa & Pendaftaran',
    '/attendance': 'Presensi & Laporan Materi',
    '/payroll': 'Klaim & Pembayaran Honor Tentor',
    '/invoices': 'Tagihan SPP & Pembayaran',
    '/candidates': 'Rekrutmen & Seleksi Tentor',
    '/subjects': 'Data Master Mata Pelajaran',
    '/levels': 'Data Master Jenjang & Kelas',
    '/packages': 'Data Master Paket Les',
    '/users': 'Manajemen Akun Pengguna',
    '/analitik': 'Analitik Operasional & Finansial',
    '/laporan': 'Laporan & Ekspor Data',
    '/profile': 'Profil Akun Pengguna',
    '/jobboard': 'Bursa Lowongan Mengajar',
    '/program': 'Program Les & Jadwal Belajar',
    '/children': 'Program Les Anak'
  };

  $: currentPageTitle = pageTitleMap[currentPath] || 'SentraEdu';
</script>

{#if $authStore}
  <DashboardLayoutTemplate
    currentUser={$authStore}
    {currentPath}
    pageTitle={currentPageTitle}
  >
    <slot />
  </DashboardLayoutTemplate>
  <div class="flex items-center justify-center min-h-screen bg-bg">
    <span class="text-[0.88rem] text-muted-fg">Mengalihkan ke halaman masuk...</span>
  </div>
{/if}
