import { s as store_get, e as escape_html, c as attr_class, d as stringify, u as unsubscribe_stores } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { U as User_modal } from "../../../../chunks/user-modal.js";
import { a as authStore } from "../../../../chunks/auth-store.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
import { f as formatCurrencyIDR } from "../../../../chunks/formatting.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let currentUser, initials, approvedSessions, activeJobs, paidHonor, studentPrograms, waliChildren;
    let editModalOpen = false;
    const roleLabelMap = {
      SUPER_ADMIN: "Super Admin",
      TENTOR: "Tentor",
      STUDENT: "Siswa",
      WALI_MURID: "Wali Murid"
    };
    const roleBadgeMap = {
      SUPER_ADMIN: "b-admin",
      TENTOR: "b-tentor",
      STUDENT: "b-student",
      WALI_MURID: "b-neutral"
    };
    function getSubjectNames(subjectIds) {
      if (!subjectIds || subjectIds.length === 0) return "—";
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.filter((s) => subjectIds.includes(s.id)).map((s) => s.name).join(", ") || "—";
    }
    function getLevelNames(levelIds) {
      if (!levelIds || levelIds.length === 0) return "—";
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).educationLevels.filter((l) => levelIds.includes(l.id)).map((l) => l.levelName).join(", ") || "—";
    }
    currentUser = store_get($$store_subs ??= {}, "$authStore", authStore);
    initials = currentUser ? currentUser.fullName.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") : "U";
    approvedSessions = currentUser ? store_get($$store_subs ??= {}, "$dbStore", dbStore).attendances.filter((a) => a.deletedAt === null && a.tentorId === currentUser?.id && a.status === "APPROVED").length : 0;
    activeJobs = currentUser ? store_get($$store_subs ??= {}, "$dbStore", dbStore).jobs.filter((j) => j.deletedAt === null && j.assignedTentorId === currentUser?.id && j.status === "ASSIGNED").length : 0;
    paidHonor = currentUser ? store_get($$store_subs ??= {}, "$dbStore", dbStore).payrollClaims.filter((c) => c.deletedAt === null && c.tentorId === currentUser?.id && c.status === "PAID").reduce((sum, c) => sum + c.totalAmount, 0) : 0;
    studentPrograms = currentUser ? store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.filter((e) => e.deletedAt === null && e.studentId === currentUser?.id).length : 0;
    waliChildren = currentUser ? store_get($$store_subs ??= {}, "$dbStore", dbStore).users.filter((u) => u.deletedAt === null && u.role === "STUDENT" && u.waliUserId === currentUser?.id).length : 0;
    if (currentUser) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="page-head"><div><h3>`);
      Icon($$renderer2, { name: "person", size: "lg" });
      $$renderer2.push(`<!----> Profil Saya</h3> <div class="desc">Informasi akun Anda — perubahan langsung berlaku, termasuk untuk login berikutnya.</div></div> <button type="button" class="btn btn-primary">`);
      Icon($$renderer2, { name: "edit", size: "sm" });
      $$renderer2.push(`<!----> Ubah Profil</button></div> <div class="grid-2"><div class="card"><div class="card-body" style="display:flex;gap:18px;align-items:center"><div class="avatar" style="width:64px;height:64px;font-size:1.4rem">${escape_html(initials)}</div> <div><div style="font-size:1.2rem;font-weight:800">${escape_html(currentUser.fullName)}</div> <div style="color:var(--muted-fg);font-size:.86rem">${escape_html(currentUser.email)}</div> <div style="margin-top:8px"><span${attr_class(`badge ${stringify(roleBadgeMap[currentUser.role])}`)}>${escape_html(roleLabelMap[currentUser.role])}</span></div></div></div></div> <div class="card"><div class="card-body"><div class="kv"><dt>Nama Lengkap</dt> <dd>${escape_html(currentUser.fullName)}</dd> <dt>Email</dt> <dd>${escape_html(currentUser.email)}</dd> <dt>Telepon</dt> <dd>${escape_html(currentUser.phone || "—")}</dd> <dt>Peran</dt> <dd>${escape_html(roleLabelMap[currentUser.role])}</dd></div></div></div></div> <div class="card"><div class="card-head">`);
      Icon($$renderer2, { name: "badge", size: "md" });
      $$renderer2.push(`<!----> Detail Profil</div> <div class="card-body"><div class="kv">`);
      if (currentUser.role === "SUPER_ADMIN") {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<dt>Jabatan</dt> <dd>${escape_html(currentUser.position || "Super Admin SentraEdu")}</dd> <dt>Departemen</dt> <dd>${escape_html(currentUser.department || "Manajemen Operasional")}</dd>`);
      } else if (currentUser.role === "TENTOR") {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<dt>Pendidikan Terakhir</dt> <dd>${escape_html(currentUser.education || "—")}</dd> <dt>Pengalaman</dt> <dd>${escape_html(currentUser.experienceYears || 0)} tahun mengajar</dd> <dt>Mata Pelajaran</dt> <dd>${escape_html(getSubjectNames(currentUser.subjectIds))}</dd> <dt>Jenjang Diajar</dt> <dd>${escape_html(getLevelNames(currentUser.levelIds))}</dd>`);
      } else if (currentUser.role === "STUDENT") {
        $$renderer2.push("<!--[2-->");
        $$renderer2.push(`<dt>Asal Sekolah</dt> <dd>${escape_html(currentUser.school || "—")}</dd> <dt>Alamat Rumah</dt> <dd>${escape_html(currentUser.address || "—")}</dd>`);
      } else if (currentUser.role === "WALI_MURID") {
        $$renderer2.push("<!--[3-->");
        $$renderer2.push(`<dt>Pekerjaan</dt> <dd>${escape_html(currentUser.occupation || "—")}</dd> <dt>Alamat Rumah</dt> <dd>${escape_html(currentUser.address || "—")}</dd>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div></div> <div class="card"><div class="card-head">`);
      Icon($$renderer2, { name: "insights", size: "md" });
      $$renderer2.push(`<!----> Ringkasan Aktivitas</div> <div class="card-body"><div class="stat-grid" style="margin-bottom:0">`);
      if (currentUser.role === "SUPER_ADMIN") {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="stat"><div class="s-icon tone-sky">`);
        Icon($$renderer2, { name: "work", size: "lg" });
        $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(store_get($$store_subs ??= {}, "$dbStore", dbStore).jobs.length)}</div> <div class="s-lbl">Total Lowongan</div></div></div> <div class="stat"><div class="s-icon tone-emerald">`);
        Icon($$renderer2, { name: "group", size: "lg" });
        $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.length)}</div> <div class="s-lbl">Siswa Terdaftar</div></div></div> <div class="stat"><div class="s-icon tone-violet">`);
        Icon($$renderer2, { name: "school", size: "lg" });
        $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(store_get($$store_subs ??= {}, "$dbStore", dbStore).users.filter((u) => u.role === "TENTOR").length)}</div> <div class="s-lbl">Tentor Aktif</div></div></div>`);
      } else if (currentUser.role === "TENTOR") {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<div class="stat"><div class="s-icon tone-emerald">`);
        Icon($$renderer2, { name: "verified", size: "lg" });
        $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(approvedSessions)}</div> <div class="s-lbl">Sesi Disetujui</div></div></div> <div class="stat"><div class="s-icon tone-sky">`);
        Icon($$renderer2, { name: "assignment", size: "lg" });
        $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(activeJobs)}</div> <div class="s-lbl">Penugasan Aktif</div></div></div> <div class="stat"><div class="s-icon tone-violet">`);
        Icon($$renderer2, { name: "payments", size: "lg" });
        $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(formatCurrencyIDR(paidHonor))}</div> <div class="s-lbl">Honor Diterima</div></div></div>`);
      } else if (currentUser.role === "STUDENT") {
        $$renderer2.push("<!--[2-->");
        $$renderer2.push(`<div class="stat"><div class="s-icon tone-sky">`);
        Icon($$renderer2, { name: "school", size: "lg" });
        $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(studentPrograms)}</div> <div class="s-lbl">Program Les Aktif</div></div></div> <div class="stat"><div class="s-icon tone-emerald">`);
        Icon($$renderer2, { name: "fact_check", size: "lg" });
        $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(store_get($$store_subs ??= {}, "$dbStore", dbStore).attendances.filter((a) => a.status === "APPROVED").length)}</div> <div class="s-lbl">Sesi Disetujui</div></div></div>`);
      } else if (currentUser.role === "WALI_MURID") {
        $$renderer2.push("<!--[3-->");
        $$renderer2.push(`<div class="stat"><div class="s-icon tone-sky">`);
        Icon($$renderer2, { name: "family_restroom", size: "lg" });
        $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(waliChildren)}</div> <div class="s-lbl">Anak Terdaftar</div></div></div> <div class="stat"><div class="s-icon tone-emerald">`);
        Icon($$renderer2, { name: "school", size: "lg" });
        $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.filter((e) => e.waliUserId === currentUser?.id).length)}</div> <div class="s-lbl">Program Les Anak</div></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div></div> `);
      User_modal($$renderer2, {
        open: editModalOpen,
        editingUser: currentUser,
        onClose: () => {
          editModalOpen = false;
        }
      });
      $$renderer2.push(`<!---->`);
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
