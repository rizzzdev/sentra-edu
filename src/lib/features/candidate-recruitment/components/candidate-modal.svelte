<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { RecruitmentCandidate } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';

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
    source = (editingCandidate as any).source || 'Media Sosial';
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

  function handleToggleSubject(id: string) {
    if (subjectIds.includes(id)) {
      subjectIds = subjectIds.filter((s) => s !== id);
    } else {
      subjectIds = [...subjectIds, id];
    }
  }

  function handleToggleLevel(id: string) {
    if (levelIds.includes(id)) {
      levelIds = levelIds.filter((l) => l !== id);
    } else {
      levelIds = [...levelIds, id];
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

    const payload = {
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

    const response = dbStore.saveCandidate(payload as any);
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
      <div style="font-size:.82rem;font-weight:600;margin-bottom:5px">
        Mapel yang Bisa Diajar (boleh lebih dari satu) <i class="req">*</i>
      </div>
      <div class="multi-group">
        {#each $dbStore.subjects.filter((s) => s.deletedAt === null) as s}
          <label class="multi-opt">
            <input
              type="checkbox"
              value={s.id}
              checked={subjectIds.includes(s.id)}
              on:change={() => handleToggleSubject(s.id)}
            /> {s.name}
          </label>
        {/each}
      </div>
    </div>

    <div class="field">
      <div style="font-size:.82rem;font-weight:600;margin-bottom:5px">
        Jenjang yang Bisa Diajar (boleh lebih dari satu) <i class="req">*</i>
      </div>
      <div class="multi-group">
        {#each $dbStore.educationLevels.filter((l) => l.deletedAt === null) as l}
          <label class="multi-opt">
            <input
              type="checkbox"
              value={l.id}
              checked={levelIds.includes(l.id)}
              on:change={() => handleToggleLevel(l.id)}
            /> {l.levelName}
          </label>
        {/each}
      </div>
    </div>

    <div class="field">
      <label for="f_source">Sumber Pendaftaran</label>
      <select id="f_source" bind:value={source}>
        <option value="Media Sosial">Media Sosial</option>
        <option value="Referensi">Referensi</option>
        <option value="Website">Website</option>
        <option value="Walk-in">Walk-in</option>
        <option value="Kampus">Kampus</option>
        <option value="Lainnya">Lainnya</option>
      </select>
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
