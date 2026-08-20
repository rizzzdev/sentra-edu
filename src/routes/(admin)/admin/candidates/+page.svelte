<script lang="ts">
  import Icon from '$lib/components/atoms/icon.svelte';
  import Modal from '$lib/components/molecules/modal.svelte';
  import CandidateModal from '$lib/features/candidate-recruitment/components/candidate-modal.svelte';
  import ConfirmationDialog from '$lib/components/organisms/confirmation-dialog.svelte';
  import { dbStore } from '$lib/shared/stores/db-store';
  import { toastStore } from '$lib/shared/stores/toast-store';
  import type { RecruitmentCandidate } from '$lib/shared/types/common.types';
  import Button from '$lib/components/atoms/button.svelte';
  import Input from '$lib/components/atoms/input.svelte';
  import { CANDIDATE_STATUS_LABEL, getStatusLabel, getStatusBadgeClass } from '$lib/shared/utils/status-map';
  import SelectSearch from '$lib/components/molecules/select-search.svelte';

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
    const response = dbStore.saveCandidate({
      ...scheduleTestCand,
      status: 'TEST_SCHEDULED',
      notes: `Tes dijadwalkan pada ${testDateTime}`
    });
    if (!response.error) {
      toastStore.success('Jadwal tes berhasil disimpan.');
      scheduleTestCand = null;
    } else {
      toastStore.error(response.message);
    }
  }

  function handleRecordTestSubmit() {
    if (!recordTestCand) return;
    const response = dbStore.saveCandidate({
      ...recordTestCand,
      status: 'TESTED',
      notes: `Skor: ${testScore}. ${testNotes}`
    });
    if (!response.error) {
      toastStore.success('Hasil tes berhasil dicatat.');
      recordTestCand = null;
    } else {
      toastStore.error(response.message);
    }
  }

  function handleScheduleInterviewSubmit() {
    if (!scheduleInterviewCand || !interviewDateTime) {
      toastStore.error('Tentukan jadwal wawancara.');
      return;
    }
    const response = dbStore.saveCandidate({
      ...scheduleInterviewCand,
      status: 'INTERVIEW_SCHEDULED',
      interviewDate: interviewDateTime
    });
    if (!response.error) {
      toastStore.success('Jadwal wawancara berhasil disimpan.');
      scheduleInterviewCand = null;
    } else {
      toastStore.error(response.message);
    }
  }

  function handleRecordInterviewSubmit() {
    if (!recordInterviewCand || !interviewNotes.trim()) {
      toastStore.error('Hasil wawancara wajib diisi.');
      return;
    }
    const response = dbStore.saveCandidate({
      ...recordInterviewCand,
      status: 'INTERVIEWED',
      notes: interviewNotes.trim()
    });
    if (!response.error) {
      toastStore.success('Hasil wawancara berhasil dicatat.');
      recordInterviewCand = null;
    } else {
      toastStore.error(response.message);
    }
  }

  function handleAcceptSubmit() {
    if (!acceptCand) return;
    const response = dbStore.convertCandidateToTentorUser(acceptCand.id);
    if (!response.error) {
      toastStore.success(response.message);
      acceptCand = null;
    } else {
      toastStore.error(response.message);
    }
  }

  function handleRejectSubmit() {
    if (!rejectCand || !rejectionReason.trim()) {
      toastStore.error('Alasan penolakan wajib diisi.');
      return;
    }
    const response = dbStore.saveCandidate({
      ...rejectCand,
      status: 'REJECTED',
      notes: rejectionReason.trim()
    });
    if (!response.error) {
      toastStore.success('Kandidat ditolak.');
      rejectCand = null;
    } else {
      toastStore.error(response.message);
    }
  }

  function handleConfirmDelete() {
    if (!deletingCandidateId) return;
    const response = dbStore.deleteCandidate(deletingCandidateId);
    deleteDialogOpen = false;
    deletingCandidateId = null;
    if (!response.error) {
      toastStore.success('Kandidat berhasil dihapus.');
    } else {
      toastStore.error(response.message);
    }
  }
</script>

<div class="page-head">
  <div>
    <h3><Icon name="badge" size="lg" /> Rekrutmen Tentor</h3>
    <div class="desc">Pipeline rekrutmen: daftar &rarr; tes &rarr; wawancara &rarr; keputusan.</div>
  </div>
  <Button variant="primary" on:click={() => { editingCandidate = null; candidateModalOpen = true; }} icon="person_add">
    Daftarkan Kandidat
  </Button>
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
          <span class="badge {getStatusBadgeClass(statusKey)}">{statusLabel}</span>
          <span style="font-weight:700;font-size:1.05rem">{count}</span>
        </span>
      {/each}
    </div>
  </div>
</div>

<div class="filter-bar">
  <div class="filter-search">
    <Icon name="search" size="sm" />
    <Input type="text" placeholder="Cari nama / email / mapel..." bind:value={searchQuery} />
  </div>
  <SelectSearch
    bind:value={statusFilter}
    placeholder="Semua Status"
    options={[
      { value: '', label: 'Semua Status' },
      ...PIPELINE_STATUSES.map(([v, l]) => ({ value: v, label: l }))
    ]}
    className="max-w-48"
  />
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
                <td>{c.source || '—'}</td>
                <td>
                  <span class="badge {getStatusBadgeClass(c.status)}">{getStatusLabel(c.status, CANDIDATE_STATUS_LABEL)}</span>
                </td>
                <td>
                  <div class="actions">
                    <Button
                      variant="outline"
                      size="sm"
                      className="btn-icon"
                      data-tip="Detail"
                      on:click={() => { detailCandidate = c; }}
                      icon="visibility"
                    />

                    {#if c.status === 'REGISTERED'}
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-icon"
                        data-tip="Jadwalkan Tes"
                        on:click={() => {
                          scheduleTestCand = c;
                          testDateTime = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
                        }}
                        icon="assignment"
                      />
                    {:else if c.status === 'TEST_SCHEDULED'}
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-icon"
                        data-tip="Catat Tes"
                        on:click={() => {
                          recordTestCand = c;
                          testScore = 85;
                          testNotes = '';
                        }}
                        icon="fact_check"
                      />
                    {:else if c.status === 'TESTED'}
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-icon"
                        data-tip="Jadwalkan Wawancara"
                        on:click={() => {
                          scheduleInterviewCand = c;
                          interviewDateTime = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
                        }}
                        icon="record_voice_over"
                      />
                    {:else if c.status === 'INTERVIEW_SCHEDULED'}
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-icon"
                        data-tip="Catat Wawancara"
                        on:click={() => {
                          recordInterviewCand = c;
                          interviewNotes = '';
                        }}
                        icon="record_voice_over"
                      />
                    {:else if c.status === 'INTERVIEWED'}
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-icon"
                        data-tip="Terima"
                        on:click={() => {
                          acceptCand = c;
                          initialPassword = 'tentor123';
                        }}
                        icon="how_to_reg"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="btn-icon"
                        data-tip="Tolak"
                        on:click={() => {
                          rejectCand = c;
                          rejectionReason = '';
                        }}
                        icon="close"
                      />
                    {/if}

                    <Button
                      variant="outline"
                      size="sm"
                      className="btn-icon"
                      data-tip="Ubah"
                      on:click={() => {
                        editingCandidate = c;
                        candidateModalOpen = true;
                      }}
                      icon="edit"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="btn-icon"
                      data-tip="Hapus"
                      on:click={() => {
                        deletingCandidateId = c.id;
                        deleteDialogOpen = true;
                      }}
                      icon="delete"
                    />
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
          <Button
            variant="outline"
            className="page-btn"
            disabled={currentPage <= 1}
            on:click={() => currentPage--}
          >
            &laquo;
          </Button>
          {#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
            <Button
              variant={currentPage === p ? 'primary' : 'outline'}
              className="page-btn"
              on:click={() => { currentPage = p; }}
            >
              {p}
            </Button>
          {/each}
          <Button
            variant="outline"
            className="page-btn"
            disabled={currentPage >= totalPages}
            on:click={() => currentPage++}
          >
            &raquo;
          </Button>
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
      <dd>{detailCandidate.source || '—'}</dd>
      <dt>Tahap</dt>
      <dd>
        <span class="badge {getStatusBadgeClass(detailCandidate.status)}">{CANDIDATE_STATUS_LABEL[detailCandidate.status] || detailCandidate.status}</span>
      </dd>
      <dt>Catatan</dt>
      <dd>{detailCandidate.notes || '—'}</dd>
    </div>
    <svelte:fragment slot="footer">
      <Button variant="outline" on:click={() => { detailCandidate = null; }} icon="close">
        Tutup
      </Button>
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
      <Input id="f_testScheduledAt" type="datetime-local" required bind:value={testDateTime} />
    </div>
    <svelte:fragment slot="footer">
      <Button variant="outline" on:click={() => { scheduleTestCand = null; }} icon="close">
        Batal
      </Button>
      <Button variant="primary" on:click={handleScheduleTestSubmit} icon="save">
        Jadwalkan
      </Button>
    </svelte:fragment>
  </Modal>
{/if}

<!-- Record Test Modal -->
{#if recordTestCand}
  <Modal open={true} onClose={() => { recordTestCand = null; }} title="Catat Hasil Tes" icon="fact_check" maxWidth="480px">
    <div class="field">
      <label for="f_testScore">Skor Tes (0–100) <i class="req">*</i></label>
      <Input id="f_testScore" type="number" min="0" max="100" required bind:value={testScore} />
    </div>
    <div class="field">
      <label for="f_testNotes">Catatan Hasil Tes</label>
      <textarea id="f_testNotes" rows="3" placeholder="cth: Penguasaan materi baik, perlu latihan pedagogi" bind:value={testNotes}></textarea>
    </div>
    <svelte:fragment slot="footer">
      <Button variant="outline" on:click={() => { recordTestCand = null; }} icon="close">
        Batal
      </Button>
      <Button variant="primary" on:click={handleRecordTestSubmit} icon="save">
        Simpan Hasil
      </Button>
    </svelte:fragment>
  </Modal>
{/if}

<!-- Schedule Interview Modal -->
{#if scheduleInterviewCand}
  <Modal open={true} onClose={() => { scheduleInterviewCand = null; }} title="Jadwalkan Wawancara" icon="record_voice_over" maxWidth="480px">
    <div class="field">
      <label for="f_interviewScheduledAt">Jadwal Wawancara <i class="req">*</i></label>
      <Input id="f_interviewScheduledAt" type="datetime-local" required bind:value={interviewDateTime} />
    </div>
    <svelte:fragment slot="footer">
      <Button variant="outline" on:click={() => { scheduleInterviewCand = null; }} icon="close">
        Batal
      </Button>
      <Button variant="primary" on:click={handleScheduleInterviewSubmit} icon="save">
        Jadwalkan
      </Button>
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
      <Button variant="outline" on:click={() => { recordInterviewCand = null; }} icon="close">
        Batal
      </Button>
      <Button variant="primary" on:click={handleRecordInterviewSubmit} icon="save">
        Simpan Hasil
      </Button>
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
      <Input id="f_initialPassword" type="password" placeholder="default: tentor123" bind:value={initialPassword} />
    </div>
    <svelte:fragment slot="footer">
      <Button variant="outline" on:click={() => { acceptCand = null; }} icon="close">
        Batal
      </Button>
      <Button variant="primary" on:click={handleAcceptSubmit} icon="how_to_reg">
        Terima & Buat Akun
      </Button>
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
      <Button variant="outline" on:click={() => { rejectCand = null; }} icon="close">
        Batal
      </Button>
      <Button variant="danger" on:click={handleRejectSubmit} icon="block">
        Tolak Kandidat
      </Button>
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
