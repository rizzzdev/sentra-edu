import { s as store_get, b as ensure_array_like, e as escape_html, u as unsubscribe_stores } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { a as authStore } from "../../../../chunks/auth-store.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let currentUser, myStudents, myStudentIds, myEnrollments;
    function getStudentName(studentId) {
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === studentId)?.fullName || "Anak";
    }
    function getClassName(classId) {
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).classes.find((c) => c.id === classId)?.className || "—";
    }
    function getSubjectName(subjectId) {
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.find((s) => s.id === subjectId)?.name || "—";
    }
    function getPackageName(packageId) {
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.find((p) => p.id === packageId)?.name || "—";
    }
    function getPackageMode(packageId) {
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.find((p) => p.id === packageId)?.mode || "PRIVATE";
    }
    currentUser = store_get($$store_subs ??= {}, "$authStore", authStore);
    myStudents = currentUser ? store_get($$store_subs ??= {}, "$dbStore", dbStore).users.filter((u) => u.deletedAt === null && u.role === "STUDENT" && u.waliUserId === currentUser?.id) : [];
    myStudentIds = myStudents.map((s) => s.id);
    myEnrollments = currentUser ? store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.filter((e) => e.deletedAt === null && (e.waliUserId === currentUser?.id || myStudentIds.includes(e.studentId))) : [];
    $$renderer2.push(`<div class="page-head"><div><h3>`);
    Icon($$renderer2, { name: "school", size: "lg" });
    $$renderer2.push(`<!----> Program Les Anak</h3> <div class="desc">Program bimbingan belajar anak yang sedang berjalan.</div></div></div> `);
    if (myEnrollments.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="empty-state">`);
      Icon($$renderer2, { name: "school", size: "xl" });
      $$renderer2.push(`<!----> <p>Belum ada program les untuk anak Anda.</p></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(myEnrollments);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let e = each_array[$$index];
        $$renderer2.push(`<div class="job-card"><div class="j-top"><div class="j-title">${escape_html(getStudentName(e.studentId))} — ${escape_html(getClassName(e.classId))} · ${escape_html(getSubjectName(e.subjectId))}</div> <span class="badge b-assigned">`);
        Icon($$renderer2, { name: "check", size: "xs" });
        $$renderer2.push(`<!----> Aktif</span></div> <div class="j-meta"><span>`);
        Icon($$renderer2, { name: "sell", size: "xs" });
        $$renderer2.push(`<!----> ${escape_html(getPackageName(e.packageId))} · ${escape_html(getPackageMode(e.packageId))}</span> <span>`);
        Icon($$renderer2, { name: "pin_drop", size: "xs" });
        $$renderer2.push(`<!----> ${escape_html(e.address)}</span></div></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
