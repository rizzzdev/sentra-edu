<script lang="ts">
  import { FormField } from '$lib/components/molecules';
  import { Button, Input } from '$lib/components/atoms';
  import { AlertBanner } from '$lib/components/molecules';
  import { authStore, toastStore } from '$lib/shared/stores';
  import { LoginSchema } from '$lib/features/auth';
  import { goto } from '$app/navigation';

  let emailInput: string = '';
  let passwordInput: string = '';
  let formErrorMessage: string | null = null;
  let validationErrors: Record<string, string> = {};

  let isSubmitting: boolean = false;

  async function handleSubmit() {
    formErrorMessage = null;
    validationErrors = {};
    isSubmitting = true;

    const validationResult = LoginSchema.safeParse({
      email: emailInput,
      password: passwordInput
    });

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      if (fieldErrors.email) validationErrors.email = fieldErrors.email[0];
      if (fieldErrors.password) validationErrors.password = fieldErrors.password[0];
      isSubmitting = false;
      return;
    }

    try {
      const loginResponse = await authStore.login(emailInput, passwordInput);
      if (loginResponse.error) {
        formErrorMessage = loginResponse.message || 'Email atau password salah.';
        isSubmitting = false;
        return;
      }
      toastStore.success(loginResponse.message || 'Login berhasil!');
      goto('/dashboard');
    } catch (err_raw) { const err = err_raw as Error;
      formErrorMessage = err.message || 'Gagal login.';
      isSubmitting = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4" novalidate>
  {#if formErrorMessage}
    <AlertBanner message={formErrorMessage} variant="destructive" />
  {/if}

  <FormField label="Email" htmlFor="login-email" required={true} error={validationErrors.email}>
    <Input
      id="login-email"
      type="email"
      placeholder="admin@sentraedu.id"
      autocomplete="username"
      bind:value={emailInput}
    />
  </FormField>

  <FormField label="Kata Sandi" htmlFor="login-password" required={true} error={validationErrors.password}>
    <Input
      id="login-password"
      type="password"
      placeholder="••••••••"
      autocomplete="current-password"
      bind:value={passwordInput}
    />
  </FormField>

  <Button type="submit" variant="primary" fullWidth={true} icon="login">
    Masuk ke Sistem
  </Button>
</form>
