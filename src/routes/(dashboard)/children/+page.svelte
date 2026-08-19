<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';

  $: currentUser = $authStore;

  $: myStudents = currentUser
    ? $dbStore.users.filter((u) => u.deletedAt === null && u.role === 'STUDENT' && u.waliUserId === currentUser?.id)
    : [];

  $: myStudentIds = myStudents.map((s) => s.id);

  $: myEnrollments = currentUser
    ? $dbStore.enrollments.filter(
        (e) => e.deletedAt === null && (e.waliUserId === currentUser?.id || myStudentIds.includes(e.studentId))
      )
    : [];

  function getStudentName(studentId: string): string {
    return $dbStore.users.find((u) => u.id === studentId)?.fullName || 'Anak';
  }

  function getClassName(classId: string): string {
    return $dbStore.classes.find((c) => c.id === classId)?.className || '—';
  }

  function getSubjectName(subjectId: string): string {
    return $dbStore.subjects.find((s) => s.id === subjectId)?.name || '—';
  }

  function getPackageName(packageId: string): string {
    return $dbStore.packages.find((p) => p.id === packageId)?.name || '—';
  }

  function getPackageMode(packageId: string): string {
    return $dbStore.packages.find((p) => p.id === packageId)?.mode || 'PRIVATE';
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="school" size="lg" /> Program Les Anak</h3>
    <div class="desc">Program bimbingan belajar anak yang sedang berjalan.</div>
  </div>
</div>

{#if myEnrollments.length === 0}
  <div class="empty-state">
    <Icon name="school" size="xl" />
    <p>Belum ada program les untuk anak Anda.</p>
  </div>
{:else}
  {#each myEnrollments as e (e.id)}
    <div class="job-card">
      <div class="j-top">
        <div class="j-title">
          {getStudentName(e.studentId)} — {getClassName(e.classId)} · {getSubjectName(e.subjectId)}
        </div>
        <span class="badge b-assigned">
          <Icon name="check" size="xs" /> Aktif
        </span>
      </div>
      <div class="j-meta">
        <span>
          <Icon name="sell" size="xs" />
          {getPackageName(e.packageId)} · {getPackageMode(e.packageId)}
        </span>
        <span>
          <Icon name="pin_drop" size="xs" />
          {e.address}
        </span>
      </div>
    </div>
  {/each}
{/if}
