<!-- svelte-options runes=false -->
<script lang="ts">
  import { page } from '$app/stores';
  import { Icon, Input } from '$lib/components/atoms';
  import {themeStore} from '$lib/shared/stores';
  import { goto } from '$app/navigation';
  import type { User } from '$lib/shared/types';
  import { Button } from '$lib/components/atoms';

  $: token = $page.url.searchParams.get('token') || '';

  // Stepper State: Step 1 (Student Data) -> Step 2 (Orang Tua Data)
  let currentStep: 1 | 2 = 1;

  // Student Form Fields
  let studentFullName: string = '';
  let studentEmail: string = '';
  let studentPassword: string = '';
  let studentPhone: string = '';
  let school: string = '';

  // Orang Tua Form Fields
  let isExistingParent: boolean = false;
  let parentFullName: string = '';
  let parentEmail: string = '';
  let parentPassword: string = '';
  let parentPhone: string = '';
  let parentOccupation: string = '';
  let address: string = '';

  let errorMessage: string | null = null;
  let createdAccounts: { student: User; parent: User } | null = null;

  let tokenValidation: { valid: boolean; message: string; magicLink: any; isLoading: boolean } = { valid: false, message: 'Memuat token...', magicLink: null, isLoading: true };

  async function validateMagicTokenValue(tokenStr: string) {
    const response = await fetch(`/api/magic-links?token=${tokenStr}`);
    const result = await response.json();
    if (!result.error && result.data && result.data.length > 0) {
      const link = result.data[0];
      const expired = new Date(link.expiresAt) < new Date();
      tokenValidation = {
        valid: link.active && !expired && link.targetRole === 'STUDENT',
        message: expired ? 'Token telah kadaluarsa.' : (!link.active ? 'Token tidak aktif.' : ''),
        magicLink: link,
        isLoading: false
      };
    } else {
      tokenValidation = { valid: false, message: 'Token pendaftaran tidak ditemukan.', magicLink: null, isLoading: false };
    }
  }

  import { onMount } from 'svelte';
  onMount(() => { if (token) validateMagicTokenValue(token); });

  function handleNextToStep2() {
    errorMessage = null;
    if (!studentFullName.trim()) {
      errorMessage = 'Nama lengkap siswa wajib diisi.';
      return;
    }
    if (!studentEmail.trim()) {
      errorMessage = 'Email akun siswa wajib diisi.';
      return;
    }
    if (!studentPassword || studentPassword.length < 4) {
      errorMessage = 'Password akun siswa minimal 4 karakter.';
      return;
    }
    currentStep = 2;
  }

  async function handleRegister() {
    errorMessage = null;
    createdAccounts = null;

    if (!parentEmail.trim()) {
      errorMessage = 'Email orang tua wajib diisi.';
      return;
    }

    if (!isExistingParent) {
      if (!parentFullName.trim()) {
        errorMessage = 'Nama lengkap orang tua wajib diisi.';
        return;
      }
      if (!parentPassword || parentPassword.length < 4) {
        errorMessage = 'Password akun orang tua minimal 4 karakter.';
        return;
      }
    }

    if (studentEmail.trim().toLowerCase() === parentEmail.trim().toLowerCase()) {
      errorMessage = 'Email siswa dan email orang tua harus berbeda.';
      return;
    }

    const response = await fetch('/api/auth/register-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
      token,
      studentFullName: studentFullName.trim(),
      studentEmail: studentEmail.trim(),
      studentPassword,
      studentPhone: studentPhone.trim(),
      school: school.trim(),
      address: address.trim(),
      isExistingParent,
      parentFullName: parentFullName.trim(),
      parentEmail: parentEmail.trim(),
      parentPassword,
      parentPhone: parentPhone.trim(),
      parentOccupation: parentOccupation.trim()
    })
    });
    const result = await response.json();

    if (result.error || !result.data) {
      errorMessage = result.message;
    } else {
      createdAccounts = result.data;
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center p-6 sm:p-8 bg-bg">
  <div class="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-md p-8">

    <!-- Brand Header -->
    <div class="flex items-center gap-2.5 font-extrabold text-lg mb-4">
      <img
        class="w-9 h-9 rounded-xl object-cover"
        src="/logo-sentraedu.jpg"
        alt="SentraEdu"
      />
      <span class="brand-name font-extrabold">
        <span class="text-primary">Sentra</span><span class="text-accent">Edu</span>
      </span>
    </div>

    <!-- Title & Theme Toggle -->
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl font-bold flex items-center gap-2">
        <Icon name="how_to_reg" filled={true} />
        {tokenValidation.magicLink?.title || 'Pendaftaran Siswa Baru'}
      </h1>
      <Button
        variant="ghost"
        isIconOnly
        size="md"
        ariaLabel="Ganti tema"
        icon={$themeStore === 'dark' ? 'light_mode' : 'dark_mode'}
        on:click={themeStore.toggleTheme}
      />
    </div>

    <p class="text-muted-fg text-sm my-2 mb-4.5">
      Lengkapi formulir 2 langkah di bawah ini untuk mendaftar.
    </p>

    {#if createdAccounts}
      <!-- SUCCESS DUAL-ACCOUNT STATE -->
      <div class="flex flex-col items-center gap-5 text-center py-4">
        <div class="w-20 h-20 rounded-full bg-success-soft text-success flex items-center justify-center shadow-inner">
          <Icon name="check_circle" size="xl" />
        </div>
        <div>
          <h2 class="text-xl font-extrabold">Pendaftaran Berhasil!</h2>
          <p class="text-muted-fg text-sm mt-1.5">
            {#if isExistingParent}
              Siswa <strong>{createdAccounts.student.fullName}</strong> berhasil didaftarkan dan ditautkan ke Orang Tua <strong>{createdAccounts.parent.fullName}</strong>.
            {:else}
              Akun Siswa & Akun Orang Tua Baru telah berhasil dibuat.
            {/if}
            <br/><span class="text-warn font-semibold">Akun Anda sedang menunggu verifikasi dari admin sebelum bisa digunakan.</span>
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left my-2">
          <div class="p-3.5 bg-primary-soft rounded-xl">
            <div class="flex items-center gap-1.5 text-primary font-bold text-xs">
              <Icon name="school" size="xs" /> Akun Siswa
            </div>
            <div class="font-bold text-sm mt-1 truncate">{createdAccounts.student.fullName}</div>
            <div class="text-muted-fg text-xs font-mono truncate">{createdAccounts.student.email}</div>
          </div>

          <div class="p-3.5 bg-accent-soft rounded-xl">
            <div class="flex items-center gap-1.5 text-accent-strong font-bold text-xs">
              <Icon name="family_restroom" size="xs" /> Akun Orang Tua
            </div>
            <div class="font-bold text-sm mt-1 truncate">{createdAccounts.parent.fullName}</div>
            <div class="text-muted-fg text-xs font-mono truncate">{createdAccounts.parent.email}</div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          icon="login"
          on:click={() => goto('/login')}
        >
          Masuk ke Halaman Login
        </Button>
      </div>

    {:else if tokenValidation.isLoading}
      <!-- LOADING STATE -->
      <div class="flex flex-col items-center gap-4 text-center py-12">
        <div class="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin"></div>
        <p class="text-muted-fg text-sm font-medium">Memverifikasi tautan pendaftaran...</p>
      </div>

    {:else if !tokenValidation.valid}
      <!-- INVALID / EXPIRED LINK STATE -->
      <div class="flex flex-col items-center gap-4 text-center py-8">
        <div class="w-20 h-20 rounded-full bg-danger-soft text-danger flex items-center justify-center">
          <Icon name="history_toggle_off" size="xl" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-danger">Magic Link Tidak Valid / Kadaluarsa</h2>
          <p class="text-muted-fg text-sm mt-1.5">
            {tokenValidation.message}
          </p>
        </div>
        <Button
          variant="outline"
          fullWidth
          on:click={() => goto('/login')}
        >
          Kembali ke Halaman Login
        </Button>
      </div>

    {:else}
      <!-- NUMBERED CIRCLE STEPPER -->
      <div class="flex items-center justify-center max-w-xs mx-auto mb-7">
        <div class="flex items-center justify-center w-11 h-11 rounded-full border-2 font-extrabold text-lg transition-all {currentStep >= 1 ? 'border-primary text-primary bg-surface shadow-sm ring-4 ring-primary/10' : 'border-border text-muted-fg bg-muted'}">
          1
        </div>

        <div class="flex-1 h-0.5 mx-3 transition-colors {currentStep >= 2 ? 'bg-primary' : 'bg-border'}"></div>

        <div class="flex items-center justify-center w-11 h-11 rounded-full border-2 font-extrabold text-lg transition-all {currentStep === 2 ? 'border-primary text-primary bg-surface shadow-sm ring-4 ring-primary/10' : 'border-border text-muted-fg bg-muted'}">
          2
        </div>
      </div>

      {#if currentStep === 1}
        <!-- STEP 1: DATA SISWA -->
        <form on:submit|preventDefault={handleNextToStep2} novalidate>
          <div class="pb-2 mb-3 border-b border-border">
            <h3 class="text-base font-bold">Mari kita mulai dari Data Siswa.</h3>
            <p class="text-muted-fg text-xs mt-0.5">Isi rincian data calon siswa yang akan didaftarkan.</p>
          </div>

          <div class="field">
            <label for="reg-stu-name">Nama Lengkap Siswa <i class="req">*</i></label>
            <Input
              type="text"
              id="reg-stu-name"
              placeholder="misal: Raka Pratama"
              bind:value={studentFullName}
              required
            />
          </div>

          <div class="field">
            <label for="reg-stu-email">Email Login Siswa <i class="req">*</i></label>
            <Input
              type="email"
              id="reg-stu-email"
              placeholder="siswa@sentraedu.id"
              bind:value={studentEmail}
              required
            />
          </div>

          <div class="field">
            <label for="reg-stu-password">Password Akun Siswa <i class="req">*</i></label>
            <Input
              type="password"
              id="reg-stu-password"
              placeholder="••••••••"
              bind:value={studentPassword}
              required
            />
          </div>

          <div class="form-grid">
            <div class="field">
              <label for="reg-stu-phone">No. HP / WhatsApp Siswa</label>
              <Input
                type="text"
                id="reg-stu-phone"
                placeholder="081234567890"
                bind:value={studentPhone}
              />
            </div>

            <div class="field">
              <label for="reg-stu-school">Sekolah / Instansi</label>
              <Input
                type="text"
                id="reg-stu-school"
                placeholder="misal: SMAN 1 Jakarta"
                bind:value={school}
              />
            </div>
          </div>

          {#if errorMessage}
            <div class="form-error block">
              {errorMessage}
            </div>
          {/if}

          <div class="mt-3">
            <Button type="submit" variant="primary" fullWidth icon="arrow_forward">
              SELANJUTNYA
            </Button>
          </div>
        </form>

      {:else}
        <!-- STEP 2: DATA ORANG TUA -->
        <form on:submit|preventDefault={handleRegister} novalidate>
          <div class="pb-2 mb-3 border-b border-border">
            <h3 class="text-base font-bold">Selanjutnya, Data Orang Tua.</h3>
            <p class="text-muted-fg text-xs mt-0.5">Pilih status akun orang tua untuk penautan.</p>
          </div>

          <!-- Radio Choice Selector -->
          <div class="grid grid-cols-2 gap-2.5 mb-3.5">
            <label
              class="flex items-center justify-center text-center px-3.5 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all {isExistingParent === false ? 'border-primary bg-primary-soft text-primary-strong' : 'border-border bg-surface text-muted-fg hover:bg-muted'}"
            >
              <input
                type="radio"
                name="parent-mode"
                class="sr-only"
                checked={isExistingParent === false}
                on:change={() => { isExistingParent = false; }}
              />
              Orang Tua Baru (Buat Akun)
            </label>

            <label
              class="flex items-center justify-center text-center px-3.5 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all {isExistingParent === true ? 'border-primary bg-primary-soft text-primary-strong' : 'border-border bg-surface text-muted-fg hover:bg-muted'}"
            >
              <input
                type="radio"
                name="parent-mode"
                class="sr-only"
                checked={isExistingParent === true}
                on:change={() => { isExistingParent = true; }}
              />
              Orang Tua Sudah Punya Akun
            </label>
          </div>

          {#if isExistingParent}
            <div class="field">
              <label for="reg-existing-parent-email">Email Akun Orang Tua Terdaftar <i class="req">*</i></label>
              <Input
                type="email"
                id="reg-existing-parent-email"
                placeholder="Masukkan email orang tua terdaftar..."
                bind:value={parentEmail}
                required
              />
              <span class="help">Siswa ini akan ditautkan secara otomatis ke akun Orang Tua tersebut.</span>
            </div>
          {:else}
            <div class="field">
              <label for="reg-parent-name">Nama Lengkap Orang Tua <i class="req">*</i></label>
              <Input
                type="text"
                id="reg-parent-name"
                placeholder="Nama ayah / ibu..."
                bind:value={parentFullName}
                required
              />
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="reg-parent-email">Email Login Orang Tua <i class="req">*</i></label>
                <Input
                  type="email"
                  id="reg-parent-email"
                  placeholder="parent@sentraedu.id"
                  bind:value={parentEmail}
                  required
                />
              </div>

              <div class="field">
                <label for="reg-parent-password">Password Akun Orang Tua <i class="req">*</i></label>
                <Input
                  type="password"
                  id="reg-parent-password"
                  placeholder="••••••••"
                  bind:value={parentPassword}
                  required
                />
              </div>
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="reg-parent-phone">No. HP / WhatsApp Orang Tua</label>
                <Input
                  type="text"
                  id="reg-parent-phone"
                  placeholder="081298765432"
                  bind:value={parentPhone}
                />
              </div>

              <div class="field">
                <label for="reg-parent-occ">Pekerjaan Orang Tua</label>
                <Input
                  type="text"
                  id="reg-parent-occ"
                  placeholder="misal: Wirausaha"
                  bind:value={parentOccupation}
                />
              </div>
            </div>

            <div class="field">
              <label for="reg-address">Alamat Tempat Tinggal</label>
              <Input
                type="text"
                id="reg-address"
                placeholder="Alamat lengkap rumah..."
                bind:value={address}
              />
            </div>
          {/if}

          {#if errorMessage}
            <div class="form-error block">
              {errorMessage}
            </div>
          {/if}

          <div class="flex items-center gap-2.5 mt-3.5">
            <Button
              variant="outline"
              isIconOnly
              on:click={() => { currentStep = 1; }}
              icon="arrow_back"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              icon="how_to_reg"
            >
              SELESAI & DAFTARKAN
            </Button>
          </div>
        </form>
      {/if}

    {/if}

  </div>
</div>
