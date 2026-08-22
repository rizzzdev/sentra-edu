<script lang="ts">
  import { Icon } from '$lib/components/atoms';
  import { authStore, toastStore } from '$lib/shared/stores';
  import { goto } from '$app/navigation';

  interface PersonaOption {
    role: string;
    icon: string;
    label: string;
    description: string;
    email: string;
    toneColor: string;
  }

  const personaList: PersonaOption[] = [
    {
      role: 'SUPER_ADMIN',
      icon: 'admin_panel_settings',
      label: 'Admin Pusat',
      description: 'Data master, lowongan, verifikasi presensi',
      email: 'admin@sentraedu.id',
      toneColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800'
    },
    {
      role: 'TENTOR',
      icon: 'school',
      label: 'Tentor',
      description: 'Lamar lowongan, presensi GPS, klaim honor',
      email: 'tentor.andi@sentraedu.id',
      toneColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
    },
    {
      role: 'STUDENT',
      icon: 'school',
      label: 'Siswa',
      description: 'Jadwal les aktif, presensi & materi',
      email: 'raka@sentraedu.id',
      toneColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
    },
    {
      role: 'PARENT',
      icon: 'family_restroom',
      label: 'Orang Tua',
      description: 'Pantau les anak & bayar tagihan SPP',
      email: 'parent.raka@sentraedu.id',
      toneColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
    }
  ];

  function handlePersonaSelect(personaEmail: string) {
    // Quick login via API (default password)
    authStore.login(personaEmail, 'password123').then((result) => {
      if (!result.error) {
        toastStore.success(result.message || 'Login berhasil!');
        goto('/dashboard');
      } else {
        toastStore.error(result.message || 'Gagal login.');
      }
    });
  }
</script>

<div class="space-y-2.5">
  <div class="flex items-center gap-3 my-4 text-xs font-bold text-muted-fg select-none">
    <span class="flex-1 h-px bg-border"></span>
    <span>ATAU MASUK CEPAT SEBAGAI</span>
    <span class="flex-1 h-px bg-border"></span>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
    {#each personaList as persona}
      <button
        type="button"
        class="flex flex-col items-start p-3 text-left bg-surface border border-border rounded-xl hover:border-primary hover:bg-primary-soft/30 transition-all duration-150 cursor-pointer group"
        onclick={() => handlePersonaSelect(persona.email)}
      >
        <div class="flex items-center gap-2 mb-1">
          <div class="flex items-center justify-center w-7 h-7 rounded-lg border {persona.toneColor}">
            <Icon name={persona.icon} size="xs" filled={true} />
          </div>
          <span class="font-bold text-xs text-fg group-hover:text-primary transition-colors">
            {persona.label}
          </span>
        </div>
        <span class="text-xs text-muted-fg leading-tight line-clamp-2">
          {persona.description}
        </span>
      </button>
    {/each}
  </div>
</div>
