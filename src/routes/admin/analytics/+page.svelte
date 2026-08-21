<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
import { userStore, subjectStore, educationLevelStore, classStore, packageStore, enrollmentStore, jobStore, applicationStore, attendanceStore, invoiceStore, payrollStore, candidateStore, notificationStore, magicLinkStore } from '$lib/api';

  let resetDialogOpen: boolean = false;
  let fileInput: HTMLInputElement;

  $: paidInvoices = $invoiceStore.filter((invoiceItem) => invoiceItem.deletedAt === null && invoiceItem.status === 'PAID');
  $: totalRevenue = paidInvoices.reduce((sum, invoiceItem) => sum + invoiceItem.amount, 0);

  $: paidClaims = $payrollStore.filter((claimItem) => claimItem.deletedAt === null && claimItem.status === 'PAID');
  $: totalHonor = paidClaims.reduce((sum, claimItem) => sum + claimItem.totalAmount, 0);

  $: allAtt = $attendanceStore.filter((attendanceItem) => attendanceItem.deletedAt === null);
  $: approvedN = allAtt.filter((attendanceItem) => attendanceItem.status === 'APPROVED').length;
  $: decidedN = allAtt.filter((attendanceItem) => attendanceItem.status === 'APPROVED' || attendanceItem.status === 'REJECTED').length;
  $: verifyRate = decidedN ? Math.round((approvedN / decidedN) * 100) : 0;

  // Monthly 6-month SPP & Honor
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  $: monthItems = Array.from({ length: 6 }, (_, index) => {
    const monthOffset = 5 - index;
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const targetMonth = targetDate.getMonth() + 1;
    const targetYear = targetDate.getFullYear();

    const sppVal = $invoiceStore
      .filter((invoiceItem) => invoiceItem.deletedAt === null && invoiceItem.status === 'PAID' && invoiceItem.periodMonth === targetMonth && invoiceItem.periodYear === targetYear)
      .reduce((sum, invoiceItem) => sum + invoiceItem.amount, 0);

    const honorVal = $payrollStore
      .filter((claimItem) => claimItem.deletedAt === null && claimItem.status === 'PAID' && claimItem.periodMonth === targetMonth && claimItem.periodYear === targetYear)
      .reduce((sum, claimItem) => sum + claimItem.totalAmount, 0);

    return {
      label: `${monthNamesShort[targetDate.getMonth()]} ${targetYear}`,
      spp: sppVal,
      honor: honorVal
    };
  });

  $: maxMonthVal = Math.max(1, ...monthItems.map((monthItem) => Math.max(monthItem.spp, monthItem.honor)));

  // Top Tentors
  $: topTentors = (() => {
    const tentorSessions: Record<string, number> = {};
    $attendanceStore
      .filter((attendanceItem) => attendanceItem.deletedAt === null && attendanceItem.status === 'APPROVED')
      .forEach((attendanceItem) => {
        tentorSessions[attendanceItem.tentorId] = (tentorSessions[attendanceItem.tentorId] || 0) + 1;
      });

    return Object.keys(tentorSessions)
      .sort((firstId, secondId) => tentorSessions[secondId] - tentorSessions[firstId])
      .slice(0, 8)
      .map((tentorId) => {
        const user = $userStore.find((userItem) => userItem.id === tentorId);
        return { label: user?.fullName || 'Tentor', value: tentorSessions[tentorId] };
      });
  })();

  $: maxTentorSessions = Math.max(1, ...topTentors.map((tentorItem) => tentorItem.value));

  // Job Status counts
  $: jobStatusCount = (() => {
    const counts: Record<string, number> = {};
    $jobStore
      .filter((jobItem) => jobItem.deletedAt === null)
      .forEach((jobItem) => {
        counts[jobItem.status] = (counts[jobItem.status] || 0) + 1;
      });
    return counts;
  })();

  // Candidate Status counts
  $: candStatusCount = (() => {
    const counts: Record<string, number> = {};
    $candidateStore
      .filter((candidateItem) => candidateItem.deletedAt === null)
      .forEach((candidateItem) => {
        counts[candidateItem.status] = (counts[candidateItem.status] || 0) + 1;
      });
    return counts;
  })();

  function handleExportJson() {
    const dataSnapshot = () => ({ users: $userStore, jobs: $jobStore, subjects: $subjectStore, educationLevels: $educationLevelStore, classes: $classStore, packages: $packageStore, enrollments: $enrollmentStore, applications: $applicationStore, attendances: $attendanceStore, invoices: $invoiceStore, payrollClaims: $payrollStore, candidates: $candidateStore, notifications: $notificationStore, magicLinks: $magicLinkStore, version: 1, seededAt: new Date().toISOString(), isLoaded: true } as any)();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataSnapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sentraedu-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toastStore.success('Cadangan data JSON berhasil diexport.');
  }

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      try {
        const jsonContent = (readerEvent.target?.result as string) || '';
        // Import requires a dedicated API endpoint
        toastStore.error('Fitur import belum tersedia melalui API.');
      } catch (parseError) {
        toastStore.error('File JSON tidak valid.');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  function handleResetDatabase() {
    // Reset requires a dedicated API endpoint
    toastStore.error('Fitur reset belum tersedia melalui API.');
    resetDialogOpen = false;
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="monitoring" size="lg" /> Analitik &amp; Laporan</h3>
    <div class="desc">Metrik performa operasional, keuangan, dan data bimbingan belajar SentraEdu.</div>
  </div>
</div>

<!-- STAT METRICS -->
<div class="stat-grid">
  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="account_balance_wallet" size="lg" /></div>
    <div>
      <div class="s-val">{formatCurrencyIDR(totalRevenue)}</div>
      <div class="s-lbl">Total SPP Masuk</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-amber"><Icon name="payments" size="lg" /></div>
    <div>
      <div class="s-val">{formatCurrencyIDR(totalHonor)}</div>
      <div class="s-lbl">Total Honor Dibayar</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="savings" size="lg" /></div>
    <div>
      <div class="s-val">{formatCurrencyIDR(totalRevenue - totalHonor)}</div>
      <div class="s-lbl">Margin Operasional</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-violet"><Icon name="fact_check" size="lg" /></div>
    <div>
      <div class="s-val">{verifyRate}%</div>
      <div class="s-lbl">Tingkat Persetujuan Presensi</div>
    </div>
  </div>
</div>

<!-- 6-MONTH CHART -->
<div class="card mb-6">
  <div class="card-head">
    <Icon name="bar_chart" size="md" /> Tren Finansial 6 Bulan Terakhir (SPP vs Honor)
  </div>
  <div class="card-body">
    <div class="chart-container">
      <div class="vbar-chart">
        {#each monthItems as monthItem}
          <div class="vbar-col">
            <div class="vbar-bars">
              <div
                class="vbar vbar-spp"
                style="height: {(monthItem.spp / maxMonthVal) * 100}%"
                title="SPP: {formatCurrencyIDR(monthItem.spp)}"
              ></div>
              <div
                class="vbar vbar-honor"
                style="height: {(monthItem.honor / maxMonthVal) * 100}%"
                title="Honor: {formatCurrencyIDR(monthItem.honor)}"
              ></div>
            </div>
            <div class="vbar-lbl">{monthItem.label}</div>
          </div>
        {/each}
      </div>
      <div class="chart-legend">
        <span class="legend-item"><span class="legend-dot dot-spp"></span> SPP Masuk</span>
        <span class="legend-item"><span class="legend-dot dot-honor"></span> Honor Dibayar</span>
      </div>
    </div>
  </div>
</div>

<!-- Top Tentors -->
{#if topTentors.length > 0}
  <div class="card">
    <div class="card-head">
      <Icon name="emoji_events" size="md" /> Top Tentor (Sesi Disetujui)
    </div>
    <div class="card-body">
      {#each topTentors as tentorItem}
        <div class="hbar-row">
          <div class="hbar-name" title={tentorItem.label}>{tentorItem.label}</div>
          <div class="hbar-track">
            <div class="hbar-fill" style="width: {(tentorItem.value / maxTentorSessions) * 100}%"></div>
          </div>
          <div class="hbar-val">{tentorItem.value} sesi</div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<!-- Status Lowongan Chips -->
<div class="card">
  <div class="card-head">
    <Icon name="work" size="md" /> Status Lowongan
  </div>
  <div class="card-body">
    <div class="chip-row">
      {#each Object.keys(jobStatusCount) as statusKey}
        <span class="inline-flex items-center gap-1.5 my-1 mr-2">
          <span class="badge {statusKey === 'AVAILABLE' ? 'b-available' : statusKey === 'NEGOTIATING' ? 'b-negotiating' : statusKey === 'ASSIGNED' ? 'b-assigned' : 'b-cancelled'}">
            {statusKey}
          </span>
          <span class="font-bold text-base">{jobStatusCount[statusKey]}</span>
        </span>
      {/each}
    </div>
  </div>
</div>

<!-- Pipeline Rekrutmen Chips -->
<div class="card">
  <div class="card-head">
    <Icon name="badge" size="md" /> Pipeline Rekrutmen Tentor
  </div>
  <div class="card-body">
    <div class="chip-row">
      {#each Object.keys(candStatusCount) as statusKey}
        <span class="inline-flex items-center gap-1.5 my-1 mr-2">
          <span class="badge {statusKey === 'ACCEPTED' ? 'b-accepted' : statusKey === 'REJECTED' ? 'b-rejected' : statusKey === 'TESTED' ? 'b-tested' : statusKey === 'INTERVIEWED' ? 'b-interviewed' : 'b-pending'}">
            {statusKey}
          </span>
          <span class="font-bold text-base">{candStatusCount[statusKey]}</span>
        </span>
      {/each}
    </div>
  </div>
</div>

<!-- Database Management -->
<div class="card">
  <div class="card-head">
    <Icon name="database" size="md" /> Manajemen Data Prototype
  </div>
  <div class="card-body">
    <p class="text-xs text-muted-fg mb-3">
      Seluruh data tersimpan di localStorage browser. Export untuk backup/pindah perangkat, import untuk memuat data dari file JSON.
    </p>
    <div class="quick-actions">
      <button type="button" class="btn btn-outline" on:click={handleExportJson}>
        <Icon name="download" size="sm" /> Export Data
      </button>
      <input
        type="file"
        accept=".json"
        class="hidden"
        bind:this={fileInput}
        on:change={handleFileChange}
      />
      <button type="button" class="btn btn-outline" on:click={() => fileInput.click()}>
        <Icon name="upload" size="sm" /> Import Data
      </button>
      <button type="button" class="btn btn-danger" on:click={() => { resetDialogOpen = true; }}>
        <Icon name="restart_alt" size="sm" /> Reset Data
      </button>
    </div>
  </div>
</div>

<ConfirmationDialog
  open={resetDialogOpen}
  title="Reset Data Prototype"
  message="Apakah Anda yakin ingin mereset seluruh data kembali ke bawaan sistem? Data kustom akan hilang."
  confirmText="Ya, Reset"
  confirmVariant="danger"
  onConfirm={handleResetDatabase}
  onCancel={() => { resetDialogOpen = false; }}
/>
