<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { PackagePlan } from '$lib/shared/types/common.types';

  export let open: boolean = false;
  export let editingPackage: PackagePlan | null = null;
  export let onClose: () => void = () => {};

  let name: string = '';
  let mode: 'PRIVATE' | 'KELOMPOK' = 'PRIVATE';
  let period: 'BULANAN' | 'HARIAN' = 'BULANAN';
  let price: number = 1000000;
  let tentorFee: number = 100000;
  let sessionsPerPeriod: number = 8;
  let maxStudents: number = 5;
  let active: boolean = true;
  let description: string = '';

  $: if (editingPackage) {
    name = editingPackage.name;
    mode = editingPackage.mode;
    period = editingPackage.period;
    price = editingPackage.price;
    tentorFee = editingPackage.tentorFee;
    sessionsPerPeriod = editingPackage.sessionsPerPeriod;
    maxStudents = editingPackage.maxStudents;
    active = editingPackage.active;
    description = editingPackage.description || '';
  } else {
    name = '';
    mode = 'PRIVATE';
    period = 'BULANAN';
    price = 1000000;
    tentorFee = 100000;
    sessionsPerPeriod = 8;
    maxStudents = 5;
    active = true;
    description = '';
  }

  function handleSubmit() {
    if (!name.trim()) {
      toastStore.error('Nama paket wajib diisi.');
      return;
    }

    const payload = {
      id: editingPackage ? editingPackage.id : undefined,
      name: name.trim(),
      mode,
      period,
      price: Number(price),
      tentorFee: Number(tentorFee),
      sessionsPerPeriod: Number(sessionsPerPeriod),
      maxStudents: Number(maxStudents),
      active,
      description: description.trim()
    };

    const response = dbStore.savePackage(payload as any);
    if (!response.error) {
      toastStore.success(response.message);
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title={editingPackage ? 'Ubah Paket Les' : 'Tambah Paket'} icon="sell" maxWidth="600px">
  <form id="form-package" on:submit|preventDefault={handleSubmit}>
    <div class="field">
      <label for="f_name">Nama Paket <i class="req">*</i></label>
      <input
        id="f_name"
        type="text"
        placeholder="cth: Paket Bulanan Private"
        required
        bind:value={name}
      />
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_mode">Mode <i class="req">*</i></label>
        <select id="f_mode" required bind:value={mode}>
          <option value="PRIVATE">Private (1 guru : 1 siswa)</option>
          <option value="KELOMPOK">Kelompok (1 guru : beberapa siswa)</option>
        </select>
      </div>

      <div class="field">
        <label for="f_period">Periode Tagihan <i class="req">*</i></label>
        <select id="f_period" required bind:value={period}>
          <option value="BULANAN">Bulanan (tagihan flat per bulan)</option>
          <option value="HARIAN">Harian (tagihan per sesi)</option>
        </select>
      </div>
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_price">Biaya Wali Murid (Rp) <i class="req">*</i></label>
        <input
          id="f_price"
          type="number"
          min="0"
          step="50000"
          required
          bind:value={price}
        />
        <div class="help">Harga paket yang dibayar wali murid (SPP).</div>
      </div>

      <div class="field">
        <label for="f_tentorFee">Honor Tentor per Sesi (Rp) <i class="req">*</i></label>
        <input
          id="f_tentorFee"
          type="number"
          min="0"
          step="5000"
          required
          bind:value={tentorFee}
        />
        <div class="help">Yang diterima tentor per sesi (sudah termasuk transport).</div>
      </div>
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_sessionsPerPeriod">Jumlah Sesi per Periode <i class="req">*</i></label>
        <input
          id="f_sessionsPerPeriod"
          type="number"
          min="1"
          step="1"
          required
          bind:value={sessionsPerPeriod}
        />
      </div>

      {#if mode === 'KELOMPOK'}
        <div class="field">
          <label for="f_maxStudents">Maks Siswa (untuk mode Kelompok)</label>
          <input
            id="f_maxStudents"
            type="number"
            min="1"
            step="1"
            bind:value={maxStudents}
          />
        </div>
      {/if}
    </div>

    <div class="field">
      <label for="f_active">Status Aktif</label>
      <select id="f_active" bind:value={active}>
        <option value={true}>Aktif</option>
        <option value={false}>Nonaktif</option>
      </select>
    </div>

    <div class="field">
      <label for="f_description">Deskripsi</label>
      <textarea
        id="f_description"
        rows="2"
        placeholder="Opsional"
        bind:value={description}
      ></textarea>
    </div>
  </form>

  <svelte:fragment slot="footer">
    <button type="button" class="btn btn-outline" on:click={onClose}>
      <Icon name="close" size="sm" /> Batal
    </button>
    <button type="submit" form="form-package" class="btn btn-primary">
      <Icon name="save" size="sm" /> {editingPackage ? 'Simpan Perubahan' : 'Tambah Paket'}
    </button>
  </svelte:fragment>
</Modal>
