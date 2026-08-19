<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { Subject } from '$lib/shared/types/common.types';

  export let open: boolean = false;
  export let editingSubject: Subject | null = null;
  export let onClose: () => void = () => {};

  let name: string = '';
  let description: string = '';

  $: if (editingSubject) {
    name = editingSubject.name;
    description = editingSubject.description || '';
  } else {
    name = '';
    description = '';
  }

  function handleSubmit() {
    if (!name.trim()) {
      toastStore.error('Nama mata pelajaran wajib diisi.');
      return;
    }

    const payload = {
      id: editingSubject ? editingSubject.id : undefined,
      name: name.trim(),
      description: description.trim()
    };

    const response = dbStore.saveSubject(payload);
    if (!response.error) {
      toastStore.success(response.message);
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title={editingSubject ? 'Ubah Mapel' : 'Tambah Mapel'} icon="menu_book" maxWidth="480px">
  <form id="form-subject" on:submit|preventDefault={handleSubmit}>
    <div class="field">
      <label for="f_name">Nama Mapel <i class="req">*</i></label>
      <input
        id="f_name"
        type="text"
        placeholder="cth: Matematika"
        required
        bind:value={name}
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
    <button type="submit" form="form-subject" class="btn btn-primary">
      <Icon name="save" size="sm" /> {editingSubject ? 'Simpan Perubahan' : 'Tambah Mapel'}
    </button>
  </svelte:fragment>
</Modal>
