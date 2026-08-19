<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import { formatCurrencyIDR } from '$lib/shared/utils/formatting';
  import type { User } from '$lib/shared/types/common.types';

  export let open: boolean = false;
  export let tentor: User | null = null;
  export let onClose: () => void = () => {};

  const now = new Date();
  let selectedTentorId: string = tentor ? tentor.id : '';
  let selectedMonth: number = now.getMonth() + 1;
  let selectedYear: number = now.getFullYear();

  $: tentors = $dbStore.users.filter((u) => u.deletedAt === null && u.role === 'TENTOR');

  $: if (tentor) {
    selectedTentorId = tentor.id;
  } else if (!selectedTentorId && tentors.length > 0) {
    selectedTentorId = tentors[0].id;
  }

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  function getTentorSessionCount(tId: string): { count: number; total: number } {
    const existingClaimedIds = $dbStore.payrollClaims
      .filter((c) => c.deletedAt === null && c.status !== 'REJECTED')
      .flatMap((c) => c.attendanceIds);

    const attendances = $dbStore.attendances.filter(
      (a) => a.deletedAt === null && a.tentorId === tId && a.status === 'APPROVED' && !existingClaimedIds.includes(a.id)
    );

    const total = attendances.reduce((sum, a) => {
      const enr = $dbStore.enrollments.find((e) => e.id === a.enrollmentId);
      const pkg = enr ? $dbStore.packages.find((p) => p.id === enr.packageId) : null;
      return sum + (pkg ? pkg.tentorFee : 100000);
    }, 0);

    return { count: attendances.length, total };
  }

  function handleSubmit() {
    if (!selectedTentorId) {
      toastStore.error('Pilih tentor terlebih dahulu.');
      return;
    }

    const { count, total } = getTentorSessionCount(selectedTentorId);
    if (count === 0) {
      toastStore.error('Belum ada sesi APPROVED yang belum masuk klaim lain pada bulan ini.');
      return;
    }

    const existingClaimedIds = $dbStore.payrollClaims
      .filter((c) => c.deletedAt === null && c.status !== 'REJECTED')
      .flatMap((c) => c.attendanceIds);

    const attIds = $dbStore.attendances
      .filter((a) => a.deletedAt === null && a.tentorId === selectedTentorId && a.status === 'APPROVED' && !existingClaimedIds.includes(a.id))
      .map((a) => a.id);

    const payload = {
      tentorId: selectedTentorId,
      periodStart: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`,
      periodEnd: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-28`,
      periodMonth: selectedMonth,
      periodYear: selectedYear,
      totalAmount: total,
      attendanceIds: attIds
    };

    const response = dbStore.submitPayrollClaim(payload);
    if (!response.error) {
      toastStore.success('Pengajuan klaim honor berhasil dikirimkan.');
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title="Ajukan Klaim Honor" icon="payments" maxWidth="560px">
  <div class="alert alert-info" style="margin-top:-4px">
    <Icon name="verified" size="sm" />
    <span>Hanya sesi <strong>APPROVED yang belum masuk klaim lain</strong> yang dihitung — tidak ada presensi ganda dalam penggajian.</span>
  </div>

  <form id="form-claim" on:submit|preventDefault={handleSubmit}>
    <div class="field">
      <label for="f_tentorId">Tentor <i class="req">*</i></label>
      <select id="f_tentorId" required bind:value={selectedTentorId}>
        <option value="">— Pilih tentor —</option>
        {#each tentors as t}
          {@const info = getTentorSessionCount(t.id)}
          <option value={t.id}>
            {t.fullName} ({info.count} sesi · ± {formatCurrencyIDR(info.total)})
          </option>
        {/each}
      </select>
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_month">Bulan <i class="req">*</i></label>
        <select id="f_month" required bind:value={selectedMonth}>
          {#each monthNames as mName, i}
            <option value={i + 1}>{mName} {selectedYear}</option>
          {/each}
        </select>
      </div>

      <div class="field">
        <label for="f_year">Tahun <i class="req">*</i></label>
        <input id="f_year" type="number" min="2026" required bind:value={selectedYear} />
      </div>
    </div>
  </form>

  <svelte:fragment slot="footer">
    <button type="button" class="btn btn-outline" on:click={onClose}>
      <Icon name="close" size="sm" /> Batal
    </button>
    <button type="submit" form="form-claim" class="btn btn-primary">
      <Icon name="payments" size="sm" /> Ajukan Pencairan
    </button>
  </svelte:fragment>
</Modal>
