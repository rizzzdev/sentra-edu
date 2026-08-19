import { s as store_get, e as escape_html, b as ensure_array_like, a as attr, c as attr_class, u as unsubscribe_stores } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { a as authStore } from "../../../../chunks/auth-store.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
import { a as formatDateIndonesian, f as formatCurrencyIDR } from "../../../../chunks/formatting.js";
import { A as Attendance_verify_modal } from "../../../../chunks/attendance-verify-modal.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let currentUser, activeJobs, tentorCount, enrolledStudentCount, pendingAttList, pendingClaimsCount, candidatesCount, adminPaginatedAtt, tentorOpenJobs, tentorMyAtt, tentorApprovedAtt, tentorClaims, tentorMyJobs, tentorPaginatedJobs, studentMyEnr, studentEnrIds, studentMyAtt, studentApprovedAtt, waliMyStudents, waliStudentIds, waliMyEnr, waliEnrIds, waliMyAtt, waliApprovedAtt, waliInvoices, waliUnpaidInvoices, waliUnpaidTotal, waliPaginatedInvoices;
    let verifyModalOpen = false;
    let selectedAttendance = null;
    let adminPage = 1;
    let tentorPage = 1;
    let waliPage = 1;
    const itemsPerPage = 5;
    function getUserName(userId) {
      if (!userId) return "—";
      const user = store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === userId);
      return user ? user.fullName : "—";
    }
    function getStudentOf(enrollmentId) {
      const enr = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.find((e) => e.id === enrollmentId);
      if (!enr) return "—";
      const stu = store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === enr.studentId);
      return stu ? stu.fullName : "—";
    }
    function getClassName(classId) {
      const cls = store_get($$store_subs ??= {}, "$dbStore", dbStore).classes.find((c) => c.id === classId);
      return cls ? cls.className : "—";
    }
    function getSubjectName(subjectId) {
      const sub = store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.find((s) => s.id === subjectId);
      return sub ? sub.name : "—";
    }
    function getPackageName(packageId) {
      if (!packageId) return "—";
      const pkg = store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.find((p) => p.id === packageId);
      return pkg ? pkg.name : "—";
    }
    currentUser = store_get($$store_subs ??= {}, "$authStore", authStore);
    activeJobs = store_get($$store_subs ??= {}, "$dbStore", dbStore).jobs.filter((j) => j.deletedAt === null && (j.status === "AVAILABLE" || j.status === "NEGOTIATING")).length;
    tentorCount = store_get($$store_subs ??= {}, "$dbStore", dbStore).users.filter((u) => u.deletedAt === null && u.role === "TENTOR").length;
    enrolledStudentCount = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.filter((e) => e.deletedAt === null).length;
    pendingAttList = store_get($$store_subs ??= {}, "$dbStore", dbStore).attendances.filter((a) => a.deletedAt === null && a.status === "SUBMITTED");
    pendingClaimsCount = store_get($$store_subs ??= {}, "$dbStore", dbStore).payrollClaims.filter((c) => c.deletedAt === null && c.status === "REQUESTED").length;
    candidatesCount = store_get($$store_subs ??= {}, "$dbStore", dbStore).candidates.filter((c) => c.deletedAt === null).length;
    adminPaginatedAtt = pendingAttList.slice((adminPage - 1) * itemsPerPage, adminPage * itemsPerPage);
    tentorOpenJobs = store_get($$store_subs ??= {}, "$dbStore", dbStore).jobs.filter((j) => j.deletedAt === null && (j.status === "AVAILABLE" || j.status === "NEGOTIATING"));
    tentorMyAtt = currentUser ? store_get($$store_subs ??= {}, "$dbStore", dbStore).attendances.filter((a) => a.deletedAt === null && a.tentorId === currentUser?.id) : [];
    tentorApprovedAtt = tentorMyAtt.filter((a) => a.status === "APPROVED");
    tentorClaims = currentUser ? store_get($$store_subs ??= {}, "$dbStore", dbStore).payrollClaims.filter((c) => c.deletedAt === null && c.tentorId === currentUser?.id) : [];
    tentorMyJobs = currentUser ? store_get($$store_subs ??= {}, "$dbStore", dbStore).jobs.filter((j) => j.deletedAt === null && j.assignedTentorId === currentUser?.id) : [];
    tentorPaginatedJobs = tentorMyJobs.slice((tentorPage - 1) * itemsPerPage, tentorPage * itemsPerPage);
    studentMyEnr = currentUser ? store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.filter((e) => e.deletedAt === null && e.studentId === currentUser?.id) : [];
    studentEnrIds = studentMyEnr.map((e) => e.id);
    studentMyAtt = store_get($$store_subs ??= {}, "$dbStore", dbStore).attendances.filter((a) => a.deletedAt === null && studentEnrIds.includes(a.enrollmentId));
    studentApprovedAtt = studentMyAtt.filter((a) => a.status === "APPROVED");
    waliMyStudents = currentUser ? store_get($$store_subs ??= {}, "$dbStore", dbStore).users.filter((u) => u.deletedAt === null && u.role === "STUDENT" && u.waliUserId === currentUser?.id) : [];
    waliStudentIds = waliMyStudents.map((s) => s.id);
    waliMyEnr = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.filter((e) => e.deletedAt === null && (e.waliUserId === currentUser?.id || waliStudentIds.includes(e.studentId)));
    waliEnrIds = waliMyEnr.map((e) => e.id);
    waliMyAtt = store_get($$store_subs ??= {}, "$dbStore", dbStore).attendances.filter((a) => a.deletedAt === null && waliEnrIds.includes(a.enrollmentId));
    waliApprovedAtt = waliMyAtt.filter((a) => a.status === "APPROVED");
    waliInvoices = store_get($$store_subs ??= {}, "$dbStore", dbStore).invoices.filter((i) => i.deletedAt === null && waliEnrIds.includes(i.enrollmentId));
    waliUnpaidInvoices = waliInvoices.filter((i) => i.status === "UNPAID");
    waliUnpaidTotal = waliUnpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    waliPaginatedInvoices = waliInvoices.slice((waliPage - 1) * itemsPerPage, waliPage * itemsPerPage);
    if (currentUser?.role === "SUPER_ADMIN") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="page-head"><div><h3>`);
      Icon($$renderer2, { name: "space_dashboard", size: "lg" });
      $$renderer2.push(`<!----> Dashboard</h3> <div class="desc">Ringkasan operasional SentraEdu.</div></div></div> <div class="stat-grid"><div class="stat"><div class="s-icon tone-sky">`);
      Icon($$renderer2, { name: "work", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(activeJobs)}</div> <div class="s-lbl">Lowongan Aktif</div></div></div> <div class="stat"><div class="s-icon tone-emerald">`);
      Icon($$renderer2, { name: "school", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(tentorCount)}</div> <div class="s-lbl">Akun Tentor</div></div></div> <div class="stat"><div class="s-icon tone-amber">`);
      Icon($$renderer2, { name: "group", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(enrolledStudentCount)}</div> <div class="s-lbl">Siswa Terdaftar</div></div></div> <div class="stat"><div class="s-icon tone-violet">`);
      Icon($$renderer2, { name: "fact_check", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(pendingAttList.length)}</div> <div class="s-lbl">Presensi Perlu Verifikasi</div></div></div> <div class="stat"><div class="s-icon tone-rose">`);
      Icon($$renderer2, { name: "payments", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(pendingClaimsCount)}</div> <div class="s-lbl">Klaim Gaji Masuk</div></div></div> <div class="stat"><div class="s-icon tone-teal">`);
      Icon($$renderer2, { name: "badge", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(candidatesCount)}</div> <div class="s-lbl">Kandidat Rekrutmen</div></div></div></div> <div class="card"><div class="card-head">`);
      Icon($$renderer2, { name: "fact_check", size: "md" });
      $$renderer2.push(`<!----> Presensi Menunggu Verifikasi</div> <div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Tanggal</th><th>Tentor</th><th>Siswa</th><th>Topik</th><th style="text-align:right">Aksi</th></tr></thead><tbody>`);
      if (adminPaginatedAtt.length === 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<tr><td colspan="5" class="empty">Tidak ada presensi menunggu verifikasi. 👍</td></tr>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<!--[-->`);
        const each_array = ensure_array_like(adminPaginatedAtt);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let att = each_array[$$index];
          $$renderer2.push(`<tr><td>${escape_html(formatDateIndonesian(att.sessionDate))}</td><td>${escape_html(getUserName(att.tentorId))}</td><td>${escape_html(getStudentOf(att.enrollmentId))}</td><td>${escape_html(att.topic)}</td><td><div class="actions"><button type="button" class="btn-icon" data-tip="Periksa">`);
          Icon($$renderer2, { name: "visibility", size: "sm" });
          $$renderer2.push(`<!----></button></div></td></tr>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></tbody></table></div> `);
      if (pendingAttList.length > itemsPerPage) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="page-nav"><div class="page-info">Menampilkan ${escape_html((adminPage - 1) * itemsPerPage + 1)}–${escape_html(Math.min(adminPage * itemsPerPage, pendingAttList.length))} dari ${escape_html(pendingAttList.length)} data</div> <div class="page-btns"><button type="button" class="page-btn"${attr("disabled", adminPage <= 1, true)}>«</button> <button type="button" class="page-btn active">${escape_html(adminPage)}</button> <button type="button" class="page-btn"${attr("disabled", adminPage * itemsPerPage >= pendingAttList.length, true)}>»</button></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div> <div class="quick-actions"><a href="/jobs" class="btn btn-primary">`);
      Icon($$renderer2, { name: "add", size: "sm" });
      $$renderer2.push(`<!----> Buat Lowongan</a> <a href="/attendance" class="btn btn-outline">`);
      Icon($$renderer2, { name: "fact_check", size: "sm" });
      $$renderer2.push(`<!----> Verifikasi Presensi</a> <a href="/candidates" class="btn btn-outline">`);
      Icon($$renderer2, { name: "badge", size: "sm" });
      $$renderer2.push(`<!----> Rekrutmen Tentor</a></div>`);
    } else if (currentUser?.role === "TENTOR") {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="page-head"><div><h3>`);
      Icon($$renderer2, { name: "space_dashboard", size: "lg" });
      $$renderer2.push(`<!----> Dashboard</h3> <div class="desc">Cari lowongan, lakukan presensi, dan pantau penggajian Anda.</div></div></div> <div class="stat-grid"><div class="stat"><div class="s-icon tone-sky">`);
      Icon($$renderer2, { name: "search", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(tentorOpenJobs.length)}</div> <div class="s-lbl">Lowongan Terbuka</div></div></div> <div class="stat"><div class="s-icon tone-emerald">`);
      Icon($$renderer2, { name: "verified", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(tentorApprovedAtt.length)}</div> <div class="s-lbl">Sesi Disetujui</div></div></div> <div class="stat"><div class="s-icon tone-amber">`);
      Icon($$renderer2, { name: "location_on", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(tentorMyAtt.length)}</div> <div class="s-lbl">Total Sesi Tercatat</div></div></div> <div class="stat"><div class="s-icon tone-violet">`);
      Icon($$renderer2, { name: "payments", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(tentorClaims.length)}</div> <div class="s-lbl">Riwayat Penggajian</div></div></div></div> <div class="card"><div class="card-head">`);
      Icon($$renderer2, { name: "assignment", size: "md" });
      $$renderer2.push(`<!----> Penugasan Saya</div> <div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Lowongan</th><th>Kelas · Mapel</th><th>Status</th></tr></thead><tbody>`);
      if (tentorPaginatedJobs.length === 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<tr><td colspan="3" class="empty">Belum ada penugasan. Cari lowongan di menu "Cari Lowongan".</td></tr>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(tentorPaginatedJobs);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let j = each_array_1[$$index_1];
          $$renderer2.push(`<tr><td><strong>${escape_html(j.title)}</strong> <div class="sub"><span${attr_class(`badge ${j.mode === "ONLINE" ? "b-neutral" : "b-available"}`)}>${escape_html(j.mode)}</span> ${escape_html(getPackageName(j.packageId))} · ${escape_html(j.schedulePreference)}</div></td><td>${escape_html(getClassName(j.classId))} · ${escape_html(getSubjectName(j.subjectId))}</td><td><span${attr_class(`badge ${j.status === "ASSIGNED" ? "b-assigned" : j.status === "AVAILABLE" ? "b-available" : "b-negotiating"}`)}>${escape_html(j.status)}</span></td></tr>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></tbody></table></div> `);
      if (tentorMyJobs.length > itemsPerPage) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="page-nav"><div class="page-info">Menampilkan ${escape_html((tentorPage - 1) * itemsPerPage + 1)}–${escape_html(Math.min(tentorPage * itemsPerPage, tentorMyJobs.length))} dari ${escape_html(tentorMyJobs.length)} data</div> <div class="page-btns"><button type="button" class="page-btn"${attr("disabled", tentorPage <= 1, true)}>«</button> <button type="button" class="page-btn active">${escape_html(tentorPage)}</button> <button type="button" class="page-btn"${attr("disabled", tentorPage * itemsPerPage >= tentorMyJobs.length, true)}>»</button></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div> <div class="quick-actions"><a href="/jobboard" class="btn btn-primary">`);
      Icon($$renderer2, { name: "search", size: "sm" });
      $$renderer2.push(`<!----> Cari Lowongan</a> <a href="/attendance" class="btn btn-outline">`);
      Icon($$renderer2, { name: "location_on", size: "sm" });
      $$renderer2.push(`<!----> Presensi Hari Ini</a> <a href="/payroll" class="btn btn-outline">`);
      Icon($$renderer2, { name: "payments", size: "sm" });
      $$renderer2.push(`<!----> Riwayat Penggajian</a></div>`);
    } else if (currentUser?.role === "STUDENT") {
      $$renderer2.push("<!--[2-->");
      $$renderer2.push(`<div class="page-head"><div><h3>`);
      Icon($$renderer2, { name: "space_dashboard", size: "lg" });
      $$renderer2.push(`<!----> Dashboard</h3> <div class="desc">Pantau les aktif, presensi, dan laporan hasil belajar Anda.</div></div></div> <div class="stat-grid"><div class="stat"><div class="s-icon tone-sky">`);
      Icon($$renderer2, { name: "school", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(studentMyEnr.length)}</div> <div class="s-lbl">Program Les Aktif</div></div></div> <div class="stat"><div class="s-icon tone-emerald">`);
      Icon($$renderer2, { name: "verified", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(studentApprovedAtt.length)}</div> <div class="s-lbl">Sesi Disetujui</div></div></div> <div class="stat"><div class="s-icon tone-amber">`);
      Icon($$renderer2, { name: "location_on", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(studentMyAtt.length)}</div> <div class="s-lbl">Total Sesi Tercatat</div></div></div></div> <div class="quick-actions"><a href="/program" class="btn btn-primary">`);
      Icon($$renderer2, { name: "school", size: "sm" });
      $$renderer2.push(`<!----> Lihat Program Les</a> <a href="/attendance" class="btn btn-outline">`);
      Icon($$renderer2, { name: "fact_check", size: "sm" });
      $$renderer2.push(`<!----> Lihat Presensi</a></div>`);
    } else if (currentUser?.role === "WALI_MURID") {
      $$renderer2.push("<!--[3-->");
      $$renderer2.push(`<div class="page-head"><div><h3>`);
      Icon($$renderer2, { name: "space_dashboard", size: "lg" });
      $$renderer2.push(`<!----> Dashboard Wali Murid</h3> <div class="desc">Pantau les, presensi, dan tagihan SPP anak Anda.</div></div></div> <div class="stat-grid"><div class="stat"><div class="s-icon tone-sky">`);
      Icon($$renderer2, { name: "school", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(waliMyEnr.length)}</div> <div class="s-lbl">Program Les Anak</div></div></div> <div class="stat"><div class="s-icon tone-emerald">`);
      Icon($$renderer2, { name: "verified", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(waliApprovedAtt.length)}</div> <div class="s-lbl">Sesi Disetujui</div></div></div> <div class="stat"><div class="s-icon tone-amber">`);
      Icon($$renderer2, { name: "receipt_long", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(waliUnpaidInvoices.length)}</div> <div class="s-lbl">Tagihan Belum Dibayar</div></div></div> <div class="stat"><div class="s-icon tone-rose">`);
      Icon($$renderer2, { name: "payments", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(formatCurrencyIDR(waliUnpaidTotal))}</div> <div class="s-lbl">Total Tagihan</div></div></div></div> <div class="card"><div class="card-head">`);
      Icon($$renderer2, { name: "receipt_long", size: "md" });
      $$renderer2.push(`<!----> Tagihan SPP Terbaru</div> <div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>No. Invoice</th><th>Anak</th><th>Periode</th><th class="num">Total</th><th>Status</th></tr></thead><tbody>`);
      if (waliPaginatedInvoices.length === 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<tr><td colspan="5" class="empty">Belum ada tagihan.</td></tr>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_2 = ensure_array_like(waliPaginatedInvoices);
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let inv = each_array_2[$$index_2];
          $$renderer2.push(`<tr><td>${escape_html(inv.invoiceNumber)}</td><td>${escape_html(getStudentOf(inv.enrollmentId))}</td><td>Bulan ${escape_html(inv.periodMonth)}/${escape_html(inv.periodYear)}</td><td class="num"><strong>${escape_html(formatCurrencyIDR(inv.amount))}</strong></td><td><span${attr_class(`badge ${inv.status === "PAID" ? "b-paid" : inv.status === "OVERDUE" ? "b-rejected" : "b-unpaid"}`)}>${escape_html(inv.status)}</span></td></tr>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></tbody></table></div> `);
      if (waliInvoices.length > itemsPerPage) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="page-nav"><div class="page-info">Menampilkan ${escape_html((waliPage - 1) * itemsPerPage + 1)}–${escape_html(Math.min(waliPage * itemsPerPage, waliInvoices.length))} dari ${escape_html(waliInvoices.length)} data</div> <div class="page-btns"><button type="button" class="page-btn"${attr("disabled", waliPage <= 1, true)}>«</button> <button type="button" class="page-btn active">${escape_html(waliPage)}</button> <button type="button" class="page-btn"${attr("disabled", waliPage * itemsPerPage >= waliInvoices.length, true)}>»</button></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div> <div class="quick-actions"><a href="/children" class="btn btn-primary">`);
      Icon($$renderer2, { name: "school", size: "sm" });
      $$renderer2.push(`<!----> Program Les Anak</a> <a href="/invoices" class="btn btn-outline">`);
      Icon($$renderer2, { name: "receipt_long", size: "sm" });
      $$renderer2.push(`<!----> Tagihan SPP</a></div>`);
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
