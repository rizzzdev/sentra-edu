import { f as fallback, h as bind_props, e as escape_html, s as store_get, a as attr, b as ensure_array_like, c as attr_class, u as unsubscribe_stores } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { M as Modal } from "../../../../chunks/modal.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
import "../../../../chunks/toast-store.js";
import { a as authStore } from "../../../../chunks/auth-store.js";
import { f as formatCurrencyIDR } from "../../../../chunks/formatting.js";
function Job_apply_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let open = fallback($$props["open"], false);
    let job = fallback($$props["job"], null);
    let tentor = $$props["tentor"];
    let onClose = fallback($$props["onClose"], () => {
    });
    let notes = "";
    Modal($$renderer2, {
      open,
      onClose,
      title: "Lamar Lowongan Les",
      icon: "send",
      maxWidth: "480px",
      children: ($$renderer3) => {
        if (job) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="kv" style="margin-bottom:14px"><dt>Judul</dt> <dd>${escape_html(job.title)}</dd> <dt>Siswa</dt> <dd>${escape_html(job.studentName || "—")}</dd> <dt>Jadwal</dt> <dd>${escape_html(job.schedulePreference || "—")}</dd> <dt>Estimasi Honor/Sesi</dt> <dd style="color:var(--primary);font-weight:700">Rp ${escape_html((job.tentorFee || 0).toLocaleString("id-ID"))}</dd></div> <div class="field"><label for="f_notes">Catatan Lamaran / Pengantar (Opsional)</label> <textarea id="f_notes" rows="3" placeholder="Tuliskan pengalaman relevan atau ketersediaan waktu Anda...">`);
          const $$body = escape_html(notes);
          if ($$body) {
            $$renderer3.push(`${$$body}`);
          }
          $$renderer3.push(`</textarea></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: {
        default: true,
        footer: ($$renderer3) => {
          {
            $$renderer3.push(`<button type="button" class="btn btn-outline">`);
            Icon($$renderer3, { name: "close", size: "sm" });
            $$renderer3.push(`<!----> Batal</button> <button type="button" class="btn btn-primary">`);
            Icon($$renderer3, { name: "send", size: "sm" });
            $$renderer3.push(`<!----> Kirim Lamaran</button>`);
          }
        }
      }
    });
    bind_props($$props, { open, job, tentor, onClose });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let currentUser, openJobs;
    let searchQuery = "";
    let applyModalOpen = false;
    let applyingJob = null;
    function hasApplied(jobId) {
      if (!currentUser) return false;
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).applications.some((a) => a.deletedAt === null && a.jobId === jobId && a.tentorId === currentUser?.id);
    }
    function getClassName(classId) {
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).classes.find((c) => c.id === classId)?.className || "—";
    }
    function getSubjectName(subjectId) {
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.find((s) => s.id === subjectId)?.name || "—";
    }
    function getPackageName(packageId) {
      if (!packageId) return "—";
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.find((p) => p.id === packageId)?.name || "—";
    }
    function getJobFee(job) {
      const pkg = store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.find((p) => p.id === job.packageId);
      return pkg ? pkg.tentorFee : 0;
    }
    currentUser = store_get($$store_subs ??= {}, "$authStore", authStore);
    openJobs = store_get($$store_subs ??= {}, "$dbStore", dbStore).jobs.filter((j) => {
      if (j.deletedAt !== null) return false;
      if (j.status !== "AVAILABLE" && j.status !== "NEGOTIATING") return false;
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      const cls = store_get($$store_subs ??= {}, "$dbStore", dbStore).classes.find((c) => c.id === j.classId);
      const sub = store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.find((s) => s.id === j.subjectId);
      return j.title.toLowerCase().includes(q) || (cls?.className || "").toLowerCase().includes(q) || (sub?.name || "").toLowerCase().includes(q);
    });
    $$renderer2.push(`<div class="page-head"><div><h3>`);
    Icon($$renderer2, { name: "search", size: "lg" });
    $$renderer2.push(`<!----> Cari Lowongan</h3> <div class="desc">Daftar lowongan mengajar yang tersedia dan siap dilamar sesuai kompetensi Anda.</div></div></div> <div class="filter-bar"><div class="filter-search">`);
    Icon($$renderer2, { name: "search", size: "sm" });
    $$renderer2.push(`<!----> <input type="text" placeholder="Cari judul / kelas / mapel..."${attr("value", searchQuery)}/></div></div> `);
    if (openJobs.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="empty-state">`);
      Icon($$renderer2, { name: "work_off", size: "xl" });
      $$renderer2.push(`<!----> <p>Tidak ada lowongan les yang tersedia saat ini.</p></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(openJobs);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let j = each_array[$$index];
        const applied = hasApplied(j.id);
        $$renderer2.push(`<div class="job-card"><div class="j-top"><div class="j-title">${escape_html(j.title)}</div> <div style="display:flex;gap:6px;align-items:center"><span${attr_class(`badge ${j.status === "AVAILABLE" ? "b-available" : "b-negotiating"}`)}>${escape_html(j.status)}</span> <span${attr_class(`badge ${j.mode === "ONLINE" ? "b-neutral" : "b-available"}`)}>${escape_html(j.mode || "OFFLINE")}</span></div></div> <div class="j-meta"><span>`);
        Icon($$renderer2, { name: "schedule", size: "xs" });
        $$renderer2.push(`<!----> ${escape_html(j.schedulePreference)}</span> <span>`);
        Icon($$renderer2, { name: "sell", size: "xs" });
        $$renderer2.push(`<!----> ${escape_html(getPackageName(j.packageId))}</span> <span>`);
        Icon($$renderer2, { name: "group", size: "xs" });
        $$renderer2.push(`<!----> ${escape_html(j.studentName)}</span> <span>`);
        Icon($$renderer2, { name: "school", size: "xs" });
        $$renderer2.push(`<!----> ${escape_html(getClassName(j.classId))} · ${escape_html(getSubjectName(j.subjectId))}</span> `);
        if (j.latitude !== null && j.longitude !== null) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span>`);
          Icon($$renderer2, { name: "location_on", size: "xs" });
          $$renderer2.push(`<!----> Lokasi les: ${escape_html(j.latitude)}, ${escape_html(j.longitude)}</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (j.notes) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span>`);
          Icon($$renderer2, { name: "notes", size: "xs" });
          $$renderer2.push(`<!----> ${escape_html(j.notes)}</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div> <div class="j-foot"><span class="j-fee">Estimasi honor/sesi: <strong>${escape_html(formatCurrencyIDR(getJobFee(j)))}</strong> <span class="sub">(sesuai paket les)</span></span> `);
        if ((j.status === "AVAILABLE" || j.status === "NEGOTIATING") && !applied) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<button type="button" class="btn btn-sm btn-primary">`);
          Icon($$renderer2, { name: "send", size: "xs" });
          $$renderer2.push(`<!----> Ajukan Lamaran</button>`);
        } else if (applied) {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<span class="badge b-pending">`);
          Icon($$renderer2, { name: "schedule", size: "xs" });
          $$renderer2.push(`<!----> Lamaran terkirim</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> `);
    if (currentUser) {
      $$renderer2.push("<!--[0-->");
      Job_apply_modal($$renderer2, {
        open: applyModalOpen,
        job: applyingJob,
        tentor: currentUser,
        onClose: () => {
          applyModalOpen = false;
        }
      });
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
