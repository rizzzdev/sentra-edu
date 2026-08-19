<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { RecruitmentCandidate, CandidateStatus } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';

  export let open: boolean = false;
  export let candidate: RecruitmentCandidate | null = null;
  export let onClose: () => void = () => {};

  let status: CandidateStatus = 'INTERVIEW';
  let notes: string = '';

  $: if (candidate) {
    status = candidate.status;
    notes = candidate.notes || '';
  }

  function handleUpdateStatus() {
    if (!candidate) return;
    const response = dbStore.saveCandidate({
      ...candidate,
      status,
      notes: notes.trim()
    });
    if (!response.error) {
      toastStore.success('Status tahapan seleksi berhasil diperbarui.');
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }

  function handleConvertToTentor() {
    if (!candidate) return;
    const response = dbStore.convertCandidateToTentorUser(candidate.id);
    if (!response.error) {
      toastStore.success(response.message);
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title="Update Tahapan Seleksi" icon="published_with_changes" maxWidth="480px">
  {#if candidate}
    <div class="kv">
      <dt>Kandidat</dt>
      <dd>{candidate.fullName}</dd>
      <dt>Email</dt>
      <dd>{candidate.email}</dd>
      <dt>Pendidikan</dt>
      <dd>{candidate.education || '—'}</dd>
    </div>

    <div class="field">
      <label for="f_status">Tahapan Seleksi Saat Ini</label>
      <select id="f_status" bind:value={status}>
        <option value="REGISTERED">1. Registrasi Berkas</option>
        <option value="TEST_SCHEDULED">2. Tes Dijadwalkan</option>
        <option value="TESTED">3. Tes Selesai</option>
        <option value="INTERVIEW_SCHEDULED">4. Wawancara Dijadwalkan</option>
        <option value="INTERVIEWED">5. Wawancara Selesai</option>
        <option value="ACCEPTED">6. Diterima</option>
        <option value="REJECTED">7. Ditolak</option>
      </select>
    </div>

    <div class="field">
      <label for="f_notes">Catatan Evaluasi</label>
      <textarea id="f_notes" rows="3" placeholder="Hasil wawancara, skor tes..." bind:value={notes}></textarea>
    </div>

    {#if status === 'ACCEPTED'}
      <div class="alert alert-info">
        <Icon name="auto_awesome" size="sm" />
        <span>Kandidat diterima — Anda dapat langsung membuatkan akun Tentor resmi.</span>
      </div>
    {/if}
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={onClose} icon="close">
      Batal
    </Button>
    {#if status === 'ACCEPTED'}
      <Button variant="primary" on:click={handleConvertToTentor} icon="how_to_reg">
        Konversi Jadi Akun Tentor
      </Button>
    {:else}
      <Button variant="primary" on:click={handleUpdateStatus} icon="save">
        Simpan Status
      </Button>
    {/if}
  </svelte:fragment>
</Modal>
