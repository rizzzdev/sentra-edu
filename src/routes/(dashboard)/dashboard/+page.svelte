<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { formatCurrencyIDR, formatDateIndonesian } from '$lib/shared/utils/formatting';
  import type { AttendanceRecord, JobPosting, InvoiceRecord } from '$lib/shared/types/common.types';
  import AttendanceVerifyModal from '$lib/features/attendance-tracking/components/attendance-verify-modal.svelte';

  $: currentUser = $authStore;

  // Selected item for modal
  let verifyModalOpen: boolean = false;
  let selectedAttendance: AttendanceRecord | null = null;

  // Pagination states
  let adminPage: number = 1;
  let tentorPage: number = 1;
  let waliPage: number = 1;
  const itemsPerPage: number = 5;

  // Super Admin stats & list
  $: activeJobs = $dbStore.jobs.filter((j) => j.deletedAt === null && (j.status === 'AVAILABLE' || j.status === 'NEGOTIATING')).length;
  $: tentorCount = $dbStore.users.filter((u) => u.deletedAt === null && u.role === 'TENTOR').length;
  $: enrolledStudentCount = $dbStore.enrollments.filter((e) => e.deletedAt === null).length;
  $: pendingAttList = $dbStore.attendances.filter((a) => a.deletedAt === null && a.status === 'SUBMITTED');
  $: pendingClaimsCount = $dbStore.payrollClaims.filter((c) => c.deletedAt === null && c.status === 'REQUESTED').length;
  $: candidatesCount = $dbStore.candidates.filter((c) => c.deletedAt === null).length;

  $: adminPaginatedAtt = pendingAttList.slice((adminPage - 1) * itemsPerPage, adminPage * itemsPerPage);

  // Tentor stats & list
  $: tentorOpenJobs = $dbStore.jobs.filter((j) => j.deletedAt === null && (j.status === 'AVAILABLE' || j.status === 'NEGOTIATING'));
  $: tentorMyAtt = currentUser ? $dbStore.attendances.filter((a) => a.deletedAt === null && a.tentorId === currentUser?.id) : [];
  $: tentorApprovedAtt = tentorMyAtt.filter((a) => a.status === 'APPROVED');
  $: tentorClaims = currentUser ? $dbStore.payrollClaims.filter((c) => c.deletedAt === null && c.tentorId === currentUser?.id) : [];
  $: tentorMyJobs = currentUser ? $dbStore.jobs.filter((j) => j.deletedAt === null && j.assignedTentorId === currentUser?.id) : [];

  $: tentorPaginatedJobs = tentorMyJobs.slice((tentorPage - 1) * itemsPerPage, tentorPage * itemsPerPage);

  // Student stats & list
  $: studentMyEnr = currentUser ? $dbStore.enrollments.filter((e) => e.deletedAt === null && e.studentId === currentUser?.id) : [];
  $: studentEnrIds = studentMyEnr.map((e) => e.id);
  $: studentMyAtt = $dbStore.attendances.filter((a) => a.deletedAt === null && studentEnrIds.includes(a.enrollmentId));
  $: studentApprovedAtt = studentMyAtt.filter((a) => a.status === 'APPROVED');

  // Wali stats & list
  $: waliMyStudents = currentUser ? $dbStore.users.filter((u) => u.deletedAt === null && u.role === 'STUDENT' && u.waliUserId === currentUser?.id) : [];
  $: waliStudentIds = waliMyStudents.map((s) => s.id);
  $: waliMyEnr = $dbStore.enrollments.filter((e) => e.deletedAt === null && (e.waliUserId === currentUser?.id || waliStudentIds.includes(e.studentId)));
  $: waliEnrIds = waliMyEnr.map((e) => e.id);
  $: waliMyAtt = $dbStore.attendances.filter((a) => a.deletedAt === null && waliEnrIds.includes(a.enrollmentId));
  $: waliApprovedAtt = waliMyAtt.filter((a) => a.status === 'APPROVED');
  $: waliInvoices = $dbStore.invoices.filter((i) => i.deletedAt === null && waliEnrIds.includes(i.enrollmentId));
  $: waliUnpaidInvoices = waliInvoices.filter((i) => i.status === 'UNPAID');
  $: waliUnpaidTotal = waliUnpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  $: waliPaginatedInvoices = waliInvoices.slice((waliPage - 1) * itemsPerPage, waliPage * itemsPerPage);

  function getUserName(userId: string | null | undefined): string {
    if (!userId) return '—';
    const user = $dbStore.users.find((u) => u.id === userId);
    return user ? user.fullName : '—';
  }

  function getStudentOf(enrollmentId: string): string {
    const enr = $dbStore.enrollments.find((e) => e.id === enrollmentId);
    if (!enr) return '—';
    const stu = $dbStore.users.find((u) => u.id === enr.studentId);
    return stu ? stu.fullName : '—';
  }

  function getClassName(classId: string): string {
    const cls = $dbStore.classes.find((c) => c.id === classId);
    return cls ? cls.className : '—';
  }

  function getSubjectName(subjectId: string): string {
    const sub = $dbStore.subjects.find((s) => s.id === subjectId);
    return sub ? sub.name : '—';
  }

  function getPackageName(packageId?: string): string {
    if (!packageId) return '—';
    const pkg = $dbStore.packages.find((p) => p.id === packageId);
    return pkg ? pkg.name : '—';
  }

  function handleOpenVerify(att: AttendanceRecord) {
    selectedAttendance = att;
    verifyModalOpen = true;
  }
</script>

{#if currentUser?.role === 'SUPER_ADMIN'}
  <!-- SUPER ADMIN DASHBOARD -->
  <div class="page-head">
    <div>
      <h3><Icon name="space_dashboard" size="lg" /> Dashboard</h3>
      <div class="desc">Ringkasan operasional SentraEdu.</div>
    </div>
  </div>

  <div class="stat-grid">
    <div class="stat">
      <div class="s-icon tone-sky"><Icon name="work" size="lg" /></div>
      <div>
        <div class="s-val">{activeJobs}</div>
        <div class="s-lbl">Lowongan Aktif</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-emerald"><Icon name="school" size="lg" /></div>
      <div>
        <div class="s-val">{tentorCount}</div>
        <div class="s-lbl">Akun Tentor</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-amber"><Icon name="group" size="lg" /></div>
      <div>
        <div class="s-val">{enrolledStudentCount}</div>
        <div class="s-lbl">Siswa Terdaftar</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-violet"><Icon name="fact_check" size="lg" /></div>
      <div>
        <div class="s-val">{pendingAttList.length}</div>
        <div class="s-lbl">Presensi Perlu Verifikasi</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-rose"><Icon name="payments" size="lg" /></div>
      <div>
        <div class="s-val">{pendingClaimsCount}</div>
        <div class="s-lbl">Klaim Gaji Masuk</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-teal"><Icon name="badge" size="lg" /></div>
      <div>
        <div class="s-val">{candidatesCount}</div>
        <div class="s-lbl">Kandidat Rekrutmen</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-head">
      <Icon name="fact_check" size="md" /> Presensi Menunggu Verifikasi
    </div>
    <div class="card-body flush">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Tentor</th>
              <th>Siswa</th>
              <th>Topik</th>
              <th style="text-align:right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#if adminPaginatedAtt.length === 0}
              <tr>
                <td colspan="5" class="empty">Tidak ada presensi menunggu verifikasi. 👍</td>
              </tr>
            {:else}
              {#each adminPaginatedAtt as att (att.id)}
                <tr>
                  <td>{formatDateIndonesian(att.sessionDate)}</td>
                  <td>{getUserName(att.tentorId)}</td>
                  <td>{getStudentOf(att.enrollmentId)}</td>
                  <td>{att.topic}</td>
                  <td>
                    <div class="actions">
                      <button
                        type="button"
                        class="btn-icon"
                        data-tip="Periksa"
                        on:click={() => handleOpenVerify(att)}
                      >
                        <Icon name="visibility" size="sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      {#if pendingAttList.length > itemsPerPage}
        <div class="page-nav">
          <div class="page-info">
            Menampilkan {(adminPage - 1) * itemsPerPage + 1}–{Math.min(adminPage * itemsPerPage, pendingAttList.length)} dari {pendingAttList.length} data
          </div>
          <div class="page-btns">
            <button
              type="button"
              class="page-btn"
              disabled={adminPage <= 1}
              on:click={() => adminPage--}
            >
              &laquo;
            </button>
            <button type="button" class="page-btn active">{adminPage}</button>
            <button
              type="button"
              class="page-btn"
              disabled={adminPage * itemsPerPage >= pendingAttList.length}
              on:click={() => adminPage++}
            >
              &raquo;
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="quick-actions">
    <a href="/jobs" class="btn btn-primary">
      <Icon name="add" size="sm" /> Buat Lowongan
    </a>
    <a href="/attendance" class="btn btn-outline">
      <Icon name="fact_check" size="sm" /> Verifikasi Presensi
    </a>
    <a href="/candidates" class="btn btn-outline">
      <Icon name="badge" size="sm" /> Rekrutmen Tentor
    </a>
  </div>

{:else if currentUser?.role === 'TENTOR'}
  <!-- TENTOR DASHBOARD -->
  <div class="page-head">
    <div>
      <h3><Icon name="space_dashboard" size="lg" /> Dashboard</h3>
      <div class="desc">Cari lowongan, lakukan presensi, dan pantau penggajian Anda.</div>
    </div>
  </div>

  <div class="stat-grid">
    <div class="stat">
      <div class="s-icon tone-sky"><Icon name="search" size="lg" /></div>
      <div>
        <div class="s-val">{tentorOpenJobs.length}</div>
        <div class="s-lbl">Lowongan Terbuka</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-emerald"><Icon name="verified" size="lg" /></div>
      <div>
        <div class="s-val">{tentorApprovedAtt.length}</div>
        <div class="s-lbl">Sesi Disetujui</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-amber"><Icon name="location_on" size="lg" /></div>
      <div>
        <div class="s-val">{tentorMyAtt.length}</div>
        <div class="s-lbl">Total Sesi Tercatat</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-violet"><Icon name="payments" size="lg" /></div>
      <div>
        <div class="s-val">{tentorClaims.length}</div>
        <div class="s-lbl">Riwayat Penggajian</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-head">
      <Icon name="assignment" size="md" /> Penugasan Saya
    </div>
    <div class="card-body flush">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Lowongan</th>
              <th>Kelas · Mapel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#if tentorPaginatedJobs.length === 0}
              <tr>
                <td colspan="3" class="empty">Belum ada penugasan. Cari lowongan di menu "Cari Lowongan".</td>
              </tr>
            {:else}
              {#each tentorPaginatedJobs as j (j.id)}
                <tr>
                  <td>
                    <strong>{j.title}</strong>
                    <div class="sub">
                      <span class="badge {j.mode === 'ONLINE' ? 'b-neutral' : 'b-available'}">{j.mode}</span>
                      {getPackageName(j.packageId)} · {j.schedulePreference}
                    </div>
                  </td>
                  <td>
                    {getClassName(j.classId)} · {getSubjectName(j.subjectId)}
                  </td>
                  <td>
                    <span class="badge {j.status === 'ASSIGNED' ? 'b-assigned' : j.status === 'AVAILABLE' ? 'b-available' : 'b-negotiating'}">
                      {j.status}
                    </span>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      {#if tentorMyJobs.length > itemsPerPage}
        <div class="page-nav">
          <div class="page-info">
            Menampilkan {(tentorPage - 1) * itemsPerPage + 1}–{Math.min(tentorPage * itemsPerPage, tentorMyJobs.length)} dari {tentorMyJobs.length} data
          </div>
          <div class="page-btns">
            <button
              type="button"
              class="page-btn"
              disabled={tentorPage <= 1}
              on:click={() => tentorPage--}
            >
              &laquo;
            </button>
            <button type="button" class="page-btn active">{tentorPage}</button>
            <button
              type="button"
              class="page-btn"
              disabled={tentorPage * itemsPerPage >= tentorMyJobs.length}
              on:click={() => tentorPage++}
            >
              &raquo;
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="quick-actions">
    <a href="/jobboard" class="btn btn-primary">
      <Icon name="search" size="sm" /> Cari Lowongan
    </a>
    <a href="/attendance" class="btn btn-outline">
      <Icon name="location_on" size="sm" /> Presensi Hari Ini
    </a>
    <a href="/payroll" class="btn btn-outline">
      <Icon name="payments" size="sm" /> Riwayat Penggajian
    </a>
  </div>

{:else if currentUser?.role === 'STUDENT'}
  <!-- STUDENT DASHBOARD -->
  <div class="page-head">
    <div>
      <h3><Icon name="space_dashboard" size="lg" /> Dashboard</h3>
      <div class="desc">Pantau les aktif, presensi, dan laporan hasil belajar Anda.</div>
    </div>
  </div>

  <div class="stat-grid">
    <div class="stat">
      <div class="s-icon tone-sky"><Icon name="school" size="lg" /></div>
      <div>
        <div class="s-val">{studentMyEnr.length}</div>
        <div class="s-lbl">Program Les Aktif</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-emerald"><Icon name="verified" size="lg" /></div>
      <div>
        <div class="s-val">{studentApprovedAtt.length}</div>
        <div class="s-lbl">Sesi Disetujui</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-amber"><Icon name="location_on" size="lg" /></div>
      <div>
        <div class="s-val">{studentMyAtt.length}</div>
        <div class="s-lbl">Total Sesi Tercatat</div>
      </div>
    </div>
  </div>

  <div class="quick-actions">
    <a href="/program" class="btn btn-primary">
      <Icon name="school" size="sm" /> Lihat Program Les
    </a>
    <a href="/attendance" class="btn btn-outline">
      <Icon name="fact_check" size="sm" /> Lihat Presensi
    </a>
  </div>

{:else if currentUser?.role === 'WALI_MURID'}
  <!-- WALI MURID DASHBOARD -->
  <div class="page-head">
    <div>
      <h3><Icon name="space_dashboard" size="lg" /> Dashboard Wali Murid</h3>
      <div class="desc">Pantau les, presensi, dan tagihan SPP anak Anda.</div>
    </div>
  </div>

  <div class="stat-grid">
    <div class="stat">
      <div class="s-icon tone-sky"><Icon name="school" size="lg" /></div>
      <div>
        <div class="s-val">{waliMyEnr.length}</div>
        <div class="s-lbl">Program Les Anak</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-emerald"><Icon name="verified" size="lg" /></div>
      <div>
        <div class="s-val">{waliApprovedAtt.length}</div>
        <div class="s-lbl">Sesi Disetujui</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-amber"><Icon name="receipt_long" size="lg" /></div>
      <div>
        <div class="s-val">{waliUnpaidInvoices.length}</div>
        <div class="s-lbl">Tagihan Belum Dibayar</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-rose"><Icon name="payments" size="lg" /></div>
      <div>
        <div class="s-val">{formatCurrencyIDR(waliUnpaidTotal)}</div>
        <div class="s-lbl">Total Tagihan</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-head">
      <Icon name="receipt_long" size="md" /> Tagihan SPP Terbaru
    </div>
    <div class="card-body flush">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>No. Invoice</th>
              <th>Anak</th>
              <th>Periode</th>
              <th class="num">Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#if waliPaginatedInvoices.length === 0}
              <tr>
                <td colspan="5" class="empty">Belum ada tagihan.</td>
              </tr>
            {:else}
              {#each waliPaginatedInvoices as inv (inv.id)}
                <tr>
                  <td>{inv.invoiceNumber}</td>
                  <td>{getStudentOf(inv.enrollmentId)}</td>
                  <td>Bulan {inv.periodMonth}/{inv.periodYear}</td>
                  <td class="num"><strong>{formatCurrencyIDR(inv.amount)}</strong></td>
                  <td>
                    <span class="badge {inv.status === 'PAID' ? 'b-paid' : inv.status === 'OVERDUE' ? 'b-rejected' : 'b-unpaid'}">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      {#if waliInvoices.length > itemsPerPage}
        <div class="page-nav">
          <div class="page-info">
            Menampilkan {(waliPage - 1) * itemsPerPage + 1}–{Math.min(waliPage * itemsPerPage, waliInvoices.length)} dari {waliInvoices.length} data
          </div>
          <div class="page-btns">
            <button
              type="button"
              class="page-btn"
              disabled={waliPage <= 1}
              on:click={() => waliPage--}
            >
              &laquo;
            </button>
            <button type="button" class="page-btn active">{waliPage}</button>
            <button
              type="button"
              class="page-btn"
              disabled={waliPage * itemsPerPage >= waliInvoices.length}
              on:click={() => waliPage++}
            >
              &raquo;
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="quick-actions">
    <a href="/children" class="btn btn-primary">
      <Icon name="school" size="sm" /> Program Les Anak
    </a>
    <a href="/invoices" class="btn btn-outline">
      <Icon name="receipt_long" size="sm" /> Tagihan SPP
    </a>
  </div>
{/if}

<AttendanceVerifyModal
  open={verifyModalOpen}
  attendance={selectedAttendance}
  onClose={() => { verifyModalOpen = false; }}
/>
