<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore, getRoleDefaultPath } from '$lib/shared/stores/auth-store';
  import { themeStore } from '$lib/shared/stores/theme-store';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';

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
    if (response.error || !response.data) {
      errorMessage = 'Email atau password salah.';
      return;
    }

    goto(getRoleDefaultPath(response.data.role));
  }

  function handlePersonaClick(personaEmail: string) {
    const response = authStore.loginAsPersona(personaEmail);
    if (!response.error && response.data) {
      goto(getRoleDefaultPath(response.data.role));
    } else {
      errorMessage = response.message;
    }
  }
</script>

<div class="auth-page" style="display:flex;min-height:100vh;align-items:center;justify-content:center;padding:2rem 1.5rem">
  <div class="auth-card" style="width:100%;max-width:460px;background:var(--surface);border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow-md);padding:2.2rem">
    <!-- Brand Header -->
    <div style="display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.15rem;margin-bottom:16px">
      <img
        class="logo"
        src="/logo-sentraedu.jpg"
        alt="SentraEdu"
        style="width:36px;height:36px;border-radius:11px;object-fit:cover"
      />
      <span class="brand-name">
        <span style="color:var(--primary)">Sentra</span><span style="color:var(--accent)">Edu</span>
      </span>
    </div>

    <!-- Title & Theme Toggle -->
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
      <h1 style="font-size:1.4rem;display:flex;align-items:center;gap:10px">
        <Icon name="lock" filled={true} /> Masuk
      </h1>
      <Button
        variant="ghost"
        isIconOnly
        size="md"
        ariaLabel="Ganti tema terang/gelap"
        icon={$themeStore === 'dark' ? 'light_mode' : 'dark_mode'}
        on:click={themeStore.toggleTheme}
      />
    </div>

    <p style="color:var(--muted-fg);font-size:.9rem;margin:6px 0 18px">
      Masuk menggunakan akun Anda, atau gunakan tombol login cepat sesuai peran.
    </p>

    <!-- Login Form -->
    <form id="login-form" on:submit|preventDefault={handleSubmit} novalidate>
      <div class="field">
        <label for="login-email">Email</label>
        <div class="input-wrap">
          <Input
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
          <Input
            type="password"
            id="login-password"
            placeholder="••••••••"
            autocomplete="current-password"
            bind:value={passwordInput}
          />
        </div>
      </div>

      {#if errorMessage}
        <div class="form-error" id="login-error" style="display:block">
          {errorMessage}
        </div>
      {/if}

      <Button type="submit" variant="primary" fullWidth icon="login">
        Masuk
      </Button>
    </form>

    <!-- Divider -->
    <div style="display:flex;align-items:center;gap:12px;margin:20px 0 14px;color:var(--muted-fg);font-size:.78rem">
      <span style="flex:1;height:1px;background:var(--border)"></span>
      atau login cepat sebagai
      <span style="flex:1;height:1px;background:var(--border)"></span>
    </div>

    <!-- Fast Persona Login Grid -->
    <div class="persona-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      {#each PERSONAS as p}
        <Button
          variant="outline"
          className="persona-btn"
          on:click={() => handlePersonaClick(p.email)}
        >
          <span style="color:var(--primary);font-size:22px">
            <Icon name={p.icon} filled={true} />
          </span>
          <span style="font-weight:700;font-size:.88rem">
            {p.label}
          </span>
          <span style="color:var(--muted-fg);font-size:.72rem;font-weight:400">
            {p.desc}
          </span>
        </Button>
      {/each}
    </div>
  </div>
</div>
