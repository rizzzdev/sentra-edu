<script lang="ts">
import { userStore, subjectStore, packageStore, enrollmentStore, attendanceStore, payrollStore } from '$lib/api';
  import { SelectSearch } from '$lib/components/molecules';
  import { Icon, Input } from '$lib/components/atoms';
  import Modal from '$lib/components/molecules/modal.svelte';
  import {authStore, toastStore} from '$lib/shared/stores';
  import { formatCurrencyIDR } from '$lib/shared/utils';
  import type { User } from '$lib/shared/types';
  import { Button } from '$lib/components/atoms';
  import { api } from '$lib/api/client';

  let {
    open = false,
    tentor = null,
    onClose = () => {}
  }: {
    open?: boolean;
    tentor?: User | null;
    onClose?: () => void;
  } = $props();

  let currentUser = $derived($authStore);
  let isAdmin = $derived(currentUser?.role === 'SUPER_ADMIN');

  const now = new Date();
  let selectedTentorId = $state('');
  let selectedMonth = $state(String(now.getMonth() + 1));
  let selectedYear = $state(now.getFullYear());

  let tentors = $derived($userStore.filter((userItem) => userItem.deletedAt === null && userItem.role === 'TENTOR' && userItem.isActive));

  $effect(() => {
    if (tentor) {
      selectedTentorId = tentor.id;
    } else if (!selectedTentorId && tentors.length > 0) {
      selectedTentorId = tentors[0].id;
    }
  });

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  let tentorOptions = $derived(tentors.map((tentorUser) => {
    const info = getTentorSessionCount(tentorUser.id);
    return {
      value: tentorUser.id,
      label: `${tentorUser.fullName} (${info.count} sesi · ${formatCurrencyIDR(info.total)})`
    };
  }));

  let monthOptions = $derived(monthNames.map((monthName, index) => ({
    value: String(index + 1),
    label: `${monthName} ${selectedYear}`
  })));

  function getTentorSessionCount(targetTentorId: string): { count: number; total: number } {
    const existingClaimedIds = $payrollStore
      .filter((claimItem) => claimItem.deletedAt === null && claimItem.status !== 'REJECTED')
      .flatMap((claimItem) => claimItem.attendanceIds);

    const attendances = $attendanceStore.filter(
      (attendanceItem) => attendanceItem.deletedAt === null && attendanceItem.tentorId === targetTentorId && attendanceItem.status === 'APPROVED' && !existingClaimedIds.includes(attendanceItem.id)
    );

    const total = attendances.reduce((sum, attendanceItem) => {
      const enrollmentItem = $enrollmentStore.find((enrollment) => enrollment.id === attendanceItem.enrollmentId);
      const packagePlan = enrollmentItem ? $packageStore.find((packageItem) => packageItem.id === enrollmentItem.packageId) : null;
      return sum + (packagePlan ? packagePlan.tentorFee : 100000);
    }, 0);

    return { count: attendances.length, total };
  }

  let pendingAttendances = $derived(
    selectedTentorId
      ? $attendanceStore.filter((attendanceItem) => {
          const existingClaimedIds = $payrollStore
            .filter((claimItem) => claimItem.deletedAt === null && claimItem.status !== 'REJECTED')
            .flatMap((claimItem) => claimItem.attendanceIds);
          return attendanceItem.deletedAt === null && attendanceItem.tentorId === selectedTentorId && attendanceItem.status === 'APPROVED' && !existingClaimedIds.includes(attendanceItem.id);
        })
      : []
  );

  let sessionTotal = $derived(pendingAttendances.reduce((sum, attendanceItem) => {
    const enrollmentItem = $enrollmentStore.find((enrollment) => enrollment.id === attendanceItem.enrollmentId);
    const packagePlan = enrollmentItem ? $packageStore.find((packageItem) => packageItem.id === enrollmentItem.packageId) : null;
    return sum + (packagePlan ? packagePlan.tentorFee : 100000);
  }, 0));

  function getStudentName(enrollmentId: string): string {
    const enrollmentItem = $enrollmentStore.find((enrollment) => enrollment.id === enrollmentId);
    if (!enrollmentItem) return '—';
    const studentUser = $userStore.find((userItem) => userItem.id === enrollmentItem.studentId);
    return studentUser?.fullName || '—';
  }

  function getSubjectName(enrollmentId: string): string {
    const enrollmentItem = $enrollmentStore.find((enrollment) => enrollment.id === enrollmentId);
    if (!enrollmentItem) return '—';
    const subjectItem = $subjectStore.find((subject) => subject.id === enrollmentItem.subjectId);
    return subjectItem?.name || '—';
  }

  function getFee(enrollmentId: string): number {
    const enrollmentItem = $enrollmentStore.find((enrollment) => enrollment.id === enrollmentId);
    const packagePlan = enrollmentItem ? $packageStore.find((packageItem) => packageItem.id === enrollmentItem.packageId) : null;
    return packagePlan ? packagePlan.tentorFee : 100000;
  }

  async function handleSubmit() {
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

    const response = await api.payroll.create(payload);
    if (!response.error) {
      toastStore.success('Klaim honor berhasil dibuat. Segera proses pembayaran.');
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title="Buat Klaim Honor" icon="payments" maxWidth="640px">
  <form id="form-claim" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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

  {#snippet footer()}
    <Button variant="outline" onclick={onClose} icon="close">
      Batal
    </Button>
    <Button type="submit" variant="primary" form="form-claim" icon="payments" disabled={!selectedTentorId || pendingAttendances.length === 0}>
      Buat Klaim
    </Button>
  {/snippet}
</Modal>
