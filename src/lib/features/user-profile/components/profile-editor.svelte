<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { User } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import { ROLE_LABEL } from '$lib/shared/utils/status-map';

  export let currentUser: User;

  let fullName: string = currentUser.fullName;
  let email: string = currentUser.email;
  let phone: string = currentUser.phone || '';
  let password: string = currentUser.password || '';
  let position: string = currentUser.position || '';
  let education: string = currentUser.education || '';
  let experienceYears: number = currentUser.experienceYears || 0;
  let school: string = currentUser.school || '';
  let address: string = currentUser.address || '';
  let subjectIds: string[] = currentUser.subjectIds || [];
  let levelIds: string[] = currentUser.levelIds || [];

  $: initials = currentUser.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'U';

  function toggleSubject(id: string) {
    if (subjectIds.includes(id)) {
      subjectIds = subjectIds.filter((s) => s !== id);
    } else {
      subjectIds = [...subjectIds, id];
    }
  }

  function toggleLevel(id: string) {
    if (levelIds.includes(id)) {
      levelIds = levelIds.filter((l) => l !== id);
    } else {
      levelIds = [...levelIds, id];
    }
  }

  function handleSave() {
    if (!fullName.trim() || !email.trim()) {
      toastStore.error('Nama dan email wajib diisi.');
      return;
    }

    const payload: Partial<User> & { fullName: string; email: string } = {
      id: currentUser.id,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      position: position.trim() || undefined,
      education: education.trim() || undefined,
      experienceYears: Number(experienceYears),
      school: school.trim() || undefined,
      address: address.trim() || undefined,
      subjectIds,
      levelIds
    };

    const response = dbStore.saveUser(payload);
    if (!response.error) {
      toastStore.success('Profil akun Anda berhasil diperbarui.');
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<div class="card">
  <div class="card-body flex items-center gap-3.5">
    <div class="avatar w-12 h-12 text-[1.1rem]">{initials}</div>
    <div>
      <div class="font-bold text-base">{currentUser.fullName}</div>
      <div class="text-muted-fg text-[0.82rem]">{currentUser.email}</div>
      <div class="mt-1">
        <span class="badge b-admin">{ROLE_LABEL[currentUser.role] || currentUser.role}</span>
      </div>
    </div>
  </div>
</div>

<div class="card">
  <div class="card-head"><Icon name="edit" size="md" /> Ubah Data Diri</div>
  <div class="card-body">
    <div class="form-grid">
      <div class="field">
        <label for="f_fullName">Nama Lengkap <i class="req">*</i></label>
        <Input id="f_fullName" type="text" required bind:value={fullName} />
      </div>

      <div class="field">
        <label for="f_email">Email <i class="req">*</i></label>
        <Input id="f_email" type="email" required bind:value={email} />
      </div>
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_phone">Telepon / WA</label>
        <Input id="f_phone" type="tel" bind:value={phone} />
      </div>

      <div class="field">
        <label for="f_password">Kata Sandi</label>
        <Input id="f_password" type="password" placeholder="••••••••" bind:value={password} />
      </div>
    </div>

    {#if currentUser.role === 'SUPER_ADMIN'}
      <div class="field">
        <label for="f_position">Jabatan Operasional</label>
        <Input id="f_position" type="text" bind:value={position} />
      </div>
    {:else if currentUser.role === 'TENTOR'}
      <div class="form-grid">
        <div class="field">
          <label for="f_education">Kualifikasi Pendidikan</label>
          <Input id="f_education" type="text" bind:value={education} />
        </div>
        <div class="field">
          <label for="f_experienceYears">Pengalaman Mengajar (Tahun)</label>
          <Input id="f_experienceYears" type="number" min="0" bind:value={experienceYears} />
        </div>
      </div>

      <div class="field">
        <div class="text-[0.82rem] font-semibold mb-1.5">Mata Pelajaran yang Diampu</div>
        <div class="multi-group">
          {#each $dbStore.subjects.filter((s) => s.deletedAt === null) as s}
            <label class="multi-opt">
              <input type="checkbox" checked={subjectIds.includes(s.id)} on:change={() => toggleSubject(s.id)} />
              {s.name}
            </label>
          {/each}
        </div>
      </div>

      <div class="field">
        <div class="text-[0.82rem] font-semibold mb-1.5">Jenjang yang Dikuasai</div>
        <div class="multi-group">
          {#each $dbStore.educationLevels.filter((l) => l.deletedAt === null) as l}
            <label class="multi-opt">
              <input type="checkbox" checked={levelIds.includes(l.id)} on:change={() => toggleLevel(l.id)} />
              {l.levelName}
            </label>
          {/each}
        </div>
      </div>
    {:else if currentUser.role === 'STUDENT'}
      <div class="field">
        <label for="f_school">Asal Sekolah</label>
        <Input id="f_school" type="text" bind:value={school} />
      </div>
    {/if}

    <div class="field">
      <label for="f_address">Alamat Domisili</label>
      <Input id="f_address" type="text" bind:value={address} />
    </div>

    <div class="flex justify-end pt-2 border-t border-border">
      <Button variant="primary" on:click={handleSave} icon="save">
        Simpan Profil
      </Button>
    </div>
  </div>
</div>
