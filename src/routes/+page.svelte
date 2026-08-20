<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore, getRoleDefaultPath } from '$lib/shared/stores/auth-store';
  import { goto } from '$app/navigation';

  onMount(() => {
    if ($authStore) {
      goto(getRoleDefaultPath($authStore.role));
    } else {
      goto('/login');
    }
  });
</script>

<div class="flex items-center justify-center min-h-screen bg-bg">
  <div class="animate-pulse flex flex-col items-center gap-3">
    <img src="/logo-sentraedu.jpg" alt="SentraEdu" class="w-12 h-12 rounded-xl shadow-md object-cover" />
    <span class="text-sm font-semibold text-muted-fg">Memuat SentraEdu...</span>
  </div>
</div>
