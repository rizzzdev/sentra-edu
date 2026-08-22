<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import { Icon } from '$lib/components/atoms';
  import {toastStore} from '$lib/shared/stores';
  import type { JobPost, User } from '$lib/shared/types';
  import { Button } from '$lib/components/atoms';
  import { formatCurrencyIDR, getScheduleDaysList } from '$lib/shared/utils';
  import { api } from '$lib/api/client';

  let {
    open = false,
    job = null,
    tentor = null,
    onClose = () => {},
    onSuccess = () => {}
  }: {
    open?: boolean;
    job?: JobPost | null;
    tentor?: User | null;
    onClose?: () => void;
    onSuccess?: () => void;
  } = $props();

  let notes = $state('');
  let submitting = $state(false);

  async function handleApply() {
    if (!job || submitting) return;
    if (!tentor?.id) {
      toastStore.error('Sesi pengajar tidak ditemukan. Silakan login kembali.');
      return;
    }
    submitting = true;
    const response = await api.applications.create({ jobId: job.id, tentorId: tentor.id, notes: notes.trim() });
    submitting = false;
    if (!response.error) {
      toastStore.success('Lamaran lowongan les berhasil dikirim ke admin.');
      notes = '';
      onSuccess();
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
      <dd class="font-semibold">{job.title}</dd>
      <dt>Jadwal</dt>
      <dd>{getScheduleDaysList(job.scheduleDays).join(', ')} · {job.scheduleTime || '—'}{#if job.scheduleEndTime} – {job.scheduleEndTime}{/if} WIB</dd>
      <dt>Estimasi Honor/Sesi</dt>
      <dd class="text-primary font-bold">
        {formatCurrencyIDR(job.tentorFee || 0)}
        {#if job.transportAllowance && job.transportAllowance > 0}
          <span class="text-xs text-emerald-600 font-normal ml-1">(+ {formatCurrencyIDR(job.transportAllowance)} transport)</span>
        {/if}
      </dd>
      {#if job.location}
        <dt>Lokasi Les</dt>
        <dd class="text-xs font-medium text-fg flex items-start gap-1">
          <Icon name="location_on" size="xs" className="text-rose-500 mt-0.5 flex-shrink-0" />
          <span>{job.location}</span>
        </dd>
      {/if}
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

  {#snippet footer()}
    <Button variant="outline" onclick={onClose} icon="close">
      Batal
    </Button>
    <Button variant="primary" onclick={handleApply} icon="send" disabled={submitting}>
      {submitting ? 'Mengirim...' : 'Kirim Lamaran'}
    </Button>
  {/snippet}
</Modal>
