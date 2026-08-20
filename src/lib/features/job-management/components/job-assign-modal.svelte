<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import type { JobPost } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';

  export let open: boolean = false;
  export let job: JobPost | null = null;
  export let onClose: () => void = () => {};

  $: selectedJobClass = job ? $dbStore.classes.find((classItem) => classItem.id === job?.classId) : null;
  $: selectedJobLevel = selectedJobClass ? selectedJobClass.educationLevelId : null;

  $: matchingTentors = $dbStore.users.filter((userItem) => {
    if (userItem.role !== 'TENTOR' || userItem.deletedAt !== null) return false;
    if (!job) return false;
    const subjectMatch = (userItem.subjectIds || []).includes(job.subjectId);
    const levelMatch = !selectedJobLevel || (userItem.levelIds || []).includes(selectedJobLevel);
    return subjectMatch && levelMatch;
  });

  $: otherTentors = $dbStore.users.filter((userItem) => {
    if (userItem.role !== 'TENTOR' || userItem.deletedAt !== null) return false;
    return !matchingTentors.some((matchingUser) => matchingUser.id === userItem.id);
  });

  function getInitials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((word) => word[0].toUpperCase()).join('');
  }

  function handleAssign(tentorId: string, tentorName: string) {
    if (!job) return;
    const response = dbStore.assignTentorToJob(job.id, tentorId);
    if (!response.error) {
      dbStore.pushNotification(
        tentorId,
        'Penugasan Lowongan Baru',
        `Anda telah ditugaskan untuk mengajar lowongan "${job.title}".`,
        'work'
      );
      toastStore.success(`Tentor ${tentorName} berhasil ditugaskan.`);
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title="Tugaskan Tentor ke Lowongan" icon="person_add" maxWidth="600px">
  {#if job}
    <div class="kv mb-3.5">
      <dt>Judul</dt>
      <dd>{job.title}</dd>
      <dt>Jadwal</dt>
      <dd>{job.schedulePreference || `${(job.scheduleDays || []).join(', ')} ${job.scheduleTime}`}</dd>
      <dt>Estimasi Honor/Sesi</dt>
      <dd class="text-primary font-bold">{formatCurrencyIDR(job.tentorFee)}</dd>
    </div>

    <div class="card-head py-2 px-0 mb-2.5 border-b border-muted">
      <span class="text-success"><Icon name="verified" size="sm" /></span>
      Tentor Rekomendasi — Mapel &amp; Jenjang Cocok ({matchingTentors.length})
    </div>

    {#if matchingTentors.length === 0}
      <p class="text-xs text-muted-fg mb-3.5">
        Tidak ada tentor yang cocok langsung dengan mapel dan jenjang ini.
      </p>
    {:else}
      {#each matchingTentors as tentorItem (tentorItem.id)}
        <div class="flex items-center justify-between p-2.5 px-3.5 border border-border rounded-xl bg-surface mb-1.5">
          <div class="flex items-center gap-2.5">
            <div class="avatar w-8 h-8 text-xs font-bold">{getInitials(tentorItem.fullName)}</div>
            <div>
              <div class="font-bold text-sm">{tentorItem.fullName}</div>
              <div class="text-muted-fg text-xs">{tentorItem.education || '—'} · {tentorItem.experienceYears || 0} thn</div>
            </div>
          </div>
          <Button variant="primary" size="sm" on:click={() => handleAssign(tentorItem.id, tentorItem.fullName)} icon="how_to_reg">
            Tugaskan
          </Button>
        </div>
      {/each}
    {/if}

    {#if otherTentors.length > 0}
      <div class="card-head py-2 px-0 mt-3.5 mb-2.5 border-b border-muted">
        Semua Tentor Lainnya ({otherTentors.length})
      </div>
      {#each otherTentors as tentorItem (tentorItem.id)}
        <div class="flex items-center justify-between p-2.5 px-3.5 border border-border rounded-xl bg-surface mb-1.5">
          <div class="flex items-center gap-2.5">
            <div class="avatar w-8 h-8 text-xs font-bold">{getInitials(tentorItem.fullName)}</div>
            <div>
              <div class="font-bold text-sm">{tentorItem.fullName}</div>
              <div class="text-muted-fg text-xs">{tentorItem.education || '—'}</div>
            </div>
          </div>
          <Button variant="outline" size="sm" on:click={() => handleAssign(tentorItem.id, tentorItem.fullName)} icon="how_to_reg">
            Tugaskan
          </Button>
        </div>
      {/each}
    {/if}
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={onClose} icon="close">
      Tutup
    </Button>
  </svelte:fragment>
</Modal>
