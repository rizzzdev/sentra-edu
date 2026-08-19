import { f as fallback, s as store_get, u as unsubscribe_stores, h as bind_props, e as escape_html, a as attr, b as ensure_array_like, c as attr_class } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { M as Modal } from "../../../../chunks/modal.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
import "../../../../chunks/toast-store.js";
import { C as Confirmation_dialog } from "../../../../chunks/confirmation-dialog.js";
import { f as formatCurrencyIDR } from "../../../../chunks/formatting.js";
function Class_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let open = fallback($$props["open"], false);
    let editingClass = fallback($$props["editingClass"], null);
    let onClose = fallback($$props["onClose"], () => {
    });
    let className = "";
    let educationLevelId = "";
    let baseRatePer90Min = 1e5;
    let description = "";
    if (editingClass) {
      className = editingClass.className;
      educationLevelId = editingClass.educationLevelId;
      baseRatePer90Min = editingClass.baseRatePer90Min;
      description = editingClass.description || "";
    } else {
      className = "";
      educationLevelId = store_get($$store_subs ??= {}, "$dbStore", dbStore).educationLevels.filter((l) => l.deletedAt === null)[0]?.id || "";
      baseRatePer90Min = 1e5;
      description = "";
    }
    Modal($$renderer2, {
      open,
      onClose,
      title: editingClass ? "Ubah Honor Kelas" : "Tambah Kelas",
      icon: "school",
      maxWidth: "500px",
      children: ($$renderer3) => {
        $$renderer3.push(`<form id="form-class"><div class="field"><label for="f_className">Nama Kelas <i class="req">*</i></label> <input id="f_className" type="text" placeholder="cth: Kelas 10 SMA" required=""${attr("value", className)}/></div> <div class="field"><label for="f_educationLevelId">Jenjang <i class="req">*</i></label> `);
        $$renderer3.select(
          {
            id: "f_educationLevelId",
            required: true,
            value: educationLevelId
          },
          ($$renderer4) => {
            $$renderer4.option({ value: "" }, ($$renderer5) => {
              $$renderer5.push(`— Pilih jenjang —`);
            });
            $$renderer4.push(`<!--[-->`);
            const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$dbStore", dbStore).educationLevels.filter((l) => l.deletedAt === null));
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let lvl = each_array[$$index];
              $$renderer4.option({ value: lvl.id }, ($$renderer5) => {
                $$renderer5.push(`${escape_html(lvl.levelName)}`);
              });
            }
            $$renderer4.push(`<!--]-->`);
          }
        );
        $$renderer3.push(`</div> <div class="field"><label for="f_baseRatePer90Min">Tarif Dasar / 90 Menit (Rp) <i class="req">*</i></label> <input id="f_baseRatePer90Min" type="number" min="0" step="5000" required=""${attr("value", baseRatePer90Min)}/></div> <div class="field"><label for="f_description">Deskripsi</label> <textarea id="f_description" rows="2" placeholder="Opsional">`);
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
            $$renderer3.push(`<!----> Batal</button> <button type="submit" form="form-class" class="btn btn-primary">`);
            Icon($$renderer3, { name: "save", size: "sm" });
            $$renderer3.push(`<!----> ${escape_html(editingClass ? "Simpan Perubahan" : "Tambah Kelas")}</button>`);
          }
        }
      }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { open, editingClass, onClose });
  });
}
function Package_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let open = fallback($$props["open"], false);
    let editingPackage = fallback($$props["editingPackage"], null);
    let onClose = fallback($$props["onClose"], () => {
    });
    let name = "";
    let mode = "PRIVATE";
    let period = "BULANAN";
    let price = 1e6;
    let tentorFee = 1e5;
    let sessionsPerPeriod = 8;
    let maxStudents = 5;
    let active = true;
    let description = "";
    if (editingPackage) {
      name = editingPackage.name;
      mode = editingPackage.mode;
      period = editingPackage.period;
      price = editingPackage.price;
      tentorFee = editingPackage.tentorFee;
      sessionsPerPeriod = editingPackage.sessionsPerPeriod;
      maxStudents = editingPackage.maxStudents;
      active = editingPackage.active;
      description = editingPackage.description || "";
    } else {
      name = "";
      mode = "PRIVATE";
      period = "BULANAN";
      price = 1e6;
      tentorFee = 1e5;
      sessionsPerPeriod = 8;
      maxStudents = 5;
      active = true;
      description = "";
    }
    Modal($$renderer2, {
      open,
      onClose,
      title: editingPackage ? "Ubah Paket Les" : "Tambah Paket",
      icon: "sell",
      maxWidth: "600px",
      children: ($$renderer3) => {
        $$renderer3.push(`<form id="form-package"><div class="field"><label for="f_name">Nama Paket <i class="req">*</i></label> <input id="f_name" type="text" placeholder="cth: Paket Bulanan Private" required=""${attr("value", name)}/></div> <div class="form-grid"><div class="field"><label for="f_mode">Mode <i class="req">*</i></label> `);
        $$renderer3.select({ id: "f_mode", required: true, value: mode }, ($$renderer4) => {
          $$renderer4.option({ value: "PRIVATE" }, ($$renderer5) => {
            $$renderer5.push(`Private (1 guru : 1 siswa)`);
          });
          $$renderer4.option({ value: "KELOMPOK" }, ($$renderer5) => {
            $$renderer5.push(`Kelompok (1 guru : beberapa siswa)`);
          });
        });
        $$renderer3.push(`</div> <div class="field"><label for="f_period">Periode Tagihan <i class="req">*</i></label> `);
        $$renderer3.select({ id: "f_period", required: true, value: period }, ($$renderer4) => {
          $$renderer4.option({ value: "BULANAN" }, ($$renderer5) => {
            $$renderer5.push(`Bulanan (tagihan flat per bulan)`);
          });
          $$renderer4.option({ value: "HARIAN" }, ($$renderer5) => {
            $$renderer5.push(`Harian (tagihan per sesi)`);
          });
        });
        $$renderer3.push(`</div></div> <div class="form-grid"><div class="field"><label for="f_price">Biaya Wali Murid (Rp) <i class="req">*</i></label> <input id="f_price" type="number" min="0" step="50000" required=""${attr("value", price)}/> <div class="help">Harga paket yang dibayar wali murid (SPP).</div></div> <div class="field"><label for="f_tentorFee">Honor Tentor per Sesi (Rp) <i class="req">*</i></label> <input id="f_tentorFee" type="number" min="0" step="5000" required=""${attr("value", tentorFee)}/> <div class="help">Yang diterima tentor per sesi (sudah termasuk transport).</div></div></div> <div class="form-grid"><div class="field"><label for="f_sessionsPerPeriod">Jumlah Sesi per Periode <i class="req">*</i></label> <input id="f_sessionsPerPeriod" type="number" min="1" step="1" required=""${attr("value", sessionsPerPeriod)}/></div> `);
        if (mode === "KELOMPOK") {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="field"><label for="f_maxStudents">Maks Siswa (untuk mode Kelompok)</label> <input id="f_maxStudents" type="number" min="1" step="1"${attr("value", maxStudents)}/></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div> <div class="field"><label for="f_active">Status Aktif</label> `);
        $$renderer3.select({ id: "f_active", value: active }, ($$renderer4) => {
          $$renderer4.option({ value: true }, ($$renderer5) => {
            $$renderer5.push(`Aktif`);
          });
          $$renderer4.option({ value: false }, ($$renderer5) => {
            $$renderer5.push(`Nonaktif`);
          });
        });
        $$renderer3.push(`</div> <div class="field"><label for="f_description">Deskripsi</label> <textarea id="f_description" rows="2" placeholder="Opsional">`);
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
            $$renderer3.push(`<!----> Batal</button> <button type="submit" form="form-package" class="btn btn-primary">`);
            Icon($$renderer3, { name: "save", size: "sm" });
            $$renderer3.push(`<!----> ${escape_html(editingPackage ? "Simpan Perubahan" : "Tambah Paket")}</button>`);
          }
        }
      }
    });
    bind_props($$props, { open, editingPackage, onClose });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let allPackages, filteredPackages, paginatedPackages, totalPages;
    let searchQuery = "";
    let modeFilter = "";
    let currentPage = 1;
    const itemsPerPage = 8;
    let packageModalOpen = false;
    let editingPackage = null;
    let classModalOpen = false;
    let editingClass = null;
    let deleteDialogOpen = false;
    function getLevelName(levelId) {
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).educationLevels.find((l) => l.id === levelId)?.levelName || "—";
    }
    function handleConfirmDelete() {
      return;
    }
    allPackages = store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.filter((p) => p.deletedAt === null);
    filteredPackages = allPackages.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
      const matchesMode = !modeFilter;
      return matchesSearch && matchesMode;
    });
    paginatedPackages = filteredPackages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    totalPages = Math.max(1, Math.ceil(filteredPackages.length / itemsPerPage));
    $$renderer2.push(`<div class="page-head"><div><h3>`);
    Icon($$renderer2, { name: "sell", size: "lg" });
    $$renderer2.push(`<!----> Paket Les</h3> <div class="desc">Master paket les: mode Private/Kelompok x periode Bulanan/Harian. Biaya wali murid (SPP) dan honor tentor per sesi dikonfigurasi di sini.</div></div> <button type="button" class="btn btn-primary">`);
    Icon($$renderer2, { name: "add", size: "sm" });
    $$renderer2.push(`<!----> Tambah Paket</button></div> <div class="alert alert-info">`);
    Icon($$renderer2, { name: "info", size: "sm" });
    $$renderer2.push(`<!----> <span><strong>Biaya Wali Murid</strong> = harga paket (SPP). <strong>Honor Tentor per Sesi</strong> = yang diterima tentor per sesi (sudah termasuk transport); bila tidak diisi, memakai honor dasar kelas + transport.</span></div> <div class="filter-bar"><div class="filter-search">`);
    Icon($$renderer2, { name: "search", size: "sm" });
    $$renderer2.push(`<!----> <input type="text" placeholder="Cari nama paket..."${attr("value", searchQuery)}/></div> `);
    $$renderer2.select({ class: "filter-select", value: modeFilter }, ($$renderer3) => {
      $$renderer3.option({ value: "" }, ($$renderer4) => {
        $$renderer4.push(`Semua Mode`);
      });
      $$renderer3.option({ value: "PRIVATE" }, ($$renderer4) => {
        $$renderer4.push(`Private`);
      });
      $$renderer3.option({ value: "KELOMPOK" }, ($$renderer4) => {
        $$renderer4.push(`Kelompok`);
      });
    });
    $$renderer2.push(`</div> <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Paket</th><th>Mode</th><th>Periode</th><th class="num">Sesi/Periode</th><th class="num">Kapasitas</th><th class="num">Harga (Wali)</th><th class="num">Honor Tentor/Sesi</th><th>Status</th><th style="text-align:right">Aksi</th></tr></thead><tbody>`);
    if (paginatedPackages.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="9" class="empty">${escape_html('Belum ada paket. Klik "Tambah Paket".')}</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(paginatedPackages);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let p = each_array[$$index];
        $$renderer2.push(`<tr><td><strong>${escape_html(p.name)}</strong> <div class="sub">${escape_html(p.description || "—")}</div></td><td><span${attr_class(`badge ${p.mode === "KELOMPOK" ? "b-negotiating" : "b-available"}`)}>${escape_html(p.mode)}</span></td><td>${escape_html(p.period === "BULANAN" ? "Bulanan" : "Harian")}</td><td class="num">${escape_html(p.sessionsPerPeriod)} sesi</td><td class="num">${escape_html(p.mode === "KELOMPOK" ? "maks " + p.maxStudents + " siswa" : "1 siswa")}</td><td class="num"><strong>${escape_html(formatCurrencyIDR(p.price))}</strong></td><td class="num">${escape_html(p.tentorFee > 0 ? formatCurrencyIDR(p.tentorFee) + "/sesi" : "—")}</td><td><span${attr_class(`badge ${p.active ? "b-available" : "b-cancelled"}`)}>${escape_html(p.active ? "Tersedia" : "Nonaktif")}</span></td><td><div class="actions"><button type="button" class="btn-icon" data-tip="Ubah">`);
        Icon($$renderer2, { name: "edit", size: "sm" });
        $$renderer2.push(`<!----></button> <button type="button" class="btn-icon btn-icon-danger" data-tip="Hapus">`);
        Icon($$renderer2, { name: "delete", size: "sm" });
        $$renderer2.push(`<!----></button></div></td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div> `);
    if (filteredPackages.length > itemsPerPage) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="page-nav"><div class="page-info">Menampilkan ${escape_html((currentPage - 1) * itemsPerPage + 1)}–${escape_html(Math.min(currentPage * itemsPerPage, filteredPackages.length))} dari ${escape_html(filteredPackages.length)} data</div> <div class="page-btns"><button type="button" class="page-btn"${attr("disabled", currentPage <= 1, true)}>«</button> <!--[-->`);
      const each_array_1 = ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let pageNum = each_array_1[$$index_1];
        $$renderer2.push(`<button type="button"${attr_class(`page-btn ${currentPage === pageNum ? "active" : ""}`)}>${escape_html(pageNum)}</button>`);
      }
      $$renderer2.push(`<!--]--> <button type="button" class="page-btn"${attr("disabled", currentPage >= totalPages, true)}>»</button></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="card"><div class="card-head">`);
    Icon($$renderer2, { name: "school", size: "md" });
    $$renderer2.push(`<!----> Honor Dasar Tentor per Kelas (per 90 menit)</div> <div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Kelas</th><th>Jenjang</th><th class="num">Honor Dasar</th><th style="text-align:right">Aksi</th></tr></thead><tbody><!--[-->`);
    const each_array_2 = ensure_array_like(store_get($$store_subs ??= {}, "$dbStore", dbStore).classes.filter((c) => c.deletedAt === null));
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let c = each_array_2[$$index_2];
      $$renderer2.push(`<tr><td><strong>${escape_html(c.className)}</strong></td><td>${escape_html(getLevelName(c.educationLevelId))}</td><td class="num">${escape_html(formatCurrencyIDR(c.baseRatePer90Min))}</td><td><div class="actions"><button type="button" class="btn-icon" data-tip="Ubah honor dasar">`);
      Icon($$renderer2, { name: "edit", size: "sm" });
      $$renderer2.push(`<!----></button></div></td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div></div> `);
    Package_modal($$renderer2, {
      open: packageModalOpen,
      editingPackage,
      onClose: () => {
        packageModalOpen = false;
      }
    });
    $$renderer2.push(`<!----> `);
    Class_modal($$renderer2, {
      open: classModalOpen,
      editingClass,
      onClose: () => {
        classModalOpen = false;
      }
    });
    $$renderer2.push(`<!----> `);
    Confirmation_dialog($$renderer2, {
      open: deleteDialogOpen,
      title: "Hapus Paket Les",
      message: "Apakah Anda yakin ingin menghapus paket les ini?",
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
