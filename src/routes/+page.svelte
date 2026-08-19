<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { goto } from '$app/navigation';

  onMount(() => {
    if ($authStore) {
      goto('/dashboard');
    } else {
      goto('/login');
    }
  });
</script>

<div class="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
  <div class="animate-pulse flex flex-col items-center gap-3">
    <img src="/logo-sentraedu.jpg" alt="SentraEdu" class="w-12 h-12 rounded-[var(--radius-sm)] shadow-md" />
    <span class="text-sm font-semibold text-[var(--color-fg-muted)]">Memuat SentraEdu...</span>
  </div>
</div>
