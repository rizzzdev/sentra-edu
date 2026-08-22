<script lang="ts">
  import { Icon, Input } from '$lib/components/atoms';
  import { authStore, getRoleDefaultPath, themeStore, toastStore } from '$lib/shared/stores';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/atoms';

  let emailInput = $state('');
  let passwordInput = $state('');
  let errorMessage = $state<string | null>(null);
  let isSubmitting = $state(false);

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
    } catch (errorRaw) {
      const error = errorRaw as Error;
      errorMessage = error.message || 'Gagal login.';
      toastStore.error(errorMessage || 'Gagal login.');
      isSubmitting = false;
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center p-6 sm:p-8 bg-bg">
  <div class="w-full max-w-md bg-surface border border-border rounded-2xl shadow-md p-8">
    <!-- Brand Header -->
    <div class="flex items-center gap-2.5 font-extrabold text-lg mb-4">
      <img
        class="w-9 h-9 rounded-xl object-cover"
        src="/logo-sentraedu.jpg"
        alt="SentraEdu"
      />
      <span class="brand-name font-extrabold">
        <span class="text-primary">Sentra</span><span class="text-accent">Edu</span>
      </span>
    </div>

    <!-- Title & Theme Toggle -->
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl font-bold flex items-center gap-2.5">
        <Icon name="lock" filled={true} /> Masuk
      </h1>
      <Button
        variant="ghost"
        isIconOnly
        size="md"
        ariaLabel="Ganti tema terang/gelap"
        icon={$themeStore === 'dark' ? 'light_mode' : 'dark_mode'}
        onclick={themeStore.toggleTheme}
      />
    </div>

    <p class="text-muted-fg text-sm my-2 mb-4.5">
      Masuk ke dashboard SentraEdu menggunakan akun Anda.
    </p>

    <!-- Login Form -->
    <form id="login-form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} novalidate>
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
        <div class="form-error block" id="login-error">
          {errorMessage}
        </div>
      {/if}

      <Button type="submit" variant="primary" fullWidth icon="login" disabled={isSubmitting}>
        {isSubmitting ? 'Memproses...' : 'Masuk'}
      </Button>
    </form>
  </div>
</div>
