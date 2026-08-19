<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import type { User } from '$lib/shared/types/common.types';

  export let open: boolean = false;
  export let currentUser: User;
  export let onClose: () => void = () => {};

  $: userNotifications = ($dbStore.notifications || [])
    .filter((notif) => notif.userId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  $: unreadCount = userNotifications.filter((n) => !n.read).length;

  function timeAgo(dateString: string): string {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return 'baru saja';
    if (diff < 3600) return Math.floor(diff / 60) + 'm lalu';
    if (diff < 86400) return Math.floor(diff / 3600) + 'j lalu';
    return Math.floor(diff / 86400) + 'h lalu';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
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
      class="modal w-[460px] max-w-[95vw]"
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
            {#each userNotifications as n (n.id)}
              <button
                type="button"
                class="notif-item {n.read ? 'read' : 'unread'}"
                on:click={() => dbStore.markNotificationAsRead(n.id)}
              >
                <span class="n-ico">
                  <Icon name={n.icon || 'notifications'} size="md" />
                </span>
                <span class="flex-1 min-w-0">
                  <span class="n-title">{n.title}</span>
                  <div class="n-msg">{n.message}</div>
                  <div class="n-time">
                    <Icon name="schedule" size="xs" /> {timeAgo(n.createdAt)}
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
            on:click={() => dbStore.markAllNotificationsAsRead(currentUser.id)}
          >
            <Icon name="done_all" size="sm" /> Tandai Semua Dibaca ({unreadCount})
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
