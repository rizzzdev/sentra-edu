import { f as fallback, s as store_get, u as unsubscribe_stores, h as bind_props, b as ensure_array_like, e as escape_html, a as attr, c as attr_class } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { M as Modal } from "../../../../chunks/modal.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
import "../../../../chunks/toast-store.js";
import { f as formatCurrencyIDR } from "../../../../chunks/formatting.js";
import { C as Confirmation_dialog } from "../../../../chunks/confirmation-dialog.js";
import { a as authStore } from "../../../../chunks/auth-store.js";
function Invoice_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let enrollments;
    let open = fallback($$props["open"], false);
    let onClose = fallback($$props["onClose"], () => {
    });
    const now = /* @__PURE__ */ new Date();
    let selectedStudentId = "";
    let selectedMonth = now.getMonth() + 1;
    let selectedYear = now.getFullYear();
    function getStudentEnrollmentLabel(enr) {
      const student = store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === enr.studentId);
      const cls = store_get($$store_subs ??= {}, "$dbStore", dbStore).classes.find((c) => c.id === enr.classId);
      const sub = store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.find((s) => s.id === enr.subjectId);
      return `${student?.fullName || "Siswa"} — ${cls?.className || ""} ${sub?.name || ""}`;
    }
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember"
    ];
    enrollments = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.filter((e) => e.deletedAt === null);
    if (enrollments.length > 0 && !selectedStudentId) {
      selectedStudentId = enrollments[0].studentId;
    }
    Modal($$renderer2, {
      open,
      onClose,
      title: "Generate Tagihan SPP",
      icon: "receipt_long",
      maxWidth: "540px",
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="alert alert-info" style="margin-top:-4px">`);
        Icon($$renderer3, { name: "auto_awesome", size: "sm" });
        $$renderer3.push(`<!----> <span>Total dihitung otomatis dari sesi APPROVED siswa pada periode terpilih.</span></div> <form id="form-gen-invoice"><div class="field"><label for="f_studentId">Siswa <i class="req">*</i></label> `);
        $$renderer3.select({ id: "f_studentId", required: true, value: selectedStudentId }, ($$renderer4) => {
          $$renderer4.push(`<!--[-->`);
          const each_array = ensure_array_like(enrollments);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let e = each_array[$$index];
            $$renderer4.option({ value: e.studentId }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(getStudentEnrollmentLabel(e))}`);
            });
          }
          $$renderer4.push(`<!--]-->`);
        });
        $$renderer3.push(`</div> <div class="form-grid"><div class="field"><label for="f_month">Bulan <i class="req">*</i></label> `);
        $$renderer3.select({ id: "f_month", required: true, value: selectedMonth }, ($$renderer4) => {
          $$renderer4.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(monthNames);
          for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
            let mName = each_array_1[i];
            $$renderer4.option({ value: i + 1 }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(mName)} ${escape_html(selectedYear)}`);
            });
          }
          $$renderer4.push(`<!--]-->`);
        });
        $$renderer3.push(`</div> <div class="field"><label for="f_year">Tahun <i class="req">*</i></label> <input id="f_year" type="number" min="2026" required=""${attr("value", selectedYear)}/></div></div></form>`);
      },
      $$slots: {
        default: true,
        footer: ($$renderer3) => {
          {
            $$renderer3.push(`<button type="button" class="btn btn-outline">`);
            Icon($$renderer3, { name: "close", size: "sm" });
            $$renderer3.push(`<!----> Batal</button> <button type="submit" form="form-gen-invoice" class="btn btn-primary">`);
            Icon($$renderer3, { name: "receipt_long", size: "sm" });
            $$renderer3.push(`<!----> Terbitkan Tagihan</button>`);
          }
        }
      }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { open, onClose });
  });
}
function Invoice_payment_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let enrollment, student, subject;
    let open = fallback($$props["open"], false);
    let invoice = fallback($$props["invoice"], null);
    let currentUser = $$props["currentUser"];
    let onClose = fallback($$props["onClose"], () => {
    });
    let paymentProofUrl = "";
    enrollment = invoice ? store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.find((e) => e.id === invoice?.enrollmentId) : null;
    student = enrollment ? store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === enrollment?.studentId) : null;
    subject = enrollment ? store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.find((s) => s.id === enrollment?.subjectId) : null;
    Modal($$renderer2, {
      open,
      onClose,
      title: "Pembayaran & Konfirmasi SPP",
      icon: "payments",
      maxWidth: "540px",
      children: ($$renderer3) => {
        if (invoice) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="kv"><dt>No. Tagihan</dt> <dd>${escape_html(invoice.invoiceNumber)}</dd> <dt>Siswa</dt> <dd>${escape_html(student?.fullName || "Siswa")}</dd> <dt>Mata Pelajaran</dt> <dd>${escape_html(subject?.name || "—")}</dd> <dt>Jatuh Tempo</dt> <dd>${escape_html(invoice.dueDate)}</dd> <dt>Total Tagihan</dt> <dd style="color:var(--primary);font-weight:700">${escape_html(formatCurrencyIDR(invoice.amount))}</dd></div> <div class="alert alert-info" style="margin-bottom:14px">`);
          Icon($$renderer3, { name: "account_balance", size: "sm" });
          $$renderer3.push(`<!----> <span><strong>Rekening Resmi SentraEdu</strong><br/> BCA VA: <strong>8890 0812 0001</strong>  |  Mandiri: <strong>1420 0012 3456</strong></span></div> <div class="field"><label for="f_paymentProof">URL Bukti Transfer / Pembayaran</label> <input id="f_paymentProof" type="text" placeholder="https://..."${attr("value", paymentProofUrl)}/></div>`);
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
            $$renderer3.push(`<!----> Tutup</button> `);
            if (currentUser.role === "SUPER_ADMIN") {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<button type="button" class="btn btn-primary">`);
              Icon($$renderer3, { name: "check_circle", size: "sm" });
              $$renderer3.push(`<!----> Konfirmasi Lunas (Admin)</button>`);
            } else {
              $$renderer3.push("<!--[-1-->");
              $$renderer3.push(`<button type="button" class="btn btn-primary">`);
              Icon($$renderer3, { name: "upload", size: "sm" });
              $$renderer3.push(`<!----> Kirim Bukti Pembayaran</button>`);
            }
            $$renderer3.push(`<!--]-->`);
          }
        }
      }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { open, invoice, currentUser, onClose });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let currentUser, allInvoices, unpaidInvoices, unpaidTotal, paidInvoices, paidTotal, filteredInvoices, paginatedInvoices, totalPages;
    let searchQuery = "";
    let statusFilter = "";
    let currentPage = 1;
    const itemsPerPage = 8;
    let invoiceModalOpen = false;
    let paymentModalOpen = false;
    let selectedInvoice = null;
    let deleteDialogOpen = false;
    function getStudentName(enrollmentId) {
      const enr = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.find((e) => e.id === enrollmentId);
      if (!enr) return "—";
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === enr.studentId)?.fullName || "—";
    }
    function getPackageName(enrollmentId) {
      const enr = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.find((e) => e.id === enrollmentId);
      if (!enr) return "—";
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.find((p) => p.id === enr.packageId)?.name || "—";
    }
    function getMonthLabel(month, year) {
      const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"
      ];
      if (!month || !year) return "—";
      return `${months[month - 1] || month} ${year}`;
    }
    function handleConfirmDelete() {
      return;
    }
    currentUser = store_get($$store_subs ??= {}, "$authStore", authStore);
    allInvoices = store_get($$store_subs ??= {}, "$dbStore", dbStore).invoices.filter((inv) => {
      if (inv.deletedAt !== null) return false;
      if (!currentUser) return false;
      if (currentUser.role === "SUPER_ADMIN") return true;
      const enr = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.find((e) => e.id === inv.enrollmentId);
      if (!enr) return false;
      return enr.studentId === currentUser.id || enr.waliUserId === currentUser.id;
    });
    unpaidInvoices = allInvoices.filter((i) => i.status === "UNPAID");
    unpaidTotal = unpaidInvoices.reduce((s, i) => s + i.amount, 0);
    paidInvoices = allInvoices.filter((i) => i.status === "PAID");
    paidTotal = paidInvoices.reduce((s, i) => s + i.amount, 0);
    filteredInvoices = allInvoices.filter((i) => {
      const q = searchQuery.toLowerCase();
      const stuName = getStudentName(i.enrollmentId).toLowerCase();
      const pkgName = getPackageName(i.enrollmentId).toLowerCase();
      const matchesSearch = !q || i.invoiceNumber.toLowerCase().includes(q) || stuName.includes(q) || pkgName.includes(q);
      const matchesStatus = !statusFilter;
      return matchesSearch && matchesStatus;
    });
    paginatedInvoices = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));
    $$renderer2.push(`<div class="page-head"><div><h3>`);
    Icon($$renderer2, { name: "receipt_long", size: "lg" });
    $$renderer2.push(`<!----> Tagihan SPP</h3> <div class="desc">`);
    if (currentUser?.role === "SUPER_ADMIN") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`Invoice tagihan les siswa. Paket BULANAN ditagih flat, paket HARIAN per sesi.`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`Daftar tagihan bimbingan belajar dan konfirmasi pelunasan SPP.`);
    }
    $$renderer2.push(`<!--]--></div></div> `);
    if (currentUser?.role === "SUPER_ADMIN") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button type="button" class="btn btn-primary">`);
      Icon($$renderer2, { name: "receipt_long", size: "sm" });
      $$renderer2.push(`<!----> Generate Tagihan</button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (currentUser?.role === "SUPER_ADMIN") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="stat-grid"><div class="stat"><div class="s-icon tone-amber">`);
      Icon($$renderer2, { name: "schedule", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(unpaidInvoices.length)} tagihan</div> <div class="s-lbl">Piutang</div></div></div> <div class="stat"><div class="s-icon tone-rose">`);
      Icon($$renderer2, { name: "payments", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(formatCurrencyIDR(unpaidTotal))}</div> <div class="s-lbl">Total Piutang</div></div></div> <div class="stat"><div class="s-icon tone-emerald">`);
      Icon($$renderer2, { name: "verified", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(paidInvoices.length)} tagihan</div> <div class="s-lbl">Lunas</div></div></div> <div class="stat"><div class="s-icon tone-violet">`);
      Icon($$renderer2, { name: "account_balance_wallet", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(formatCurrencyIDR(paidTotal))}</div> <div class="s-lbl">Total Lunas</div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="filter-bar"><div class="filter-search">`);
    Icon($$renderer2, { name: "search", size: "sm" });
    $$renderer2.push(`<!----> <input type="text" placeholder="Cari no. invoice / siswa / paket..."${attr("value", searchQuery)}/></div> `);
    $$renderer2.select({ class: "filter-select", value: statusFilter }, ($$renderer3) => {
      $$renderer3.option({ value: "" }, ($$renderer4) => {
        $$renderer4.push(`Semua Status`);
      });
      $$renderer3.option({ value: "UNPAID" }, ($$renderer4) => {
        $$renderer4.push(`Belum Lunas`);
      });
      $$renderer3.option({ value: "PAID" }, ($$renderer4) => {
        $$renderer4.push(`Lunas`);
      });
      $$renderer3.option({ value: "OVERDUE" }, ($$renderer4) => {
        $$renderer4.push(`Jatuh Tempo`);
      });
    });
    $$renderer2.push(`</div> <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>No. Invoice</th><th>Siswa</th><th>Periode</th><th>Paket</th><th class="num">Total</th><th>Status</th><th style="text-align:right">Aksi</th></tr></thead><tbody>`);
    if (paginatedInvoices.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="7" class="empty">Tidak ada tagihan untuk filter ini.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(paginatedInvoices);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let inv = each_array[$$index];
        $$renderer2.push(`<tr><td>${escape_html(inv.invoiceNumber)}</td><td>${escape_html(getStudentName(inv.enrollmentId))}</td><td>${escape_html(getMonthLabel(inv.periodMonth, inv.periodYear))}</td><td>${escape_html(getPackageName(inv.enrollmentId))}</td><td class="num"><strong>${escape_html(formatCurrencyIDR(inv.amount))}</strong></td><td><span${attr_class(`badge ${inv.status === "PAID" ? "b-paid" : inv.status === "OVERDUE" ? "b-rejected" : "b-unpaid"}`)}>${escape_html(inv.status)}</span></td><td><div class="actions">`);
        if (inv.status !== "PAID") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<button type="button" class="btn-icon"${attr("data-tip", currentUser?.role === "SUPER_ADMIN" ? "Konfirmasi Bayar" : "Bayar Sekarang")}>`);
          Icon($$renderer2, { name: "payments", size: "sm" });
          $$renderer2.push(`<!----></button> `);
          if (currentUser?.role === "SUPER_ADMIN") {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<button type="button" class="btn-icon btn-icon-danger" data-tip="Hapus">`);
            Icon($$renderer2, { name: "delete", size: "sm" });
            $$renderer2.push(`<!----></button>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]-->`);
        } else if (inv.paymentProofUrl) {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<a${attr("href", inv.paymentProofUrl)} target="_blank" rel="noreferrer" class="btn-icon" data-tip="Bukti Bayar">`);
          Icon($$renderer2, { name: "receipt", size: "sm" });
          $$renderer2.push(`<!----></a>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<span class="sub">—</span>`);
        }
        $$renderer2.push(`<!--]--></div></td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div> `);
    if (filteredInvoices.length > itemsPerPage) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="page-nav"><div class="page-info">Menampilkan ${escape_html((currentPage - 1) * itemsPerPage + 1)}–${escape_html(Math.min(currentPage * itemsPerPage, filteredInvoices.length))} dari ${escape_html(filteredInvoices.length)} data</div> <div class="page-btns"><button type="button" class="page-btn"${attr("disabled", currentPage <= 1, true)}>«</button> <!--[-->`);
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
    Invoice_modal($$renderer2, {
      open: invoiceModalOpen,
      onClose: () => {
        invoiceModalOpen = false;
      }
    });
    $$renderer2.push(`<!----> `);
    if (currentUser) {
      $$renderer2.push("<!--[0-->");
      Invoice_payment_modal($$renderer2, {
        open: paymentModalOpen,
        invoice: selectedInvoice,
        currentUser,
        onClose: () => {
          paymentModalOpen = false;
        }
      });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    Confirmation_dialog($$renderer2, {
      open: deleteDialogOpen,
      title: "Hapus Tagihan SPP",
      message: "Apakah Anda yakin ingin menghapus tagihan ini?",
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
