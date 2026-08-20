<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { RecruitmentCandidate } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';

  export let open: boolean = false;
  export let editingCandidate: RecruitmentCandidate | null = null;
  export let onClose: () => void = () => {};

  let fullName: string = '';
  let email: string = '';
  let phone: string = '';
  let education: string = '';
  let experienceYears: number = 0;
  let subjectIds: string[] = [];
  let levelIds: string[] = [];
  let source: string = 'Media Sosial';

  $: if (editingCandidate) {
    fullName = editingCandidate.fullName;
    email = editingCandidate.email;
    phone = editingCandidate.phone || '';
    education = editingCandidate.education || '';
    experienceYears = editingCandidate.experienceYears || 0;
    subjectIds = editingCandidate.subjectIds || [];
    levelIds = editingCandidate.levelIds || [];
    source = editingCandidate.source || 'Media Sosial';
  } else {
    fullName = '';
    email = '';
    phone = '';
    education = '';
    experienceYears = 0;
    subjectIds = [];
    levelIds = [];
    source = 'Media Sosial';
  }

  function handleToggleSubject(targetSubjectId: string) {
    if (subjectIds.includes(targetSubjectId)) {
      subjectIds = subjectIds.filter((subjectId) => subjectId !== targetSubjectId);
    } else {
      subjectIds = [...subjectIds, targetSubjectId];
    }
  }

  function handleToggleLevel(targetLevelId: string) {
    if (levelIds.includes(targetLevelId)) {
      levelIds = levelIds.filter((levelId) => levelId !== targetLevelId);
    } else {
      levelIds = [...levelIds, targetLevelId];
    }
  }

  function handleSubmit() {
    if (!fullName.trim() || !email.trim()) {
      toastStore.error('Nama lengkap dan email wajib diisi.');
      return;
    }

    if (subjectIds.length === 0) {
      toastStore.error('Pilih setidaknya satu mata pelajaran.');
      return;
    }

    if (levelIds.length === 0) {
      toastStore.error('Pilih setidaknya satu jenjang.');
      return;
    }

    const payload: Partial<RecruitmentCandidate> & { fullName: string; email: string; phone: string } = {
      id: editingCandidate ? editingCandidate.id : undefined,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      education: education.trim(),
      experienceYears: Number(experienceYears),
      subjectIds,
      levelIds,
      source
    };

    const response = dbStore.saveCandidate(payload);
    if (!response.error) {
      toastStore.success(response.message);
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title={editingCandidate ? 'Ubah Kandidat' : 'Daftarkan Kandidat'} icon="person_add" maxWidth="620px">
  <form id="form-candidate" on:submit|preventDefault={handleSubmit}>
    <div class="field">
      <label for="f_fullName">Nama Lengkap <i class="req">*</i></label>
      <Input
        id="f_fullName"
        type="text"
        placeholder="cth: Fajar Ramadhan"
        required
        bind:value={fullName}
      />
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_email">Email <i class="req">*</i></label>
        <Input
          id="f_email"
          type="email"
          placeholder="calon@email.com"
          required
          bind:value={email}
        />
      </div>

      <div class="field">
        <label for="f_phone">Telepon</label>
        <Input
          id="f_phone"
          type="tel"
          placeholder="08xx-xxxx-xxxx"
          bind:value={phone}
        />
      </div>
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_education">Pendidikan Terakhir</label>
        <Input
          id="f_education"
          type="text"
          placeholder="cth: S1 Pendidikan Matematika"
          bind:value={education}
        />
      </div>

      <div class="field">
        <label for="f_experienceYears">Pengalaman Mengajar (tahun)</label>
        <Input
          id="f_experienceYears"
          type="number"
          min="0"
          step="1"
          bind:value={experienceYears}
        />
      </div>
    </div>

    <div class="field">
      <div class="text-xs font-semibold mb-1.5">
        Mapel yang Bisa Diajar (boleh lebih dari satu) <i class="req">*</i>
      </div>
      <div class="multi-group">
        {#each $dbStore.subjects.filter((subjectItem) => subjectItem.deletedAt === null) as subjectItem}
          <label class="multi-opt">
            <input
              type="checkbox"
              value={subjectItem.id}
              checked={subjectIds.includes(subjectItem.id)}
              on:change={() => handleToggleSubject(subjectItem.id)}
            /> {subjectItem.name}
          </label>
        {/each}
      </div>
    </div>

    <div class="field">
      <div class="text-xs font-semibold mb-1.5">
        Jenjang yang Bisa Diajar (boleh lebih dari satu) <i class="req">*</i>
      </div>
      <div class="multi-group">
        {#each $dbStore.educationLevels.filter((levelItem) => levelItem.deletedAt === null) as levelItem}
          <label class="multi-opt">
            <input
              type="checkbox"
              value={levelItem.id}
              checked={levelIds.includes(levelItem.id)}
              on:change={() => handleToggleLevel(levelItem.id)}
            /> {levelItem.levelName}
          </label>
        {/each}
      </div>
    </div>

    <div class="field">
      <label for="f_source">Sumber Pendaftaran</label>
      <SelectSearch
        id="f_source"
        bind:value={source}
        options={[
          { value: 'Media Sosial', label: 'Media Sosial' },
          { value: 'Referensi', label: 'Referensi' },
          { value: 'Website', label: 'Website' },
          { value: 'Walk-in', label: 'Walk-in' },
          { value: 'Kampus', label: 'Kampus' },
          { value: 'Lainnya', label: 'Lainnya' }
        ]}
      />
    </div>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={onClose} icon="close">
      Batal
    </Button>
    <Button type="submit" variant="primary" form="form-candidate" icon="save">
      {editingCandidate ? 'Simpan Perubahan' : 'Daftarkan Kandidat'}
    </Button>
  </svelte:fragment>
</Modal>
