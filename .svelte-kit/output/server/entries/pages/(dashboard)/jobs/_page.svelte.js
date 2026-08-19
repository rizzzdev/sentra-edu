import { f as fallback, s as store_get, u as unsubscribe_stores, h as bind_props, e as escape_html, a as attr, b as ensure_array_like, c as attr_class } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { M as Modal } from "../../../../chunks/modal.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
import { t as toastStore } from "../../../../chunks/toast-store.js";
import { C as Confirmation_dialog } from "../../../../chunks/confirmation-dialog.js";
import { f as formatCurrencyIDR } from "../../../../chunks/formatting.js";
function Job_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let enrollments;
    let open = fallback($$props["open"], false);
    let editingJob = fallback($$props["editingJob"], null);
    let onClose = fallback($$props["onClose"], () => {
    });
    let title = "";
    let jobType = "REGULAR";
    let studentEnrollmentId = "";
    let classId = "";
    let subjectId = "";
    let mode = "OFFLINE";
    let packageId = "";
    let preferredDays = ["Senin", "Rabu"];
    let preferredTime = "16:00";
    let transportAllowance = 0;
    let latitude = -6.2;
    let longitude = 106.8;
    let additionalNotes = "";
    const dayOptions = [
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu"
    ];
    function getEnrollmentLabel(e) {
      const u = store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((user) => user.id === e.studentId);
      const cls = store_get($$store_subs ??= {}, "$dbStore", dbStore).classes.find((c) => c.id === e.classId);
      const sub = store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.find((s) => s.id === e.subjectId);
      return `${u?.fullName || "Siswa"} — ${cls?.className || ""} ${sub?.name || ""}`;
    }
    enrollments = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.filter((e) => e.deletedAt === null);
    if (editingJob) {
      title = editingJob.title;
      jobType = editingJob.jobType;
      studentEnrollmentId = editingJob.enrollmentId || enrollments[0]?.id || "";
      classId = editingJob.classId;
      subjectId = editingJob.subjectId;
      mode = editingJob.mode || editingJob.jobMode || "OFFLINE";
      packageId = editingJob.packageId || store_get($$store_subs ??= {}, "$dbStore", dbStore).packages[0]?.id || "";
      preferredDays = editingJob.scheduleDays || ["Senin", "Rabu"];
      preferredTime = editingJob.scheduleTime || "16:00";
      latitude = editingJob.latitude ?? -6.2;
      longitude = editingJob.longitude ?? 106.8;
      additionalNotes = editingJob.additionalNotes || editingJob.notes || "";
    } else {
      title = "";
      jobType = "REGULAR";
      studentEnrollmentId = enrollments[0]?.id || "";
      classId = store_get($$store_subs ??= {}, "$dbStore", dbStore).classes.filter((c) => c.deletedAt === null)[0]?.id || "";
      subjectId = store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.filter((s) => s.deletedAt === null)[0]?.id || "";
      mode = "OFFLINE";
      packageId = store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.filter((p) => p.deletedAt === null && p.active)[0]?.id || "";
      preferredDays = ["Senin", "Rabu"];
      preferredTime = "16:00";
      transportAllowance = 0;
      latitude = -6.2;
      longitude = 106.8;
      additionalNotes = "";
    }
    Modal($$renderer2, {
      open,
      onClose,
      title: editingJob ? "Ubah Lowongan" : "Buat Lowongan Les",
      icon: "add_circle",
      maxWidth: "640px",
      children: ($$renderer3) => {
        if (mode !== "ONLINE") {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div id="job-gps-box" style="margin-bottom:14px"><div class="quick-actions" style="margin-bottom:8px"><button type="button" class="btn btn-sm btn-soft">`);
          Icon($$renderer3, { name: "home_pin", size: "sm" });
          $$renderer3.push(`<!----> Ambil Lokasi dari Siswa</button></div> <div id="job-gps-status">`);
          if (latitude && longitude) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<span class="gps-pill gps-ok">`);
            Icon($$renderer3, { name: "verified", size: "xs" });
            $$renderer3.push(`<!----> Lokasi les terpasang: ${escape_html(latitude)}, ${escape_html(longitude)}</span>`);
          } else {
            $$renderer3.push("<!--[-1-->");
            $$renderer3.push(`<span class="gps-pill gps-warn">`);
            Icon($$renderer3, { name: "warning", size: "xs" });
            $$renderer3.push(`<!----> Koordinat GPS lokasi les wajib diisi</span>`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> <form id="form-job"><div class="field"><label for="f_title">Judul Lowongan <i class="req">*</i></label> <input id="f_title" type="text" placeholder="cth: Les Privat Matematika Kelas 12 SMA" required=""${attr("value", title)}/></div> <div class="form-grid"><div class="field"><label for="f_jobType">Tipe Lowongan <i class="req">*</i></label> `);
        $$renderer3.select({ id: "f_jobType", required: true, value: jobType }, ($$renderer4) => {
          $$renderer4.option({ value: "REGULAR" }, ($$renderer5) => {
            $$renderer5.push(`Reguler`);
          });
          $$renderer4.option({ value: "TEMPORARY_REPLACEMENT" }, ($$renderer5) => {
            $$renderer5.push(`Pengganti Sementara`);
          });
        });
        $$renderer3.push(`</div> <div class="field"><label for="f_mode">Mode Les <i class="req">*</i></label> `);
        $$renderer3.select({ id: "f_mode", required: true, value: mode }, ($$renderer4) => {
          $$renderer4.option({ value: "OFFLINE" }, ($$renderer5) => {
            $$renderer5.push(`Offline (tatap muka langsung)`);
          });
          $$renderer4.option({ value: "ONLINE" }, ($$renderer5) => {
            $$renderer5.push(`Online (daring / video call)`);
          });
        });
        $$renderer3.push(`</div></div> <div class="field"><label for="f_studentEnrollmentId">Siswa <i class="req">*</i></label> `);
        $$renderer3.select(
          {
            id: "f_studentEnrollmentId",
            required: true,
            value: studentEnrollmentId
          },
          ($$renderer4) => {
            $$renderer4.option({ value: "" }, ($$renderer5) => {
              $$renderer5.push(`— Pilih siswa SentraEdu —`);
            });
            $$renderer4.push(`<!--[-->`);
            const each_array = ensure_array_like(enrollments);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let e = each_array[$$index];
              $$renderer4.option({ value: e.id }, ($$renderer5) => {
                $$renderer5.push(`${escape_html(getEnrollmentLabel(e))}`);
              });
            }
            $$renderer4.push(`<!--]-->`);
          }
        );
        $$renderer3.push(` <div class="help">Private — satu siswa per lowongan.</div></div> <div class="form-grid"><div class="field"><label for="f_classId">Kelas <i class="req">*</i></label> `);
        $$renderer3.select({ id: "f_classId", required: true, value: classId }, ($$renderer4) => {
          $$renderer4.option({ value: "" }, ($$renderer5) => {
            $$renderer5.push(`— Pilih kelas —`);
          });
          $$renderer4.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$dbStore", dbStore).classes.filter((c) => c.deletedAt === null));
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let c = each_array_1[$$index_1];
            $$renderer4.option({ value: c.id }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(c.className)}`);
            });
          }
          $$renderer4.push(`<!--]-->`);
        });
        $$renderer3.push(`</div> <div class="field"><label for="f_subjectId">Mata Pelajaran <i class="req">*</i></label> `);
        $$renderer3.select({ id: "f_subjectId", required: true, value: subjectId }, ($$renderer4) => {
          $$renderer4.option({ value: "" }, ($$renderer5) => {
            $$renderer5.push(`— Pilih mapel —`);
          });
          $$renderer4.push(`<!--[-->`);
          const each_array_2 = ensure_array_like(store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.filter((s) => s.deletedAt === null));
          for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
            let s = each_array_2[$$index_2];
            $$renderer4.option({ value: s.id }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(s.name)}`);
            });
          }
          $$renderer4.push(`<!--]-->`);
        });
        $$renderer3.push(`</div></div> <div class="field"><label for="f_packageId">Paket Les (mode &amp; harga SPP) <i class="req">*</i></label> `);
        $$renderer3.select({ id: "f_packageId", required: true, value: packageId }, ($$renderer4) => {
          $$renderer4.option({ value: "" }, ($$renderer5) => {
            $$renderer5.push(`— Pilih paket les —`);
          });
          $$renderer4.push(`<!--[-->`);
          const each_array_3 = ensure_array_like(store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.filter((p) => p.deletedAt === null && p.active));
          for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
            let p = each_array_3[$$index_3];
            $$renderer4.option({ value: p.id }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(p.name)} (${escape_html(p.mode)} · Rp ${escape_html(p.price.toLocaleString("id-ID"))})`);
            });
          }
          $$renderer4.push(`<!--]-->`);
        });
        $$renderer3.push(`</div> <div class="field"><div style="font-size:.82rem;font-weight:600;margin-bottom:5px">Hari Preferensi (boleh pilih beberapa) <i class="req">*</i></div> <div class="multi-group"><!--[-->`);
        const each_array_4 = ensure_array_like(dayOptions);
        for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
          let d = each_array_4[$$index_4];
          $$renderer3.push(`<label class="multi-opt"><input type="checkbox"${attr("value", d)}${attr("checked", preferredDays.includes(d), true)}/> ${escape_html(d)}</label>`);
        }
        $$renderer3.push(`<!--]--></div></div> <div class="form-grid"><div class="field"><label for="f_preferredTime">Jam Mulai <i class="req">*</i></label> <input id="f_preferredTime" type="text" placeholder="16:00" required=""${attr("value", preferredTime)}/></div> <div class="field"><label for="f_transportAllowance">Tunjangan Transport (Rp/sesi)</label> <input id="f_transportAllowance" type="number" min="0" step="5000"${attr("value", transportAllowance)}/></div></div> `);
        if (mode !== "ONLINE") {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="form-grid"><div class="field"><label for="f_latitude">Latitude — Lokasi Les (GPS) <i class="req">*</i></label> <input id="f_latitude" type="number" step="0.000001" required=""${attr("value", latitude)}/></div> <div class="field"><label for="f_longitude">Longitude — Lokasi Les (GPS) <i class="req">*</i></label> <input id="f_longitude" type="number" step="0.000001" required=""${attr("value", longitude)}/></div></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> <div class="field"><label for="f_additionalNotes">Catatan Tambahan</label> <textarea id="f_additionalNotes" rows="2" placeholder="cth: Guru ramah, sabar, fokus UTBK">`);
        const $$body = escape_html(additionalNotes);
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
            $$renderer3.push(`<!----> Batal</button> <button type="submit" form="form-job" class="btn btn-primary">`);
            Icon($$renderer3, { name: "save", size: "sm" });
            $$renderer3.push(`<!----> ${escape_html(editingJob ? "Simpan Perubahan" : "Buat Lowongan")}</button>`);
          }
        }
      }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { open, editingJob, onClose });
  });
}
function Job_manage_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let applications;
    let open = fallback($$props["open"], false);
    let job = fallback($$props["job"], null);
    let onClose = fallback($$props["onClose"], () => {
    });
    let confirmCancelOpen = false;
    let confirmRejectAppId = null;
    function getUserName(userId) {
      if (!userId) return "—";
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === userId)?.fullName || "—";
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
    function getJobFee(j) {
      const pkg = store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.find((p) => p.id === j.packageId);
      return pkg ? pkg.tentorFee : 1e5;
    }
    function handleAppRejectConfirm() {
      if (!confirmRejectAppId) return;
      const updatedApps = store_get($$store_subs ??= {}, "$dbStore", dbStore).applications.map((a) => a.id === confirmRejectAppId ? { ...a, status: "REJECTED" } : a);
      const snap = dbStore.getSnapshot();
      dbStore.importDatabaseJson(JSON.stringify({ ...snap, applications: updatedApps }));
      confirmRejectAppId = null;
      toastStore.success("Lamaran ditolak.");
    }
    function handleSetStatus(newStatus) {
      if (!job) return;
      const res = dbStore.saveJobPost({
        id: job.id,
        status: newStatus,
        assignedTentorId: job.assignedTentorId
      });
      if (!res.error) {
        toastStore.success(`Status lowongan diubah menjadi ${newStatus}.`);
      } else {
        toastStore.error(res.message);
      }
    }
    applications = job ? store_get($$store_subs ??= {}, "$dbStore", dbStore).applications.filter((a) => a.deletedAt === null && a.jobId === job?.id) : [];
    applications.filter((a) => a.status === "PENDING");
    Modal($$renderer2, {
      open,
      onClose,
      title: "Kelola Lowongan",
      icon: "tune",
      maxWidth: "680px",
      children: ($$renderer3) => {
        if (job) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="kv"><dt>Judul</dt> <dd>${escape_html(job.title)}</dd> <dt>Siswa</dt> <dd>${escape_html(job.studentName || "—")}</dd> <dt>Kelas · Mapel</dt> <dd>${escape_html(getClassName(job.classId))} · ${escape_html(getSubjectName(job.subjectId))}</dd> <dt>Mode</dt> <dd><span${attr_class(`badge ${job.mode === "ONLINE" ? "b-neutral" : "b-available"}`)}>${escape_html(job.mode || "OFFLINE")}</span></dd> <dt>Paket Les</dt> <dd>${escape_html(getPackageName(job.packageId))}</dd> <dt>Jadwal</dt> <dd>${escape_html(job.schedulePreference || `${(job.scheduleDays || []).join(" & ")} ${job.scheduleTime} WIB`)}</dd> <dt>Estimasi Honor/Sesi</dt> <dd>${escape_html(formatCurrencyIDR(getJobFee(job)))}</dd> <dt>Lokasi Les (GPS)</dt> <dd>${escape_html(job.latitude !== null && job.latitude !== void 0 && job.longitude !== null && job.longitude !== void 0 ? `${job.latitude}, ${job.longitude}` : "—")}</dd> <dt>Status</dt> <dd><span${attr_class(`badge ${job.status === "AVAILABLE" ? "b-available" : job.status === "NEGOTIATING" ? "b-negotiating" : job.status === "ASSIGNED" ? "b-assigned" : "b-cancelled"}`)}>${escape_html(job.status)}</span></dd></div> <div class="card" style="border:1px solid var(--border);border-radius:12px;margin-bottom:14px"><div class="card-head" style="padding:10px 14px;font-size:.85rem">`);
          Icon($$renderer3, { name: "group", size: "sm" });
          $$renderer3.push(`<!----> Lamaran Masuk (${escape_html(applications.length)})</div> <div class="card-body flush">`);
          if (applications.length === 0) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div style="padding:14px;font-size:.84rem;color:var(--muted-fg)">Belum ada tentor yang melamar.</div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
            $$renderer3.push(`<div class="table-wrap"><table class="tbl"><thead><tr><th>Tentor</th><th>Status</th><th style="text-align:right">Aksi</th></tr></thead><tbody><!--[-->`);
            const each_array = ensure_array_like(applications);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let a = each_array[$$index];
              $$renderer3.push(`<tr><td><strong>${escape_html(getUserName(a.tentorId))}</strong> <div class="sub">${escape_html(a.notes || "—")}</div></td><td><span${attr_class(`badge ${a.status === "ACCEPTED" ? "b-approved" : a.status === "REJECTED" ? "b-rejected" : "b-submitted"}`)}>${escape_html(a.status)}</span></td><td><div class="actions">`);
              if (a.status === "PENDING" && job.status !== "ASSIGNED") {
                $$renderer3.push("<!--[0-->");
                $$renderer3.push(`<button type="button" class="btn btn-sm btn-primary">`);
                Icon($$renderer3, { name: "check", size: "xs" });
                $$renderer3.push(`<!----> Setujui</button> <button type="button" class="btn btn-sm btn-danger">`);
                Icon($$renderer3, { name: "close", size: "xs" });
                $$renderer3.push(`<!----> Tolak</button>`);
              } else {
                $$renderer3.push("<!--[-1-->");
              }
              $$renderer3.push(`<!--]--></div></td></tr>`);
            }
            $$renderer3.push(`<!--]--></tbody></table></div>`);
          }
          $$renderer3.push(`<!--]--></div></div> <div class="card" style="border:1px solid var(--border);border-radius:12px"><div class="card-head" style="padding:10px 14px;font-size:.85rem">`);
          Icon($$renderer3, { name: "tune", size: "sm" });
          $$renderer3.push(`<!----> Ubah Status Lowongan</div> <div class="card-body">`);
          if (job.status === "AVAILABLE") {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<p style="font-size:.85rem;color:var(--muted-fg);margin-bottom:10px">Lowongan tersedia. Tentor bisa melamar dari feed lowongan.</p>`);
          } else if (job.status === "NEGOTIATING") {
            $$renderer3.push("<!--[1-->");
            $$renderer3.push(`<p style="font-size:.85rem;color:var(--muted-fg);margin-bottom:10px">Sedang dinegosiasikan. Setujui salah satu pelamar, atau kembalikan ke status Tersedia.</p> <div class="quick-actions"><button type="button" class="btn btn-sm btn-outline">`);
            Icon($$renderer3, { name: "undo", size: "xs" });
            $$renderer3.push(`<!----> Kembalikan ke Tersedia</button></div>`);
          } else if (job.status === "ASSIGNED") {
            $$renderer3.push("<!--[2-->");
            $$renderer3.push(`<p style="font-size:.85rem;color:var(--muted-fg);margin-bottom:10px">Ditugaskan ke <strong>${escape_html(getUserName(job.assignedTentorId))}</strong>. Job terkunci — tidak bisa dilamar tentor lain.</p> <button type="button" class="btn btn-sm btn-danger">`);
            Icon($$renderer3, { name: "block", size: "xs" });
            $$renderer3.push(`<!----> Batalkan Lowongan</button>`);
          } else {
            $$renderer3.push("<!--[-1-->");
            $$renderer3.push(`<p style="font-size:.85rem;color:var(--muted-fg);margin-bottom:10px">Lowongan dibatalkan. Buka kembali lowongan ini agar tentor bisa melamar lagi.</p> <div class="quick-actions"><button type="button" class="btn btn-sm btn-outline">`);
            Icon($$renderer3, { name: "undo", size: "xs" });
            $$renderer3.push(`<!----> Kembalikan ke Tersedia</button></div>`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
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
            $$renderer3.push(`<!----> Tutup</button>`);
          }
        }
      }
    });
    $$renderer2.push(`<!----> `);
    Confirmation_dialog($$renderer2, {
      open: confirmCancelOpen,
      title: "Batalkan Lowongan",
      message: "Batalkan lowongan ini? Penugasan tentor akan dilepas.",
      confirmText: "Batalkan",
      confirmVariant: "danger",
      onConfirm: () => {
        confirmCancelOpen = false;
        handleSetStatus("CANCELLED");
      },
      onCancel: () => {
        confirmCancelOpen = false;
      }
    });
    $$renderer2.push(`<!----> `);
    Confirmation_dialog($$renderer2, {
      open: confirmRejectAppId !== null,
      title: "Tolak Lamaran",
      message: "Tolak lamaran tentor ini?",
      confirmText: "Tolak",
      confirmVariant: "danger",
      onConfirm: handleAppRejectConfirm,
      onCancel: () => {
        confirmRejectAppId = null;
      }
    });
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { open, job, onClose });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let allJobs, nTotal, nTersedia, nNegosiasi, nDitugaskan, filteredJobs, paginatedJobs, totalPages;
    let searchQuery = "";
    let statusFilter = "";
    let currentPage = 1;
    const itemsPerPage = 8;
    let jobModalOpen = false;
    let editingJob = null;
    let assignModalOpen = false;
    let assigningJob = null;
    let deleteDialogOpen = false;
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
    function getPackageMode(packageId) {
      if (!packageId) return "PRIVATE";
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.find((p) => p.id === packageId)?.mode || "PRIVATE";
    }
    function getUserName(userId) {
      if (!userId) return "";
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === userId)?.fullName || "";
    }
    function getJobFee(job) {
      const pkg = store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.find((p) => p.id === job.packageId);
      return pkg ? pkg.tentorFee : 0;
    }
    function handleConfirmDelete() {
      return;
    }
    allJobs = store_get($$store_subs ??= {}, "$dbStore", dbStore).jobs.filter((j) => j.deletedAt === null);
    nTotal = allJobs.length;
    nTersedia = allJobs.filter((j) => j.status === "AVAILABLE").length;
    nNegosiasi = allJobs.filter((j) => j.status === "NEGOTIATING").length;
    nDitugaskan = allJobs.filter((j) => j.status === "ASSIGNED").length;
    filteredJobs = allJobs.filter((j) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || j.title.toLowerCase().includes(q) || getClassName(j.classId).toLowerCase().includes(q) || getSubjectName(j.subjectId).toLowerCase().includes(q) || getPackageName(j.packageId).toLowerCase().includes(q) || (j.studentName || "").toLowerCase().includes(q);
      const matchesStatus = !statusFilter;
      return matchesSearch && matchesStatus;
    });
    paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    totalPages = Math.max(1, Math.ceil(filteredJobs.length / itemsPerPage));
    $$renderer2.push(`<div class="page-head"><div><h3>`);
    Icon($$renderer2, { name: "work", size: "lg" });
    $$renderer2.push(`<!----> Lowongan Les</h3> <div class="desc">Daftar lowongan les dengan mode Offline/Online, jenis Private/Kelompok, dan paket les.</div></div> <button type="button" class="btn btn-primary">`);
    Icon($$renderer2, { name: "add", size: "sm" });
    $$renderer2.push(`<!----> Buat Lowongan</button></div> <div class="stat-grid"><div class="stat"><div class="s-icon tone-sky">`);
    Icon($$renderer2, { name: "work", size: "lg" });
    $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(nTotal)}</div> <div class="s-lbl">Total Lowongan</div></div></div> <div class="stat"><div class="s-icon tone-emerald">`);
    Icon($$renderer2, { name: "event_available", size: "lg" });
    $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(nTersedia)}</div> <div class="s-lbl">Tersedia</div></div></div> <div class="stat"><div class="s-icon tone-amber">`);
    Icon($$renderer2, { name: "handshake", size: "lg" });
    $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(nNegosiasi)}</div> <div class="s-lbl">Sedang Negosiasi</div></div></div> <div class="stat"><div class="s-icon tone-violet">`);
    Icon($$renderer2, { name: "lock", size: "lg" });
    $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(nDitugaskan)}</div> <div class="s-lbl">Ditugaskan</div></div></div></div> <div class="filter-bar"><div class="filter-search">`);
    Icon($$renderer2, { name: "search", size: "sm" });
    $$renderer2.push(`<!----> <input type="text" placeholder="Cari judul / kelas / mapel / paket / siswa..."${attr("value", searchQuery)}/></div> `);
    $$renderer2.select({ class: "filter-select", value: statusFilter }, ($$renderer3) => {
      $$renderer3.option({ value: "" }, ($$renderer4) => {
        $$renderer4.push(`Semua Status`);
      });
      $$renderer3.option({ value: "AVAILABLE" }, ($$renderer4) => {
        $$renderer4.push(`Tersedia`);
      });
      $$renderer3.option({ value: "NEGOTIATING" }, ($$renderer4) => {
        $$renderer4.push(`Sedang Negosiasi`);
      });
      $$renderer3.option({ value: "ASSIGNED" }, ($$renderer4) => {
        $$renderer4.push(`Ditugaskan`);
      });
      $$renderer3.option({ value: "CANCELLED" }, ($$renderer4) => {
        $$renderer4.push(`Dibatalkan`);
      });
    });
    $$renderer2.push(`</div> <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Lowongan</th><th>Kelas · Mapel</th><th>Paket Les</th><th class="num">Honor/Sesi</th><th>Status</th><th style="text-align:right">Aksi</th></tr></thead><tbody>`);
    if (paginatedJobs.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="6" class="empty">${escape_html('Belum ada lowongan. Klik "Buat Lowongan".')}</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(paginatedJobs);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let j = each_array[$$index];
        $$renderer2.push(`<tr><td><strong>${escape_html(j.title)}</strong> <div class="sub"><span${attr_class(`badge ${j.mode === "ONLINE" ? "b-neutral" : "b-available"}`)}>${escape_html(j.mode)}</span> · ${escape_html(j.schedulePreference)}</div> <div class="sub">`);
        Icon($$renderer2, { name: "group", size: "xs" });
        $$renderer2.push(`<!----> ${escape_html(j.studentName)}</div></td><td>${escape_html(getClassName(j.classId))} · ${escape_html(getSubjectName(j.subjectId))}</td><td><span class="sub">${escape_html(getPackageMode(j.packageId))}</span> ${escape_html(getPackageName(j.packageId))}</td><td class="num">${escape_html(formatCurrencyIDR(getJobFee(j)))}</td><td><span${attr_class(`badge ${j.status === "AVAILABLE" ? "b-available" : j.status === "NEGOTIATING" ? "b-negotiating" : j.status === "ASSIGNED" ? "b-assigned" : "b-cancelled"}`)}>${escape_html(j.status)}</span> `);
        if (j.assignedTentorId) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="sub">${escape_html(getUserName(j.assignedTentorId))}</div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></td><td><div class="actions"><button type="button" class="btn-icon" data-tip="Kelola">`);
        Icon($$renderer2, { name: "tune", size: "sm" });
        $$renderer2.push(`<!----></button> <button type="button" class="btn-icon" data-tip="Ubah">`);
        Icon($$renderer2, { name: "edit", size: "sm" });
        $$renderer2.push(`<!----></button> <button type="button" class="btn-icon btn-icon-danger" data-tip="Hapus">`);
        Icon($$renderer2, { name: "delete", size: "sm" });
        $$renderer2.push(`<!----></button></div></td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div> `);
    if (filteredJobs.length > itemsPerPage) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="page-nav"><div class="page-info">Menampilkan ${escape_html((currentPage - 1) * itemsPerPage + 1)}–${escape_html(Math.min(currentPage * itemsPerPage, filteredJobs.length))} dari ${escape_html(filteredJobs.length)} data</div> <div class="page-btns"><button type="button" class="page-btn"${attr("disabled", currentPage <= 1, true)}>«</button> <!--[-->`);
      const each_array_1 = ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let p = each_array_1[$$index_1];
        $$renderer2.push(`<button type="button"${attr_class(`page-btn ${currentPage === p ? "active" : ""}`)}>${escape_html(p)}</button>`);
      }
      $$renderer2.push(`<!--]--> <button type="button" class="page-btn"${attr("disabled", currentPage >= totalPages, true)}>»</button></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    Job_modal($$renderer2, {
      open: jobModalOpen,
      editingJob,
      onClose: () => {
        jobModalOpen = false;
      }
    });
    $$renderer2.push(`<!----> `);
    Job_manage_modal($$renderer2, {
      open: assignModalOpen,
      job: assigningJob,
      onClose: () => {
        assignModalOpen = false;
      }
    });
    $$renderer2.push(`<!----> `);
    Confirmation_dialog($$renderer2, {
      open: deleteDialogOpen,
      title: "Hapus Lowongan",
      message: "Apakah Anda yakin ingin menghapus lowongan les ini?",
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
