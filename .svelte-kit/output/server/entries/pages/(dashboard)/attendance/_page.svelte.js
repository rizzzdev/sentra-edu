import { f as fallback, s as store_get, u as unsubscribe_stores, h as bind_props, b as ensure_array_like, e as escape_html, a as attr, c as attr_class } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { M as Modal } from "../../../../chunks/modal.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
import "../../../../chunks/toast-store.js";
import { A as Attendance_verify_modal } from "../../../../chunks/attendance-verify-modal.js";
import { a as authStore } from "../../../../chunks/auth-store.js";
import { a as formatDateIndonesian } from "../../../../chunks/formatting.js";
function Attendance_checkin_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let myEnrollments, durationMinutes, sessionsCount;
    let open = fallback($$props["open"], false);
    let tentor = $$props["tentor"];
    let onClose = fallback($$props["onClose"], () => {
    });
    let selectedEnrollmentId = "";
    let sessionDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let startTime = "09:00";
    let endTime = "10:30";
    let topicTaught = "";
    let activityNotes = "";
    let latitudeCheckIn = -6.2;
    let longitudeCheckIn = 106.8;
    function time24ToMin(t) {
      const m = /^([01][0-9]|2[0-3]):([0-5][0-9])$/.exec(String(t || "").trim());
      return m ? +m[1] * 60 + +m[2] : null;
    }
    myEnrollments = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.filter((e) => e.deletedAt === null && e.tentorId === tentor.id && e.status === "ACTIVE");
    if (myEnrollments.length > 0 && !selectedEnrollmentId) {
      selectedEnrollmentId = myEnrollments[0].id;
    }
    store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.find((e) => e.id === selectedEnrollmentId);
    durationMinutes = (() => {
      const s = time24ToMin(startTime);
      const e = time24ToMin(endTime);
      if (s === null || e === null || s === e) return 90;
      return e > s ? e - s : e - s + 1440;
    })();
    sessionsCount = Math.round(durationMinutes / 90 * 10) / 10;
    Modal($$renderer2, {
      open,
      onClose,
      title: "Check-in Presensi",
      icon: "location_on",
      maxWidth: "620px",
      children: ($$renderer3) => {
        $$renderer3.push(`<div id="gps-box" style="margin-bottom:12px"><div class="quick-actions" style="margin-bottom:10px"><button type="button" class="btn btn-sm btn-soft">`);
        Icon($$renderer3, { name: "gps_fixed", size: "sm" });
        $$renderer3.push(`<!----> Ambil Lokasi GPS</button> <button type="button" class="btn btn-sm btn-outline">`);
        Icon($$renderer3, { name: "my_location", size: "sm" });
        $$renderer3.push(`<!----> Simulasi GPS (lokasi les)</button></div></div> <div class="alert alert-info">`);
        Icon($$renderer3, { name: "schedule", size: "sm" });
        $$renderer3.push(`<!----> <span>Jam mulai &amp; selesai <strong>terisi otomatis</strong> dari preferensi lowongan namun <strong>bisa diubah</strong> dengan format <strong>24 jam</strong> (cth: 14:30). <strong>Lama pembelajaran</strong> &amp; <strong>jumlah sesi</strong> dihitung otomatis.</span></div> <form id="form-checkin"><div class="field"><label for="f_enr">Pilih Siswa / Program <i class="req">*</i></label> `);
        $$renderer3.select({ id: "f_enr", required: true, value: selectedEnrollmentId }, ($$renderer4) => {
          $$renderer4.push(`<!--[-->`);
          const each_array = ensure_array_like(myEnrollments);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let e = each_array[$$index];
            const student = store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === e.studentId);
            const subject = store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.find((s) => s.id === e.subjectId);
            const cls = store_get($$store_subs ??= {}, "$dbStore", dbStore).classes.find((c) => c.id === e.classId);
            $$renderer4.option({ value: e.id }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(student?.fullName || "Siswa")} — ${escape_html(cls?.className)} ${escape_html(subject?.name)}`);
            });
          }
          $$renderer4.push(`<!--]-->`);
        });
        $$renderer3.push(`</div> <div class="field"><label for="f_sessionDate">Tanggal Sesi <i class="req">*</i></label> <input id="f_sessionDate" type="date" required=""${attr("value", sessionDate)}/></div> <div class="form-grid"><div class="field"><label for="f_startTime">Jam Mulai <i class="req">*</i></label> <input id="f_startTime" type="text" placeholder="09:00" required=""${attr("value", startTime)}/></div> <div class="field"><label for="f_endTime">Jam Selesai <i class="req">*</i></label> <input id="f_endTime" type="text" placeholder="10:30" required=""${attr("value", endTime)}/></div></div> <div class="form-grid"><div class="field"><label for="f_durationMinutes">Lama Pembelajaran (menit)</label> <input id="f_durationMinutes" type="number" readonly=""${attr("value", durationMinutes)}/> <div class="help">Dihitung otomatis dari jam mulai &amp; selesai.</div></div> <div class="field"><label for="f_sessionsCount">Jumlah Sesi (90 menit/sesi)</label> <input id="f_sessionsCount" type="number" readonly=""${attr("value", sessionsCount)}/> <div class="help">Dihitung otomatis: lama ÷ 90 menit.</div></div></div> <div class="form-grid"><div class="field"><label for="f_latitudeCheckIn">Latitude (GPS) <i class="req">*</i></label> <input id="f_latitudeCheckIn" type="number" step="0.000001" required=""${attr("value", latitudeCheckIn)}/></div> <div class="field"><label for="f_longitudeCheckIn">Longitude (GPS) <i class="req">*</i></label> <input id="f_longitudeCheckIn" type="number" step="0.000001" required=""${attr("value", longitudeCheckIn)}/></div></div> <div class="field"><label for="f_topicTaught">Topik Materi <i class="req">*</i></label> <input id="f_topicTaught" type="text" placeholder="cth: Matematika: Turunan &amp; Aplikasinya" required=""${attr("value", topicTaught)}/></div> <div class="field"><label for="f_activityNotes">Catatan Kegiatan</label> <textarea id="f_activityNotes" rows="2" placeholder="cth: Latihan soal studi kasus">`);
        const $$body = escape_html(activityNotes);
        if ($$body) {
          $$renderer3.push(`${$$body}`);
        }
        $$renderer3.push(`</textarea></div></form>`);
      },
      $$slots: {
        default: true,
        footer: ($$renderer3) => {
          {
            $$renderer3.push(`<button type="button" class="btn btn-outline">`);
            Icon($$renderer3, { name: "close", size: "sm" });
            $$renderer3.push(`<!----> Batal</button> <button type="submit" form="form-checkin" class="btn btn-primary">`);
            Icon($$renderer3, { name: "location_on", size: "sm" });
            $$renderer3.push(`<!----> Kirim Presensi</button>`);
          }
        }
      }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { open, tentor, onClose });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let currentUser, allAttendances, nSubmitted, nApproved, nRejected, filteredAttendances, paginatedAttendances, totalPages;
    let searchQuery = "";
    let statusFilter = "";
    let currentPage = 1;
    const itemsPerPage = 8;
    let checkinModalOpen = false;
    let verifyModalOpen = false;
    let selectedAttendance = null;
    function getUserName(userId) {
      if (!userId) return "—";
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === userId)?.fullName || "—";
    }
    function getStudentOf(enrollmentId) {
      const enr = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.find((e) => e.id === enrollmentId);
      if (!enr) return "—";
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === enr.studentId)?.fullName || "—";
    }
    function getSubjectName(enrollmentId) {
      const enr = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.find((e) => e.id === enrollmentId);
      if (!enr) return "—";
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.find((s) => s.id === enr.subjectId)?.name || "—";
    }
    currentUser = store_get($$store_subs ??= {}, "$authStore", authStore);
    allAttendances = store_get($$store_subs ??= {}, "$dbStore", dbStore).attendances.filter((a) => {
      if (a.deletedAt !== null) return false;
      if (!currentUser) return false;
      if (currentUser.role === "SUPER_ADMIN") return true;
      if (currentUser.role === "TENTOR") return a.tentorId === currentUser.id;
      const enr = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.find((e) => e.id === a.enrollmentId);
      if (!enr) return false;
      return enr.studentId === currentUser.id || enr.waliUserId === currentUser.id;
    });
    nSubmitted = allAttendances.filter((a) => a.status === "SUBMITTED").length;
    nApproved = allAttendances.filter((a) => a.status === "APPROVED").length;
    nRejected = allAttendances.filter((a) => a.status === "REJECTED").length;
    filteredAttendances = allAttendances.filter((att) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || att.topic.toLowerCase().includes(q) || getStudentOf(att.enrollmentId).toLowerCase().includes(q) || getUserName(att.tentorId).toLowerCase().includes(q);
      const matchesStatus = !statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => a.sessionDate < b.sessionDate ? 1 : -1);
    paginatedAttendances = filteredAttendances.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    totalPages = Math.max(1, Math.ceil(filteredAttendances.length / itemsPerPage));
    if (currentUser?.role === "SUPER_ADMIN") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="page-head"><div><h3>`);
      Icon($$renderer2, { name: "fact_check", size: "lg" });
      $$renderer2.push(`<!----> Verifikasi Presensi</h3> <div class="desc">Setujui atau tolak presensi tentor. Sesi yang disetujui masuk klaim gaji &amp; tagihan SPP.</div></div></div> <div class="stat-grid"><div class="stat"><div class="s-icon tone-amber">`);
      Icon($$renderer2, { name: "fact_check", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(nSubmitted)}</div> <div class="s-lbl">Menunggu Verifikasi</div></div></div> <div class="stat"><div class="s-icon tone-emerald">`);
      Icon($$renderer2, { name: "verified", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(nApproved)}</div> <div class="s-lbl">Disetujui</div></div></div> <div class="stat"><div class="s-icon tone-rose">`);
      Icon($$renderer2, { name: "cancel", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(nRejected)}</div> <div class="s-lbl">Ditolak</div></div></div></div> <div class="filter-bar">`);
      $$renderer2.select({ class: "filter-select", value: statusFilter }, ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Semua Status`);
        });
        $$renderer3.option({ value: "SUBMITTED" }, ($$renderer4) => {
          $$renderer4.push(`Menunggu Verifikasi`);
        });
        $$renderer3.option({ value: "APPROVED" }, ($$renderer4) => {
          $$renderer4.push(`Disetujui`);
        });
        $$renderer3.option({ value: "REJECTED" }, ($$renderer4) => {
          $$renderer4.push(`Ditolak`);
        });
      });
      $$renderer2.push(`</div> <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Tanggal</th><th>Tentor</th><th>Siswa</th><th>Mode · Topik</th><th>Status</th><th style="text-align:right">Aksi</th></tr></thead><tbody>`);
      if (paginatedAttendances.length === 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<tr><td colspan="6" class="empty">Tidak ada presensi untuk filter ini.</td></tr>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<!--[-->`);
        const each_array = ensure_array_like(paginatedAttendances);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let a = each_array[$$index];
          $$renderer2.push(`<tr><td>${escape_html(formatDateIndonesian(a.sessionDate))}</td><td>${escape_html(getUserName(a.tentorId))}</td><td>${escape_html(getStudentOf(a.enrollmentId))}</td><td>${escape_html(a.topic)} `);
          if (!a.isRadiusValid) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<div class="sub" style="color:var(--warn)">⚠ di luar radius</div>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></td><td><span${attr_class(`badge ${a.status === "APPROVED" ? "b-approved" : a.status === "REJECTED" ? "b-rejected" : "b-submitted"}`)}>${escape_html(a.status)}</span></td><td><div class="actions"><button type="button" class="btn-icon" data-tip="Periksa">`);
          Icon($$renderer2, { name: "visibility", size: "sm" });
          $$renderer2.push(`<!----></button> `);
          if (a.status === "SUBMITTED") {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<button type="button" class="btn-icon" data-tip="Setujui">`);
            Icon($$renderer2, { name: "check", size: "sm" });
            $$renderer2.push(`<!----></button> <button type="button" class="btn-icon btn-icon-danger" data-tip="Tolak">`);
            Icon($$renderer2, { name: "close", size: "sm" });
            $$renderer2.push(`<!----></button>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></div></td></tr>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></tbody></table></div> `);
      if (filteredAttendances.length > itemsPerPage) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="page-nav"><div class="page-info">Menampilkan ${escape_html((currentPage - 1) * itemsPerPage + 1)}–${escape_html(Math.min(currentPage * itemsPerPage, filteredAttendances.length))} dari ${escape_html(filteredAttendances.length)} data</div> <div class="page-btns"><button type="button" class="page-btn"${attr("disabled", currentPage <= 1, true)}>«</button> <!--[-->`);
        const each_array_1 = ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let p = each_array_1[$$index_1];
          $$renderer2.push(`<button type="button"${attr_class(`page-btn ${currentPage === p ? "active" : ""}`)}>${escape_html(p)}</button>`);
        }
        $$renderer2.push(`<!--]--> <button type="button" class="page-btn"${attr("disabled", currentPage >= totalPages, true)}>»</button></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else if (currentUser?.role === "TENTOR") {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="page-head"><div><h3>`);
      Icon($$renderer2, { name: "location_on", size: "lg" });
      $$renderer2.push(`<!----> Presensi Saya</h3> <div class="desc">Catatan presensi dan materi belajar sesi les Anda.</div></div> <button type="button" class="btn btn-primary">`);
      Icon($$renderer2, { name: "location_on", size: "sm" });
      $$renderer2.push(`<!----> Check-in Presensi</button></div> <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Tanggal</th><th>Siswa</th><th>Topik</th><th>Catatan</th><th>Status</th><th style="text-align:right">Aksi</th></tr></thead><tbody>`);
      if (paginatedAttendances.length === 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<tr><td colspan="6" class="empty">Belum ada catatan presensi. Klik "Check-in Presensi".</td></tr>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_2 = ensure_array_like(paginatedAttendances);
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let a = each_array_2[$$index_2];
          $$renderer2.push(`<tr><td>${escape_html(formatDateIndonesian(a.sessionDate))}</td><td>${escape_html(getStudentOf(a.enrollmentId))}</td><td>${escape_html(a.topic)}</td><td>${escape_html(a.studentNotes || "—")}</td><td><span${attr_class(`badge ${a.status === "APPROVED" ? "b-approved" : a.status === "REJECTED" ? "b-rejected" : "b-submitted"}`)}>${escape_html(a.status)}</span></td><td><div class="actions"><button type="button" class="btn-icon" data-tip="Periksa">`);
          Icon($$renderer2, { name: "visibility", size: "sm" });
          $$renderer2.push(`<!----></button></div></td></tr>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></tbody></table></div> `);
      if (filteredAttendances.length > itemsPerPage) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="page-nav"><div class="page-info">Menampilkan ${escape_html((currentPage - 1) * itemsPerPage + 1)}–${escape_html(Math.min(currentPage * itemsPerPage, filteredAttendances.length))} dari ${escape_html(filteredAttendances.length)} data</div> <div class="page-btns"><button type="button" class="page-btn"${attr("disabled", currentPage <= 1, true)}>«</button> <!--[-->`);
        const each_array_3 = ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));
        for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
          let p = each_array_3[$$index_3];
          $$renderer2.push(`<button type="button"${attr_class(`page-btn ${currentPage === p ? "active" : ""}`)}>${escape_html(p)}</button>`);
        }
        $$renderer2.push(`<!--]--> <button type="button" class="page-btn"${attr("disabled", currentPage >= totalPages, true)}>»</button></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="page-head"><div><h3>`);
      Icon($$renderer2, { name: "fact_check", size: "lg" });
      $$renderer2.push(`<!----> Daftar Presensi</h3> <div class="desc">Riwayat kehadiran tentor pada sesi les pembelajaran.</div></div></div> <div class="filter-bar"><div class="filter-search">`);
      Icon($$renderer2, { name: "search", size: "sm" });
      $$renderer2.push(`<!----> <input type="text" placeholder="Cari tentor / topik..."${attr("value", searchQuery)}/></div></div> <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Tanggal</th><th>Tentor</th><th>Mapel</th><th>Topik</th><th>Catatan</th><th>Status</th></tr></thead><tbody>`);
      if (paginatedAttendances.length === 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<tr><td colspan="6" class="empty">Belum ada riwayat presensi.</td></tr>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_4 = ensure_array_like(paginatedAttendances);
        for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
          let a = each_array_4[$$index_4];
          $$renderer2.push(`<tr><td>${escape_html(formatDateIndonesian(a.sessionDate))}</td><td>${escape_html(getUserName(a.tentorId))}</td><td>${escape_html(getSubjectName(a.enrollmentId))}</td><td>${escape_html(a.topic)}</td><td>${escape_html(a.studentNotes || "—")}</td><td><span${attr_class(`badge ${a.status === "APPROVED" ? "b-approved" : a.status === "REJECTED" ? "b-rejected" : "b-submitted"}`)}>${escape_html(a.status)}</span></td></tr>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></tbody></table></div> `);
      if (filteredAttendances.length > itemsPerPage) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="page-nav"><div class="page-info">Menampilkan ${escape_html((currentPage - 1) * itemsPerPage + 1)}–${escape_html(Math.min(currentPage * itemsPerPage, filteredAttendances.length))} dari ${escape_html(filteredAttendances.length)} data</div> <div class="page-btns"><button type="button" class="page-btn"${attr("disabled", currentPage <= 1, true)}>«</button> <!--[-->`);
        const each_array_5 = ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));
        for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
          let p = each_array_5[$$index_5];
          $$renderer2.push(`<button type="button"${attr_class(`page-btn ${currentPage === p ? "active" : ""}`)}>${escape_html(p)}</button>`);
        }
        $$renderer2.push(`<!--]--> <button type="button" class="page-btn"${attr("disabled", currentPage >= totalPages, true)}>»</button></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (currentUser && currentUser.role === "TENTOR") {
      $$renderer2.push("<!--[0-->");
      Attendance_checkin_modal($$renderer2, {
        open: checkinModalOpen,
        tentor: currentUser,
        onClose: () => {
          checkinModalOpen = false;
        }
      });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    Attendance_verify_modal($$renderer2, {
      open: verifyModalOpen,
      attendance: selectedAttendance,
      onClose: () => {
        verifyModalOpen = false;
      }
    });
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
