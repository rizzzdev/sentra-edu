<script lang="ts">
  import Modal from '$lib/components/molecules/modal.svelte';
  import Icon from '$lib/components/atoms/icon.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';

  export let open: boolean = false;
  export let onClose: () => void = () => {};

  const now = new Date();
  let selectedStudentId: string = '';
  let selectedMonth: number = now.getMonth() + 1;
  let selectedYear: number = now.getFullYear();

  $: enrollments = $dbStore.enrollments.filter((e) => e.deletedAt === null);

  $: if (enrollments.length > 0 && !selectedStudentId) {
    selectedStudentId = enrollments[0].studentId;
  }

  function getStudentEnrollmentLabel(enr: any): string {
    const student = $dbStore.users.find((u) => u.id === enr.studentId);
    const cls = $dbStore.classes.find((c) => c.id === enr.classId);
    const sub = $dbStore.subjects.find((s) => s.id === enr.subjectId);
    return `${student?.fullName || 'Siswa'} — ${cls?.className || ''} ${sub?.name || ''}`;
  }

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  function handleSubmit() {
    if (!selectedStudentId) {
      toastStore.error('Pilih siswa terlebih dahulu.');
      return;
    }

    const enr = enrollments.find((e) => e.studentId === selectedStudentId);
    if (!enr) {
      toastStore.error('Data pendaftaran siswa tidak ditemukan.');
      return;
    }

    const pkg = $dbStore.packages.find((p) => p.id === enr.packageId);
    const amount = pkg ? pkg.price : 1000000;

    const payload = {
      enrollmentId: enr.id,
      amount,
      dueDate: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-25`,
      periodMonth: Number(selectedMonth),
      periodYear: Number(selectedYear),
      notes: `Tagihan SPP Periode ${monthNames[selectedMonth - 1]} ${selectedYear}`
    };

    const response = dbStore.createInvoice(payload);
    if (!response.error) {
      toastStore.success('Tagihan SPP berhasil diterbitkan.');
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title="Generate Tagihan SPP" icon="receipt_long" maxWidth="540px">
  <div class="alert alert-info" style="margin-top:-4px">
    <Icon name="auto_awesome" size="sm" />
    <span>Total dihitung otomatis dari sesi APPROVED siswa pada periode terpilih.</span>
  </div>

  <form id="form-gen-invoice" on:submit|preventDefault={handleSubmit}>
    <div class="field">
      <label for="f_studentId">Siswa <i class="req">*</i></label>
      <select id="f_studentId" required bind:value={selectedStudentId}>
        {#each enrollments as e}
          <option value={e.studentId}>{getStudentEnrollmentLabel(e)}</option>
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
        <Input id="f_year" type="number" min="2026" required bind:value={selectedYear} />
      </div>
    </div>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={onClose} icon="close">
      Batal
    </Button>
    <Button type="submit" variant="primary" form="form-gen-invoice" icon="receipt_long">
      Terbitkan Tagihan
    </Button>
  </svelte:fragment>
</Modal>
