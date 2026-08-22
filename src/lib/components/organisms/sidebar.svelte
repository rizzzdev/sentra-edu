<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores';
  import type { User, UserRole } from '$lib/shared/types';
  import { ROLE_LABEL } from '$lib/shared/utils';

  interface NavItem {
    path: string;
    label: string;
    icon: string;
    group?: string;
  }

  interface SidebarProps {
    currentUser: User;
    currentPath?: string;
    mobileOpen?: boolean;
    onCloseMobile?: () => void;
  }

  let {
    currentUser,
    currentPath = '/dashboard',
    mobileOpen = false,
    onCloseMobile = () => {}
  }: SidebarProps = $props();

  const roleNavMap: Record<UserRole, NavItem[]> = {
    SUPER_ADMIN: [
      { path: '/admin', label: 'Dashboard', icon: 'space_dashboard', group: 'Beranda' },
      { path: '/admin/jobs', label: 'Lowongan Les', icon: 'work', group: 'Operasional' },
      { path: '/admin/attendance', label: 'Verifikasi Presensi', icon: 'fact_check', group: 'Operasional' },
      { path: '/admin/payroll', label: 'Penggajian', icon: 'payments', group: 'Operasional' },
      { path: '/admin/invoices', label: 'Tagihan SPP', icon: 'receipt_long', group: 'Operasional' },
      { path: '/admin/students', label: 'Data Murid', icon: 'school', group: 'Kelola Murid & Orang Tua' },
      { path: '/admin/parents', label: 'Data Orang Tua', icon: 'family_restroom', group: 'Kelola Murid & Orang Tua' },
      { path: '/admin/student-parent-magic-links', label: 'Magic Link Pendaftaran', icon: 'link', group: 'Kelola Murid & Orang Tua' },
      { path: '/admin/tutors', label: 'Data Tentor', icon: 'badge', group: 'Kelola Tentor' },
      { path: '/admin/tutor-magic-links', label: 'Magic Link Tentor', icon: 'link', group: 'Kelola Tentor' },
      { path: '/admin/candidates', label: 'Rekrutmen & Pelamar', icon: 'person_search', group: 'Kelola Tentor' },
      { path: '/admin/classes', label: 'Kelas', icon: 'stairs', group: 'Master Data' },
      { path: '/admin/subjects', label: 'Mata Pelajaran', icon: 'menu_book', group: 'Master Data' },
      { path: '/admin/levels', label: 'Jenjang', icon: 'stairs', group: 'Master Data' },
      { path: '/admin/packages', label: 'Paket Les', icon: 'sell', group: 'Master Data' },
      { path: '/admin/analytics', label: 'Analitik', icon: 'monitoring', group: 'Insight' },
      { path: '/admin/reports-admin', label: 'Laporan', icon: 'summarize', group: 'Insight' },
      { path: '/admin/profile', label: 'Profil Saya', icon: 'person', group: 'Akun' }
    ],
    TENTOR: [
      { path: '/tutor', label: 'Dashboard', icon: 'space_dashboard', group: 'Beranda' },
      { path: '/tutor/classes', label: 'Les Aktif', icon: 'school', group: 'Pekerjaan' },
      { path: '/tutor/job-board', label: 'Cari Lowongan', icon: 'search', group: 'Pekerjaan' },
      { path: '/tutor/attendance', label: 'Presensi Saya', icon: 'location_on', group: 'Pekerjaan' },
      { path: '/tutor/payroll', label: 'Penggajian', icon: 'payments', group: 'Pekerjaan' },
      { path: '/tutor/profile', label: 'Profil Saya', icon: 'person', group: 'Akun' }
    ],
    STUDENT: [
      { path: '/student', label: 'Dashboard', icon: 'space_dashboard', group: 'Beranda' },
      { path: '/student/program', label: 'Program Les Aktif', icon: 'school', group: 'Belajar' },
      { path: '/student/attendance', label: 'Daftar Presensi', icon: 'fact_check', group: 'Belajar' },
      { path: '/student/reports', label: 'Laporan Hasil Belajar', icon: 'summarize', group: 'Belajar' },
      { path: '/student/profile', label: 'Profil Saya', icon: 'person', group: 'Akun' }
    ],
    PARENT: [
      { path: '/parent', label: 'Dashboard', icon: 'space_dashboard', group: 'Beranda' },
      { path: '/parent/children', label: 'Program Les Anak', icon: 'school', group: 'Monitoring Anak' },
      { path: '/parent/attendance', label: 'Presensi Anak', icon: 'fact_check', group: 'Monitoring Anak' },
      { path: '/parent/reports', label: 'Laporan Hasil Belajar', icon: 'summarize', group: 'Monitoring Anak' },
      { path: '/parent/invoices', label: 'Tagihan SPP', icon: 'receipt_long', group: 'Keuangan' },
      { path: '/parent/profile', label: 'Profil Saya', icon: 'person', group: 'Akun' }
    ]
  };

  const navList = $derived(roleNavMap[currentUser.role] || roleNavMap.STUDENT);

  const roleBadgeClassMap: Record<string, string> = {
    SUPER_ADMIN: 'b-admin',
    TENTOR: 'b-tentor',
    STUDENT: 'b-student',
    PARENT: 'b-neutral'
  };

  const roleIconMap: Record<string, string> = {
    SUPER_ADMIN: 'admin_panel_settings',
    TENTOR: 'school',
    STUDENT: 'school',
    PARENT: 'family_restroom'
  };

  const initials = $derived(
    currentUser.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('') || 'U'
  );

  function isNavActive(current: string, targetPath: string): boolean {
    if (current === targetPath) return true;
    if (['/admin', '/tutor', '/student', '/parent'].includes(targetPath)) {
      return current === targetPath;
    }
    return current.startsWith(targetPath + '/');
  }
</script>

<aside class="sidebar {mobileOpen ? 'open' : ''}">
  <div class="side-brand">
    <div class="side-brand-top">
      <img
        class="logo w-9 h-9 rounded-xl object-cover flex-none"
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
        class="nav-item {isNavActive(currentPath, item.path) ? 'active' : ''}"
        onclick={onCloseMobile}
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
    <button type="button" class="btn-logout" onclick={() => authStore.logout()}>
      <Icon name="logout" size="sm" />
      Keluar
    </button>
  </div>
</aside>
