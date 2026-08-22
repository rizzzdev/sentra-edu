<script lang="ts">
  import type { User } from '$lib/shared/types';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { notificationStore } from '$lib/api';
  import { formatDateIndonesian } from '$lib/shared/utils/formatting';

  let {
    open = false,
    currentUser,
    onClose = () => {}
  }: {
    open?: boolean;
    currentUser: User;
    onClose?: () => void;
  } = $props();

  const notifications = $derived(
    $notificationStore
      .filter((n) => n.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
  );

  const unreadCount = $derived(
    notifications.filter((n) => !n.read).length
  );

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') onClose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="notif-overlay" onclick={onClose} onkeydown={handleKeydown}>
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="notif-panel" role="dialog" aria-label="Notifikasi" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={handleKeydown}>
      <div class="notif-head">
        <h4>Notifikasi</h4>
        <button type="button" class="modal-x" onclick={onClose} aria-label="Tutup">
          <Icon name="close" size="sm" />
        </button>
      </div>

      <div class="notif-body">
        {#if notifications.length === 0}
          <div class="notif-empty">
            <Icon name="notifications_off" size="lg" />
            <p>Belum ada notifikasi.</p>
          </div>
        {:else}
          {#each notifications as notif (notif.id)}
            <div
              class="notif-item {!notif.read ? 'unread' : ''}"
              onclick={() => notificationStore.markNotificationAsRead(notif.id)}
              onkeydown={(e) => { if (e.key === 'Enter') notificationStore.markNotificationAsRead(notif.id); }}
              role="button"
              tabindex="0"
            >
              <div class="notif-icon">
                <Icon name={notif.icon || 'notifications'} size="md" />
              </div>
              <div class="notif-content">
                <div class="notif-title">{notif.title}</div>
                <div class="notif-msg">{notif.message}</div>
                <div class="notif-time">{formatDateIndonesian(notif.createdAt)}</div>
              </div>
              {#if !notif.read}
                <div class="notif-dot"></div>
              {/if}
            </div>
          {/each}
        {/if}
      </div>

      <div class="notif-foot">
        <button type="button" class="btn btn-outline btn-sm" onclick={onClose}>
          Tutup
        </button>
        {#if unreadCount > 0}
          <button type="button" class="btn btn-primary btn-sm" onclick={() => notificationStore.markAllNotificationsAsRead(currentUser.id)}>
            Tandai Semua Dibaca ({unreadCount})
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
