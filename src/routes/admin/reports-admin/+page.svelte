<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import { INVOICE_STATUS_LABEL, PAYROLL_STATUS_LABEL, getStatusLabel, getStatusBadgeClass } from '$lib/shared/utils/status-map';
import { userStore, educationLevelStore, classStore, enrollmentStore, attendanceStore, invoiceStore, payrollStore } from '$lib/api';

  const paidInvs = $derived($invoiceStore.filter((invoiceItem) => invoiceItem.deletedAt === null && invoiceItem.status === 'PAID'));
  const unpaidInvs = $derived($invoiceStore.filter((invoiceItem) => invoiceItem.deletedAt === null && invoiceItem.status === 'UNPAID'));
  const revenue = $derived(paidInvs.reduce((sum, invoiceItem) => sum + invoiceItem.amount, 0));
  const receivable = $derived(unpaidInvs.reduce((sum, invoiceItem) => sum + invoiceItem.amount, 0));

  const paidClaims = $derived($payrollStore.filter((claimItem) => claimItem.deletedAt === null && claimItem.status === 'PAID'));
  const reqClaims = $derived($payrollStore.filter((claimItem) => claimItem.deletedAt === null && claimItem.status === 'REQUESTED'));
  const honor = $derived(paidClaims.reduce((sum, claimItem) => sum + claimItem.totalAmount, 0));
  const pendingHonor = $derived(reqClaims.reduce((sum, claimItem) => sum + claimItem.totalAmount, 0));

  // 6 months SPP vs Honor
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthItems = $derived(Array.from({ length: 6 }, (_, index) => {
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
  }));

  const maxMonthVal = $derived(Math.max(1, ...monthItems.map((monthItem) => Math.max(monthItem.spp, monthItem.honor))));

  // Invoice recap
  const invStatus = $derived.by(() => {
    const statusMap: Record<string, { count: number; total: number }> = {};
    $invoiceStore
      .filter((invoiceItem) => invoiceItem.deletedAt === null)
      .forEach((invoiceItem) => {
        statusMap[invoiceItem.status] = statusMap[invoiceItem.status] || { count: 0, total: 0 };
        statusMap[invoiceItem.status].count++;
        statusMap[invoiceItem.status].total += invoiceItem.amount;
      });
    return statusMap;
  });

  // Payroll claim recap
  const claimStatus = $derived.by(() => {
    const statusMap: Record<string, { count: number; total: number }> = {};
    $payrollStore
      .filter((claimItem) => claimItem.deletedAt === null)
      .forEach((claimItem) => {
        statusMap[claimItem.status] = statusMap[claimItem.status] || { count: 0, total: 0 };
        statusMap[claimItem.status].count++;
        statusMap[claimItem.status].total += claimItem.totalAmount;
      });
    return statusMap;
  });

  // Tentor attendance recap
  const tentorSessions = $derived.by(() => {
    const sessionMap: Record<string, { total: number; approved: number; submitted: number }> = {};
    $attendanceStore
      .filter((attendanceItem) => attendanceItem.deletedAt === null)
      .forEach((attendanceItem) => {
        sessionMap[attendanceItem.tentorId] = sessionMap[attendanceItem.tentorId] || { total: 0, approved: 0, submitted: 0 };
        sessionMap[attendanceItem.tentorId].total++;
        if (attendanceItem.status === 'APPROVED') sessionMap[attendanceItem.tentorId].approved++;
        if (attendanceItem.status === 'SUBMITTED') sessionMap[attendanceItem.tentorId].submitted++;
      });
    return sessionMap;
  });

  const sortedTentorIds = $derived(Object.keys(tentorSessions).sort(
    (firstId, secondId) => tentorSessions[secondId].total - tentorSessions[firstId].total
  ));

  // Level recap
  const levelPrograms = $derived.by(() => {
    const map: Record<string, number> = {};
    $enrollmentStore
      .filter((enrollmentItem) => enrollmentItem.deletedAt === null)
      .forEach((enrollmentItem) => {
        const classItem = $classStore.find((cls) => cls.id === enrollmentItem.classId);
        const levelItem = classItem ? $educationLevelStore.find((lvl) => lvl.id === classItem.educationLevelId) : null;
        const name = levelItem?.levelName || 'Lainnya';
        map[name] = (map[name] || 0) + 1;
      });
    return map;
  });

  function getUserName(userId: string): string {
    return $userStore.find((userItem) => userItem.id === userId)?.fullName || 'Tentor';
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
      <span><span class="dot bg-primary"></span>SPP</span>
      <span><span class="dot bg-accent"></span>Honor</span>
    </div>
    <div class="bar-chart">
      {#each monthItems as monthItem}
        <div class="bar-col">
          <div class="bar-pair">
            <div
              class="bar"
              style="height: {Math.max(2, Math.round((monthItem.spp / maxMonthVal) * 110))}px"
              title="SPP: {formatCurrencyIDR(monthItem.spp)}"
            ></div>
            <div
              class="bar alt"
              style="height: {Math.max(2, Math.round((monthItem.honor / maxMonthVal) * 110))}px"
              title="Honor: {formatCurrencyIDR(monthItem.honor)}"
            ></div>
          </div>
          <div class="bar-label">{monthItem.label}</div>
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
              {#each Object.keys(invStatus) as statusKey}
                <tr>
                  <td>
                    <span class="badge {getStatusBadgeClass(statusKey)}">
                      {getStatusLabel(statusKey, INVOICE_STATUS_LABEL)}
                    </span>
                  </td>
                  <td class="num">{invStatus[statusKey].count}</td>
                  <td class="num">{formatCurrencyIDR(invStatus[statusKey].total)}</td>
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
              {#each Object.keys(claimStatus) as statusKey}
                <tr>
                  <td>
                    <span class="badge {getStatusBadgeClass(statusKey)}">
                      {getStatusLabel(statusKey, PAYROLL_STATUS_LABEL)}
                    </span>
                  </td>
                  <td class="num">{claimStatus[statusKey].count}</td>
                  <td class="num">{formatCurrencyIDR(claimStatus[statusKey].total)}</td>
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
              {#each sortedTentorIds as tentorId}
                <tr>
                  <td><strong>{getUserName(tentorId)}</strong></td>
                  <td class="num">{tentorSessions[tentorId].total}</td>
                  <td class="num">{tentorSessions[tentorId].approved}</td>
                  <td class="num">{tentorSessions[tentorId].submitted}</td>
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
              {#each Object.keys(levelPrograms) as levelName}
                <tr>
                  <td><strong>{levelName}</strong></td>
                  <td class="num">{levelPrograms[levelName]}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
