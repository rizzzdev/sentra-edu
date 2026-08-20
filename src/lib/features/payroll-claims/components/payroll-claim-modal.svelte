<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { authStore } from '$lib/shared/stores/auth-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import type { User } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';

  export let open: boolean = false;
  export let tentor: User | null = null;
  export let onClose: () => void = () => {};

  $: currentUser = $authStore;
  $: isAdmin = currentUser?.role === 'SUPER_ADMIN';

  const now = new Date();
  let selectedTentorId: string = tentor ? tentor.id : '';
  let selectedMonth: string = String(now.getMonth() + 1);
  let selectedYear: number = now.getFullYear();

  $: tentors = $dbStore.users.filter((userItem) => userItem.deletedAt === null && userItem.role === 'TENTOR' && userItem.isActive);

  $: if (tentor) {
    selectedTentorId = tentor.id;
  } else if (!selectedTentorId && tentors.length > 0) {
    selectedTentorId = tentors[0].id;
  }

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Tentor options for SelectSearch
  $: tentorOptions = tentors.map((tentorUser) => {
    const info = getTentorSessionCount(tentorUser.id);
    return {
      value: tentorUser.id,
      label: `${tentorUser.fullName} (${info.count} sesi · ${formatCurrencyIDR(info.total)})`
    };
  });

  // Month options
  $: monthOptions = monthNames.map((monthName, index) => ({
    value: String(index + 1),
    label: `${monthName} ${selectedYear}`
  }));

  function getTentorSessionCount(targetTentorId: string): { count: number; total: number } {
    const existingClaimedIds = $dbStore.payrollClaims
      .filter((claimItem) => claimItem.deletedAt === null && claimItem.status !== 'REJECTED')
      .flatMap((claimItem) => claimItem.attendanceIds);

    const attendances = $dbStore.attendances.filter(
      (attendanceItem) => attendanceItem.deletedAt === null && attendanceItem.tentorId === targetTentorId && attendanceItem.status === 'APPROVED' && !existingClaimedIds.includes(attendanceItem.id)
    );

    const total = attendances.reduce((sum, attendanceItem) => {
      const enrollmentItem = $dbStore.enrollments.find((enrollment) => enrollment.id === attendanceItem.enrollmentId);
      const packagePlan = enrollmentItem ? $dbStore.packages.find((packageItem) => packageItem.id === enrollmentItem.packageId) : null;
      return sum + (packagePlan ? packagePlan.tentorFee : 100000);
    }, 0);

    return { count: attendances.length, total };
  }

  // Detail sesi yang akan diklaim
  $: pendingAttendances = selectedTentorId
    ? $dbStore.attendances.filter((attendanceItem) => {
        const existingClaimedIds = $dbStore.payrollClaims
          .filter((claimItem) => claimItem.deletedAt === null && claimItem.status !== 'REJECTED')
          .flatMap((claimItem) => claimItem.attendanceIds);
        return attendanceItem.deletedAt === null && attendanceItem.tentorId === selectedTentorId && attendanceItem.status === 'APPROVED' && !existingClaimedIds.includes(attendanceItem.id);
      })
    : [];

  $: sessionTotal = pendingAttendances.reduce((sum, attendanceItem) => {
    const enrollmentItem = $dbStore.enrollments.find((enrollment) => enrollment.id === attendanceItem.enrollmentId);
    const packagePlan = enrollmentItem ? $dbStore.packages.find((packageItem) => packageItem.id === enrollmentItem.packageId) : null;
    return sum + (packagePlan ? packagePlan.tentorFee : 100000);
  }, 0);

  function getStudentName(enrollmentId: string): string {
    const enrollmentItem = $dbStore.enrollments.find((enrollment) => enrollment.id === enrollmentId);
    if (!enrollmentItem) return '—';
    const studentUser = $dbStore.users.find((userItem) => userItem.id === enrollmentItem.studentId);
    return studentUser?.fullName || '—';
  }

  function getSubjectName(enrollmentId: string): string {
    const enrollmentItem = $dbStore.enrollments.find((enrollment) => enrollment.id === enrollmentId);
    if (!enrollmentItem) return '—';
    const subjectItem = $dbStore.subjects.find((subject) => subject.id === enrollmentItem.subjectId);
    return subjectItem?.name || '—';
  }

  function getFee(enrollmentId: string): number {
    const enrollmentItem = $dbStore.enrollments.find((enrollment) => enrollment.id === enrollmentId);
    const packagePlan = enrollmentItem ? $dbStore.packages.find((packageItem) => packageItem.id === enrollmentItem.packageId) : null;
    return packagePlan ? packagePlan.tentorFee : 100000;
  }

  function handleSubmit() {
    if (!selectedTentorId) {
      toastStore.error('Pilih tentor terlebih dahulu.');
      return;
    }

    if (!pendingAttendances.length) {
      toastStore.error('Belum ada sesi APPROVED yang belum masuk klaim lain.');
      return;
    }

    const attendanceIds = pendingAttendances.map((attendanceItem) => attendanceItem.id);

    const payload = {
      tentorId: selectedTentorId,
      periodStart: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`,
      periodEnd: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-28`,
      periodMonth: Number(selectedMonth),
      periodYear: selectedYear,
      totalAmount: sessionTotal,
      attendanceIds
    };

    const response = dbStore.submitPayrollClaim(payload);
    if (!response.error) {
      toastStore.success('Klaim honor berhasil dibuat. Segera proses pembayaran.');
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title="Buat Klaim Honor" icon="payments" maxWidth="640px">
  <form id="form-claim" on:submit|preventDefault={handleSubmit}>
    {#if isAdmin}
      <div class="field">
        <span>Tentor <i class="req">*</i></span>
        <SelectSearch
          bind:value={selectedTentorId}
          placeholder="Pilih tentor..."
          options={tentorOptions}
          searchable={true}
        />
      </div>
    {:else}
      <div class="alert alert-info -mt-1">
        <Icon name="verified" size="sm" />
        <span>Hanya sesi <strong>APPROVED yang belum masuk klaim lain</strong> yang dihitung.</span>
      </div>
    {/if}

    <div class="form-grid">
      <div class="field">
        <span>Bulan <i class="req">*</i></span>
        <SelectSearch
          bind:value={selectedMonth}
          placeholder="Pilih bulan"
          options={monthOptions}
        />
      </div>

      <div class="field">
        <span>Tahun <i class="req">*</i></span>
        <Input type="number" min="2026" required bind:value={selectedYear} />
      </div>
    </div>

    <!-- Detail sesi yang akan diklaim -->
    {#if selectedTentorId && pendingAttendances.length > 0}
      <div class="alert alert-success mt-1">
        <Icon name="check_circle" size="sm" />
        <span>
          <strong>{pendingAttendances.length} sesi</strong> APPROVED akan dimasukkan ke klaim ini
          — total <strong>{formatCurrencyIDR(sessionTotal)}</strong>.
        </span>
      </div>

      <div class="mt-3 max-h-60 overflow-y-auto border border-border rounded-xl">
        <table class="tbl m-0">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Murid</th>
              <th>Mapel</th>
              <th class="num">Fee</th>
            </tr>
          </thead>
          <tbody>
            {#each pendingAttendances as att (att.id)}
              <tr>
                <td class="sub">{att.sessionDate}</td>
                <td>{getStudentName(att.enrollmentId)}</td>
                <td>{getSubjectName(att.enrollmentId)}</td>
                <td class="num">{formatCurrencyIDR(getFee(att.enrollmentId))}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else if selectedTentorId}
      <div class="alert alert-warning mt-2">
        <Icon name="warning" size="sm" />
        <span>Belum ada sesi APPROVED yang tersedia untuk klaim pada periode ini.</span>
      </div>
    {/if}
  </form>

  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={onClose} icon="close">
      Batal
    </Button>
    <Button type="submit" variant="primary" form="form-claim" icon="payments" disabled={!selectedTentorId || pendingAttendances.length === 0}>
      Buat Klaim
    </Button>
  </svelte:fragment>
</Modal>
