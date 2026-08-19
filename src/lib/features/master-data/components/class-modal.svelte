<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { ClassLevel } from '$lib/shared/types/common.types';

  export let open: boolean = false;
  export let editingClass: ClassLevel | null = null;
  export let onClose: () => void = () => {};

  let className: string = '';
  let educationLevelId: string = '';
  let baseRatePer90Min: number = 100000;
  let description: string = '';

  $: if (editingClass) {
    className = editingClass.className;
    educationLevelId = editingClass.educationLevelId;
    baseRatePer90Min = editingClass.baseRatePer90Min;
    description = editingClass.description || '';
  } else {
    className = '';
    educationLevelId = $dbStore.educationLevels.filter((l) => l.deletedAt === null)[0]?.id || '';
    baseRatePer90Min = 100000;
    description = '';
  }

  function handleSubmit() {
    if (!className.trim() || !educationLevelId) {
      toastStore.error('Nama kelas dan jenjang wajib diisi.');
      return;
    }

    const payload = {
      id: editingClass ? editingClass.id : undefined,
      className: className.trim(),
      educationLevelId,
      baseRatePer90Min: Number(baseRatePer90Min),
      description: description.trim()
    };

    const response = dbStore.saveClassLevel(payload);
    if (!response.error) {
      toastStore.success(response.message);
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title={editingClass ? 'Ubah Honor Kelas' : 'Tambah Kelas'} icon="school" maxWidth="500px">
  <form id="form-class" on:submit|preventDefault={handleSubmit}>
    <div class="field">
      <label for="f_className">Nama Kelas <i class="req">*</i></label>
      <input
        id="f_className"
        type="text"
        placeholder="cth: Kelas 10 SMA"
        required
        bind:value={className}
      />
    </div>

    <div class="field">
      <label for="f_educationLevelId">Jenjang <i class="req">*</i></label>
      <select id="f_educationLevelId" required bind:value={educationLevelId}>
        <option value="">— Pilih jenjang —</option>
        {#each $dbStore.educationLevels.filter((l) => l.deletedAt === null) as lvl}
          <option value={lvl.id}>{lvl.levelName}</option>
        {/each}
      </select>
    </div>

    <div class="field">
      <label for="f_baseRatePer90Min">Tarif Dasar / 90 Menit (Rp) <i class="req">*</i></label>
      <input
        id="f_baseRatePer90Min"
        type="number"
        min="0"
        step="5000"
        required
        bind:value={baseRatePer90Min}
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
    <button type="button" class="btn btn-outline" on:click={onClose}>
      <Icon name="close" size="sm" /> Batal
    </button>
    <button type="submit" form="form-class" class="btn btn-primary">
      <Icon name="save" size="sm" /> {editingClass ? 'Simpan Perubahan' : 'Tambah Kelas'}
    </button>
  </svelte:fragment>
</Modal>
