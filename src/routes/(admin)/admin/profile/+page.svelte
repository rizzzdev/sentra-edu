<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import UserModal from '$lib/features/master-data/components/user-modal.svelte';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import type { UserRole } from '$lib/shared/types/common.types';
  import { ROLE_LABEL } from '$lib/shared/utils/status-map';

  let editModalOpen: boolean = false;

  $: currentUser = $authStore;

  $: initials = currentUser
    ? currentUser.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('')
    : 'U';

  const roleBadgeMap: Record<UserRole, string> = {
    SUPER_ADMIN: 'b-admin',
    TENTOR: 'b-tentor',
    STUDENT: 'b-student',
    WALI_MURID: 'b-neutral'
  };

  // Activity stats by role
  $: approvedSessions = currentUser
    ? $dbStore.attendances.filter((attendanceItem) => attendanceItem.deletedAt === null && attendanceItem.tentorId === currentUser?.id && attendanceItem.status === 'APPROVED').length
    : 0;

  $: activeJobs = currentUser
    ? $dbStore.jobs.filter((jobItem) => jobItem.deletedAt === null && jobItem.assignedTentorId === currentUser?.id && jobItem.status === 'ASSIGNED').length
    : 0;

  $: paidHonor = currentUser
    ? $dbStore.payrollClaims
        .filter((claimItem) => claimItem.deletedAt === null && claimItem.tentorId === currentUser?.id && claimItem.status === 'PAID')
        .reduce((sum, claimItem) => sum + claimItem.totalAmount, 0)
    : 0;

  $: studentPrograms = currentUser
    ? $dbStore.enrollments.filter((enrollmentItem) => enrollmentItem.deletedAt === null && enrollmentItem.studentId === currentUser?.id).length
    : 0;

  $: waliChildren = currentUser
    ? $dbStore.users.filter((userItem) => userItem.deletedAt === null && userItem.role === 'STUDENT' && userItem.waliUserId === currentUser?.id).length
    : 0;

  function getSubjectNames(subjectIds?: string[]): string {
    if (!subjectIds || subjectIds.length === 0) return '—';
    return $dbStore.subjects
      .filter((subjectItem) => subjectIds.includes(subjectItem.id))
      .map((subjectItem) => subjectItem.name)
      .join(', ') || '—';
  }

  function getLevelNames(levelIds?: string[]): string {
    if (!levelIds || levelIds.length === 0) return '—';
    return $dbStore.educationLevels
      .filter((levelItem) => levelIds.includes(levelItem.id))
      .map((levelItem) => levelItem.levelName)
      .join(', ') || '—';
  }
</script>

{#if currentUser}
  <div class="page-head">
    <div>
      <h3><Icon name="person" size="lg" /> Profil Saya</h3>
      <div class="desc">Informasi akun Anda — perubahan langsung berlaku, termasuk untuk login berikutnya.</div>
    </div>
    <button type="button" class="btn btn-primary" on:click={() => { editModalOpen = true; }}>
      <Icon name="edit" size="sm" /> Ubah Profil
    </button>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-body flex items-center gap-4.5">
        <div class="avatar w-16 h-16 text-2xl font-extrabold">
          {initials}
        </div>
        <div>
          <div class="text-xl font-extrabold">
            {currentUser.fullName}
          </div>
          <div class="text-muted-fg text-sm">
            {currentUser.email}
          </div>
          <div class="mt-2">
            <span class="badge {roleBadgeMap[currentUser.role]}">
              {ROLE_LABEL[currentUser.role] || currentUser.role}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="kv">
          <dt>Nama Lengkap</dt>
          <dd>{currentUser.fullName}</dd>
          <dt>Email</dt>
          <dd>{currentUser.email}</dd>
          <dt>Telepon</dt>
          <dd>{currentUser.phone || '—'}</dd>
          <dt>Peran</dt>
          <dd>{ROLE_LABEL[currentUser.role] || currentUser.role}</dd>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-head">
      <Icon name="badge" size="md" /> Detail Profil
    </div>
    <div class="card-body">
      <div class="kv">
        {#if currentUser.role === 'SUPER_ADMIN'}
          <dt>Jabatan</dt>
          <dd>{currentUser.position || 'Super Admin SentraEdu'}</dd>
          <dt>Departemen</dt>
          <dd>{currentUser.department || 'Manajemen Operasional'}</dd>
        {:else if currentUser.role === 'TENTOR'}
          <dt>Pendidikan Terakhir</dt>
          <dd>{currentUser.education || '—'}</dd>
          <dt>Pengalaman</dt>
          <dd>{currentUser.experienceYears || 0} tahun mengajar</dd>
          <dt>Mata Pelajaran</dt>
          <dd>{getSubjectNames(currentUser.subjectIds)}</dd>
          <dt>Jenjang Diajar</dt>
          <dd>{getLevelNames(currentUser.levelIds)}</dd>
        {:else if currentUser.role === 'STUDENT'}
          <dt>Asal Sekolah</dt>
          <dd>{currentUser.school || '—'}</dd>
          <dt>Alamat Rumah</dt>
          <dd>{currentUser.address || '—'}</dd>
        {:else if currentUser.role === 'WALI_MURID'}
          <dt>Pekerjaan</dt>
          <dd>{currentUser.occupation || '—'}</dd>
          <dt>Alamat Rumah</dt>
          <dd>{currentUser.address || '—'}</dd>
        {/if}
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-head">
      <Icon name="insights" size="md" /> Ringkasan Aktivitas
    </div>
    <div class="card-body">
      <div class="stat-grid mb-0">
        {#if currentUser.role === 'SUPER_ADMIN'}
          <div class="stat">
            <div class="s-icon tone-sky"><Icon name="work" size="lg" /></div>
            <div>
              <div class="s-val">{$dbStore.jobs.length}</div>
              <div class="s-lbl">Total Lowongan</div>
            </div>
          </div>
          <div class="stat">
            <div class="s-icon tone-emerald"><Icon name="group" size="lg" /></div>
            <div>
              <div class="s-val">{$dbStore.enrollments.length}</div>
              <div class="s-lbl">Murid Terdaftar</div>
            </div>
          </div>
          <div class="stat">
            <div class="s-icon tone-violet"><Icon name="school" size="lg" /></div>
            <div>
              <div class="s-val">{$dbStore.users.filter((userItem) => userItem.role === 'TENTOR').length}</div>
              <div class="s-lbl">Tentor Aktif</div>
            </div>
          </div>
        {:else if currentUser.role === 'TENTOR'}
          <div class="stat">
            <div class="s-icon tone-emerald"><Icon name="verified" size="lg" /></div>
            <div>
              <div class="s-val">{approvedSessions}</div>
              <div class="s-lbl">Sesi Disetujui</div>
            </div>
          </div>
          <div class="stat">
            <div class="s-icon tone-sky"><Icon name="assignment" size="lg" /></div>
            <div>
              <div class="s-val">{activeJobs}</div>
              <div class="s-lbl">Penugasan Aktif</div>
            </div>
          </div>
          <div class="stat">
            <div class="s-icon tone-violet"><Icon name="payments" size="lg" /></div>
            <div>
              <div class="s-val">{formatCurrencyIDR(paidHonor)}</div>
              <div class="s-lbl">Honor Diterima</div>
            </div>
          </div>
        {:else if currentUser.role === 'STUDENT'}
          <div class="stat">
            <div class="s-icon tone-sky"><Icon name="school" size="lg" /></div>
            <div>
              <div class="s-val">{studentPrograms}</div>
              <div class="s-lbl">Program Les Aktif</div>
            </div>
          </div>
          <div class="stat">
            <div class="s-icon tone-emerald"><Icon name="fact_check" size="lg" /></div>
            <div>
              <div class="s-val">{$dbStore.attendances.filter((attendanceItem) => attendanceItem.status === 'APPROVED').length}</div>
              <div class="s-lbl">Sesi Disetujui</div>
            </div>
          </div>
        {:else if currentUser.role === 'WALI_MURID'}
          <div class="stat">
            <div class="s-icon tone-sky"><Icon name="family_restroom" size="lg" /></div>
            <div>
              <div class="s-val">{waliChildren}</div>
              <div class="s-lbl">Anak Terdaftar</div>
            </div>
          </div>
          <div class="stat">
            <div class="s-icon tone-emerald"><Icon name="school" size="lg" /></div>
            <div>
              <div class="s-val">{$dbStore.enrollments.filter((enrollmentItem) => enrollmentItem.waliUserId === currentUser?.id).length}</div>
              <div class="s-lbl">Program Les Anak</div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <UserModal
    open={editModalOpen}
    editingUser={currentUser}
    onClose={() => { editModalOpen = false; }}
  />
{/if}
