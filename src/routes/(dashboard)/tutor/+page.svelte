<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { formatCurrencyIDR, formatDateIndonesian } from '$lib/shared/utils/formatting';
  import { JOB_STATUS_LABEL, ATTENDANCE_STATUS_LABEL, getStatusLabel, getStatusBadgeClass } from '$lib/shared/utils/status-map';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
  import Button from '$lib/components/atoms/button.svelte';
  import { goto } from '$app/navigation';

  $: currentUser = $authStore;
  $: tentorId = currentUser?.id || '';

  // My enrollments (active jobs assigned to me)
  $: myEnrollments = $dbStore.enrollments.filter(
    (e) => e.deletedAt === null && e.tentorId === tentorId && e.status === 'ACTIVE'
  );

  // My attendance records
  $: myAttendances = $dbStore.attendances.filter(
    (a) => a.deletedAt === null && a.tentorId === tentorId
  );
  $: approvedAttendances = myAttendances.filter((a) => a.status === 'APPROVED');
  $: pendingAttendances = myAttendances.filter((a) => a.status === 'SUBMITTED');

  // My payroll claims
  $: myClaims = $dbStore.payrollClaims.filter(
    (c) => c.deletedAt === null && c.tentorId === tentorId
  );
  $: paidClaims = myClaims.filter((c) => c.status === 'PAID');
  $: totalPaid = paidClaims.reduce((sum, c) => sum + c.totalAmount, 0);

  // Available jobs (open for application)
  $: openJobs = $dbStore.jobs.filter(
    (j) => j.deletedAt === null && j.status === 'AVAILABLE'
  );

  // My applications
  $: myApps = $dbStore.applications.filter(
    (a) => a.deletedAt === null && a.tentorId === tentorId
  );

  function getSubjectName(subjectId: string): string {
    return $dbStore.subjects.find((s) => s.id === subjectId)?.name || '—';
  }

  function getClassName(classId: string): string {
    return $dbStore.classes.find((c) => c.id === classId)?.className || '—';
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }
</script>

{#if currentUser}
  <div class="page-head">
    <div>
      <h3><Icon name="school" size="lg" /> Dashboard Tentor</h3>
      <div class="desc">Selamat datang, {currentUser.fullName}. Kelola jadwal mengajar dan presensi Anda.</div>
    </div>
  </div>

  <!-- STAT CARDS -->
  <div class="stat-grid">
    <div class="stat">
      <div class="s-icon tone-sky"><Icon name="menu_book" size="lg" /></div>
      <div>
        <div class="s-val">{myEnrollments.length}</div>
        <div class="s-lbl">Les Aktif</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-emerald"><Icon name="check_circle" size="lg" /></div>
      <div>
        <div class="s-val">{approvedAttendances.length}</div>
        <div class="s-lbl">Presensi Disetujui</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-amber"><Icon name="pending" size="lg" /></div>
      <div>
        <div class="s-val">{pendingAttendances.length}</div>
        <div class="s-lbl">Menunggu Verifikasi</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-violet"><Icon name="payments" size="lg" /></div>
      <div>
        <div class="s-val">{formatCurrencyIDR(totalPaid)}</div>
        <div class="s-lbl">Total Honor Dibayar</div>
      </div>
    </div>
  </div>

  <!-- QUICK ACTIONS -->
  <div class="quick-actions" style="margin-bottom:20px">
    <Button variant="primary" icon="work" on:click={() => goto('/tutor/job-board')}>
      Cari Lowongan
    </Button>
    <Button variant="outline" icon="location_on" on:click={() => goto('/tutor/attendance')}>
      Presensi Saya
    </Button>

  </div>

  <!-- TWO COLUMN LAYOUT -->
  <div class="grid-2">
    <!-- Active Lessons -->
    <div class="card">
      <div class="card-head">
        <Icon name="menu_book" size="md" /> Les Aktif Saya
      </div>
      <div class="card-body flush">
        {#if myEnrollments.length === 0}
          <div class="empty-state">
            <Icon name="school" size="lg" />
            <p>Belum ada les aktif yang ditugaskan.</p>
          </div>
        {:else}
          <div class="table-wrap">
            <table class="tbl">
              <thead>
                <tr>
                  <th>Siswa</th>
                  <th>Mapel</th>
                  <th>Kelas</th>
                  <th>Jadwal</th>
                </tr>
              </thead>
              <tbody>
                {#each myEnrollments as enr (enr.id)}
                  {@const student = $dbStore.users.find((u) => u.id === enr.studentId)}
                  <tr>
                    <td><strong>{student?.fullName || '—'}</strong></td>
                    <td>{getSubjectName(enr.subjectId)}</td>
                    <td>{getClassName(enr.classId)}</td>
                    <td class="sub">{enr.scheduleDay} · {enr.scheduleTime}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </div>

    <!-- Recent Attendance -->
    <div class="card">
      <div class="card-head">
        <Icon name="fact_check" size="md" /> Presensi Terakhir
      </div>
      <div class="card-body flush">
        {#if myAttendances.length === 0}
          <div class="empty-state">
            <Icon name="location_off" size="lg" />
            <p>Belum ada catatan presensi.</p>
          </div>
        {:else}
          <div class="table-wrap">
            <table class="tbl">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Topik</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {#each myAttendances.slice(0, 5) as att (att.id)}
                  <tr>
                    <td class="sub">{formatDate(att.sessionDate)}</td>
                    <td>{att.topic}</td>
                    <td>
                      <span class="badge {getStatusBadgeClass(att.status)}">
                        {getStatusLabel(att.status, ATTENDANCE_STATUS_LABEL)}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Recent Applications -->
  {#if myApps.length > 0}
    <div class="card">
      <div class="card-head">
        <Icon name="send" size="md" /> Lamaran Saya
      </div>
      <div class="card-body flush">
        <div class="table-wrap">
          <table class="tbl">
            <thead>
              <tr>
                <th>Lowongan</th>
                <th>Tanggal Lamar</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {#each myApps as app (app.id)}
                {@const job = $dbStore.jobs.find((j) => j.id === app.jobId)}
                <tr>
                  <td><strong>{job?.title || '—'}</strong></td>
                  <td class="sub">{formatDate(app.appliedAt)}</td>
                  <td>
                    <span class="badge {getStatusBadgeClass(app.status)}">
                      {app.status}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {/if}
{:else}
  <Skeleton />
{/if}
