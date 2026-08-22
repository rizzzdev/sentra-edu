<script lang="ts">
import { educationLevelStore } from '$lib/api';
  import { SelectSearch } from '$lib/components/molecules';
  import Modal from '$lib/components/molecules/modal.svelte';
  import { Icon, Input } from '$lib/components/atoms';
  import {toastStore} from '$lib/shared/stores';
  import type { ClassLevel } from '$lib/shared/types';
  import { Button } from '$lib/components/atoms';
  import { api } from '$lib/api/client';

  let {
    open = false,
    editingClass = null,
    onClose = () => {}
  }: {
    open?: boolean;
    editingClass?: ClassLevel | null;
    onClose?: () => void;
  } = $props();

  let className = $state('');
  let educationLevelId = $state('');
  let description = $state('');

  $effect(() => {
    if (editingClass) {
      className = editingClass.className;
      educationLevelId = editingClass.educationLevelId;
      description = editingClass.description || '';
    } else {
      className = '';
      educationLevelId = $educationLevelStore.filter((levelItem) => levelItem.deletedAt === null)[0]?.id || '';
      description = '';
    }
  });

  async function handleSubmit() {
    if (!className.trim() || !educationLevelId) {
      toastStore.error('Nama kelas dan jenjang wajib diisi.');
      return;
    }

    const payload = {
      id: editingClass ? editingClass.id : undefined,
      className: className.trim(),
      educationLevelId,
      description: description.trim()
    };

    const response = await api.classes.create(payload);
    if (!response.error) {
      toastStore.success(response.message);
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title={editingClass ? 'Ubah Kelas' : 'Tambah Kelas'} icon="school" maxWidth="500px">
  <form id="form-class" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
    <div class="field">
      <label for="f_className">Nama Kelas <i class="req">*</i></label>
      <Input
        id="f_className"
        type="text"
        placeholder="cth: Kelas 10 SMA"
        required
        bind:value={className}
      />
    </div>

    <div class="field">
      <label for="f_educationLevelId">Jenjang <i class="req">*</i></label>
      <SelectSearch
        id="f_educationLevelId"
        required
        bind:value={educationLevelId}
        options={[
          { value: '', label: '— Pilih jenjang —' },
          ...$educationLevelStore.filter((levelItem) => levelItem.deletedAt === null).map((levelItem) => ({ value: levelItem.id, label: levelItem.levelName }))
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

  {#snippet footer()}
    <Button variant="outline" onclick={onClose} icon="close">
      Batal
    </Button>
    <Button type="submit" variant="primary" form="form-class" icon="save">
      {editingClass ? 'Simpan Perubahan' : 'Tambah Kelas'}
    </Button>
  {/snippet}
</Modal>
