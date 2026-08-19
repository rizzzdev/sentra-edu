<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import type { User, UserRole } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import { ROLE_LABEL } from '$lib/shared/utils/status-map';

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
      { path: '/admin', label: 'Dashboard', icon: 'space_dashboard', group: 'Beranda' },
      { path: '/admin/jobs', label: 'Lowongan Les', icon: 'work', group: 'Operasional' },
      { path: '/admin/attendance', label: 'Verifikasi Presensi', icon: 'fact_check', group: 'Operasional' },
      { path: '/admin/payroll', label: 'Penggajian', icon: 'payments', group: 'Operasional' },
      { path: '/admin/invoices', label: 'Tagihan SPP', icon: 'receipt_long', group: 'Operasional' },
      { path: '/admin/students', label: 'Data Murid', icon: 'school', group: 'Kelola Murid & Wali' },
      { path: '/admin/students/wali', label: 'Data Wali Murid', icon: 'family_restroom', group: 'Kelola Murid & Wali' },
      { path: '/admin/magic-links', label: 'Magic Link Pendaftaran', icon: 'link', group: 'Kelola Murid & Wali' },
      { path: '/admin/tentors', label: 'Data Tentor', icon: 'badge', group: 'Kelola Tentor' },
      { path: '/admin/tentors/magic-links', label: 'Magic Link Tentor', icon: 'link', group: 'Kelola Tentor' },
      { path: '/admin/candidates', label: 'Rekrutmen & Pelamar', icon: 'person_search', group: 'Kelola Tentor' },
      { path: '/admin/subjects', label: 'Mata Pelajaran', icon: 'menu_book', group: 'Master Data' },
      { path: '/admin/levels', label: 'Jenjang', icon: 'stairs', group: 'Master Data' },
      { path: '/admin/packages', label: 'Paket Les', icon: 'sell', group: 'Master Data' },
      { path: '/admin/users', label: 'Akun Pengguna', icon: 'manage_accounts', group: 'Master Data' },
      { path: '/admin/analitik', label: 'Analitik', icon: 'monitoring', group: 'Insight' },
      { path: '/admin/laporan', label: 'Laporan', icon: 'summarize', group: 'Insight' },
      { path: '/admin/profile', label: 'Profil Saya', icon: 'person', group: 'Akun' }
    ],
    TENTOR: [
      { path: '/tentor', label: 'Dashboard', icon: 'space_dashboard', group: 'Beranda' },
      { path: '/tentor/jobboard', label: 'Cari Lowongan', icon: 'search', group: 'Pekerjaan' },
      { path: '/tentor/attendance', label: 'Presensi Saya', icon: 'location_on', group: 'Pekerjaan' },
      { path: '/tentor/payroll', label: 'Penggajian', icon: 'payments', group: 'Pekerjaan' },
      { path: '/tentor/profile', label: 'Profil Saya', icon: 'person', group: 'Akun' }
    ],
    STUDENT: [
      { path: '/student', label: 'Dashboard', icon: 'space_dashboard', group: 'Beranda' },
      { path: '/student/program', label: 'Program Les Aktif', icon: 'school', group: 'Belajar' },
      { path: '/student/attendance', label: 'Daftar Presensi', icon: 'fact_check', group: 'Belajar' },
      { path: '/student/reports', label: 'Laporan Hasil Belajar', icon: 'summarize', group: 'Belajar' },
      { path: '/student/profile', label: 'Profil Saya', icon: 'person', group: 'Akun' }
    ],
    WALI_MURID: [
      { path: '/wali', label: 'Dashboard', icon: 'space_dashboard', group: 'Beranda' },
      { path: '/wali/children', label: 'Program Les Anak', icon: 'school', group: 'Monitoring Anak' },
      { path: '/wali/attendance', label: 'Presensi Anak', icon: 'fact_check', group: 'Monitoring Anak' },
      { path: '/wali/reports', label: 'Laporan Hasil Belajar', icon: 'summarize', group: 'Monitoring Anak' },
      { path: '/wali/invoices', label: 'Tagihan SPP', icon: 'receipt_long', group: 'Keuangan' },
      { path: '/wali/profile', label: 'Profil Saya', icon: 'person', group: 'Akun' }
    ]
  };

  $: navList = roleNavMap[currentUser.role] || roleNavMap.STUDENT;

  const roleBadgeClassMap: Record<string, string> = {
    SUPER_ADMIN: 'b-admin',
    TENTOR: 'b-tentor',
    STUDENT: 'b-student',
    WALI_MURID: 'b-neutral'
  };
  const roleIconMap: Record<string, string> = {
    SUPER_ADMIN: 'admin_panel_settings',
    TENTOR: 'school',
    STUDENT: 'school',
    WALI_MURID: 'family_restroom'
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
      <span class="badge {roleBadgeClassMap[currentUser.role] || 'b-neutral'}">
        <Icon name={roleIconMap[currentUser.role] || 'person'} size="xs" />
        {ROLE_LABEL[currentUser.role] || currentUser.role}
      </span>
    </div>
  </div>

  <nav class="side-nav">
    {#each navList as item, index}
      {#if item.group && (index === 0 || navList[index - 1].group !== item.group)}
        <div class="nav-group-label">{item.group}</div>
      {/if}
      <a
        href={item.path}
        class="nav-item {currentPath === item.path ? 'active' : ''}"
        on:click={onCloseMobile}
      >
        <Icon name={item.icon} size="sm" />
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
    <Button variant="ghost" className="btn-logout" on:click={() => authStore.logout()} icon="logout">
      Keluar
    </Button>
  </div>
</aside>
