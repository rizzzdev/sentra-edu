<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';

  import { getStudentPrograms, getParentPrograms } from '$lib/shared/utils/program-helpers';
import { userStore, subjectStore, enrollmentStore, jobStore, attendanceStore } from '$lib/api';
import { database } from '$lib/shared/stores';

  const currentUser = $derived($authStore);

  // Student data calculation
  const studentPrograms = $derived(currentUser ? getStudentPrograms($database, currentUser.id, currentUser.fullName) : []);
  const studentProgramIds = $derived(studentPrograms.map((programItem) => programItem.id));
  const studentEnrs = $derived(
    currentUser
      ? $enrollmentStore.filter((enrollmentItem) => enrollmentItem.deletedAt === null && enrollmentItem.studentId === currentUser?.id)
      : []
  );
  const studentEnrIds = $derived(studentEnrs.map((enrollmentItem) => enrollmentItem.id));

  const studentApprovedAtt = $derived($attendanceStore.filter(
    (attendanceItem) => attendanceItem.deletedAt === null && (studentEnrIds.includes(attendanceItem.enrollmentId) || studentProgramIds.includes(attendanceItem.enrollmentId)) && attendanceItem.status === 'APPROVED'
  ));

  const studentBySubject = $derived.by(() => {
    const map: Record<string, { count: number; topics: string[] }> = {};
    studentApprovedAtt.forEach((attendanceItem) => {
      let subjectDisplayName = 'Lainnya';
      const enrollmentItem = $enrollmentStore.find((enrollment) => enrollment.id === attendanceItem.enrollmentId);
      if (enrollmentItem) {
        const subjectItem = $subjectStore.find((subject) => subject.id === enrollmentItem.subjectId);
        if (subjectItem) subjectDisplayName = subjectItem.name;
      } else {
        const jobItem = $jobStore.find((job) => job.id === attendanceItem.enrollmentId);
        if (jobItem) {
          const subjectIds = Array.isArray(jobItem.subjectIds) && jobItem.subjectIds.length > 0 ? jobItem.subjectIds : (jobItem.subjectId ? [jobItem.subjectId] : []);
          const subjectItem = $subjectStore.find((subject) => subjectIds.includes(subject.id));
          if (subjectItem) subjectDisplayName = subjectItem.name;
        }
      }

      if (!map[subjectDisplayName]) map[subjectDisplayName] = { count: 0, topics: [] };
      map[subjectDisplayName].count++;
      if (attendanceItem.topic && !map[subjectDisplayName].topics.includes(attendanceItem.topic)) {
        map[subjectDisplayName].topics.push(attendanceItem.topic);
      }
    });
    return map;
  });

  const totalStudentHours = $derived(Math.round(studentApprovedAtt.length * 1.5));

  // Orang Tua data calculation
  const parentPrograms = $derived(currentUser ? getParentPrograms($database, currentUser.id) : []);
  const parentProgramIds = $derived(parentPrograms.map((programItem) => programItem.id));
  const parentStudents = $derived(
    currentUser
      ? $userStore.filter((userItem) => userItem.deletedAt === null && userItem.role === 'STUDENT' && userItem.parentId === currentUser?.id)
      : []
  );
  const parentStudentIds = $derived(parentStudents.map((studentUser) => studentUser.id));

  const parentEnrs = $derived($enrollmentStore.filter(
    (enrollmentItem) => enrollmentItem.deletedAt === null && (enrollmentItem.parentId === currentUser?.id || parentStudentIds.includes(enrollmentItem.studentId))
  ));
  const parentEnrIds = $derived(parentEnrs.map((enrollmentItem) => enrollmentItem.id));

  const parentApprovedAtt = $derived($attendanceStore.filter(
    (attendanceItem) => attendanceItem.deletedAt === null && (parentEnrIds.includes(attendanceItem.enrollmentId) || parentProgramIds.includes(attendanceItem.enrollmentId)) && attendanceItem.status === 'APPROVED'
  ));

  const parentByStudent = $derived.by(() => {
    const map: Record<string, { count: number; hours: number }> = {};
    parentApprovedAtt.forEach((attendanceItem) => {
      let studentDisplayName = '—';
      const enrollmentItem = $enrollmentStore.find((enrollment) => enrollment.id === attendanceItem.enrollmentId);
      if (enrollmentItem) {
        const studentUser = $userStore.find((userItem) => userItem.id === enrollmentItem.studentId);
        if (studentUser) studentDisplayName = studentUser.fullName;
      } else {
        const jobItem = $jobStore.find((job) => job.id === attendanceItem.enrollmentId);
        if (jobItem) {
          if (Array.isArray(jobItem.studentNames) && jobItem.studentNames.length > 0) studentDisplayName = jobItem.studentNames.join(', ');
          else if (jobItem.studentName) studentDisplayName = jobItem.studentName;
          else if (jobItem.studentId) studentDisplayName = $userStore.find((userItem) => userItem.id === jobItem.studentId)?.fullName || '—';
        }
      }

      if (!map[studentDisplayName]) map[studentDisplayName] = { count: 0, hours: 0 };
      map[studentDisplayName].count++;
      map[studentDisplayName].hours += 90;
    });
    return map;
  });
</script>

{#if currentUser?.role === 'STUDENT'}
  <div class="page-head">
    <div>
      <h3><Icon name="summarize" size="lg" /> Laporan Hasil Belajar</h3>
      <div class="desc">Ringkasan progress belajar berdasarkan sesi yang telah disetujui.</div>
    </div>
  </div>

  <div class="stat-grid">
    <div class="stat">
      <div class="s-icon tone-sky"><Icon name="verified" size="lg" /></div>
      <div>
        <div class="s-val">{studentApprovedAtt.length}</div>
        <div class="s-lbl">Total Sesi Disetujui</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-emerald"><Icon name="schedule" size="lg" /></div>
      <div>
        <div class="s-val">{totalStudentHours} jam</div>
        <div class="s-lbl">Total Jam Belajar</div>
      </div>
    </div>
    <div class="stat">
      <div class="s-icon tone-amber"><Icon name="menu_book" size="lg" /></div>
      <div>
        <div class="s-val">{Object.keys(studentBySubject).length}</div>
        <div class="s-lbl">Jumlah Mapel</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-head">
      <Icon name="menu_book" size="md" /> Rekap per Mata Pelajaran
    </div>
    <div class="card-body flush">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Mapel</th>
              <th class="num">Sesi</th>
              <th>Topik yang Dipelajari</th>
            </tr>
          </thead>
          <tbody>
            {#if Object.keys(studentBySubject).length === 0}
              <tr>
                <td colspan="3" class="empty">Belum ada sesi yang disetujui.</td>
              </tr>
            {:else}
              {#each Object.keys(studentBySubject) as subjectName}
                {@const detail = studentBySubject[subjectName]}
                <tr>
                  <td><strong>{subjectName}</strong></td>
                  <td class="num">{detail.count} sesi</td>
                  <td>{detail.topics.join(', ')}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>

{:else if currentUser?.role === 'PARENT'}
  <div class="page-head">
    <div>
      <h3><Icon name="summarize" size="lg" /> Laporan Hasil Belajar Anak</h3>
      <div class="desc">Ringkasan progress belajar anak berdasarkan sesi yang telah disetujui.</div>
    </div>
  </div>

  <div class="card">
    <div class="card-head">
      <Icon name="group" size="md" /> Rekap per Anak
    </div>
    <div class="card-body flush">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Anak</th>
              <th class="num">Sesi</th>
              <th class="num">Total Jam</th>
            </tr>
          </thead>
          <tbody>
            {#if Object.keys(parentByStudent).length === 0}
              <tr>
                <td colspan="3" class="empty">Belum ada sesi yang disetujui.</td>
              </tr>
            {:else}
              {#each Object.keys(parentByStudent) as studentName}
                {@const detail = parentByStudent[studentName]}
                <tr>
                  <td><strong>{studentName}</strong></td>
                  <td class="num">{detail.count} sesi</td>
                  <td class="num">{Math.round(detail.hours / 60)} jam</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>
{/if}
