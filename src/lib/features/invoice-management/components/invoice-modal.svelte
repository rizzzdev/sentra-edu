<script lang="ts">
import { userStore, subjectStore, classStore, packageStore, enrollmentStore } from '$lib/api';
  import { SelectSearch } from '$lib/components/molecules';
  import { Input } from '$lib/components/atoms';
  import Modal from '$lib/components/molecules/modal.svelte';
  import {toastStore} from '$lib/shared/stores';
  import type { Enrollment } from '$lib/shared/types';
  import { Button } from '$lib/components/atoms';

  let {
    open = false,
    onClose = () => {}
  }: {
    open?: boolean;
    onClose?: () => void;
  } = $props();

  const now = new Date();
  let selectedStudentId = $state('');
  let selectedMonth = $state(String(now.getMonth() + 1));
  let selectedYear = $state(now.getFullYear());

  let enrollments = $derived($enrollmentStore.filter((enrollment) => enrollment.deletedAt === null));

  $effect(() => {
    if (enrollments.length > 0 && !selectedStudentId) {
      selectedStudentId = enrollments[0].studentId;
    }
  });

  function getStudentEnrollmentLabel(enrollment: Enrollment): string {
    const student = $userStore.find((user) => user.id === enrollment.studentId);
    const classLevel = $classStore.find((classItem) => classItem.id === enrollment.classId);
    const subject = $subjectStore.find((subjectItem) => subjectItem.id === enrollment.subjectId);
    return `${student?.fullName || 'Siswa'} — ${classLevel?.className || ''} ${subject?.name || ''}`;
  }

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  async function handleSubmit() {
    if (!selectedStudentId) {
      toastStore.error('Pilih murid terlebih dahulu.');
      return;
    }

    const enrollment = enrollments.find((enr) => enr.studentId === selectedStudentId);
    if (!enrollment) {
      toastStore.error('Data pendaftaran murid tidak ditemukan.');
      return;
    }

    const packagePlan = $packageStore.find((pkg) => pkg.id === enrollment.packageId);
    const amount = packagePlan ? packagePlan.price : 1000000;

    const payload = {
      enrollmentId: enrollment.id,
      amount,
      dueDate: `${selectedYear}-${selectedMonth.padStart(2, '0')}-25`,
      periodMonth: Number(selectedMonth),
      periodYear: Number(selectedYear),
      notes: `Tagihan SPP Periode ${monthNames[Number(selectedMonth) - 1]} ${selectedYear}`
    };

    const { api } = await import('$lib/api/client');
    const response = await api.invoices.create(payload);
    if (!response.error) {
      toastStore.success('Tagihan SPP berhasil diterbitkan.');
      onClose();
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<Modal {open} {onClose} title="Generate Tagihan SPP" icon="receipt_long" maxWidth="540px">
  <div class="alert alert-info -mt-1">
    <span class="material-symbols-rounded" style="font-size:1rem;">auto_awesome</span>
    <span>Total dihitung otomatis dari sesi APPROVED murid pada periode terpilih.</span>
  </div>

  <form id="form-gen-invoice" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
    <div class="field">
      <label for="f_studentId">Murid <i class="req">*</i></label>
      <SelectSearch 
        id="f_studentId" 
        required 
        bind:value={selectedStudentId}
        options={enrollments.map((enrollmentItem) => ({ value: enrollmentItem.studentId, label: getStudentEnrollmentLabel(enrollmentItem) }))}
      />
    </div>

    <div class="form-grid">
      <div class="field">
        <label for="f_month">Bulan <i class="req">*</i></label>
        <SelectSearch 
          id="f_month" 
          required 
          bind:value={selectedMonth}
          options={monthNames.map((monthName, index) => ({ value: String(index + 1), label: `${monthName} ${selectedYear}` }))}
        />
      </div>

      <div class="field">
        <label for="f_year">Tahun <i class="req">*</i></label>
        <Input id="f_year" type="number" min="2026" required bind:value={selectedYear} />
      </div>
    </div>
  </form>

  {#snippet footer()}
    <Button variant="outline" onclick={onClose} icon="close">
      Batal
    </Button>
    <Button type="submit" variant="primary" form="form-gen-invoice" icon="receipt_long">
      Terbitkan Tagihan
    </Button>
  {/snippet}
</Modal>
