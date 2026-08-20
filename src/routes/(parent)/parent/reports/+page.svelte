<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';

  $: currentUser = $authStore;

  // Student data calculation
  $: studentEnrs = currentUser
    ? $dbStore.enrollments.filter((e) => e.deletedAt === null && e.studentId === currentUser?.id)
    : [];
  $: studentEnrIds = studentEnrs.map((e) => e.id);

  $: studentApprovedAtt = $dbStore.attendances.filter(
    (a) => a.deletedAt === null && studentEnrIds.includes(a.enrollmentId) && a.status === 'APPROVED'
  );

  $: studentBySubject = (() => {
    const map: Record<string, { count: number; topics: string[] }> = {};
    studentApprovedAtt.forEach((a) => {
      const enr = $dbStore.enrollments.find((e) => e.id === a.enrollmentId);
      const sub = enr ? $dbStore.subjects.find((s) => s.id === enr.subjectId) : null;
      const sName = sub ? sub.name : 'Lainnya';
      if (!map[sName]) map[sName] = { count: 0, topics: [] };
      map[sName].count++;
      if (!map[sName].topics.includes(a.topic)) {
        map[sName].topics.push(a.topic);
      }
    });
    return map;
  })();

  $: totalStudentHours = Math.round(studentApprovedAtt.length * 1.5);

  // Wali Murid data calculation
  $: waliStudents = currentUser
    ? $dbStore.users.filter((u) => u.deletedAt === null && u.role === 'STUDENT' && u.waliUserId === currentUser?.id)
    : [];
  $: waliStudentIds = waliStudents.map((s) => s.id);

  $: waliEnrs = $dbStore.enrollments.filter(
    (e) => e.deletedAt === null && (e.waliUserId === currentUser?.id || waliStudentIds.includes(e.studentId))
  );
  $: waliEnrIds = waliEnrs.map((e) => e.id);

  $: waliApprovedAtt = $dbStore.attendances.filter(
    (a) => a.deletedAt === null && waliEnrIds.includes(a.enrollmentId) && a.status === 'APPROVED'
  );

  $: waliByStudent = (() => {
    const map: Record<string, { count: number; hours: number }> = {};
    waliApprovedAtt.forEach((a) => {
      const enr = $dbStore.enrollments.find((e) => e.id === a.enrollmentId);
      const student = enr ? $dbStore.users.find((u) => u.id === enr.studentId) : null;
      const sName = student ? student.fullName : '—';
      if (!map[sName]) map[sName] = { count: 0, hours: 0 };
      map[sName].count++;
      map[sName].hours += 90;
    });
    return map;
  })();
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
              {#each Object.keys(studentBySubject) as sName}
                {@const d = studentBySubject[sName]}
                <tr>
                  <td><strong>{sName}</strong></td>
                  <td class="num">{d.count} sesi</td>
                  <td>{d.topics.join(', ')}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>

{:else if currentUser?.role === 'WALI_MURID'}
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
            {#if Object.keys(waliByStudent).length === 0}
              <tr>
                <td colspan="3" class="empty">Belum ada sesi yang disetujui.</td>
              </tr>
            {:else}
              {#each Object.keys(waliByStudent) as sName}
                {@const d = waliByStudent[sName]}
                <tr>
                  <td><strong>{sName}</strong></td>
                  <td class="num">{d.count} sesi</td>
                  <td class="num">{Math.round(d.hours / 60)} jam</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>
{/if}
