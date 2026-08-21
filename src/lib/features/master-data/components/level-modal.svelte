<script lang="ts">
  import { Modal } from '$lib/components/molecules';
  import { Icon, Input } from '$lib/components/atoms';
  import {toastStore} from '$lib/shared/stores';
  import type { EducationLevel } from '$lib/shared/types';
  import { Button } from '$lib/components/atoms';
  import { api } from '$lib/api/client';

  export let open: boolean = false;
  export let editingLevel: EducationLevel | null = null;
  export let onClose: () => void = () => {};

  let levelName: string = '';
  let description: string = '';

  $: if (editingLevel) {
    levelName = editingLevel.levelName;
    description = editingLevel.description || '';
  } else {
    levelName = '';
    description = '';
  }

  async function handleSubmit() {
    if (!levelName.trim()) {
      toastStore.error('Nama jenjang wajib diisi.');
      return;
    }

    const payload = {
      id: editingLevel ? editingLevel.id : undefined,
      levelName: levelName.trim(),
      description: description.trim()
    };

    const response = await api.educationLevels.create(payload);
    if (!response.error) {
      toastStore.success(response.message);
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title={editingLevel ? 'Ubah Jenjang' : 'Tambah Jenjang'} icon="school" maxWidth="480px">
  <form id="form-level" on:submit|preventDefault={handleSubmit}>
    <div class="field">
      <label for="f_levelName">Nama Jenjang <i class="req">*</i></label>
      <Input
        id="f_levelName"
        type="text"
        placeholder="cth: SD, SMP, SMA"
        required
        bind:value={levelName}
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
    <Button type="submit" variant="primary" form="form-level" icon="save">
      {editingLevel ? 'Simpan Perubahan' : 'Tambah Jenjang'}
    </Button>
  </svelte:fragment>
</Modal>
