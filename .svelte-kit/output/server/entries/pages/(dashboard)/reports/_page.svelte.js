import { s as store_get, e as escape_html, b as ensure_array_like, u as unsubscribe_stores } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { a as authStore } from "../../../../chunks/auth-store.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let currentUser, studentEnrs, studentEnrIds, studentApprovedAtt, studentBySubject, totalStudentHours, waliStudents, waliStudentIds, waliEnrs, waliEnrIds, waliApprovedAtt, waliByStudent;
    currentUser = store_get($$store_subs ??= {}, "$authStore", authStore);
    studentEnrs = currentUser ? store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.filter((e) => e.deletedAt === null && e.studentId === currentUser?.id) : [];
    studentEnrIds = studentEnrs.map((e) => e.id);
    studentApprovedAtt = store_get($$store_subs ??= {}, "$dbStore", dbStore).attendances.filter((a) => a.deletedAt === null && studentEnrIds.includes(a.enrollmentId) && a.status === "APPROVED");
    studentBySubject = (() => {
      const map = {};
      studentApprovedAtt.forEach((a) => {
        const enr = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.find((e) => e.id === a.enrollmentId);
        const sub = enr ? store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.find((s) => s.id === enr.subjectId) : null;
        const sName = sub ? sub.name : "Lainnya";
        if (!map[sName]) map[sName] = { count: 0, topics: [] };
        map[sName].count++;
        if (!map[sName].topics.includes(a.topic)) {
          map[sName].topics.push(a.topic);
        }
      });
      return map;
    })();
    totalStudentHours = Math.round(studentApprovedAtt.length * 1.5);
    waliStudents = currentUser ? store_get($$store_subs ??= {}, "$dbStore", dbStore).users.filter((u) => u.deletedAt === null && u.role === "STUDENT" && u.waliUserId === currentUser?.id) : [];
    waliStudentIds = waliStudents.map((s) => s.id);
    waliEnrs = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.filter((e) => e.deletedAt === null && (e.waliUserId === currentUser?.id || waliStudentIds.includes(e.studentId)));
    waliEnrIds = waliEnrs.map((e) => e.id);
    waliApprovedAtt = store_get($$store_subs ??= {}, "$dbStore", dbStore).attendances.filter((a) => a.deletedAt === null && waliEnrIds.includes(a.enrollmentId) && a.status === "APPROVED");
    waliByStudent = (() => {
      const map = {};
      waliApprovedAtt.forEach((a) => {
        const enr = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.find((e) => e.id === a.enrollmentId);
        const student = enr ? store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === enr.studentId) : null;
        const sName = student ? student.fullName : "—";
        if (!map[sName]) map[sName] = { count: 0, hours: 0 };
        map[sName].count++;
        map[sName].hours += 90;
      });
      return map;
    })();
    if (currentUser?.role === "STUDENT") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="page-head"><div><h3>`);
      Icon($$renderer2, { name: "summarize", size: "lg" });
      $$renderer2.push(`<!----> Laporan Hasil Belajar</h3> <div class="desc">Ringkasan progress belajar berdasarkan sesi yang telah disetujui.</div></div></div> <div class="stat-grid"><div class="stat"><div class="s-icon tone-sky">`);
      Icon($$renderer2, { name: "verified", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(studentApprovedAtt.length)}</div> <div class="s-lbl">Total Sesi Disetujui</div></div></div> <div class="stat"><div class="s-icon tone-emerald">`);
      Icon($$renderer2, { name: "schedule", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(totalStudentHours)} jam</div> <div class="s-lbl">Total Jam Belajar</div></div></div> <div class="stat"><div class="s-icon tone-amber">`);
      Icon($$renderer2, { name: "menu_book", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(Object.keys(studentBySubject).length)}</div> <div class="s-lbl">Jumlah Mapel</div></div></div></div> <div class="card"><div class="card-head">`);
      Icon($$renderer2, { name: "menu_book", size: "md" });
      $$renderer2.push(`<!----> Rekap per Mata Pelajaran</div> <div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Mapel</th><th class="num">Sesi</th><th>Topik yang Dipelajari</th></tr></thead><tbody>`);
      if (Object.keys(studentBySubject).length === 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<tr><td colspan="3" class="empty">Belum ada sesi yang disetujui.</td></tr>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<!--[-->`);
        const each_array = ensure_array_like(Object.keys(studentBySubject));
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let sName = each_array[$$index];
          const d = studentBySubject[sName];
          $$renderer2.push(`<tr><td><strong>${escape_html(sName)}</strong></td><td class="num">${escape_html(d.count)} sesi</td><td>${escape_html(d.topics.join(", "))}</td></tr>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></tbody></table></div></div></div>`);
    } else if (currentUser?.role === "WALI_MURID") {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="page-head"><div><h3>`);
      Icon($$renderer2, { name: "summarize", size: "lg" });
      $$renderer2.push(`<!----> Laporan Hasil Belajar Anak</h3> <div class="desc">Ringkasan progress belajar anak berdasarkan sesi yang telah disetujui.</div></div></div> <div class="card"><div class="card-head">`);
      Icon($$renderer2, { name: "group", size: "md" });
      $$renderer2.push(`<!----> Rekap per Anak</div> <div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Anak</th><th class="num">Sesi</th><th class="num">Total Jam</th></tr></thead><tbody>`);
      if (Object.keys(waliByStudent).length === 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<tr><td colspan="3" class="empty">Belum ada sesi yang disetujui.</td></tr>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(Object.keys(waliByStudent));
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let sName = each_array_1[$$index_1];
          const d = waliByStudent[sName];
          $$renderer2.push(`<tr><td><strong>${escape_html(sName)}</strong></td><td class="num">${escape_html(d.count)} sesi</td><td class="num">${escape_html(Math.round(d.hours / 60))} jam</td></tr>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></tbody></table></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
