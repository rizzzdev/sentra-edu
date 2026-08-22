<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import { Icon, Input } from '$lib/components/atoms';
  import {toastStore} from '$lib/shared/stores';
  import type { EducationLevel } from '$lib/shared/types';
  import { Button } from '$lib/components/atoms';
  import { api } from '$lib/api/client';
  import { educationLevelStore } from '$lib/api';

  let {
    open = false,
    editingLevel = null,
    onClose = () => {}
  }: {
    open?: boolean;
    editingLevel?: EducationLevel | null;
    onClose?: () => void;
  } = $props();

  let levelName = $state('');
  let description = $state('');
  let isSubmitting = $state(false);

  $effect(() => {
    if (editingLevel) {
      levelName = editingLevel.levelName;
      description = editingLevel.description || '';
    } else {
      levelName = '';
      description = '';
    }
  });

  async function handleSubmit() {
    if (!levelName.trim()) {
      toastStore.error('Nama jenjang wajib diisi.');
      return;
    }

    isSubmitting = true;
    const payload = {
      id: editingLevel ? editingLevel.id : undefined,
      levelName: levelName.trim(),
      description: description.trim()
    };

    const response = await api.educationLevels.create(payload);
    isSubmitting = false;
    if (!response.error) {
      toastStore.success(response.message || (editingLevel ? 'Jenjang berhasil diubah.' : 'Jenjang berhasil ditambahkan.'));
      await educationLevelStore.fetch();
      onClose();
    } else {
      toastStore.error(response.message || 'Gagal menyimpan data jenjang.');
    }
  }
</script>

<Modal {open} {onClose} title={editingLevel ? 'Ubah Jenjang' : 'Tambah Jenjang'} icon="school" maxWidth="480px">
  <form id="form-level" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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

  {#snippet footer()}
    <Button variant="outline" onclick={onClose} icon="close">
      Batal
    </Button>
    <Button type="submit" variant="primary" form="form-level" icon="save">
      {editingLevel ? 'Simpan Perubahan' : 'Tambah Jenjang'}
    </Button>
  {/snippet}
</Modal>
