<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore, getRoleDefaultPath } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import DashboardLayoutTemplate from '$lib/components/templates/dashboard-layout-template.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';

  $: currentPath = $page.url.pathname;

  $: if (typeof window !== 'undefined' && !$authStore) {
    goto('/login');
  }

  $: if ($authStore && (currentPath === '/dashboard' || currentPath === '/')) {
    goto(getRoleDefaultPath($authStore.role));
  }

  const pageTitleMap: Record<string, string> = {
    '/dashboard': 'Dashboard Ikhtisar',
    '/admin': 'Dashboard Ikhtisar',
    '/admin/dashboard': 'Dashboard Ikhtisar',
    '/admin/jobs': 'Lowongan Les Privat',
    '/admin/students': 'Data Master Murid',
    '/admin/students/parent': 'Data Master Wali Murid',
    '/admin/magic-links': 'Magic Link Pendaftaran Murid',
    '/admin/tutors': 'Data Master Tentor / Mentor',
    '/admin/tutors/magic-links': 'Magic Link Pendaftaran Tentor',
    '/admin/attendance': 'Presensi & Laporan Materi',
    '/admin/payroll': 'Penggajian Tentor',
    '/admin/invoices': 'Tagihan SPP & Pembayaran',
    '/admin/candidates': 'Rekrutmen & Seleksi Tentor',
    '/admin/subjects': 'Data Master Mata Pelajaran',
    '/admin/classes': 'Data Master Kelas',
    '/admin/levels': 'Data Master Jenjang & Kelas',
    '/admin/packages': 'Data Master Paket Les',
    '/admin/users': 'Manajemen Akun Pengguna',
    '/admin/analytics': 'Analitik Operasional & Finansial',
    '/admin/reports-admin': 'Laporan & Ekspor Data',
    '/admin/profile': 'Profil Akun Pengguna',
    '/tutor': 'Dashboard Ikhtisar',
    '/tutor/dashboard': 'Dashboard Ikhtisar',
    '/tutor/job-board': 'Bursa Lowongan Mengajar',
    '/tutor/attendance': 'Presensi Saya',
    '/tutor/payroll': 'Penggajian',
    '/tutor/profile': 'Profil Akun Pengguna',
    '/student': 'Dashboard Ikhtisar',
    '/student/dashboard': 'Dashboard Ikhtisar',
    '/student/program': 'Program Les & Jadwal Belajar',
    '/student/attendance': 'Daftar Presensi',
    '/student/reports': 'Laporan Hasil Belajar',
    '/student/profile': 'Profil Akun Pengguna',
    '/parent': 'Dashboard Ikhtisar',
    '/parent/dashboard': 'Dashboard Ikhtisar',
    '/parent/children': 'Program Les Anak',
    '/parent/attendance': 'Presensi Anak',
    '/parent/reports': 'Laporan Hasil Belajar',
    '/parent/invoices': 'Tagihan SPP & Pembayaran',
    '/parent/profile': 'Profil Akun Pengguna',
    '/jobs': 'Lowongan Les Privat',
    '/students': 'Data Master Murid',
    '/students/parent': 'Data Master Wali Murid',
    '/magic-links': 'Magic Link Pendaftaran Murid',
    '/tutors': 'Data Master Tentor / Mentor',
    '/tutors/magic-links': 'Magic Link Pendaftaran Tentor',
    '/attendance': 'Presensi & Laporan Materi',
    '/payroll': 'Penggajian Tentor',
    '/invoices': 'Tagihan SPP & Pembayaran',
    '/candidates': 'Rekrutmen & Seleksi Tentor',
    '/subjects': 'Data Master Mata Pelajaran',
    '/classes': 'Data Master Kelas',
    '/levels': 'Data Master Jenjang & Kelas',
    '/packages': 'Data Master Paket Les',
    '/users': 'Manajemen Akun Pengguna',
    '/analytics': 'Analitik Operasional & Finansial',
    '/reports-admin': 'Laporan & Ekspor Data',
    '/profile': 'Profil Akun Pengguna',
    '/job-board': 'Bursa Lowongan Mengajar',
    '/program': 'Program Les & Jadwal Belajar',
    '/reports': 'Laporan Hasil Belajar',
    '/children': 'Program Les Anak'
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
