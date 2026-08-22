<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import { Icon, Input } from '$lib/components/atoms';
  import {toastStore} from '$lib/shared/stores';
  import type { Subject } from '$lib/shared/types';
  import { Button } from '$lib/components/atoms';
  import { api } from '$lib/api/client';

  let {
    open = false,
    editingSubject = null,
    onClose = () => {}
  }: {
    open?: boolean;
    editingSubject?: Subject | null;
    onClose?: () => void;
  } = $props();

  let name = $state('');
  let description = $state('');

  $effect(() => {
    if (editingSubject) {
      name = editingSubject.name;
      description = editingSubject.description || '';
    } else {
      name = '';
      description = '';
    }
  });

  async function handleSubmit() {
    if (!name.trim()) {
      toastStore.error('Nama mata pelajaran wajib diisi.');
      return;
    }

    const payload = {
      id: editingSubject ? editingSubject.id : undefined,
      name: name.trim(),
      description: description.trim()
    };

    const response = await api.subjects.create(payload);
    if (!response.error) {
      toastStore.success(response.message);
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title={editingSubject ? 'Ubah Mapel' : 'Tambah Mapel'} icon="menu_book" maxWidth="480px">
  <form id="form-subject" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
    <div class="field">
      <label for="f_name">Nama Mapel <i class="req">*</i></label>
      <Input
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

  {#snippet footer()}
    <Button variant="outline" onclick={onClose} icon="close">
      Batal
    </Button>
    <Button type="submit" variant="primary" form="form-subject" icon="save">
      {editingSubject ? 'Simpan Perubahan' : 'Tambah Mapel'}
    </Button>
  {/snippet}
</Modal>
