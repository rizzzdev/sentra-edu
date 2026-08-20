<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { formatCurrencyIDR, formatDateIndonesian } from '$lib/shared/utils/formatting';
  import { JOB_STATUS_LABEL, ATTENDANCE_STATUS_LABEL, getStatusLabel, getStatusBadgeClass, getScheduleDaysList } from '$lib/shared/utils/status-map';
  import Skeleton from '$lib/components/atoms/skeleton.svelte';
  import Button from '$lib/components/atoms/button.svelte';
  import { goto } from '$app/navigation';

  $: currentUser = $authStore;
  $: tentorId = currentUser?.id || '';

  interface TutorActiveLesson {
    id: string;
    studentName: string;
    subjectName: string;
    className: string;
    schedule: string;
    mode: string;
  }

  // My active lessons (both direct enrollments and assigned jobs)
  $: myActiveLessons = (() => {
    const list: TutorActiveLesson[] = [];
    const seenIds = new Set<string>();

    const directEnrollments = $dbStore.enrollments.filter(
      (enrollmentItem) => enrollmentItem.deletedAt === null && enrollmentItem.tentorId === tentorId && enrollmentItem.status === 'ACTIVE'
    );
    for (const enr of directEnrollments) {
      seenIds.add(enr.id);
      const student = $dbStore.users.find((userItem) => userItem.id === enr.studentId);
      list.push({
        id: enr.id,
        studentName: student?.fullName || 'Murid',
        subjectName: getSubjectName(enr.subjectId),
        className: getClassName(enr.classId),
        schedule: `${enr.scheduleDay ? getScheduleDaysList([enr.scheduleDay]).join(', ') : '—'} · ${enr.scheduleTime}`,
        mode: 'Privat'
      });
    }

    const assignedJobs = $dbStore.jobs.filter(
      (jobItem) => jobItem.deletedAt === null && jobItem.assignedTentorId === tentorId && jobItem.status === 'ASSIGNED'
    );
    for (const job of assignedJobs) {
      if (job.enrollmentId && seenIds.has(job.enrollmentId)) continue;
      seenIds.add(job.id);

      const studentNames = Array.isArray(job.studentNames) && job.studentNames.length > 0
        ? job.studentNames.join(', ')
        : (job.studentName || (job.studentId ? $dbStore.users.find((userItem) => userItem.id === job.studentId)?.fullName : 'Murid'));

      const subjectIds = Array.isArray(job.subjectIds) && job.subjectIds.length > 0 ? job.subjectIds : (job.subjectId ? [job.subjectId] : []);
      const subjectNames = $dbStore.subjects.filter((subjectItem) => subjectIds.includes(subjectItem.id)).map((subjectItem) => subjectItem.name).join(', ') || 'Mapel';

      const classIds = Array.isArray(job.classIds) && job.classIds.length > 0 ? job.classIds : (job.classId ? [job.classId] : []);
      const classNames = $dbStore.classes.filter((classItem) => classIds.includes(classItem.id)).map((classItem) => classItem.className).join(', ') || 'Kelas';

      const isGroup = (job.studentCount && job.studentCount > 1) || (Array.isArray(job.studentIds) && job.studentIds.length > 1);

      list.push({
        id: job.id,
        studentName: studentNames || 'Murid',
        subjectName: subjectNames,
        className: classNames,
        schedule: `${getScheduleDaysList(job.scheduleDays).join(', ')} · ${job.scheduleTime || '16:00'}${job.scheduleEndTime ? ` - ${job.scheduleEndTime}` : ''}`,
        mode: isGroup ? 'Kelompok' : 'Privat'
      });
    }

    return list;
  })();

  // My attendance records
  $: myAttendances = $dbStore.attendances.filter(
    (attendanceItem) => attendanceItem.deletedAt === null && attendanceItem.tentorId === tentorId
  );
  $: approvedAttendances = myAttendances.filter((attendanceItem) => attendanceItem.status === 'APPROVED');
  $: pendingAttendances = myAttendances.filter((attendanceItem) => attendanceItem.status === 'SUBMITTED');

  // My payroll claims
  $: myClaims = $dbStore.payrollClaims.filter(
    (claimItem) => claimItem.deletedAt === null && claimItem.tentorId === tentorId
  );
  $: paidClaims = myClaims.filter((claimItem) => claimItem.status === 'PAID');
  $: totalPaid = paidClaims.reduce((sum, claimItem) => sum + claimItem.totalAmount, 0);

  // Available jobs (open for application)
  $: openJobs = $dbStore.jobs.filter(
    (jobItem) => jobItem.deletedAt === null && jobItem.status === 'AVAILABLE'
  );

  // My applications
  $: myApps = $dbStore.applications.filter(
    (appItem) => appItem.deletedAt === null && appItem.tentorId === tentorId
  );

  function getSubjectName(subjectId: string): string {
    return $dbStore.subjects.find((subjectItem) => subjectItem.id === subjectId)?.name || '—';
  }

  function getClassName(classId: string): string {
    return $dbStore.classes.find((classItem) => classItem.id === classId)?.className || '—';
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
        <div class="s-val">{myActiveLessons.length}</div>
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
  <div class="quick-actions mb-5">
    <Button variant="primary" icon="school" on:click={() => goto('/tutor/classes')}>
      Program Les Aktif
    </Button>
    <Button variant="outline" icon="work" on:click={() => goto('/tutor/job-board')}>
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
      <div class="card-head flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Icon name="menu_book" size="md" />
          <span>Les Aktif Saya</span>
        </div>
        <a href="/tutor/classes" class="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1">
          Lihat Semua <Icon name="arrow_forward" size="xs" />
        </a>
      </div>
      <div class="card-body flush">
        {#if myActiveLessons.length === 0}
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
                  <th>Mode</th>
                  <th>Jadwal</th>
                </tr>
              </thead>
              <tbody>
                {#each myActiveLessons as lesson (lesson.id)}
                  <tr>
                    <td>
                      <a href="/tutor/classes/{lesson.id}" class="font-semibold text-primary hover:underline">
                        {lesson.studentName}
                      </a>
                    </td>
                    <td>{lesson.subjectName}</td>
                    <td>{lesson.className}</td>
                    <td><span class="badge {lesson.mode === 'Privat' ? 'b-sky' : 'b-amber'}">{lesson.mode}</span></td>
                    <td class="sub">{lesson.schedule}</td>
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
                {#each myAttendances.slice(0, 5) as attendanceItem (attendanceItem.id)}
                  <tr>
                    <td class="sub">{formatDate(attendanceItem.sessionDate)}</td>
                    <td>{attendanceItem.topic}</td>
                    <td>
                      <span class="badge {getStatusBadgeClass(attendanceItem.status)}">
                        {getStatusLabel(attendanceItem.status, ATTENDANCE_STATUS_LABEL)}
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
                {@const job = $dbStore.jobs.find((jobItem) => jobItem.id === app.jobId)}
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
