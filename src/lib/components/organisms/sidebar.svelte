<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import type { User, UserRole } from '$lib/shared/types/common.types';

  export let currentUser: User;
  export let currentPath: string = '/dashboard';
  export let mobileOpen: boolean = false;
  export let onCloseMobile: () => void = () => {};

  interface NavItem {
    path: string;
    label: string;
    icon: string;
    group?: string;
  }

  const roleNavMap: Record<UserRole, NavItem[]> = {
    SUPER_ADMIN: [
      { path: '/dashboard', label: 'Dashboard', icon: 'space_dashboard', group: 'Beranda' },
      { path: '/jobs', label: 'Lowongan Les', icon: 'work', group: 'Operasional' },
      { path: '/students', label: 'Siswa', icon: 'group', group: 'Operasional' },
      { path: '/attendance', label: 'Verifikasi Presensi', icon: 'fact_check', group: 'Operasional' },
      { path: '/payroll', label: 'Klaim Gaji', icon: 'payments', group: 'Operasional' },
      { path: '/invoices', label: 'Tagihan SPP', icon: 'receipt_long', group: 'Operasional' },
      { path: '/candidates', label: 'Rekrutmen Tentor', icon: 'badge', group: 'SDM' },
      { path: '/subjects', label: 'Mata Pelajaran', icon: 'menu_book', group: 'Master Data' },
      { path: '/levels', label: 'Jenjang', icon: 'school', group: 'Master Data' },
      { path: '/packages', label: 'Paket Les', icon: 'sell', group: 'Master Data' },
      { path: '/users', label: 'Akun Pengguna', icon: 'manage_accounts', group: 'Master Data' },
      { path: '/analitik', label: 'Analitik', icon: 'monitoring', group: 'Insight' },
      { path: '/laporan', label: 'Laporan', icon: 'summarize', group: 'Insight' },
      { path: '/profile', label: 'Profil Saya', icon: 'person', group: 'Akun' }
    ],
    TENTOR: [
      { path: '/dashboard', label: 'Dashboard', icon: 'space_dashboard', group: 'Beranda' },
      { path: '/jobboard', label: 'Cari Lowongan', icon: 'search', group: 'Pekerjaan' },
      { path: '/attendance', label: 'Presensi Saya', icon: 'location_on', group: 'Pekerjaan' },
      { path: '/payroll', label: 'Klaim Gaji', icon: 'payments', group: 'Pekerjaan' },
      { path: '/profile', label: 'Profil Saya', icon: 'person', group: 'Akun' }
    ],
    STUDENT: [
      { path: '/dashboard', label: 'Dashboard', icon: 'space_dashboard', group: 'Beranda' },
      { path: '/program', label: 'Program Les Aktif', icon: 'school', group: 'Belajar' },
      { path: '/attendance', label: 'Daftar Presensi', icon: 'fact_check', group: 'Belajar' },
      { path: '/reports', label: 'Laporan Hasil Belajar', icon: 'summarize', group: 'Belajar' },
      { path: '/profile', label: 'Profil Saya', icon: 'person', group: 'Akun' }
    ],
    WALI_MURID: [
      { path: '/dashboard', label: 'Dashboard', icon: 'space_dashboard', group: 'Beranda' },
      { path: '/children', label: 'Program Les Anak', icon: 'school', group: 'Monitoring Anak' },
      { path: '/attendance', label: 'Presensi Anak', icon: 'fact_check', group: 'Monitoring Anak' },
      { path: '/reports', label: 'Laporan Hasil Belajar', icon: 'summarize', group: 'Monitoring Anak' },
      { path: '/invoices', label: 'Tagihan SPP', icon: 'receipt_long', group: 'Keuangan' },
      { path: '/profile', label: 'Profil Saya', icon: 'person', group: 'Akun' }
    ]
  };

  $: navList = roleNavMap[currentUser.role] || roleNavMap.STUDENT;

  const roleBadgeMap: Record<UserRole, { label: string; badgeClass: string; icon: string }> = {
    SUPER_ADMIN: { label: 'Super Admin', badgeClass: 'b-admin', icon: 'admin_panel_settings' },
    TENTOR: { label: 'Tentor', badgeClass: 'b-tentor', icon: 'school' },
    STUDENT: { label: 'Siswa', badgeClass: 'b-student', icon: 'school' },
    WALI_MURID: { label: 'Wali Murid', badgeClass: 'b-neutral', icon: 'family_restroom' }
  };

  $: initials = currentUser.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'U';
</script>

<aside class="sidebar {mobileOpen ? 'open' : ''}">
  <div class="side-brand">
    <div class="side-brand-top">
      <img
        class="logo w-9 h-9 rounded-[11px] object-cover flex-none"
        src="/logo-sentraedu.jpg"
        alt="SentraEdu"
      />
      <span class="brand-name">
        <span class="text-primary">Sentra</span><span class="text-accent">Edu</span>
      </span>
    </div>
    <div class="side-role">
      <span class="badge {roleBadgeMap[currentUser.role].badgeClass}">
        <Icon name={roleBadgeMap[currentUser.role].icon} size="xs" />
        {roleBadgeMap[currentUser.role].label}
      </span>
    </div>
  </div>

  <nav class="side-nav">
    <div class="nav-label">Menu</div>
    {#each navList as item, index}
      {#if item.group && (index === 0 || navList[index - 1].group !== item.group)}
        <div class="nav-group-label">{item.group}</div>
      {/if}
      <a
        href={item.path}
        class="nav-item {currentPath === item.path ? 'active' : ''}"
        on:click={onCloseMobile}
      >
        <Icon name={item.icon} size="md" />
        <span>{item.label}</span>
      </a>
    {/each}
  </nav>

  <div class="side-foot">
    <div class="side-user">
      <div class="avatar">{initials}</div>
      <div>
        <div class="u-name">{currentUser.fullName}</div>
        <div class="u-mail">{currentUser.email}</div>
      </div>
    </div>
    <button type="button" class="btn-logout" on:click={() => authStore.logout()}>
      <Icon name="logout" size="sm" />
      <span>Keluar</span>
    </button>
  </div>
</aside>
