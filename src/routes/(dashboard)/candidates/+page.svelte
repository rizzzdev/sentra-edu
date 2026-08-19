<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import Modal from '$lib/components/molecules/modal.svelte';
  import CandidateModal from '$lib/features/candidate-recruitment/components/candidate-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { RecruitmentCandidate } from '$lib/shared/types/common.types';

  let searchQuery: string = '';
  let statusFilter: string = '';
  let currentPage: number = 1;
  const itemsPerPage: number = 8;

  let candidateModalOpen: boolean = false;
  let editingCandidate: RecruitmentCandidate | null = null;
  let detailCandidate: RecruitmentCandidate | null = null;

  // Step modals
  let scheduleTestCand: RecruitmentCandidate | null = null;
  let testDateTime: string = '';

  let recordTestCand: RecruitmentCandidate | null = null;
  let testScore: number = 85;
  let testNotes: string = '';

  let scheduleInterviewCand: RecruitmentCandidate | null = null;
  let interviewDateTime: string = '';

  let recordInterviewCand: RecruitmentCandidate | null = null;
  let interviewNotes: string = '';

  let acceptCand: RecruitmentCandidate | null = null;
  let initialPassword: string = '';

  let rejectCand: RecruitmentCandidate | null = null;
  let rejectionReason: string = '';

  let deleteDialogOpen: boolean = false;
  let deletingCandidateId: string | null = null;

  $: allCandidates = $dbStore.candidates.filter((c) => c.deletedAt === null);

  const PIPELINE_STATUSES: [string, string][] = [
    ['REGISTERED', 'Pendaftar Baru'],
    ['TEST_SCHEDULED', 'Tes Dijadwalkan'],
    ['TESTED', 'Tes Selesai'],
    ['INTERVIEW_SCHEDULED', 'Wawancara Dijadwalkan'],
    ['INTERVIEWED', 'Wawancara Selesai'],
    ['ACCEPTED', 'Diterima'],
    ['REJECTED', 'Ditolak']
  ];

  function getBadgeClass(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'b-accepted';
      case 'REJECTED':
        return 'b-rejected';
      case 'TESTED':
        return 'b-tested';
      case 'INTERVIEWED':
        return 'b-interviewed';
      default:
        return 'b-pending';
    }
  }

  function getSubjectNames(subjectIds?: string[]): string {
    if (!subjectIds || subjectIds.length === 0) return '—';
    return $dbStore.subjects
      .filter((s) => subjectIds.includes(s.id))
      .map((s) => s.name)
      .join(', ') || '—';
  }

  function getLevelNames(levelIds?: string[]): string {
    if (!levelIds || levelIds.length === 0) return '—';
    return $dbStore.educationLevels
      .filter((l) => levelIds.includes(l.id))
      .map((l) => l.levelName)
      .join(', ') || '—';
  }

  $: filteredCandidates = allCandidates.filter((c) => {
    const q = searchQuery.toLowerCase();
    const subjectsStr = getSubjectNames(c.subjectIds).toLowerCase();
    const matchesSearch =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      subjectsStr.includes(q);
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  $: paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  $: totalPages = Math.max(1, Math.ceil(filteredCandidates.length / itemsPerPage));

  function handleScheduleTestSubmit() {
    if (!scheduleTestCand || !testDateTime) {
      toastStore.error('Tentukan jadwal tes.');
      return;
    }
    const res = dbStore.saveCandidate({
      ...scheduleTestCand,
      status: 'TEST_SCHEDULED' as any,
      notes: `Tes dijadwalkan pada ${testDateTime}`
    });
    if (!res.error) {
      toastStore.success('Jadwal tes berhasil disimpan.');
      scheduleTestCand = null;
    } else {
      toastStore.error(res.message);
    }
  }

  function handleRecordTestSubmit() {
    if (!recordTestCand) return;
    const res = dbStore.saveCandidate({
      ...recordTestCand,
      status: 'TESTED' as any,
      notes: `Skor: ${testScore}. ${testNotes}`
    });
    if (!res.error) {
      toastStore.success('Hasil tes berhasil dicatat.');
      recordTestCand = null;
    } else {
      toastStore.error(res.message);
    }
  }

  function handleScheduleInterviewSubmit() {
    if (!scheduleInterviewCand || !interviewDateTime) {
      toastStore.error('Tentukan jadwal wawancara.');
      return;
    }
    const res = dbStore.saveCandidate({
      ...scheduleInterviewCand,
      status: 'INTERVIEW_SCHEDULED' as any,
      interviewDate: interviewDateTime
    });
    if (!res.error) {
      toastStore.success('Jadwal wawancara berhasil disimpan.');
      scheduleInterviewCand = null;
    } else {
      toastStore.error(res.message);
    }
  }

  function handleRecordInterviewSubmit() {
    if (!recordInterviewCand || !interviewNotes.trim()) {
      toastStore.error('Hasil wawancara wajib diisi.');
      return;
    }
    const res = dbStore.saveCandidate({
      ...recordInterviewCand,
      status: 'INTERVIEWED' as any,
      notes: interviewNotes.trim()
    });
    if (!res.error) {
      toastStore.success('Hasil wawancara berhasil dicatat.');
      recordInterviewCand = null;
    } else {
      toastStore.error(res.message);
    }
  }

  function handleAcceptSubmit() {
    if (!acceptCand) return;
    const res = dbStore.convertCandidateToTentorUser(acceptCand.id);
    if (!res.error) {
      toastStore.success(res.message);
      acceptCand = null;
    } else {
      toastStore.error(res.message);
    }
  }

  function handleRejectSubmit() {
    if (!rejectCand || !rejectionReason.trim()) {
      toastStore.error('Alasan penolakan wajib diisi.');
      return;
    }
    const res = dbStore.saveCandidate({
      ...rejectCand,
      status: 'REJECTED' as any,
      notes: rejectionReason.trim()
    });
    if (!res.error) {
      toastStore.success('Kandidat ditolak.');
      rejectCand = null;
    } else {
      toastStore.error(res.message);
    }
  }

  function handleConfirmDelete() {
    if (!deletingCandidateId) return;
    const res = dbStore.saveCandidate({
      id: deletingCandidateId,
      fullName: '',
      email: '',
      phone: '',
      deletedAt: new Date().toISOString()
    } as any);
    deleteDialogOpen = false;
    deletingCandidateId = null;
    if (!res.error) {
      toastStore.success('Kandidat berhasil dihapus.');
    } else {
      toastStore.error(res.message);
    }
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="badge" size="lg" /> Rekrutmen Tentor</h3>
    <div class="desc">Pipeline rekrutmen: daftar &rarr; tes &rarr; wawancara &rarr; keputusan.</div>
  </div>
  <button type="button" class="btn btn-primary" on:click={() => { editingCandidate = null; candidateModalOpen = true; }}>
    <Icon name="person_add" size="sm" /> Daftarkan Kandidat
  </button>
</div>

<div class="card">
  <div class="card-head">
    <Icon name="track_changes" size="md" /> Pipeline Kandidat
  </div>
  <div class="card-body">
    <div class="chip-row">
      {#each PIPELINE_STATUSES as [statusKey, statusLabel]}
        {@const count = allCandidates.filter((c) => c.status === statusKey).length}
        <span style="display:inline-flex;align-items:center;gap:6px;margin:4px 8px 4px 0">
          <span class="badge {getBadgeClass(statusKey)}">{statusKey}</span>
          <span style="font-weight:700;font-size:1.05rem">{count}</span>
        </span>
      {/each}
    </div>
  </div>
</div>

<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <input type="text" placeholder="Cari nama / email / mapel..." bind:value={searchQuery} />
  </div>
  <select class="filter-select" bind:value={statusFilter}>
    <option value="">Semua Status</option>
    {#each PIPELINE_STATUSES as [statusKey, statusLabel]}
      <option value={statusKey}>{statusLabel}</option>
    {/each}
  </select>
</div>

<div class="card">
  <div class="card-body flush">
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Kandidat</th>
            <th>Mapel</th>
            <th>Sumber</th>
            <th>Tahap</th>
            <th style="text-align:right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedCandidates.length === 0}
            <tr>
              <td colspan="5" class="empty">Tidak ada kandidat untuk filter ini.</td>
            </tr>
          {:else}
            {#each paginatedCandidates as c (c.id)}
              <tr>
                <td>
                  <strong>{c.fullName}</strong>
                  <div class="sub">{c.email}</div>
                </td>
                <td>{getSubjectNames(c.subjectIds)}</td>
                <td>{(c as any).source || '—'}</td>
                <td>
                  <span class="badge {getBadgeClass(c.status)}">{c.status}</span>
                </td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Detail"
                      on:click={() => { detailCandidate = c; }}
                    >
                      <Icon name="visibility" size="sm" />
                    </button>

                    {#if c.status === 'REGISTERED'}
                      <button
                        type="button"
                        class="btn-icon"
                        data-tip="Jadwalkan Tes"
                        on:click={() => {
                          scheduleTestCand = c;
                          testDateTime = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
                        }}
                      >
                        <Icon name="assignment" size="sm" />
                      </button>
                    {:else if c.status === 'TEST_SCHEDULED'}
                      <button
                        type="button"
                        class="btn-icon"
                        data-tip="Catat Tes"
                        on:click={() => {
                          recordTestCand = c;
                          testScore = 85;
                          testNotes = '';
                        }}
                      >
                        <Icon name="fact_check" size="sm" />
                      </button>
                    {:else if c.status === 'TESTED'}
                      <button
                        type="button"
                        class="btn-icon"
                        data-tip="Jadwalkan Wawancara"
                        on:click={() => {
                          scheduleInterviewCand = c;
                          interviewDateTime = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
                        }}
                      >
                        <Icon name="record_voice_over" size="sm" />
                      </button>
                    {:else if c.status === 'INTERVIEW_SCHEDULED'}
                      <button
                        type="button"
                        class="btn-icon"
                        data-tip="Catat Wawancara"
                        on:click={() => {
                          recordInterviewCand = c;
                          interviewNotes = '';
                        }}
                      >
                        <Icon name="record_voice_over" size="sm" />
                      </button>
                    {:else if c.status === 'INTERVIEWED'}
                      <button
                        type="button"
                        class="btn-icon"
                        data-tip="Terima"
                        on:click={() => {
                          acceptCand = c;
                          initialPassword = 'tentor123';
                        }}
                      >
                        <Icon name="how_to_reg" size="sm" />
                      </button>
                      <button
                        type="button"
                        class="btn-icon btn-icon-danger"
                        data-tip="Tolak"
                        on:click={() => {
                          rejectCand = c;
                          rejectionReason = '';
                        }}
                      >
                        <Icon name="close" size="sm" />
                      </button>
                    {/if}

                    <button
                      type="button"
                      class="btn-icon"
                      data-tip="Ubah"
                      on:click={() => {
                        editingCandidate = c;
                        candidateModalOpen = true;
                      }}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      type="button"
                      class="btn-icon btn-icon-danger"
                      data-tip="Hapus"
                      on:click={() => {
                        deletingCandidateId = c.id;
                        deleteDialogOpen = true;
                      }}
                    >
                      <Icon name="delete" size="sm" />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    {#if filteredCandidates.length > itemsPerPage}
      <div class="page-nav">
        <div class="page-info">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredCandidates.length)} dari {filteredCandidates.length} data
        </div>
        <div class="page-btns">
          <button
            type="button"
            class="page-btn"
            disabled={currentPage <= 1}
            on:click={() => currentPage--}
          >
            &laquo;
          </button>
          {#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
            <button
              type="button"
              class="page-btn {currentPage === p ? 'active' : ''}"
              on:click={() => { currentPage = p; }}
            >
              {p}
            </button>
          {/each}
          <button
            type="button"
            class="page-btn"
            disabled={currentPage >= totalPages}
            on:click={() => currentPage++}
          >
            &raquo;
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Candidate Detail Modal -->
{#if detailCandidate}
  <Modal open={true} onClose={() => { detailCandidate = null; }} title="Detail Kandidat" icon="badge" maxWidth="560px">
    <div class="kv">
      <dt>Nama</dt>
      <dd>{detailCandidate.fullName}</dd>
      <dt>Email / Telepon</dt>
      <dd>{detailCandidate.email} · {detailCandidate.phone || '—'}</dd>
      <dt>Pendidikan</dt>
      <dd>{detailCandidate.education || '—'}</dd>
      <dt>Mapel yang Bisa Diajar</dt>
      <dd>{getSubjectNames(detailCandidate.subjectIds)}</dd>
      <dt>Jenjang yang Bisa Diajar</dt>
      <dd>{getLevelNames(detailCandidate.levelIds)}</dd>
      <dt>Pengalaman</dt>
      <dd>{detailCandidate.experienceYears} tahun</dd>
      <dt>Sumber</dt>
      <dd>{(detailCandidate as any).source || '—'}</dd>
      <dt>Tahap</dt>
      <dd>
        <span class="badge {getBadgeClass(detailCandidate.status)}">{detailCandidate.status}</span>
      </dd>
      <dt>Catatan</dt>
      <dd>{detailCandidate.notes || '—'}</dd>
    </div>
    <svelte:fragment slot="footer">
      <button type="button" class="btn btn-outline" on:click={() => { detailCandidate = null; }}>
        <Icon name="close" size="sm" /> Tutup
      </button>
    </svelte:fragment>
  </Modal>
{/if}

<!-- Schedule Test Modal -->
{#if scheduleTestCand}
  <Modal open={true} onClose={() => { scheduleTestCand = null; }} title="Jadwalkan Tes" icon="assignment" maxWidth="480px">
    <div class="alert alert-info" style="margin-top:-4px">
      <Icon name="info" size="sm" />
      <span>Tes mengajar / mapel untuk menilai penguasaan materi kandidat.</span>
    </div>
    <div class="field">
      <label for="f_testScheduledAt">Jadwal Tes <i class="req">*</i></label>
      <input id="f_testScheduledAt" type="datetime-local" required bind:value={testDateTime} />
    </div>
    <svelte:fragment slot="footer">
      <button type="button" class="btn btn-outline" on:click={() => { scheduleTestCand = null; }}>
        <Icon name="close" size="sm" /> Batal
      </button>
      <button type="button" class="btn btn-primary" on:click={handleScheduleTestSubmit}>
        <Icon name="save" size="sm" /> Jadwalkan
      </button>
    </svelte:fragment>
  </Modal>
{/if}

<!-- Record Test Modal -->
{#if recordTestCand}
  <Modal open={true} onClose={() => { recordTestCand = null; }} title="Catat Hasil Tes" icon="fact_check" maxWidth="480px">
    <div class="field">
      <label for="f_testScore">Skor Tes (0–100) <i class="req">*</i></label>
      <input id="f_testScore" type="number" min="0" max="100" required bind:value={testScore} />
    </div>
    <div class="field">
      <label for="f_testNotes">Catatan Hasil Tes</label>
      <textarea id="f_testNotes" rows="3" placeholder="cth: Penguasaan materi baik, perlu latihan pedagogi" bind:value={testNotes}></textarea>
    </div>
    <svelte:fragment slot="footer">
      <button type="button" class="btn btn-outline" on:click={() => { recordTestCand = null; }}>
        <Icon name="close" size="sm" /> Batal
      </button>
      <button type="button" class="btn btn-primary" on:click={handleRecordTestSubmit}>
        <Icon name="save" size="sm" /> Simpan Hasil
      </button>
    </svelte:fragment>
  </Modal>
{/if}

<!-- Schedule Interview Modal -->
{#if scheduleInterviewCand}
  <Modal open={true} onClose={() => { scheduleInterviewCand = null; }} title="Jadwalkan Wawancara" icon="record_voice_over" maxWidth="480px">
    <div class="field">
      <label for="f_interviewScheduledAt">Jadwal Wawancara <i class="req">*</i></label>
      <input id="f_interviewScheduledAt" type="datetime-local" required bind:value={interviewDateTime} />
    </div>
    <svelte:fragment slot="footer">
      <button type="button" class="btn btn-outline" on:click={() => { scheduleInterviewCand = null; }}>
        <Icon name="close" size="sm" /> Batal
      </button>
      <button type="button" class="btn btn-primary" on:click={handleScheduleInterviewSubmit}>
        <Icon name="save" size="sm" /> Jadwalkan
      </button>
    </svelte:fragment>
  </Modal>
{/if}

<!-- Record Interview Modal -->
{#if recordInterviewCand}
  <Modal open={true} onClose={() => { recordInterviewCand = null; }} title="Catat Hasil Wawancara" icon="record_voice_over" maxWidth="480px">
    <div class="field">
      <label for="f_interviewNotes">Hasil Wawancara <i class="req">*</i></label>
      <textarea id="f_interviewNotes" rows="3" placeholder="cth: Komunikasi baik, siap ditempatkan" required bind:value={interviewNotes}></textarea>
    </div>
    <svelte:fragment slot="footer">
      <button type="button" class="btn btn-outline" on:click={() => { recordInterviewCand = null; }}>
        <Icon name="close" size="sm" /> Batal
      </button>
      <button type="button" class="btn btn-primary" on:click={handleRecordInterviewSubmit}>
        <Icon name="save" size="sm" /> Simpan Hasil
      </button>
    </svelte:fragment>
  </Modal>
{/if}

<!-- Accept Candidate Modal -->
{#if acceptCand}
  <Modal open={true} onClose={() => { acceptCand = null; }} title="Terima Kandidat" icon="how_to_reg" maxWidth="520px">
    <div class="alert alert-info" style="margin-top:-4px">
      <Icon name="auto_awesome" size="sm" />
      <span>Kandidat diterima &rarr; akun <strong>Tentor</strong> otomatis dibuat dengan email <strong>{acceptCand.email}</strong>. Ia bisa langsung login & melihat feed lowongan.</span>
    </div>
    <div class="field">
      <label for="f_initialPassword">Password Awal (kosongkan untuk default)</label>
      <input id="f_initialPassword" type="password" placeholder="default: tentor123" bind:value={initialPassword} />
    </div>
    <svelte:fragment slot="footer">
      <button type="button" class="btn btn-outline" on:click={() => { acceptCand = null; }}>
        <Icon name="close" size="sm" /> Batal
      </button>
      <button type="button" class="btn btn-primary" on:click={handleAcceptSubmit}>
        <Icon name="how_to_reg" size="sm" /> Terima & Buat Akun
      </button>
    </svelte:fragment>
  </Modal>
{/if}

<!-- Reject Candidate Modal -->
{#if rejectCand}
  <Modal open={true} onClose={() => { rejectCand = null; }} title="Tolak Kandidat" icon="block" maxWidth="480px">
    <div class="field">
      <label for="f_rejectionReason">Alasan Penolakan <i class="req">*</i></label>
      <textarea id="f_rejectionReason" rows="3" placeholder="cth: Skor tes di bawah standar" required bind:value={rejectionReason}></textarea>
    </div>
    <svelte:fragment slot="footer">
      <button type="button" class="btn btn-outline" on:click={() => { rejectCand = null; }}>
        <Icon name="close" size="sm" /> Batal
      </button>
      <button type="button" class="btn btn-danger" on:click={handleRejectSubmit}>
        <Icon name="block" size="sm" /> Tolak Kandidat
      </button>
    </svelte:fragment>
  </Modal>
{/if}

<CandidateModal
  open={candidateModalOpen}
  {editingCandidate}
  onClose={() => { candidateModalOpen = false; }}
/>

<ConfirmationDialog
  open={deleteDialogOpen}
  title="Hapus Kandidat"
  message="Apakah Anda yakin ingin menghapus kandidat ini?"
  confirmText="Hapus"
  confirmVariant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => { deleteDialogOpen = false; }}
/>
