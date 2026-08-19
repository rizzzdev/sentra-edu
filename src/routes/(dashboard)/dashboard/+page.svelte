<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { formatCurrencyIDR, formatDateIndonesian } from '$lib/shared/utils/formatting';
  import { JOB_STATUS_LABEL, INVOICE_STATUS_LABEL, ATTENDANCE_STATUS_LABEL, getStatusLabel, getStatusBadgeClass } from '$lib/shared/utils/status-map';
  import type { AttendanceRecord, JobPosting, InvoiceRecord } from '$lib/shared/types/common.types';
  import AttendanceVerifyModal from '$lib/features/attendance-tracking/components/attendance-verify-modal.svelte';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
  import AlertBanner from '$lib/components/molecules/alert-banner.svelte';

  $: currentUser = $authStore;

  let verifyModalOpen: boolean = false;
  let selectedAttendance: AttendanceRecord | null = null;

  // Pagination states
  let adminPage: number = 1;
  let tentorPage: number = 1;
  let waliPage: number = 1;
  const itemsPerPage: number = 5;

  let isLoading: boolean = true;
  let errorMessage: string | null = null;

  import { onMount } from 'svelte';
  onMount(() => {
    setTimeout(() => { isLoading = false; }, 600);
  });

  // Super Admin stats & list
  $: activeJobs = $dbStore.jobs.filter((job) => job.deletedAt === null && (job.status === 'AVAILABLE' || job.status === 'NEGOTIATING')).length;
  $: tentorCount = $dbStore.users.filter((user) => user.deletedAt === null && user.role === 'TENTOR').length;
  $: enrolledStudentCount = $dbStore.enrollments.filter((enroll) => enroll.deletedAt === null).length;
  $: pendingAttList = $dbStore.attendances.filter((att) => att.deletedAt === null && att.status === 'SUBMITTED');
  $: pendingClaimsCount = $dbStore.payrollClaims.filter((claim) => claim.deletedAt === null && claim.status === 'REQUESTED').length;
  $: candidatesCount = $dbStore.candidates.filter((cand) => cand.deletedAt === null).length;

  $: adminPaginatedAtt = pendingAttList.slice((adminPage - 1) * itemsPerPage, adminPage * itemsPerPage);

  // Tentor stats & list
  $: tentorOpenJobs = $dbStore.jobs.filter((job) => job.deletedAt === null && (job.status === 'AVAILABLE' || job.status === 'NEGOTIATING'));
  $: tentorMyAtt = currentUser ? $dbStore.attendances.filter((att) => att.deletedAt === null && att.tentorId === currentUser?.id) : [];
  $: tentorApprovedAtt = tentorMyAtt.filter((att) => att.status === 'APPROVED');
  $: tentorClaims = currentUser ? $dbStore.payrollClaims.filter((claim) => claim.deletedAt === null && claim.tentorId === currentUser?.id) : [];
  $: tentorMyJobs = currentUser ? $dbStore.jobs.filter((job) => job.deletedAt === null && job.assignedTentorId === currentUser?.id) : [];

  $: tentorPaginatedJobs = tentorMyJobs.slice((tentorPage - 1) * itemsPerPage, tentorPage * itemsPerPage);

  // Student stats & list
  $: studentMyEnr = currentUser ? $dbStore.enrollments.filter((enroll) => enroll.deletedAt === null && enroll.studentId === currentUser?.id) : [];
  $: studentEnrIds = studentMyEnr.map((enroll) => enroll.id);
  $: studentMyAtt = $dbStore.attendances.filter((att) => att.deletedAt === null && studentEnrIds.includes(att.enrollmentId));
  $: studentApprovedAtt = studentMyAtt.filter((att) => att.status === 'APPROVED');

  // Wali stats & list
  $: waliMyStudents = currentUser ? $dbStore.users.filter((user) => user.deletedAt === null && user.role === 'STUDENT' && user.waliUserId === currentUser?.id) : [];
  $: waliStudentIds = waliMyStudents.map((student) => student.id);
  $: waliMyEnr = $dbStore.enrollments.filter((enroll) => enroll.deletedAt === null && (enroll.waliUserId === currentUser?.id || waliStudentIds.includes(enroll.studentId)));
  $: waliEnrIds = waliMyEnr.map((enroll) => enroll.id);
  $: waliMyAtt = $dbStore.attendances.filter((att) => att.deletedAt === null && waliEnrIds.includes(att.enrollmentId));
  $: waliApprovedAtt = waliMyAtt.filter((att) => att.status === 'APPROVED');
  $: waliInvoices = $dbStore.invoices.filter((inv) => inv.deletedAt === null && waliEnrIds.includes(inv.enrollmentId));
  $: waliUnpaidInvoices = waliInvoices.filter((inv) => inv.status === 'UNPAID');
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
        <div class="s-lbl">Murid Terdaftar</div>
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
        <div class="s-lbl">Penggajian Masuk</div>
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
            {#if isLoading}
              {#each Array(3) as _}
                <tr>
                  <td><Skeleton width="w-24" height="h-4" /></td>
                  <td><Skeleton width="w-32" height="h-4" /></td>
                  <td><Skeleton width="w-32" height="h-4" /></td>
                  <td><Skeleton width="w-40" height="h-4" /></td>
                  <td><Skeleton width="w-10" height="h-8" className="ml-auto" /></td>
                </tr>
              {/each}
            {:else if errorMessage}
              <tr>
                <td colspan="5" class="!p-4">
                  <AlertBanner variant="destructive" message={errorMessage} onRetry={() => { errorMessage = null; isLoading = true; setTimeout(() => isLoading = false, 600); }} />
                </td>
              </tr>
            {:else if adminPaginatedAtt.length === 0}
              <tr>
                <td colspan="5" class="empty py-8 text-center text-muted-fg">
                  <Icon name="check_circle" size="lg" className="opacity-50 mb-2 block mx-auto text-4xl text-[var(--color-success)]" />
                  <div class="font-medium">Tidak ada presensi menunggu verifikasi. 👍</div>
                </td>
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
    <a href="/admin/jobs" class="btn btn-primary">
      <Icon name="add" size="sm" /> Buat Lowongan
    </a>
    <a href="/admin/attendance" class="btn btn-outline">
      <Icon name="fact_check" size="sm" /> Verifikasi Presensi
    </a>
    <a href="/admin/candidates" class="btn btn-outline">
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
            {#if isLoading}
              {#each Array(3) as _}
                <tr>
                  <td><Skeleton width="w-40" height="h-5" /><Skeleton width="w-24" height="h-3" className="mt-2" /></td>
                  <td><Skeleton width="w-32" height="h-4" /></td>
                  <td><Skeleton width="w-24" height="h-6" className="rounded-full" /></td>
                </tr>
              {/each}
            {:else if errorMessage}
              <tr>
                <td colspan="3" class="!p-4">
                  <AlertBanner variant="destructive" message={errorMessage} onRetry={() => { errorMessage = null; isLoading = true; setTimeout(() => isLoading = false, 600); }} />
                </td>
              </tr>
            {:else if tentorPaginatedJobs.length === 0}
              <tr>
                <td colspan="3" class="empty py-8 text-center text-muted-fg">
                  <Icon name="assignment_late" size="lg" className="opacity-50 mb-2 block mx-auto text-4xl" />
                  <div class="font-medium">Belum ada penugasan. Cari lowongan di menu "Cari Lowongan".</div>
                </td>
              </tr>
            {:else}
              {#each tentorPaginatedJobs as job (job.id)}
                <tr>
                  <td>
                    <strong>{job.title}</strong>
                    <div class="sub">
                      <span class="badge {job.mode === 'ONLINE' ? 'b-neutral' : 'b-available'}">{job.mode}</span>
                      {getPackageName(job.packageId)} · {job.schedulePreference}
                    </div>
                  </td>
                  <td>
                    {getClassName(job.classId)} · {getSubjectName(job.subjectId)}
                  </td>
                  <td>
                    <span class="badge {getStatusBadgeClass(job.status)}">
                      {getStatusLabel(job.status, JOB_STATUS_LABEL)}
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
    <a href="/tentor/jobboard" class="btn btn-primary">
      <Icon name="search" size="sm" /> Cari Lowongan
    </a>
    <a href="/tentor/attendance" class="btn btn-outline">
      <Icon name="location_on" size="sm" /> Presensi Hari Ini
    </a>
    <a href="/tentor/payroll" class="btn btn-outline">
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
    <a href="/student/program" class="btn btn-primary">
      <Icon name="school" size="sm" /> Lihat Program Les
    </a>
    <a href="/student/attendance" class="btn btn-outline">
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
            {#if isLoading}
              {#each Array(3) as _}
                <tr>
                  <td><Skeleton width="w-20" height="h-4" /></td>
                  <td><Skeleton width="w-32" height="h-4" /></td>
                  <td><Skeleton width="w-24" height="h-4" /></td>
                  <td><Skeleton width="w-32" height="h-5" className="ml-auto" /></td>
                  <td><Skeleton width="w-24" height="h-6" className="rounded-full" /></td>
                </tr>
              {/each}
            {:else if errorMessage}
              <tr>
                <td colspan="5" class="!p-4">
                  <AlertBanner variant="destructive" message={errorMessage} onRetry={() => { errorMessage = null; isLoading = true; setTimeout(() => isLoading = false, 600); }} />
                </td>
              </tr>
            {:else if waliPaginatedInvoices.length === 0}
              <tr>
                <td colspan="5" class="empty py-8 text-center text-muted-fg">
                  <Icon name="receipt_long" size="lg" className="opacity-50 mb-2 block mx-auto text-4xl" />
                  <div class="font-medium">Belum ada tagihan.</div>
                </td>
              </tr>
            {:else}
              {#each waliPaginatedInvoices as inv (inv.id)}
                <tr>
                  <td>{inv.invoiceNumber}</td>
                  <td>{getStudentOf(inv.enrollmentId)}</td>
                  <td>Bulan {inv.periodMonth}/{inv.periodYear}</td>
                  <td class="num"><strong>{formatCurrencyIDR(inv.amount)}</strong></td>
                  <td>
                    <span class="badge {getStatusBadgeClass(inv.status)}">
                      {getStatusLabel(inv.status, INVOICE_STATUS_LABEL)}
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
    <a href="/wali/children" class="btn btn-primary">
      <Icon name="school" size="sm" /> Program Les Anak
    </a>
    <a href="/wali/invoices" class="btn btn-outline">
      <Icon name="receipt_long" size="sm" /> Tagihan SPP
    </a>
  </div>
{/if}

<AttendanceVerifyModal
  open={verifyModalOpen}
  attendance={selectedAttendance}
  onClose={() => { verifyModalOpen = false; }}
/>
