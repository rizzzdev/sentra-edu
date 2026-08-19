import { f as fallback, h as bind_props, e as escape_html, a as attr, b as ensure_array_like, s as store_get, u as unsubscribe_stores, c as attr_class, d as stringify } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { M as Modal } from "../../../../chunks/modal.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
import "../../../../chunks/toast-store.js";
import { C as Confirmation_dialog } from "../../../../chunks/confirmation-dialog.js";
function Candidate_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let open = fallback($$props["open"], false);
    let editingCandidate = fallback($$props["editingCandidate"], null);
    let onClose = fallback($$props["onClose"], () => {
    });
    let fullName = "";
    let email = "";
    let phone = "";
    let education = "";
    let experienceYears = 0;
    let subjectIds = [];
    let levelIds = [];
    let source = "Media Sosial";
    if (editingCandidate) {
      fullName = editingCandidate.fullName;
      email = editingCandidate.email;
      phone = editingCandidate.phone || "";
      education = editingCandidate.education || "";
      experienceYears = editingCandidate.experienceYears || 0;
      subjectIds = editingCandidate.subjectIds || [];
      levelIds = editingCandidate.levelIds || [];
      source = editingCandidate.source || "Media Sosial";
    } else {
      fullName = "";
      email = "";
      phone = "";
      education = "";
      experienceYears = 0;
      subjectIds = [];
      levelIds = [];
      source = "Media Sosial";
    }
    Modal($$renderer2, {
      open,
      onClose,
      title: editingCandidate ? "Ubah Kandidat" : "Daftarkan Kandidat",
      icon: "person_add",
      maxWidth: "620px",
      children: ($$renderer3) => {
        $$renderer3.push(`<form id="form-candidate"><div class="field"><label for="f_fullName">Nama Lengkap <i class="req">*</i></label> <input id="f_fullName" type="text" placeholder="cth: Fajar Ramadhan" required=""${attr("value", fullName)}/></div> <div class="form-grid"><div class="field"><label for="f_email">Email <i class="req">*</i></label> <input id="f_email" type="email" placeholder="calon@email.com" required=""${attr("value", email)}/></div> <div class="field"><label for="f_phone">Telepon</label> <input id="f_phone" type="tel" placeholder="08xx-xxxx-xxxx"${attr("value", phone)}/></div></div> <div class="form-grid"><div class="field"><label for="f_education">Pendidikan Terakhir</label> <input id="f_education" type="text" placeholder="cth: S1 Pendidikan Matematika"${attr("value", education)}/></div> <div class="field"><label for="f_experienceYears">Pengalaman Mengajar (tahun)</label> <input id="f_experienceYears" type="number" min="0" step="1"${attr("value", experienceYears)}/></div></div> <div class="field"><div style="font-size:.82rem;font-weight:600;margin-bottom:5px">Mapel yang Bisa Diajar (boleh lebih dari satu) <i class="req">*</i></div> <div class="multi-group"><!--[-->`);
        const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.filter((s) => s.deletedAt === null));
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let s = each_array[$$index];
          $$renderer3.push(`<label class="multi-opt"><input type="checkbox"${attr("value", s.id)}${attr("checked", subjectIds.includes(s.id), true)}/> ${escape_html(s.name)}</label>`);
        }
        $$renderer3.push(`<!--]--></div></div> <div class="field"><div style="font-size:.82rem;font-weight:600;margin-bottom:5px">Jenjang yang Bisa Diajar (boleh lebih dari satu) <i class="req">*</i></div> <div class="multi-group"><!--[-->`);
        const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$dbStore", dbStore).educationLevels.filter((l) => l.deletedAt === null));
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let l = each_array_1[$$index_1];
          $$renderer3.push(`<label class="multi-opt"><input type="checkbox"${attr("value", l.id)}${attr("checked", levelIds.includes(l.id), true)}/> ${escape_html(l.levelName)}</label>`);
        }
        $$renderer3.push(`<!--]--></div></div> <div class="field"><label for="f_source">Sumber Pendaftaran</label> `);
        $$renderer3.select({ id: "f_source", value: source }, ($$renderer4) => {
          $$renderer4.option({ value: "Media Sosial" }, ($$renderer5) => {
            $$renderer5.push(`Media Sosial`);
          });
          $$renderer4.option({ value: "Referensi" }, ($$renderer5) => {
            $$renderer5.push(`Referensi`);
          });
          $$renderer4.option({ value: "Website" }, ($$renderer5) => {
            $$renderer5.push(`Website`);
          });
          $$renderer4.option({ value: "Walk-in" }, ($$renderer5) => {
            $$renderer5.push(`Walk-in`);
          });
          $$renderer4.option({ value: "Kampus" }, ($$renderer5) => {
            $$renderer5.push(`Kampus`);
          });
          $$renderer4.option({ value: "Lainnya" }, ($$renderer5) => {
            $$renderer5.push(`Lainnya`);
          });
        });
        $$renderer3.push(`</div></form>`);
      },
      $$slots: {
        default: true,
        footer: ($$renderer3) => {
          {
            $$renderer3.push(`<button type="button" class="btn btn-outline">`);
            Icon($$renderer3, { name: "close", size: "sm" });
            $$renderer3.push(`<!----> Batal</button> <button type="submit" form="form-candidate" class="btn btn-primary">`);
            Icon($$renderer3, { name: "save", size: "sm" });
            $$renderer3.push(`<!----> ${escape_html(editingCandidate ? "Simpan Perubahan" : "Daftarkan Kandidat")}</button>`);
          }
        }
      }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { open, editingCandidate, onClose });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let allCandidates, filteredCandidates, paginatedCandidates, totalPages;
    let searchQuery = "";
    let statusFilter = "";
    let currentPage = 1;
    const itemsPerPage = 8;
    let candidateModalOpen = false;
    let editingCandidate = null;
    let deleteDialogOpen = false;
    const PIPELINE_STATUSES = [
      ["REGISTERED", "Pendaftar Baru"],
      ["TEST_SCHEDULED", "Tes Dijadwalkan"],
      ["TESTED", "Tes Selesai"],
      ["INTERVIEW_SCHEDULED", "Wawancara Dijadwalkan"],
      ["INTERVIEWED", "Wawancara Selesai"],
      ["ACCEPTED", "Diterima"],
      ["REJECTED", "Ditolak"]
    ];
    function getBadgeClass(status) {
      switch (status) {
        case "ACCEPTED":
          return "b-accepted";
        case "REJECTED":
          return "b-rejected";
        case "TESTED":
          return "b-tested";
        case "INTERVIEWED":
          return "b-interviewed";
        default:
          return "b-pending";
      }
    }
    function getSubjectNames(subjectIds) {
      if (!subjectIds || subjectIds.length === 0) return "—";
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.filter((s) => subjectIds.includes(s.id)).map((s) => s.name).join(", ") || "—";
    }
    function handleConfirmDelete() {
      return;
    }
    allCandidates = store_get($$store_subs ??= {}, "$dbStore", dbStore).candidates.filter((c) => c.deletedAt === null);
    filteredCandidates = allCandidates.filter((c) => {
      const q = searchQuery.toLowerCase();
      const subjectsStr = getSubjectNames(c.subjectIds).toLowerCase();
      const matchesSearch = !q || c.fullName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || subjectsStr.includes(q);
      const matchesStatus = !statusFilter;
      return matchesSearch && matchesStatus;
    });
    paginatedCandidates = filteredCandidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    totalPages = Math.max(1, Math.ceil(filteredCandidates.length / itemsPerPage));
    $$renderer2.push(`<div class="page-head"><div><h3>`);
    Icon($$renderer2, { name: "badge", size: "lg" });
    $$renderer2.push(`<!----> Rekrutmen Tentor</h3> <div class="desc">Pipeline rekrutmen: daftar → tes → wawancara → keputusan.</div></div> <button type="button" class="btn btn-primary">`);
    Icon($$renderer2, { name: "person_add", size: "sm" });
    $$renderer2.push(`<!----> Daftarkan Kandidat</button></div> <div class="card"><div class="card-head">`);
    Icon($$renderer2, { name: "track_changes", size: "md" });
    $$renderer2.push(`<!----> Pipeline Kandidat</div> <div class="card-body"><div class="chip-row"><!--[-->`);
    const each_array = ensure_array_like(PIPELINE_STATUSES);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let [statusKey, statusLabel] = each_array[$$index];
      const count = allCandidates.filter((c) => c.status === statusKey).length;
      $$renderer2.push(`<span style="display:inline-flex;align-items:center;gap:6px;margin:4px 8px 4px 0"><span${attr_class(`badge ${stringify(getBadgeClass(statusKey))}`)}>${escape_html(statusKey)}</span> <span style="font-weight:700;font-size:1.05rem">${escape_html(count)}</span></span>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="filter-bar"><div class="filter-search">`);
    Icon($$renderer2, { name: "search", size: "sm" });
    $$renderer2.push(`<!----> <input type="text" placeholder="Cari nama / email / mapel..."${attr("value", searchQuery)}/></div> `);
    $$renderer2.select({ class: "filter-select", value: statusFilter }, ($$renderer3) => {
      $$renderer3.option({ value: "" }, ($$renderer4) => {
        $$renderer4.push(`Semua Status`);
      });
      $$renderer3.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(PIPELINE_STATUSES);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let [statusKey, statusLabel] = each_array_1[$$index_1];
        $$renderer3.option({ value: statusKey }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(statusLabel)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</div> <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Kandidat</th><th>Mapel</th><th>Sumber</th><th>Tahap</th><th style="text-align:right">Aksi</th></tr></thead><tbody>`);
    if (paginatedCandidates.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="5" class="empty">Tidak ada kandidat untuk filter ini.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_2 = ensure_array_like(paginatedCandidates);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let c = each_array_2[$$index_2];
        $$renderer2.push(`<tr><td><strong>${escape_html(c.fullName)}</strong> <div class="sub">${escape_html(c.email)}</div></td><td>${escape_html(getSubjectNames(c.subjectIds))}</td><td>${escape_html(c.source || "—")}</td><td><span${attr_class(`badge ${stringify(getBadgeClass(c.status))}`)}>${escape_html(c.status)}</span></td><td><div class="actions"><button type="button" class="btn-icon" data-tip="Detail">`);
        Icon($$renderer2, { name: "visibility", size: "sm" });
        $$renderer2.push(`<!----></button> `);
        if (c.status === "REGISTERED") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<button type="button" class="btn-icon" data-tip="Jadwalkan Tes">`);
          Icon($$renderer2, { name: "assignment", size: "sm" });
          $$renderer2.push(`<!----></button>`);
        } else if (c.status === "TEST_SCHEDULED") {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<button type="button" class="btn-icon" data-tip="Catat Tes">`);
          Icon($$renderer2, { name: "fact_check", size: "sm" });
          $$renderer2.push(`<!----></button>`);
        } else if (c.status === "TESTED") {
          $$renderer2.push("<!--[2-->");
          $$renderer2.push(`<button type="button" class="btn-icon" data-tip="Jadwalkan Wawancara">`);
          Icon($$renderer2, { name: "record_voice_over", size: "sm" });
          $$renderer2.push(`<!----></button>`);
        } else if (c.status === "INTERVIEW_SCHEDULED") {
          $$renderer2.push("<!--[3-->");
          $$renderer2.push(`<button type="button" class="btn-icon" data-tip="Catat Wawancara">`);
          Icon($$renderer2, { name: "record_voice_over", size: "sm" });
          $$renderer2.push(`<!----></button>`);
        } else if (c.status === "INTERVIEWED") {
          $$renderer2.push("<!--[4-->");
          $$renderer2.push(`<button type="button" class="btn-icon" data-tip="Terima">`);
          Icon($$renderer2, { name: "how_to_reg", size: "sm" });
          $$renderer2.push(`<!----></button> <button type="button" class="btn-icon btn-icon-danger" data-tip="Tolak">`);
          Icon($$renderer2, { name: "close", size: "sm" });
          $$renderer2.push(`<!----></button>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> <button type="button" class="btn-icon" data-tip="Ubah">`);
        Icon($$renderer2, { name: "edit", size: "sm" });
        $$renderer2.push(`<!----></button> <button type="button" class="btn-icon btn-icon-danger" data-tip="Hapus">`);
        Icon($$renderer2, { name: "delete", size: "sm" });
        $$renderer2.push(`<!----></button></div></td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div> `);
    if (filteredCandidates.length > itemsPerPage) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="page-nav"><div class="page-info">Menampilkan ${escape_html((currentPage - 1) * itemsPerPage + 1)}–${escape_html(Math.min(currentPage * itemsPerPage, filteredCandidates.length))} dari ${escape_html(filteredCandidates.length)} data</div> <div class="page-btns"><button type="button" class="page-btn"${attr("disabled", currentPage <= 1, true)}>«</button> <!--[-->`);
      const each_array_3 = ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let p = each_array_3[$$index_3];
        $$renderer2.push(`<button type="button"${attr_class(`page-btn ${currentPage === p ? "active" : ""}`)}>${escape_html(p)}</button>`);
      }
      $$renderer2.push(`<!--]--> <button type="button" class="page-btn"${attr("disabled", currentPage >= totalPages, true)}>»</button></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    Candidate_modal($$renderer2, {
      open: candidateModalOpen,
      editingCandidate,
      onClose: () => {
        candidateModalOpen = false;
      }
    });
    $$renderer2.push(`<!----> `);
    Confirmation_dialog($$renderer2, {
      open: deleteDialogOpen,
      title: "Hapus Kandidat",
      message: "Apakah Anda yakin ingin menghapus kandidat ini?",
      confirmText: "Hapus",
      confirmVariant: "danger",
      onConfirm: handleConfirmDelete,
      onCancel: () => {
        deleteDialogOpen = false;
      }
    });
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
