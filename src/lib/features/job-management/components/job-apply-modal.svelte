<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { JobPost, User } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';

  export let open: boolean = false;
  export let job: JobPost | null = null;
  export let tentor: User;
  export let onClose: () => void = () => {};

  let notes: string = '';

  function handleApply() {
    if (!job) return;
    const response = dbStore.applyToJob(job.id, tentor.id, notes.trim());
    if (!response.error) {
      toastStore.success('Lamaran lowongan les berhasil dikirim ke admin.');
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title="Lamar Lowongan Les" icon="send" maxWidth="480px">
  {#if job}
    <div class="kv mb-3.5">
      <dt>Judul</dt>
      <dd>{job.title}</dd>
      <dt>Siswa</dt>
      <dd>{job.studentName || '—'}</dd>
      <dt>Jadwal</dt>
      <dd>{job.schedulePreference || '—'}</dd>
      <dt>Estimasi Honor/Sesi</dt>
      <dd class="text-primary font-bold">
        Rp {(job.tentorFee || 0).toLocaleString('id-ID')}
      </dd>
    </div>

    <div class="field">
      <label for="f_notes">Catatan Lamaran / Pengantar (Opsional)</label>
      <textarea
        id="f_notes"
        rows="3"
        placeholder="Tuliskan pengalaman relevan atau ketersediaan waktu Anda..."
        bind:value={notes}
      ></textarea>
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={onClose} icon="close">
      Batal
    </Button>
    <Button variant="primary" on:click={handleApply} icon="send">
      Kirim Lamaran
    </Button>
  </svelte:fragment>
</Modal>
