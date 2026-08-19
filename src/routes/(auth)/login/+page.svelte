<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore, getRoleDefaultPath } from '$lib/shared/stores/auth-store';
  import { themeStore } from '$lib/shared/stores/theme-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';

  let emailInput: string = '';
  let passwordInput: string = '';
  let errorMessage: string | null = null;


  let isSubmitting: boolean = false;

  async function handleSubmit() {
    errorMessage = null;
    isSubmitting = true;
    if (!emailInput.trim() || !passwordInput) {
      errorMessage = 'Email dan password wajib diisi.';
      isSubmitting = false;
      return;
    }

    try {
      const response = await authStore.login(emailInput, passwordInput);
      if (response.error || !response.data) {
        errorMessage = response.message || 'Email atau password salah.';
        toastStore.error(errorMessage || 'Terjadi kesalahan.');
        isSubmitting = false;
        return;
      }
      toastStore.success(response.message || 'Berhasil login.');
      goto(getRoleDefaultPath(response.data.role));
    } catch (err_raw) { const err = err_raw as Error;
      errorMessage = err.message || 'Gagal login.';
      toastStore.error(errorMessage || 'Gagal login.');
      isSubmitting = false;
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
Masuk ke dashboard SentraEdu menggunakan akun Anda.
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

      <Button type="submit" variant="primary" fullWidth icon="login" disabled={isSubmitting}>
        {isSubmitting ? 'Memproses...' : 'Masuk'}
      </Button>
    </form>


  </div>
</div>
