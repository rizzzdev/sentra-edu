<script lang="ts">
  import FormField from '$lib/components/molecules/form-field.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import Button from '$lib/components/atoms/button.svelte';
  import AlertBanner from '$lib/components/molecules/alert-banner.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { LoginSchema } from '$lib/features/auth/schemas/login.schema';
  import { goto } from '$app/navigation';

  let emailInput: string = '';
  let passwordInput: string = '';
  let formErrorMessage: string | null = null;
  let validationErrors: Record<string, string> = {};

  function handleSubmit() {
    formErrorMessage = null;
    validationErrors = {};

    const validationResult = LoginSchema.safeParse({
      email: emailInput,
      password: passwordInput
    });

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      if (fieldErrors.email) validationErrors.email = fieldErrors.email[0];
      if (fieldErrors.password) validationErrors.password = fieldErrors.password[0];
      return;
    }

    const loginResponse = authStore.login(emailInput, passwordInput);
    if (loginResponse.error) {
      formErrorMessage = loginResponse.message;
      return;
    }

    toastStore.success(loginResponse.message);
    goto('/dashboard');
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
