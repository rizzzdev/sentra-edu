<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { themeStore } from '$lib/shared/stores/theme-store';
  import { goto } from '$app/navigation';
  import type { User } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';

  $: token = $page.url.searchParams.get('token') || '';

  // Stepper State: Step 1 (Tentor Account Data) -> Step 2 (Teaching Skills & Address)
  let currentStep: 1 | 2 = 1;

  // Tentor Form Fields
  let fullName: string = '';
  let email: string = '';
  let password: string = '';
  let phone: string = '';
  let education: string = '';
  let address: string = '';
  let selectedSubjectIds: string[] = [];

  let errorMessage: string | null = null;
  let createdTentor: User | null = null;

  $: tokenValidation = token
    ? dbStore.validateMagicToken(token, $dbStore)
    : { valid: false, message: 'Token pendaftaran tentor tidak ditemukan.', magicLink: null };

  function toggleSubject(id: string) {
    if (selectedSubjectIds.includes(id)) {
      selectedSubjectIds = selectedSubjectIds.filter((subjectId) => subjectId !== id);
    } else {
      selectedSubjectIds = [...selectedSubjectIds, id];
    }
  }

  function handleNextToStep2() {
    errorMessage = null;
    if (!fullName.trim()) {
      errorMessage = 'Nama lengkap tentor wajib diisi.';
      return;
    }
    if (!email.trim()) {
      errorMessage = 'Email akun tentor wajib diisi.';
      return;
    }
    if (!password || password.length < 4) {
      errorMessage = 'Password akun tentor minimal 4 karakter.';
      return;
    }
    currentStep = 2;
  }

  function handleRegister() {
    errorMessage = null;
    createdTentor = null;

    const response = dbStore.registerTentorViaMagicLink({
      token,
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      education: education.trim(),
      subjectIds: selectedSubjectIds,
      address: address.trim()
    });

    if (response.error || !response.data) {
      errorMessage = response.message;
    } else {
      createdTentor = response.data;
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
        <Icon name="school" filled={true} />
        {tokenValidation.magicLink?.title || 'Pendaftaran Tentor / Mentor Baru'}
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
      Lengkapi formulir 2 langkah di bawah ini untuk bergabung sebagai tentor.
    </p>

    {#if createdTentor}
      <!-- SUCCESS TENTOR ACCOUNT STATE -->
      <div class="flex flex-col items-center gap-5 text-center py-4">
        <div class="w-20 h-20 rounded-full bg-success-soft text-success flex items-center justify-center shadow-inner">
          <Icon name="check_circle" size="xl" />
        </div>
        <div>
          <h2 class="text-xl font-extrabold">Pendaftaran Tentor Berhasil!</h2>
          <p class="text-muted-fg text-sm mt-1.5">
            Selamat <strong>{createdTentor.fullName}</strong>! Akun Anda telah berhasil dibuat.
            <br/><span class="text-warn font-semibold">Akun sedang dalam proses verifikasi oleh admin. Anda akan menerima notifikasi setelah akun aktif.</span>
          </p>
        </div>

        <div class="w-full p-3.5 bg-primary-soft rounded-xl text-left my-2">
          <div class="flex items-center gap-1.5 text-primary font-bold text-xs">
            <Icon name="badge" size="sm" /> Detail Akun Tentor / Mentor
          </div>
          <div class="font-bold text-sm mt-1">{createdTentor.fullName}</div>
          <div class="text-muted-fg text-xs font-mono">{createdTentor.email}</div>
          <div class="text-primary text-xs font-semibold mt-1">Peran: TENTOR / MENTOR</div>
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
        <p class="text-muted-fg text-sm font-medium">Memverifikasi tautan pendaftaran tentor...</p>
      </div>

    {:else if !tokenValidation.valid}
      <!-- INVALID / EXPIRED LINK STATE -->
      <div class="flex flex-col items-center gap-4 text-center py-8">
        <div class="w-20 h-20 rounded-full bg-danger-soft text-danger flex items-center justify-center">
          <Icon name="history_toggle_off" size="xl" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-danger">Magic Link Tentor Tidak Valid / Kadaluarsa</h2>
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
        <!-- STEP 1: DATA DIRI & AKUN TENTOR -->
        <form on:submit|preventDefault={handleNextToStep2} novalidate>
          <div class="pb-2 mb-3 border-b border-border">
            <h3 class="text-base font-bold">Langkah 1: Data Diri & Akun Tentor.</h3>
            <p class="text-muted-fg text-xs mt-0.5">Isi rincian informasi calon pengajar / mentor.</p>
          </div>

          <div class="field">
            <label for="reg-ten-name">Nama Lengkap Tentor / Gelar <i class="req">*</i></label>
            <Input
              type="text"
              id="reg-ten-name"
              placeholder="misal: Dr. Andi Wijaya, M.Pd"
              bind:value={fullName}
              required
            />
          </div>

          <div class="field">
            <label for="reg-ten-email">Email Login Tentor <i class="req">*</i></label>
            <Input
              type="email"
              id="reg-ten-email"
              placeholder="tentor@sentraedu.id"
              bind:value={email}
              required
            />
          </div>

          <div class="field">
            <label for="reg-ten-password">Password Akun Tentor <i class="req">*</i></label>
            <Input
              type="password"
              id="reg-ten-password"
              placeholder="••••••••"
              bind:value={password}
              required
            />
          </div>

          <div class="form-grid">
            <div class="field">
              <label for="reg-ten-phone">No. HP / WhatsApp Tentor</label>
              <Input
                type="text"
                id="reg-ten-phone"
                placeholder="081234567890"
                bind:value={phone}
              />
            </div>

            <div class="field">
              <label for="reg-ten-edu">Pendidikan / Gelar Terakhir</label>
              <Input
                type="text"
                id="reg-ten-edu"
                placeholder="S1 Pend. Matematika - UI"
                bind:value={education}
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
        <!-- STEP 2: KEAHLIAN MENGAJAR & ALAMAT -->
        <form on:submit|preventDefault={handleRegister} novalidate>
          <div class="pb-2 mb-3 border-b border-border">
            <h3 class="text-base font-bold">Langkah 2: Keahlian Pelajaran & Alamat.</h3>
            <p class="text-muted-fg text-xs mt-0.5">Pilih mata pelajaran yang Anda kuasai untuk mengajar.</p>
          </div>

          <div class="field">
            <label for="reg-ten-subjects">Keahlian Mata Pelajaran</label>
            <SelectSearch
              id="reg-ten-subjects"
              multiple
              bind:value={selectedSubjectIds}
              placeholder="Pilih mata pelajaran yang dikuasai..."
              options={$dbStore.subjects.map((subjectItem) => ({ value: subjectItem.id, label: subjectItem.name }))}
            />
          </div>

          <div class="field">
            <label for="reg-ten-address">Alamat Tempat Tinggal / Domisili</label>
            <Input
              type="text"
              id="reg-ten-address"
              placeholder="Alamat domisili tentor..."
              bind:value={address}
            />
          </div>

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
