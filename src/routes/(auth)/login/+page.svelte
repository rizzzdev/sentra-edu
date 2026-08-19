<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { themeStore } from '$lib/shared/stores/theme-store';
  import { goto } from '$app/navigation';

  let emailInput: string = '';
  let passwordInput: string = '';
  let errorMessage: string | null = null;

  const PERSONAS = [
    {
      role: 'SUPER_ADMIN',
      icon: 'admin_panel_settings',
      label: 'Admin',
      desc: 'Data master, lowongan, presensi, rekrutmen',
      email: 'admin@sentraedu.id'
    },
    {
      role: 'TENTOR',
      icon: 'school',
      label: 'Tentor',
      desc: 'Lamar les, presensi GPS, klaim honor',
      email: 'tentor.andi@sentraedu.id'
    },
    {
      role: 'STUDENT',
      icon: 'school',
      label: 'Siswa',
      desc: 'Lihat les aktif, presensi, laporan',
      email: 'raka@sentraedu.id'
    },
    {
      role: 'WALI_MURID',
      icon: 'family_restroom',
      label: 'Wali Murid',
      desc: 'Pantau les anak & bayar SPP',
      email: 'wali.raka@sentraedu.id'
    }
  ];

  function handleSubmit() {
    errorMessage = null;
    if (!emailInput.trim() || !passwordInput) {
      errorMessage = 'Email dan password wajib diisi.';
      return;
    }

    const response = authStore.login(emailInput, passwordInput);
    if (response.error) {
      errorMessage = 'Email atau password salah.';
      return;
    }

    goto('/dashboard');
  }

  function handlePersonaClick(personaEmail: string) {
    const response = authStore.loginAsPersona(personaEmail);
    if (!response.error) {
      goto('/dashboard');
    } else {
      errorMessage = response.message;
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center p-6 sm:p-8 bg-bg">
  <div class="w-full max-w-[460px] bg-surface border border-border rounded-[18px] shadow-md p-8 sm:p-9">
    <!-- Brand Header -->
    <div class="flex items-center gap-2.5 font-extrabold text-[1.15rem] mb-4">
      <img
        class="w-9 h-9 rounded-[11px] object-cover flex-none"
        src="/logo-sentraedu.jpg"
        alt="SentraEdu"
      />
      <span class="brand-name">
        <span class="text-primary">Sentra</span><span class="text-accent">Edu</span>
      </span>
    </div>

    <!-- Title & Theme Toggle -->
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-[1.4rem] font-bold flex items-center gap-2.5">
        <Icon name="lock" size="lg" filled={true} /> Masuk
      </h1>
      <button
        type="button"
        class="top-btn"
        title="Ganti tema"
        aria-label="Ganti tema terang/gelap"
        on:click={themeStore.toggleTheme}
      >
        <Icon name={$themeStore === 'dark' ? 'light_mode' : 'dark_mode'} size="md" />
      </button>
    </div>

    <p class="text-muted-fg text-[0.9rem] my-1.5 mb-4.5">
      Masuk menggunakan akun Anda, atau gunakan tombol login cepat sesuai peran.
    </p>

    <!-- Login Form -->
    <form on:submit|preventDefault={handleSubmit} novalidate>
      <div class="field">
        <label for="login-email">Email</label>
        <div class="input-wrap">
          <input
            type="email"
            id="login-email"
            placeholder="nama@sentraedu.id"
            autocomplete="username"
            bind:value={emailInput}
          />
        </div>
      </div>

      <div class="field">
        <label for="login-password">Password</label>
        <div class="input-wrap">
          <input
            type="password"
            id="login-password"
            placeholder="••••••••"
            autocomplete="current-password"
            bind:value={passwordInput}
          />
        </div>
      </div>

      {#if errorMessage}
        <div class="bg-danger-soft text-danger rounded-[10px] p-2.5 text-[0.85rem] mb-3">
          {errorMessage}
        </div>
      {/if}

      <button type="submit" class="btn btn-primary w-full py-2.5">
        <Icon name="login" size="sm" /> Masuk
      </button>
    </form>

    <!-- Divider -->
    <div class="flex items-center gap-3 my-5 mb-3.5 text-muted-fg text-[0.78rem]">
      <span class="flex-1 h-px bg-border"></span>
      atau login cepat sebagai
      <span class="flex-1 h-px bg-border"></span>
    </div>

    <!-- Fast Persona Login Grid -->
    <div class="grid grid-cols-2 gap-2.5">
      {#each PERSONAS as p}
        <button
          type="button"
          class="flex flex-col items-start gap-1 text-left p-3 bg-surface border border-border rounded-xl transition cursor-pointer hover:border-primary-soft-2 hover:bg-muted"
          on:click={() => handlePersonaClick(p.email)}
        >
          <span class="text-primary text-[22px]">
            <Icon name={p.icon} size="md" filled={true} />
          </span>
          <span class="font-bold text-[0.88rem] text-fg">
            {p.label}
          </span>
          <span class="text-muted-fg text-[0.72rem] leading-tight">
            {p.desc}
          </span>
        </button>
      {/each}
    </div>
  </div>
</div>
