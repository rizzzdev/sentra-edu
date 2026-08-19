import { f as fallback, s as store_get, u as unsubscribe_stores, h as bind_props, e as escape_html, b as ensure_array_like, a as attr, c as attr_class } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { M as Modal } from "../../../../chunks/modal.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
import "../../../../chunks/toast-store.js";
import { C as Confirmation_dialog } from "../../../../chunks/confirmation-dialog.js";
import { f as formatCurrencyIDR } from "../../../../chunks/formatting.js";
function Enrollment_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let students;
    let open = fallback($$props["open"], false);
    let editingEnrollment = fallback($$props["editingEnrollment"], null);
    let onClose = fallback($$props["onClose"], () => {
    });
    let studentId = "";
    let classId = "";
    let subjectId = "";
    let packageId = "";
    let parentName = "";
    let parentPhone = "";
    let fullAddress = "";
    let latitude = -6.2;
    let longitude = 106.8;
    students = store_get($$store_subs ??= {}, "$dbStore", dbStore).users.filter((u) => u.deletedAt === null && u.role === "STUDENT");
    if (editingEnrollment) {
      studentId = editingEnrollment.studentId;
      classId = editingEnrollment.classId;
      subjectId = editingEnrollment.subjectId;
      packageId = editingEnrollment.packageId;
      fullAddress = editingEnrollment.address || "";
      latitude = editingEnrollment.latitude || -6.2;
      longitude = editingEnrollment.longitude || 106.8;
    } else {
      studentId = students[0]?.id || "";
      classId = store_get($$store_subs ??= {}, "$dbStore", dbStore).classes.filter((c) => c.deletedAt === null)[0]?.id || "";
      subjectId = store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.filter((s) => s.deletedAt === null)[0]?.id || "";
      packageId = store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.filter((p) => p.deletedAt === null && p.active)[0]?.id || "";
      parentName = "";
      parentPhone = "";
      fullAddress = "";
      latitude = -6.2;
      longitude = 106.8;
    }
    Modal($$renderer2, {
      open,
      onClose,
      title: editingEnrollment ? "Ubah Data Siswa" : "Daftarkan Siswa",
      icon: "person_add",
      maxWidth: "600px",
      children: ($$renderer3) => {
        $$renderer3.push(`<form id="form-enrollment"><div class="field"><label for="f_studentId">Akun Siswa <i class="req">*</i></label> `);
        $$renderer3.select({ id: "f_studentId", required: true, value: studentId }, ($$renderer4) => {
          $$renderer4.option({ value: "" }, ($$renderer5) => {
            $$renderer5.push(`— Pilih akun siswa —`);
          });
          $$renderer4.push(`<!--[-->`);
          const each_array = ensure_array_like(students);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let u = each_array[$$index];
            $$renderer4.option({ value: u.id }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(u.fullName)} (${escape_html(u.email)})`);
            });
          }
          $$renderer4.push(`<!--]-->`);
        });
        $$renderer3.push(`</div> <div class="form-grid"><div class="field"><label for="f_classId">Kelas <i class="req">*</i></label> `);
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
        $$renderer3.push(`</div></div> <div class="field"><label for="f_packageId">Paket Les <i class="req">*</i></label> `);
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
        $$renderer3.push(`</div> <div class="form-grid"><div class="field"><label for="f_parentName">Nama Wali</label> <input id="f_parentName" type="text" placeholder="Nama orang tua / wali"${attr("value", parentName)}/></div> <div class="field"><label for="f_parentPhone">Telepon Wali</label> <input id="f_parentPhone" type="tel" placeholder="08xx-xxxx-xxxx"${attr("value", parentPhone)}/></div></div> <div class="field"><label for="f_fullAddress">Alamat Rumah (lokasi les) <i class="req">*</i></label> <input id="f_fullAddress" type="text" placeholder="Alamat lengkap rumah siswa" required=""${attr("value", fullAddress)}/></div> <div class="form-grid"><div class="field"><label for="f_latitude">Latitude <i class="req">*</i></label> <input id="f_latitude" type="number" step="0.0001" required=""${attr("value", latitude)}/></div> <div class="field"><label for="f_longitude">Longitude <i class="req">*</i></label> <input id="f_longitude" type="number" step="0.0001" required=""${attr("value", longitude)}/></div></div></form>`);
      },
      $$slots: {
        default: true,
        footer: ($$renderer3) => {
          {
            $$renderer3.push(`<button type="button" class="btn btn-outline">`);
            Icon($$renderer3, { name: "close", size: "sm" });
            $$renderer3.push(`<!----> Batal</button> <button type="submit" form="form-enrollment" class="btn btn-primary">`);
            Icon($$renderer3, { name: "save", size: "sm" });
            $$renderer3.push(`<!----> ${escape_html(editingEnrollment ? "Simpan Perubahan" : "Daftarkan Siswa")}</button>`);
          }
        }
      }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { open, editingEnrollment, onClose });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let allEnrollments, nTotal, nKelompok, nPrivate, filteredEnrollments, paginatedEnrollments, totalPages;
    let searchQuery = "";
    let levelFilter = "";
    let currentPage = 1;
    const itemsPerPage = 8;
    let enrollmentModalOpen = false;
    let editingEnrollment = null;
    let deleteDialogOpen = false;
    function getUserName(userId) {
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === userId)?.fullName || "—";
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
    function getPackage(packageId) {
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.find((p) => p.id === packageId);
    }
    function handleConfirmDelete() {
      return;
    }
    allEnrollments = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.filter((e) => e.deletedAt === null);
    nTotal = allEnrollments.length;
    nKelompok = allEnrollments.filter((e) => {
      const p = store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.find((pkg) => pkg.id === e.packageId);
      return p && p.mode === "KELOMPOK";
    }).length;
    nPrivate = nTotal - nKelompok;
    filteredEnrollments = allEnrollments.filter((e) => {
      const cls = store_get($$store_subs ??= {}, "$dbStore", dbStore).classes.find((c) => c.id === e.classId);
      cls ? cls.educationLevelId : null;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || getUserName(e.studentId).toLowerCase().includes(q) || getClassName(e.classId).toLowerCase().includes(q) || getSubjectName(e.subjectId).toLowerCase().includes(q) || getPackageName(e.packageId).toLowerCase().includes(q) || (e.address || "").toLowerCase().includes(q);
      const matchesLevel = !levelFilter;
      return matchesSearch && matchesLevel;
    });
    paginatedEnrollments = filteredEnrollments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    totalPages = Math.max(1, Math.ceil(filteredEnrollments.length / itemsPerPage));
    $$renderer2.push(`<div class="page-head"><div><h3>`);
    Icon($$renderer2, { name: "group", size: "lg" });
    $$renderer2.push(`<!----> Siswa</h3> <div class="desc">Siswa terdaftar beserta paket les yang dilanggan.</div></div> <button type="button" class="btn btn-primary">`);
    Icon($$renderer2, { name: "person_add", size: "sm" });
    $$renderer2.push(`<!----> Daftarkan Siswa</button></div> <div class="stat-grid"><div class="stat"><div class="s-icon tone-sky">`);
    Icon($$renderer2, { name: "group", size: "lg" });
    $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(nTotal)}</div> <div class="s-lbl">Siswa Terdaftar</div></div></div> <div class="stat"><div class="s-icon tone-emerald">`);
    Icon($$renderer2, { name: "person", size: "lg" });
    $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(nPrivate)}</div> <div class="s-lbl">Paket Private</div></div></div> <div class="stat"><div class="s-icon tone-amber">`);
    Icon($$renderer2, { name: "groups", size: "lg" });
    $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(nKelompok)}</div> <div class="s-lbl">Paket Kelompok</div></div></div></div> <div class="filter-bar"><div class="filter-search">`);
    Icon($$renderer2, { name: "search", size: "sm" });
    $$renderer2.push(`<!----> <input type="text" placeholder="Cari siswa / kelas / mapel / paket / alamat..."${attr("value", searchQuery)}/></div> `);
    $$renderer2.select({ class: "filter-select", value: levelFilter }, ($$renderer3) => {
      $$renderer3.option({ value: "" }, ($$renderer4) => {
        $$renderer4.push(`Semua Jenjang`);
      });
      $$renderer3.push(`<!--[-->`);
      const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$dbStore", dbStore).educationLevels);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let lvl = each_array[$$index];
        $$renderer3.option({ value: lvl.id }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(lvl.levelName)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</div> <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Siswa</th><th>Kelas · Mapel</th><th>Paket Les</th><th>Wali</th><th style="text-align:right">Aksi</th></tr></thead><tbody>`);
    if (paginatedEnrollments.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="5" class="empty">${escape_html('Belum ada pendaftaran siswa. Klik "Daftarkan Siswa".')}</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(paginatedEnrollments);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let e = each_array_1[$$index_1];
        const pkg = getPackage(e.packageId);
        const wali = e.waliUserId ? store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === e.waliUserId) : null;
        $$renderer2.push(`<tr><td><strong>${escape_html(getUserName(e.studentId))}</strong></td><td>${escape_html(getClassName(e.classId))} · ${escape_html(getSubjectName(e.subjectId))}</td><td><span class="sub">${escape_html(pkg?.mode || "PRIVATE")}</span> ${escape_html(pkg?.name || "—")} `);
        if (pkg) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="sub">${escape_html(formatCurrencyIDR(pkg.price))}/${escape_html(pkg.period === "BULANAN" ? "bulan" : "sesi")}</div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></td><td>`);
        if (wali) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`${escape_html(wali.fullName)} <div class="sub">${escape_html(wali.phone || "—")}</div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`—`);
        }
        $$renderer2.push(`<!--]--></td><td><div class="actions"><button type="button" class="btn-icon" data-tip="Ubah">`);
        Icon($$renderer2, { name: "edit", size: "sm" });
        $$renderer2.push(`<!----></button> <button type="button" class="btn-icon btn-icon-danger" data-tip="Hapus">`);
        Icon($$renderer2, { name: "delete", size: "sm" });
        $$renderer2.push(`<!----></button></div></td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div> `);
    if (filteredEnrollments.length > itemsPerPage) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="page-nav"><div class="page-info">Menampilkan ${escape_html((currentPage - 1) * itemsPerPage + 1)}–${escape_html(Math.min(currentPage * itemsPerPage, filteredEnrollments.length))} dari ${escape_html(filteredEnrollments.length)} data</div> <div class="page-btns"><button type="button" class="page-btn"${attr("disabled", currentPage <= 1, true)}>«</button> <!--[-->`);
      const each_array_2 = ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let p = each_array_2[$$index_2];
        $$renderer2.push(`<button type="button"${attr_class(`page-btn ${currentPage === p ? "active" : ""}`)}>${escape_html(p)}</button>`);
      }
      $$renderer2.push(`<!--]--> <button type="button" class="page-btn"${attr("disabled", currentPage >= totalPages, true)}>»</button></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    Enrollment_modal($$renderer2, {
      open: enrollmentModalOpen,
      editingEnrollment,
      onClose: () => {
        enrollmentModalOpen = false;
      }
    });
    $$renderer2.push(`<!----> `);
    Confirmation_dialog($$renderer2, {
      open: deleteDialogOpen,
      title: "Hapus Pendaftaran Siswa",
      message: "Apakah Anda yakin ingin menghapus pendaftaran siswa ini?",
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
