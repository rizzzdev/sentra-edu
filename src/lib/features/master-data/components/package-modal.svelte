<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { PackagePlan } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import CurrencyInput from '$lib/components/atoms/currency-input.svelte';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';

  export let open: boolean = false;
  export let editingPackage: PackagePlan | null = null;
  export let onClose: () => void = () => {};

  let name: string = '';
  let mode: string = 'PRIVATE';
  let period: string = 'BULANAN';
  let price: number = 1000000;
  let tentorFee: number = 100000;
  let sessionsPerPeriod: number = 8;
  let maxStudents: number = 5;
  let activeStr: string = 'true';
  let description: string = '';

  $: if (editingPackage) {
    name = editingPackage.name;
    mode = editingPackage.mode;
    period = editingPackage.period;
    price = editingPackage.price;
    tentorFee = editingPackage.tentorFee;
    sessionsPerPeriod = editingPackage.sessionsPerPeriod;
    maxStudents = editingPackage.maxStudents;
    activeStr = String(editingPackage.active);
    description = editingPackage.description || '';
  } else {
    name = '';
    mode = 'PRIVATE';
    period = 'BULANAN';
    price = 1000000;
    tentorFee = 100000;
    sessionsPerPeriod = 8;
    maxStudents = 5;
    activeStr = 'true';
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
      mode: mode as 'PRIVATE' | 'KELOMPOK',
      period: period as 'BULANAN' | 'HARIAN',
      price: Number(price),
      tentorFee: Number(tentorFee),
      sessionsPerPeriod: Number(sessionsPerPeriod),
      maxStudents: Number(maxStudents),
      active: activeStr === 'true',
      description: description.trim()
    };

    const response = dbStore.savePackagePlan(payload);
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
      <Input
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
        <SelectSearch
          id="f_mode"
          required
          bind:value={mode}
          options={[
            { value: 'PRIVATE', label: 'Private (1 guru : 1 siswa)' },
            { value: 'KELOMPOK', label: 'Kelompok (1 guru : beberapa siswa)' }
          ]}
        />
      </div>

      <div class="field">
        <label for="f_period">Periode Tagihan <i class="req">*</i></label>
        <SelectSearch
          id="f_period"
          required
          bind:value={period}
          options={[
            { value: 'BULANAN', label: 'Bulanan (tagihan flat per bulan)' },
            { value: 'HARIAN', label: 'Harian (tagihan per sesi)' }
          ]}
        />
      </div>
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_price">Biaya Wali Murid (Rp) <i class="req">*</i></label>
        <CurrencyInput
          id="f_price"
          bind:value={price}
        />
        <div class="help">Harga paket yang dibayar wali murid (SPP).</div>
      </div>

      <div class="field">
        <label for="f_tentorFee">Honor Tentor per Sesi (Rp) <i class="req">*</i></label>
        <CurrencyInput
          id="f_tentorFee"
          bind:value={tentorFee}
        />
        <div class="help">Yang diterima tentor per sesi (sudah termasuk transport).</div>
      </div>
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_sessionsPerPeriod">Jumlah Sesi per Periode <i class="req">*</i></label>
        <Input
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
          <Input
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
      <SelectSearch
        id="f_active"
        bind:value={activeStr}
        options={[
          { value: 'true', label: 'Aktif' },
          { value: 'false', label: 'Nonaktif' }
        ]}
      />
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
    <Button variant="outline" on:click={onClose} icon="close">
      Batal
    </Button>
    <Button type="submit" variant="primary" form="form-package" icon="save">
      {editingPackage ? 'Simpan Perubahan' : 'Tambah Paket'}
    </Button>
  </svelte:fragment>
</Modal>
