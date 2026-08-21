<script lang="ts">
  import { Modal } from '$lib/components/molecules';
  import { Icon } from '$lib/components/atoms';
  import {toastStore} from '$lib/shared/stores';
  import type { RecruitmentCandidate, CandidateStatus } from '$lib/shared/types';
  import { Button } from '$lib/components/atoms';
  import { SelectSearch } from '$lib/components/molecules';
  import { api } from '$lib/api/client';

  export let open: boolean = false;
  export let candidate: RecruitmentCandidate | null = null;
  export let onClose: () => void = () => {};

  let status: string = 'INTERVIEW';
  let notes: string = '';

  $: if (candidate) {
    status = candidate.status;
    notes = candidate.notes || '';
  }

  async function handleUpdateStatus() {
    if (!candidate) return;
    const response = await api.candidates.update({
      id: candidate.id,
      status: status as CandidateStatus,
      notes: notes.trim()
    });
    if (!response.error) {
      toastStore.success('Status tahapan seleksi berhasil diperbarui.');
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }

  async function handleConvertToTentor() {
    if (!candidate) return;
    const response = await api.users.create({
      fullName: candidate.fullName,
      email: candidate.email,
      role: 'TENTOR',
      password: 'tentor123'
    });
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
      <SelectSearch
        id="f_status"
        bind:value={status}
        options={[
          { value: 'REGISTERED', label: '1. Registrasi Berkas' },
          { value: 'TEST_SCHEDULED', label: '2. Tes Dijadwalkan' },
          { value: 'TESTED', label: '3. Tes Selesai' },
          { value: 'INTERVIEW_SCHEDULED', label: '4. Wawancara Dijadwalkan' },
          { value: 'INTERVIEWED', label: '5. Wawancara Selesai' },
          { value: 'ACCEPTED', label: '6. Diterima' },
          { value: 'REJECTED', label: '7. Ditolak' }
        ]}
      />
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
