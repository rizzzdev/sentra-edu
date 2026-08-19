<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';

  let resetDialogOpen: boolean = false;
  let fileInput: HTMLInputElement;

  $: paidInvoices = $dbStore.invoices.filter((i) => i.deletedAt === null && i.status === 'PAID');
  $: totalRevenue = paidInvoices.reduce((s, i) => s + i.amount, 0);

  $: paidClaims = $dbStore.payrollClaims.filter((c) => c.deletedAt === null && c.status === 'PAID');
  $: totalHonor = paidClaims.reduce((s, c) => s + c.totalAmount, 0);

  $: allAtt = $dbStore.attendances.filter((a) => a.deletedAt === null);
  $: approvedN = allAtt.filter((a) => a.status === 'APPROVED').length;
  $: decidedN = allAtt.filter((a) => a.status === 'APPROVED' || a.status === 'REJECTED').length;
  $: verifyRate = decidedN ? Math.round((approvedN / decidedN) * 100) : 0;

  // Monthly 6-month SPP & Honor
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  $: monthItems = Array.from({ length: 6 }, (_, index) => {
    const mi = 5 - index;
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() - mi, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();

    const sppVal = $dbStore.invoices
      .filter((i) => i.deletedAt === null && i.status === 'PAID' && i.periodMonth === m && i.periodYear === y)
      .reduce((s, i) => s + i.amount, 0);

    const honorVal = $dbStore.payrollClaims
      .filter((c) => c.deletedAt === null && c.status === 'PAID' && c.periodMonth === m && c.periodYear === y)
      .reduce((s, c) => s + c.totalAmount, 0);

    return {
      label: `${monthNamesShort[d.getMonth()]} ${y}`,
      spp: sppVal,
      honor: honorVal
    };
  });

  $: maxMonthVal = Math.max(1, ...monthItems.map((m) => Math.max(m.spp, m.honor)));

  // Top Tentors
  $: topTentors = (() => {
    const tentorSessions: Record<string, number> = {};
    $dbStore.attendances
      .filter((a) => a.deletedAt === null && a.status === 'APPROVED')
      .forEach((a) => {
        tentorSessions[a.tentorId] = (tentorSessions[a.tentorId] || 0) + 1;
      });

    return Object.keys(tentorSessions)
      .sort((a, b) => tentorSessions[b] - tentorSessions[a])
      .slice(0, 8)
      .map((tid) => {
        const u = $dbStore.users.find((user) => user.id === tid);
        return { label: u?.fullName || 'Tentor', value: tentorSessions[tid] };
      });
  })();

  $: maxTentorSessions = Math.max(1, ...topTentors.map((t) => t.value));

  // Job Status counts
  $: jobStatusCount = (() => {
    const counts: Record<string, number> = {};
    $dbStore.jobs
      .filter((j) => j.deletedAt === null)
      .forEach((j) => {
        counts[j.status] = (counts[j.status] || 0) + 1;
      });
    return counts;
  })();

  // Candidate Status counts
  $: candStatusCount = (() => {
    const counts: Record<string, number> = {};
    $dbStore.candidates
      .filter((c) => c.deletedAt === null)
      .forEach((c) => {
        counts[c.status] = (counts[c.status] || 0) + 1;
      });
    return counts;
  })();

  function handleExportJson() {
    const dataSnapshot = dbStore.getSnapshot();
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
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const response = dbStore.importDatabaseJson(content);
        if (!response.error) {
          toastStore.success(response.message);
        } else {
          toastStore.error(response.message);
        }
      }
    };
    reader.readAsText(file);
    target.value = '';
  }

  function handleResetDatabase() {
    const response = dbStore.resetToFactoryDefaults();
    resetDialogOpen = false;
    if (!response.error) {
      toastStore.success(response.message);
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="monitoring" size="lg" /> Analitik</h3>
    <div class="desc">Ringkasan data operasional SentraEdu.</div>
  </div>
</div>

<div class="stat-grid">
  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="account_balance_wallet" size="lg" /></div>
    <div>
      <div class="s-val">{formatCurrencyIDR(totalRevenue)}</div>
      <div class="s-lbl">Pendapatan SPP (Lunas)</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-violet"><Icon name="payments" size="lg" /></div>
    <div>
      <div class="s-val">{formatCurrencyIDR(totalHonor)}</div>
      <div class="s-lbl">Honor Tentor Dibayar</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-sky"><Icon name="location_on" size="lg" /></div>
    <div>
      <div class="s-val">{allAtt.length}</div>
      <div class="s-lbl">Total Sesi Tercatat</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-amber"><Icon name="verified" size="lg" /></div>
    <div>
      <div class="s-val">{verifyRate}%</div>
      <div class="s-lbl">Presensi Disetujui</div>
    </div>
  </div>
</div>

<!-- Chart: Pendapatan & Honor per Bulan -->
<div class="card">
  <div class="card-head">
    <Icon name="bar_chart" size="md" /> Pendapatan & Honor per Bulan (6 bulan terakhir)
  </div>
  <div class="card-body">
    <div class="chart-legend">
      <span><span class="dot" style="background:var(--primary)"></span>SPP</span>
      <span><span class="dot" style="background:var(--accent)"></span>Honor</span>
    </div>
    <div class="bar-chart">
      {#each monthItems as m}
        <div class="bar-col">
          <div class="bar-pair">
            <div
              class="bar"
              style="height: {Math.max(2, Math.round((m.spp / maxMonthVal) * 110))}px"
              title="SPP: {formatCurrencyIDR(m.spp)}"
            ></div>
            <div
              class="bar alt"
              style="height: {Math.max(2, Math.round((m.honor / maxMonthVal) * 110))}px"
              title="Honor: {formatCurrencyIDR(m.honor)}"
            ></div>
          </div>
          <div class="bar-label">{m.label}</div>
        </div>
      {/each}
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
      {#each topTentors as t}
        <div class="hbar-row">
          <div class="hbar-name" title={t.label}>{t.label}</div>
          <div class="hbar-track">
            <div class="hbar-fill" style="width: {(t.value / maxTentorSessions) * 100}%"></div>
          </div>
          <div class="hbar-val">{t.value} sesi</div>
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
      {#each Object.keys(jobStatusCount) as s}
        <span style="display:inline-flex;align-items:center;gap:6px;margin:4px 8px 4px 0">
          <span class="badge {s === 'AVAILABLE' ? 'b-available' : s === 'NEGOTIATING' ? 'b-negotiating' : s === 'ASSIGNED' ? 'b-assigned' : 'b-cancelled'}">
            {s}
          </span>
          <span style="font-weight:700;font-size:1.05rem">{jobStatusCount[s]}</span>
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
      {#each Object.keys(candStatusCount) as s}
        <span style="display:inline-flex;align-items:center;gap:6px;margin:4px 8px 4px 0">
          <span class="badge {s === 'ACCEPTED' ? 'b-accepted' : s === 'REJECTED' ? 'b-rejected' : s === 'TESTED' ? 'b-tested' : s === 'INTERVIEWED' ? 'b-interviewed' : 'b-pending'}">
            {s}
          </span>
          <span style="font-weight:700;font-size:1.05rem">{candStatusCount[s]}</span>
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
    <p style="font-size:.84rem;color:var(--muted-fg);margin-bottom:12px">
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
