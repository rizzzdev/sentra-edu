<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import { INVOICE_STATUS_LABEL, PAYROLL_STATUS_LABEL, getStatusLabel, getStatusBadgeClass } from '$lib/shared/utils/status-map';

  $: paidInvs = $dbStore.invoices.filter((i) => i.deletedAt === null && i.status === 'PAID');
  $: unpaidInvs = $dbStore.invoices.filter((i) => i.deletedAt === null && i.status === 'UNPAID');
  $: revenue = paidInvs.reduce((s, i) => s + i.amount, 0);
  $: receivable = unpaidInvs.reduce((s, i) => s + i.amount, 0);

  $: paidClaims = $dbStore.payrollClaims.filter((c) => c.deletedAt === null && c.status === 'PAID');
  $: reqClaims = $dbStore.payrollClaims.filter((c) => c.deletedAt === null && c.status === 'REQUESTED');
  $: honor = paidClaims.reduce((s, c) => s + c.totalAmount, 0);
  $: pendingHonor = reqClaims.reduce((s, c) => s + c.totalAmount, 0);

  // 6 months SPP vs Honor
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

  // Invoice recap
  $: invStatus = (() => {
    const statusMap: Record<string, { count: number; total: number }> = {};
    $dbStore.invoices
      .filter((i) => i.deletedAt === null)
      .forEach((i) => {
        statusMap[i.status] = statusMap[i.status] || { count: 0, total: 0 };
        statusMap[i.status].count++;
        statusMap[i.status].total += i.amount;
      });
    return statusMap;
  })();

  // Payroll claim recap
  $: claimStatus = (() => {
    const statusMap: Record<string, { count: number; total: number }> = {};
    $dbStore.payrollClaims
      .filter((c) => c.deletedAt === null)
      .forEach((c) => {
        statusMap[c.status] = statusMap[c.status] || { count: 0, total: 0 };
        statusMap[c.status].count++;
        statusMap[c.status].total += c.totalAmount;
      });
    return statusMap;
  })();

  // Tentor attendance recap
  $: tentorSessions = (() => {
    const sessionMap: Record<string, { total: number; approved: number; submitted: number }> = {};
    $dbStore.attendances
      .filter((a) => a.deletedAt === null)
      .forEach((a) => {
        sessionMap[a.tentorId] = sessionMap[a.tentorId] || { total: 0, approved: 0, submitted: 0 };
        sessionMap[a.tentorId].total++;
        if (a.status === 'APPROVED') sessionMap[a.tentorId].approved++;
        if (a.status === 'SUBMITTED') sessionMap[a.tentorId].submitted++;
      });
    return sessionMap;
  })();

  $: sortedTentorIds = Object.keys(tentorSessions).sort(
    (a, b) => tentorSessions[b].total - tentorSessions[a].total
  );

  // Level recap
  $: levelPrograms = (() => {
    const map: Record<string, number> = {};
    $dbStore.enrollments
      .filter((e) => e.deletedAt === null)
      .forEach((e) => {
        const cls = $dbStore.classes.find((c) => c.id === e.classId);
        const lvl = cls ? $dbStore.educationLevels.find((l) => l.id === cls.educationLevelId) : null;
        const name = lvl?.levelName || 'Lainnya';
        map[name] = (map[name] || 0) + 1;
      });
    return map;
  })();

  function getUserName(userId: string): string {
    return $dbStore.users.find((u) => u.id === userId)?.fullName || 'Tentor';
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="summarize" size="lg" /> Laporan</h3>
    <div class="desc">Rekapitulasi keuangan, presensi, dan program les.</div>
  </div>
</div>

<div class="stat-grid">
  <div class="stat">
    <div class="s-icon tone-emerald"><Icon name="account_balance_wallet" size="lg" /></div>
    <div>
      <div class="s-val">{formatCurrencyIDR(revenue)}</div>
      <div class="s-lbl">Pendapatan SPP (Lunas)</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-amber"><Icon name="schedule" size="lg" /></div>
    <div>
      <div class="s-val">{formatCurrencyIDR(receivable)}</div>
      <div class="s-lbl">Piutang SPP</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-violet"><Icon name="payments" size="lg" /></div>
    <div>
      <div class="s-val">{formatCurrencyIDR(honor)}</div>
      <div class="s-lbl">Honor Tentor Dibayar</div>
    </div>
  </div>
  <div class="stat">
    <div class="s-icon tone-rose"><Icon name="hourglass_top" size="lg" /></div>
    <div>
      <div class="s-val">{formatCurrencyIDR(pendingHonor)}</div>
      <div class="s-lbl">Honor Menunggu Proses</div>
    </div>
  </div>
</div>

<!-- Chart: Pendapatan SPP vs Honor Tentor -->
<div class="card">
  <div class="card-head">
    <Icon name="bar_chart" size="md" /> Pendapatan SPP vs Honor Tentor (6 bulan terakhir)
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

<div class="grid-2">
  <!-- Table: Rekap Tagihan SPP -->
  <div class="card">
    <div class="card-head">
      <Icon name="receipt_long" size="md" /> Rekap Tagihan SPP
    </div>
    <div class="card-body flush">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Status</th>
              <th class="num">Jumlah</th>
              <th class="num">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {#if Object.keys(invStatus).length === 0}
              <tr>
                <td colspan="3" class="empty">Belum ada tagihan.</td>
              </tr>
            {:else}
              {#each Object.keys(invStatus) as s}
                <tr>
                  <td>
                    <span class="badge {getStatusBadgeClass(s)}">
                      {getStatusLabel(s, INVOICE_STATUS_LABEL)}
                    </span>
                  </td>
                  <td class="num">{invStatus[s].count}</td>
                  <td class="num">{formatCurrencyIDR(invStatus[s].total)}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Table: Rekap Klaim Honor -->
  <div class="card">
    <div class="card-head">
      <Icon name="payments" size="md" /> Rekap Klaim Honor
    </div>
    <div class="card-body flush">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Status</th>
              <th class="num">Jumlah</th>
              <th class="num">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {#if Object.keys(claimStatus).length === 0}
              <tr>
                <td colspan="3" class="empty">Belum ada klaim.</td>
              </tr>
            {:else}
              {#each Object.keys(claimStatus) as s}
                <tr>
                  <td>
                    <span class="badge {getStatusBadgeClass(s)}">
                      {getStatusLabel(s, PAYROLL_STATUS_LABEL)}
                    </span>
                  </td>
                  <td class="num">{claimStatus[s].count}</td>
                  <td class="num">{formatCurrencyIDR(claimStatus[s].total)}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<div class="grid-2">
  <!-- Table: Rekap Presensi per Tentor -->
  <div class="card">
    <div class="card-head">
      <Icon name="location_on" size="md" /> Rekap Presensi per Tentor
    </div>
    <div class="card-body flush">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Tentor</th>
              <th class="num">Total</th>
              <th class="num">Disetujui</th>
              <th class="num">Menunggu</th>
            </tr>
          </thead>
          <tbody>
            {#if sortedTentorIds.length === 0}
              <tr>
                <td colspan="4" class="empty">Belum ada presensi.</td>
              </tr>
            {:else}
              {#each sortedTentorIds as tid}
                <tr>
                  <td><strong>{getUserName(tid)}</strong></td>
                  <td class="num">{tentorSessions[tid].total}</td>
                  <td class="num">{tentorSessions[tid].approved}</td>
                  <td class="num">{tentorSessions[tid].submitted}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Table: Rekap Program Les per Jenjang -->
  <div class="card">
    <div class="card-head">
      <Icon name="group" size="md" /> Rekap Program Les per Jenjang
    </div>
    <div class="card-body flush">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Jenjang</th>
              <th class="num">Program Aktif</th>
            </tr>
          </thead>
          <tbody>
            {#if Object.keys(levelPrograms).length === 0}
              <tr>
                <td colspan="2" class="empty">Belum ada siswa.</td>
              </tr>
            {:else}
              {#each Object.keys(levelPrograms) as lv}
                <tr>
                  <td><strong>{lv}</strong></td>
                  <td class="num">{levelPrograms[lv]}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
