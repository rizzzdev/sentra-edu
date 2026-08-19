import { s as store_get, a as attr, b as ensure_array_like, e as escape_html, c as attr_class, d as stringify, u as unsubscribe_stores } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { U as User_modal } from "../../../../chunks/user-modal.js";
import { C as Confirmation_dialog } from "../../../../chunks/confirmation-dialog.js";
import { a as authStore } from "../../../../chunks/auth-store.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
import "../../../../chunks/toast-store.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let currentUser, allUsers, filteredUsers, paginatedUsers, totalPages;
    let searchQuery = "";
    let roleFilter = "";
    let currentPage = 1;
    const itemsPerPage = 8;
    let userModalOpen = false;
    let editingUser = null;
    let deleteDialogOpen = false;
    function getBadgeClass(role) {
      switch (role) {
        case "SUPER_ADMIN":
          return "b-admin";
        case "TENTOR":
          return "b-tentor";
        case "STUDENT":
          return "b-student";
        case "WALI_MURID":
          return "b-neutral";
        default:
          return "b-neutral";
      }
    }
    function handleConfirmDelete() {
      return;
    }
    currentUser = store_get($$store_subs ??= {}, "$authStore", authStore);
    allUsers = store_get($$store_subs ??= {}, "$dbStore", dbStore).users.filter((u) => u.deletedAt === null);
    filteredUsers = allUsers.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = !roleFilter;
      return matchesSearch && matchesRole;
    });
    paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
    $$renderer2.push(`<div class="page-head"><div><h3>`);
    Icon($$renderer2, { name: "manage_accounts", size: "lg" });
    $$renderer2.push(`<!----> Akun Pengguna</h3> <div class="desc">Kelola akun Super Admin, Admin, Tentor, dan Siswa/Wali.</div></div> <button type="button" class="btn btn-primary">`);
    Icon($$renderer2, { name: "person_add", size: "sm" });
    $$renderer2.push(`<!----> Tambah Pengguna</button></div> <div class="filter-bar"><div class="filter-search">`);
    Icon($$renderer2, { name: "search", size: "sm" });
    $$renderer2.push(`<!----> <input type="text" placeholder="Cari nama / email..."${attr("value", searchQuery)}/></div> `);
    $$renderer2.select({ class: "filter-select", value: roleFilter }, ($$renderer3) => {
      $$renderer3.option({ value: "" }, ($$renderer4) => {
        $$renderer4.push(`Semua Peran`);
      });
      $$renderer3.option({ value: "SUPER_ADMIN" }, ($$renderer4) => {
        $$renderer4.push(`Super Admin`);
      });
      $$renderer3.option({ value: "TENTOR" }, ($$renderer4) => {
        $$renderer4.push(`Tentor`);
      });
      $$renderer3.option({ value: "STUDENT" }, ($$renderer4) => {
        $$renderer4.push(`Siswa`);
      });
      $$renderer3.option({ value: "WALI_MURID" }, ($$renderer4) => {
        $$renderer4.push(`Wali Murid`);
      });
    });
    $$renderer2.push(`</div> <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Pengguna</th><th>Telepon</th><th>Peran</th><th style="text-align:right">Aksi</th></tr></thead><tbody>`);
    if (paginatedUsers.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="4" class="empty">Tidak ada pengguna untuk filter ini.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(paginatedUsers);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let u = each_array[$$index];
        $$renderer2.push(`<tr><td><strong>${escape_html(u.fullName)}</strong> <div class="sub">${escape_html(u.email)}</div></td><td>${escape_html(u.phone || "—")}</td><td><span${attr_class(`badge ${stringify(getBadgeClass(u.role))}`)}>${escape_html(u.role)}</span></td><td><div class="actions"><button type="button" class="btn-icon" data-tip="Ubah">`);
        Icon($$renderer2, { name: "edit", size: "sm" });
        $$renderer2.push(`<!----></button> `);
        if (u.id !== currentUser?.id) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<button type="button" class="btn-icon btn-icon-danger" data-tip="Hapus">`);
          Icon($$renderer2, { name: "delete", size: "sm" });
          $$renderer2.push(`<!----></button>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div></td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div> `);
    if (filteredUsers.length > itemsPerPage) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="page-nav"><div class="page-info">Menampilkan ${escape_html((currentPage - 1) * itemsPerPage + 1)}–${escape_html(Math.min(currentPage * itemsPerPage, filteredUsers.length))} dari ${escape_html(filteredUsers.length)} data</div> <div class="page-btns"><button type="button" class="page-btn"${attr("disabled", currentPage <= 1, true)}>«</button> <!--[-->`);
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
    User_modal($$renderer2, {
      open: userModalOpen,
      editingUser,
      onClose: () => {
        userModalOpen = false;
      }
    });
    $$renderer2.push(`<!----> `);
    Confirmation_dialog($$renderer2, {
      open: deleteDialogOpen,
      title: "Hapus Akun Pengguna",
      message: "Apakah Anda yakin ingin menghapus akun pengguna ini?",
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
