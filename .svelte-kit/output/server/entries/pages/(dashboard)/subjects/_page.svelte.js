import { f as fallback, h as bind_props, e as escape_html, a as attr, s as store_get, b as ensure_array_like, c as attr_class, u as unsubscribe_stores } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { M as Modal } from "../../../../chunks/modal.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
import "../../../../chunks/toast-store.js";
import { C as Confirmation_dialog } from "../../../../chunks/confirmation-dialog.js";
function Subject_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let open = fallback($$props["open"], false);
    let editingSubject = fallback($$props["editingSubject"], null);
    let onClose = fallback($$props["onClose"], () => {
    });
    let name = "";
    let description = "";
    if (editingSubject) {
      name = editingSubject.name;
      description = editingSubject.description || "";
    } else {
      name = "";
      description = "";
    }
    Modal($$renderer2, {
      open,
      onClose,
      title: editingSubject ? "Ubah Mapel" : "Tambah Mapel",
      icon: "menu_book",
      maxWidth: "480px",
      children: ($$renderer3) => {
        $$renderer3.push(`<form id="form-subject"><div class="field"><label for="f_name">Nama Mapel <i class="req">*</i></label> <input id="f_name" type="text" placeholder="cth: Matematika" required=""${attr("value", name)}/></div> <div class="field"><label for="f_description">Deskripsi</label> <textarea id="f_description" rows="2" placeholder="Opsional">`);
        const $$body = escape_html(description);
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
            $$renderer3.push(`<!----> Batal</button> <button type="submit" form="form-subject" class="btn btn-primary">`);
            Icon($$renderer3, { name: "save", size: "sm" });
            $$renderer3.push(`<!----> ${escape_html(editingSubject ? "Simpan Perubahan" : "Tambah Mapel")}</button>`);
          }
        }
      }
    });
    bind_props($$props, { open, editingSubject, onClose });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let allSubjects, filteredSubjects, paginatedSubjects, totalPages;
    let searchQuery = "";
    let currentPage = 1;
    const itemsPerPage = 8;
    let subjectModalOpen = false;
    let editingSubject = null;
    let deleteDialogOpen = false;
    function handleConfirmDelete() {
      return;
    }
    allSubjects = store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.filter((s) => s.deletedAt === null);
    filteredSubjects = allSubjects.filter((s) => !searchQuery);
    paginatedSubjects = filteredSubjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    totalPages = Math.max(1, Math.ceil(filteredSubjects.length / itemsPerPage));
    $$renderer2.push(`<div class="page-head"><div><h3>`);
    Icon($$renderer2, { name: "menu_book", size: "lg" });
    $$renderer2.push(`<!----> Mata Pelajaran</h3> <div class="desc">Daftar mapel yang tersedia untuk lowongan les.</div></div> <button type="button" class="btn btn-primary">`);
    Icon($$renderer2, { name: "add", size: "sm" });
    $$renderer2.push(`<!----> Tambah Mapel</button></div> <div class="filter-bar"><div class="filter-search">`);
    Icon($$renderer2, { name: "search", size: "sm" });
    $$renderer2.push(`<!----> <input type="text" placeholder="Cari nama mapel..."${attr("value", searchQuery)}/></div></div> <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Nama</th><th>Deskripsi</th><th style="text-align:right">Aksi</th></tr></thead><tbody>`);
    if (paginatedSubjects.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="3" class="empty">${escape_html("Belum ada mapel.")}</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(paginatedSubjects);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let s = each_array[$$index];
        $$renderer2.push(`<tr><td><strong>${escape_html(s.name)}</strong></td><td>${escape_html(s.description || "—")}</td><td><div class="actions"><button type="button" class="btn-icon" data-tip="Ubah">`);
        Icon($$renderer2, { name: "edit", size: "sm" });
        $$renderer2.push(`<!----></button> <button type="button" class="btn-icon btn-icon-danger" data-tip="Hapus">`);
        Icon($$renderer2, { name: "delete", size: "sm" });
        $$renderer2.push(`<!----></button></div></td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div> `);
    if (filteredSubjects.length > itemsPerPage) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="page-nav"><div class="page-info">Menampilkan ${escape_html((currentPage - 1) * itemsPerPage + 1)}–${escape_html(Math.min(currentPage * itemsPerPage, filteredSubjects.length))} dari ${escape_html(filteredSubjects.length)} data</div> <div class="page-btns"><button type="button" class="page-btn"${attr("disabled", currentPage <= 1, true)}>«</button> <!--[-->`);
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
    Subject_modal($$renderer2, {
      open: subjectModalOpen,
      editingSubject,
      onClose: () => {
        subjectModalOpen = false;
      }
    });
    $$renderer2.push(`<!----> `);
    Confirmation_dialog($$renderer2, {
      open: deleteDialogOpen,
      title: "Hapus Mata Pelajaran",
      message: "Apakah Anda yakin ingin menghapus mata pelajaran ini?",
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
