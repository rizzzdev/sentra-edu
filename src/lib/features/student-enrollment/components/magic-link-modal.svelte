<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import Modal from '$lib/components/molecules/modal.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { MagicLinkRegistration } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';
  import { MagicLinkSchema } from '$lib/features/student-enrollment/schemas/student-enrollment.schema';
  import { ZodError } from 'zod';

  export let open: boolean = false;
  export let defaultRole: 'STUDENT' | 'TENTOR' = 'STUDENT';
  export let onClose: () => void = () => {};

  let targetRole: 'STUDENT' | 'TENTOR' = 'STUDENT';
  let title: string = 'Pendaftaran Murid Baru';
  let daysValid: number = 7;
  let selectedClassId: string = '';
  let selectedPackageId: string = '';

  let generatedLink: MagicLinkRegistration | null = null;
  let copied: boolean = false;

  $: if (open) {
    targetRole = defaultRole;
    if (defaultRole === 'TENTOR') {
      title = 'Pendaftaran Tentor / Mentor Baru';
    } else {
      title = 'Pendaftaran Murid Baru';
    }
  }

  function handleCreate() {
    try {
      const payload = MagicLinkSchema.parse({
        title: title.trim(),
        daysValid,
        targetRole,
        classId: selectedClassId || undefined,
        packageId: selectedPackageId || undefined,
      });

      const response = dbStore.createMagicLink(payload);

      if (!response.error && response.data) {
        generatedLink = response.data;
        toastStore.success(response.message);
      } else {
        toastStore.error(response.message);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        toastStore.error(error.errors[0].message);
      } else {
        toastStore.error('Terjadi kesalahan validasi data.');
      }
    }
  }

  function getFullMagicUrl(link: MagicLinkRegistration): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const basePath = link.targetRole === 'TENTOR' ? '/register-tutor' : '/register';
    return `${origin}${basePath}?token=${link.token}`;
  }

  function handleCopyUrl(url: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      copied = true;
      toastStore.success('Link pendaftaran berhasil disalin ke clipboard!');
      setTimeout(() => { copied = false; }, 2500);
    }
  }

  function handleReset() {
    generatedLink = null;
    copied = false;
    title = targetRole === 'TENTOR' ? 'Pendaftaran Tentor / Mentor Baru' : 'Pendaftaran Murid Baru';
    daysValid = 7;
    selectedClassId = '';
    selectedPackageId = '';
  }

  function handleCloseModal() {
    handleReset();
    onClose();
  }
</script>

<Modal {open} title={targetRole === 'TENTOR' ? 'Buat Magic Link Tentor / Mentor' : 'Buat Magic Link Pendaftaran Murid'} onClose={handleCloseModal}>
  {#if generatedLink}
    <!-- SUCCESS GENERATED STATE -->
    <div class="flex flex-col items-center gap-4 text-center py-3">
      <div class="w-14 h-14 rounded-full bg-success-soft text-success flex items-center justify-center">
        <Icon name="check_circle" size="xl" />
      </div>
      <div>
        <h4 class="font-bold text-lg">Magic Link {targetRole === 'TENTOR' ? 'Tentor' : 'Murid'} Berhasil Dibuat!</h4>
        <p class="text-muted-fg text-sm mt-1">
          Bagikan link berikut ke calon {targetRole === 'TENTOR' ? 'tentor/mentor' : 'murid/parent murid'}. Link berlaku selama <strong>{generatedLink.daysValid} hari</strong> (kadaluarsa: {new Date(generatedLink.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}).
        </p>
      </div>

      <div class="w-full bg-muted p-3.5 rounded-xl border border-border flex flex-col gap-2">
        <span class="text-xs font-bold text-muted-fg uppercase tracking-wider text-left">URL Pendaftaran</span>
        <div class="flex items-center gap-2">
          <Input
            type="text"
            readonly
            value={getFullMagicUrl(generatedLink)}
            className="flex-1 font-mono select-all"
          />
          <Button
            variant="primary"
            size="sm"
            className="flex-none"
            on:click={() => handleCopyUrl(getFullMagicUrl(generatedLink!))}
            icon={copied ? 'done' : 'content_copy'}
          >
            {copied ? 'Tersalin' : 'Salin'}
          </Button>
        </div>
      </div>

      <div class="flex justify-end gap-2.5 w-full mt-2">
        <Button variant="outline" on:click={handleReset} icon="add">
          Buat Link Lain
        </Button>
        <Button variant="primary" on:click={handleCloseModal}>
          Selesai
        </Button>
      </div>
    </div>
  {:else}
    <!-- FORM CREATION STATE -->
    <form on:submit|preventDefault={handleCreate} class="flex flex-col gap-5 py-2">
      <div class="field">
        <label for="ml-title">Judul Magic Link <i class="req">*</i></label>
        <Input
          type="text"
          id="ml-title"
          placeholder={targetRole === 'TENTOR' ? 'contoh: Pendaftaran Tentor Matematika - Batch 1' : 'contoh: Pendaftaran Murid Baru - Batch Agustus'}
          bind:value={title}
          required
        />
      </div>

      <div class="field">
        <label for="ml-days">Masa Kadaluarsa (Hari) <i class="req">*</i></label>
        <div class="flex items-center gap-3">
          <Input
            type="number"
            id="ml-days"
            min="1"
            max="365"
            bind:value={daysValid}
            required
            className="w-24 text-center"
          />
          <span class="text-sm font-semibold text-fg">Hari</span>
        </div>
        <div class="flex flex-wrap gap-2 mt-2">
          {#each [1, 3, 7, 14, 30] as dayOption}
            <Button
              variant={daysValid === dayOption ? 'primary' : 'outline'}
              className="rounded-xl px-3 py-1.5 text-xs h-auto shadow-2xs"
              on:click={() => { daysValid = dayOption; }}
            >
              {dayOption} Hari
            </Button>
          {/each}
        </div>
      </div>

      {#if targetRole === 'STUDENT'}
        <div class="form-grid">
          <div class="field">
            <label for="ml-class">Preset Jenjang/Kelas</label>
            <SelectSearch 
              id="ml-class" 
              bind:value={selectedClassId}
              options={[
                { value: '', label: '-- Semua Kelas (Terbuka) --' },
                ...$dbStore.classes.map((classItem) => ({ value: classItem.id, label: classItem.className }))
              ]}
            />
          </div>

          <div class="field">
            <label for="ml-package">Preset Paket Les</label>
            <SelectSearch 
              id="ml-package" 
              bind:value={selectedPackageId}
              options={[
                { value: '', label: '-- Tanpa Preset Paket --' },
                ...$dbStore.packages.map((packageItem) => ({ value: packageItem.id, label: `${packageItem.name} (${packageItem.mode})` }))
              ]}
            />
          </div>
        </div>
      {/if}

      <div class="modal-foot pt-3.5 border-t-0">
        <Button variant="outline" on:click={handleCloseModal}>
          Batal
        </Button>
        <Button type="submit" variant="primary" icon="link">
          Generasi Magic Link
        </Button>
      </div>
    </form>
  {/if}
</Modal>
