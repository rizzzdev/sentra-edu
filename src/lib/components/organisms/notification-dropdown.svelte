<script lang="ts">
import { notificationStore } from '$lib/api';
  import { Icon } from '$lib/components/atoms';
  ;
  import type { User } from '$lib/shared/types';

  export let open: boolean = false;
  export let currentUser: User;
  export let onClose: () => void = () => {};

  $: userNotifications = ($notificationStore || [])
    .filter((notif) => notif.userId === currentUser.id)
    .sort((firstNotif, secondNotif) => new Date(secondNotif.createdAt).getTime() - new Date(firstNotif.createdAt).getTime());

  $: unreadCount = userNotifications.filter((notificationItem) => !notificationItem.read).length;

  function timeAgo(dateString: string): string {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return 'baru saja';
    if (diff < 3600) return Math.floor(diff / 60) + 'm lalu';
    if (diff < 86400) return Math.floor(diff / 3600) + 'j lalu';
    return Math.floor(diff / 86400) + 'h lalu';
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') onClose();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div
    class="modal-overlay"
    on:click|self={onClose}
    on:keydown={handleKeydown}
    role="presentation"
    tabindex="-1"
  >
    <div
      class="modal max-w-lg w-full"
      role="dialog"
      aria-modal="true"
      tabindex="0"
    >
      <div class="modal-head">
        <div class="modal-title">
          <Icon name="notifications" size="md" />
          <span>Notifikasi</span>
        </div>
        <button type="button" class="modal-x" on:click={onClose} aria-label="Tutup">
          <Icon name="close" size="sm" />
        </button>
      </div>

      <div class="modal-body p-0">
        <div class="notif-list">
          {#if userNotifications.length === 0}
            <div class="notif-empty">
              <Icon name="notifications_off" size="lg" />
              <div>Belum ada notifikasi.</div>
            </div>
          {:else}
            {#each userNotifications as notificationItem (notificationItem.id)}
              <button
                type="button"
                class="notif-item {notificationItem.read ? 'read' : 'unread'}"
                on:click={() => notificationStore.markNotificationAsRead(notificationItem.id)}
              >
                <span class="n-ico">
                  <Icon name={notificationItem.icon || 'notifications'} size="md" />
                </span>
                <span class="flex-1 min-w-0">
                  <span class="n-title">{notificationItem.title}</span>
                  <div class="n-msg">{notificationItem.message}</div>
                  <div class="n-time">
                    <Icon name="schedule" size="xs" /> {timeAgo(notificationItem.createdAt)}
                  </div>
                </span>
                <span class="n-dot-rd"></span>
              </button>
            {/each}
          {/if}
        </div>
      </div>

      <div class="modal-foot">
        <button type="button" class="btn btn-outline" on:click={onClose}>
          <Icon name="close" size="sm" /> Tutup
        </button>
        {#if unreadCount > 0}
          <button
            type="button"
            class="btn btn-soft"
            on:click={() => notificationStore.markAllNotificationsAsRead(currentUser.id)}
          >
            <Icon name="done_all" size="sm" /> Tandai Semua Dibaca ({unreadCount})
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
