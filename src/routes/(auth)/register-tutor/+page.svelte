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

  $: tokenValidation = token ? dbStore.validateMagicToken(token) : { valid: false, message: 'Token pendaftaran tentor tidak ditemukan.', magicLink: null };

  function toggleSubject(id: string) {
    if (selectedSubjectIds.includes(id)) {
      selectedSubjectIds = selectedSubjectIds.filter((s) => s !== id);
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

<div class="auth-page">
  <div class="auth-card" style="max-width:540px">

    <!-- Brand Header -->
    <div style="display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.15rem;margin-bottom:16px">
      <img
        class="logo"
        src="/logo-sentraedu.jpg"
        alt="SentraEdu"
        style="width:36px;height:36px;border-radius:11px;object-fit:cover"
      />
      <span class="brand-name">
        <span style="color:var(--primary)">Sentra</span><span style="color:var(--accent)">Edu</span>
      </span>
    </div>

    <!-- Title & Theme Toggle -->
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
      <h1 style="font-size:1.25rem;display:flex;align-items:center;gap:8px">
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

    <p style="color:var(--muted-fg);font-size:.9rem;margin:6px 0 18px">
      Lengkapi formulir 2 langkah di bawah ini untuk bergabung sebagai tentor.
    </p>

    {#if createdTentor}
      <!-- SUCCESS TENTOR ACCOUNT STATE -->
      <div class="flex flex-col items-center gap-5 text-center py-4">
        <div class="w-20 h-20 rounded-full bg-success-soft text-success flex items-center justify-center shadow-inner">
          <Icon name="check_circle" size="xl" />
        </div>
        <div>
          <h2 style="font-size:1.3rem;font-weight:800">Pendaftaran Tentor Berhasil!</h2>
          <p style="color:var(--muted-fg);font-size:.9rem;margin-top:6px">
            Selamat <strong>{createdTentor.fullName}</strong>! Akun Anda telah berhasil dibuat.
            <br/><span style="color:var(--warn);font-weight:600">Akun sedang dalam proses verifikasi oleh admin. Anda akan menerima notifikasi setelah akun aktif.</span>
          </p>
        </div>

        <div style="width:100%;padding:14px;background:var(--primary-soft);border-radius:12px;text-align:left;margin:8px 0">
          <div style="display:flex;align-items:center;gap:6px;color:var(--primary);font-weight:700;font-size:.78rem">
            <Icon name="badge" size="sm" /> Detail Akun Tentor / Mentor
          </div>
          <div style="font-weight:700;font-size:.88rem;margin-top:4px">{createdTentor.fullName}</div>
          <div style="color:var(--muted-fg);font-size:.78rem;font-family:monospace">{createdTentor.email}</div>
          <div style="color:var(--primary);font-size:.74rem;font-weight:600;margin-top:4px">Peran: TENTOR / MENTOR</div>
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

    {:else if !tokenValidation.valid}
      <!-- INVALID / EXPIRED LINK STATE -->
      <div class="flex flex-col items-center gap-4 text-center py-8">
        <div class="w-20 h-20 rounded-full bg-danger-soft text-danger flex items-center justify-center">
          <Icon name="history_toggle_off" size="xl" />
        </div>
        <div>
          <h2 style="font-size:1.15rem;font-weight:700;color:var(--danger)">Magic Link Tentor Tidak Valid / Kadaluarsa</h2>
          <p style="color:var(--muted-fg);font-size:.88rem;margin-top:6px">
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
      <div style="display:flex;align-items:center;justify-content:center;max-width:320px;margin:0 auto 28px">
        <div style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;border:2px solid {currentStep >= 1 ? 'var(--primary)' : 'var(--border)'};font-weight:800;font-size:1.1rem;transition:all .15s;{currentStep >= 1 ? 'color:var(--primary);background:var(--surface);box-shadow:0 0 0 4px rgba(37,99,235,.1)' : 'color:var(--muted-fg);background:var(--muted)'}">
          1
        </div>

        <div style="flex:1;height:2px;margin:0 12px;background:{currentStep >= 2 ? 'var(--primary)' : 'var(--border)'};transition:background .15s"></div>

        <div style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;border:2px solid {currentStep === 2 ? 'var(--primary)' : 'var(--border)'};font-weight:800;font-size:1.1rem;transition:all .15s;{currentStep === 2 ? 'color:var(--primary);background:var(--surface);box-shadow:0 0 0 4px rgba(37,99,235,.1)' : 'color:var(--muted-fg);background:var(--muted)'}">
          2
        </div>
      </div>

      {#if currentStep === 1}
        <!-- STEP 1: DATA DIRI & AKUN TENTOR -->
        <form on:submit|preventDefault={handleNextToStep2} novalidate>
          <div style="padding-bottom:8px;margin-bottom:12px;border-bottom:1px solid var(--border)">
            <h3 style="font-size:1.05rem;font-weight:700">Langkah 1: Data Diri & Akun Tentor.</h3>
            <p style="color:var(--muted-fg);font-size:.82rem;margin-top:2px">Isi rincian informasi calon pengajar / mentor.</p>
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
            <div class="form-error" style="display:block">
              {errorMessage}
            </div>
          {/if}

          <Button type="submit" variant="primary" fullWidth icon="arrow_forward" style="margin-top:12px">
            SELANJUTNYA
          </Button>
        </form>

      {:else}
        <!-- STEP 2: KEAHLIAN MENGAJAR & ALAMAT -->
        <form on:submit|preventDefault={handleRegister} novalidate>
          <div style="padding-bottom:8px;margin-bottom:12px;border-bottom:1px solid var(--border)">
            <h3 style="font-size:1.05rem;font-weight:700">Langkah 2: Keahlian Pelajaran & Alamat.</h3>
            <p style="color:var(--muted-fg);font-size:.82rem;margin-top:2px">Pilih mata pelajaran yang Anda kuasai untuk mengajar.</p>
          </div>

          <div class="field">
            <label for="reg-ten-subjects">Keahlian Mata Pelajaran</label>
            <SelectSearch
              id="reg-ten-subjects"
              multiple
              bind:value={selectedSubjectIds}
              placeholder="Pilih mata pelajaran yang dikuasai..."
              options={$dbStore.subjects.map((s) => ({ value: s.id, label: s.name }))}
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
            <div class="form-error" style="display:block">
              {errorMessage}
            </div>
          {/if}

          <div style="display:flex;align-items:center;gap:10px;margin-top:14px">
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
