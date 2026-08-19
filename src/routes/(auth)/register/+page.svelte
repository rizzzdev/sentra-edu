<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { themeStore } from '$lib/shared/stores/theme-store';
  import { goto } from '$app/navigation';
  import type { User } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';

  $: token = $page.url.searchParams.get('token') || '';

  // Stepper State: Step 1 (Student Data) -> Step 2 (Wali Murid Data)
  let currentStep: 1 | 2 = 1;

  // Student Form Fields
  let studentFullName: string = '';
  let studentEmail: string = '';
  let studentPassword: string = '';
  let studentPhone: string = '';
  let school: string = '';

  // Wali Murid Form Fields
  let isExistingWali: boolean = false;
  let waliFullName: string = '';
  let waliEmail: string = '';
  let waliPassword: string = '';
  let waliPhone: string = '';
  let waliOccupation: string = '';
  let address: string = '';

  let errorMessage: string | null = null;
  let createdAccounts: { student: User; wali: User } | null = null;

  $: tokenValidation = token ? dbStore.validateMagicToken(token) : { valid: false, message: 'Token pendaftaran tidak ditemukan.', magicLink: null };

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

  function handleRegister() {
    errorMessage = null;
    createdAccounts = null;

    if (!waliEmail.trim()) {
      errorMessage = 'Email wali murid wajib diisi.';
      return;
    }

    if (!isExistingWali) {
      if (!waliFullName.trim()) {
        errorMessage = 'Nama lengkap wali murid wajib diisi.';
        return;
      }
      if (!waliPassword || waliPassword.length < 4) {
        errorMessage = 'Password akun wali murid minimal 4 karakter.';
        return;
      }
    }

    if (studentEmail.trim().toLowerCase() === waliEmail.trim().toLowerCase()) {
      errorMessage = 'Email siswa dan email wali murid harus berbeda.';
      return;
    }

    const response = dbStore.registerStudentViaMagicLink({
      token,
      studentFullName: studentFullName.trim(),
      studentEmail: studentEmail.trim(),
      studentPassword,
      studentPhone: studentPhone.trim(),
      school: school.trim(),
      address: address.trim(),
      isExistingWali,
      waliFullName: waliFullName.trim(),
      waliEmail: waliEmail.trim(),
      waliPassword,
      waliPhone: waliPhone.trim(),
      waliOccupation: waliOccupation.trim()
    });

    if (response.error || !response.data) {
      errorMessage = response.message;
    } else {
      createdAccounts = response.data;
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

    <p style="color:var(--muted-fg);font-size:.9rem;margin:6px 0 18px">
      Lengkapi formulir 2 langkah di bawah ini untuk mendaftar.
    </p>

    {#if createdAccounts}
      <!-- SUCCESS DUAL-ACCOUNT STATE -->
      <div class="flex flex-col items-center gap-5 text-center py-4">
        <div class="w-20 h-20 rounded-full bg-success-soft text-success flex items-center justify-center shadow-inner">
          <Icon name="check_circle" size="xl" />
        </div>
        <div>
          <h2 style="font-size:1.3rem;font-weight:800">Pendaftaran Berhasil!</h2>
          <p style="color:var(--muted-fg);font-size:.9rem;margin-top:6px">
            {#if isExistingWali}
              Siswa <strong>{createdAccounts.student.fullName}</strong> berhasil didaftarkan dan ditautkan ke Wali Murid <strong>{createdAccounts.wali.fullName}</strong>.
            {:else}
              Akun Siswa & Akun Wali Murid Baru telah berhasil dibuat.
            {/if}
            <br/><span style="color:var(--warn);font-weight:600">Akun Anda sedang menunggu verifikasi dari admin sebelum bisa digunakan.</span>
          </p>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;text-align:left;margin:8px 0">
          <div style="padding:14px;background:var(--primary-soft);border-radius:12px">
            <div style="display:flex;align-items:center;gap:6px;color:var(--primary);font-weight:700;font-size:.78rem">
              <Icon name="school" size="xs" /> Akun Siswa
            </div>
            <div style="font-weight:700;font-size:.88rem;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{createdAccounts.student.fullName}</div>
            <div style="color:var(--muted-fg);font-size:.78rem;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{createdAccounts.student.email}</div>
          </div>

          <div style="padding:14px;background:var(--accent-soft);border-radius:12px">
            <div style="display:flex;align-items:center;gap:6px;color:var(--accent-strong);font-weight:700;font-size:.78rem">
              <Icon name="family_restroom" size="xs" /> Akun Wali Murid
            </div>
            <div style="font-weight:700;font-size:.88rem;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{createdAccounts.wali.fullName}</div>
            <div style="color:var(--muted-fg);font-size:.78rem;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{createdAccounts.wali.email}</div>
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

    {:else if !tokenValidation.valid}
      <!-- INVALID / EXPIRED LINK STATE -->
      <div class="flex flex-col items-center gap-4 text-center py-8">
        <div class="w-20 h-20 rounded-full bg-danger-soft text-danger flex items-center justify-center">
          <Icon name="history_toggle_off" size="xl" />
        </div>
        <div>
          <h2 style="font-size:1.15rem;font-weight:700;color:var(--danger)">Magic Link Tidak Valid / Kadaluarsa</h2>
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
        <!-- STEP 1: DATA SISWA -->
        <form on:submit|preventDefault={handleNextToStep2} novalidate>
          <div style="padding-bottom:8px;margin-bottom:12px;border-bottom:1px solid var(--border)">
            <h3 style="font-size:1.05rem;font-weight:700">Mari kita mulai dari Data Siswa.</h3>
            <p style="color:var(--muted-fg);font-size:.82rem;margin-top:2px">Isi rincian data calon siswa yang akan didaftarkan.</p>
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
            <div class="form-error" style="display:block">
              {errorMessage}
            </div>
          {/if}

          <Button type="submit" variant="primary" fullWidth icon="arrow_forward" style="margin-top:12px">
            SELANJUTNYA
          </Button>
        </form>

      {:else}
        <!-- STEP 2: DATA WALI MURID -->
        <form on:submit|preventDefault={handleRegister} novalidate>
          <div style="padding-bottom:8px;margin-bottom:12px;border-bottom:1px solid var(--border)">
            <h3 style="font-size:1.05rem;font-weight:700">Selanjutnya, Data Orang Tua / Wali.</h3>
            <p style="color:var(--muted-fg);font-size:.82rem;margin-top:2px">Pilih status akun wali murid untuk penautan.</p>
          </div>

          <!-- Radio Choice Selector -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
            <label
              style="display:flex;align-items:center;justify-content:center;text-align:center;padding:10px 14px;border-radius:10px;border:1px solid {isExistingWali === false ? 'var(--primary)' : 'var(--border)'};font-size:.82rem;font-weight:700;cursor:pointer;transition:all .12s;{isExistingWali === false ? 'background:var(--primary-soft);color:var(--primary-strong)' : 'background:var(--surface);color:var(--muted-fg)'}"
            >
              <input
                type="radio"
                name="wali-mode"
                class="sr-only"
                checked={isExistingWali === false}
                on:change={() => { isExistingWali = false; }}
              />
              Wali Baru (Buat Akun)
            </label>

            <label
              style="display:flex;align-items:center;justify-content:center;text-align:center;padding:10px 14px;border-radius:10px;border:1px solid {isExistingWali === true ? 'var(--primary)' : 'var(--border)'};font-size:.82rem;font-weight:700;cursor:pointer;transition:all .12s;{isExistingWali === true ? 'background:var(--primary-soft);color:var(--primary-strong)' : 'background:var(--surface);color:var(--muted-fg)'}"
            >
              <input
                type="radio"
                name="wali-mode"
                class="sr-only"
                checked={isExistingWali === true}
                on:change={() => { isExistingWali = true; }}
              />
              Wali Sudah Punya Akun
            </label>
          </div>

          {#if isExistingWali}
            <div class="field">
              <label for="reg-existing-wali-email">Email Akun Wali Murid Terdaftar <i class="req">*</i></label>
              <Input
                type="email"
                id="reg-existing-wali-email"
                placeholder="Masukkan email wali terdaftar..."
                bind:value={waliEmail}
                required
              />
              <span class="help">Siswa ini akan ditautkan secara otomatis ke akun Wali Murid tersebut.</span>
            </div>
          {:else}
            <div class="field">
              <label for="reg-wali-name">Nama Lengkap Wali Murid <i class="req">*</i></label>
              <Input
                type="text"
                id="reg-wali-name"
                placeholder="Nama ayah / ibu / wali..."
                bind:value={waliFullName}
                required
              />
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="reg-wali-email">Email Login Wali <i class="req">*</i></label>
                <Input
                  type="email"
                  id="reg-wali-email"
                  placeholder="wali@sentraedu.id"
                  bind:value={waliEmail}
                  required
                />
              </div>

              <div class="field">
                <label for="reg-wali-password">Password Akun Wali <i class="req">*</i></label>
                <Input
                  type="password"
                  id="reg-wali-password"
                  placeholder="••••••••"
                  bind:value={waliPassword}
                  required
                />
              </div>
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="reg-wali-phone">No. HP / WhatsApp Wali</label>
                <Input
                  type="text"
                  id="reg-wali-phone"
                  placeholder="081298765432"
                  bind:value={waliPhone}
                />
              </div>

              <div class="field">
                <label for="reg-wali-occ">Pekerjaan Wali Murid</label>
                <Input
                  type="text"
                  id="reg-wali-occ"
                  placeholder="misal: Wirausaha"
                  bind:value={waliOccupation}
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
