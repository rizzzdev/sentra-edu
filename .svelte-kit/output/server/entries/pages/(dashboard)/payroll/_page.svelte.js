import { f as fallback, s as store_get, u as unsubscribe_stores, h as bind_props, b as ensure_array_like, e as escape_html, a as attr, c as attr_class } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { M as Modal } from "../../../../chunks/modal.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
import "../../../../chunks/toast-store.js";
import { f as formatCurrencyIDR } from "../../../../chunks/formatting.js";
import { a as authStore } from "../../../../chunks/auth-store.js";
function Payroll_claim_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let tentors;
    let open = fallback($$props["open"], false);
    let tentor = fallback($$props["tentor"], null);
    let onClose = fallback($$props["onClose"], () => {
    });
    const now = /* @__PURE__ */ new Date();
    let selectedTentorId = tentor ? tentor.id : "";
    let selectedMonth = now.getMonth() + 1;
    let selectedYear = now.getFullYear();
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
    function getTentorSessionCount(tId) {
      const existingClaimedIds = store_get($$store_subs ??= {}, "$dbStore", dbStore).payrollClaims.filter((c) => c.deletedAt === null && c.status !== "REJECTED").flatMap((c) => c.attendanceIds);
      const attendances = store_get($$store_subs ??= {}, "$dbStore", dbStore).attendances.filter((a) => a.deletedAt === null && a.tentorId === tId && a.status === "APPROVED" && !existingClaimedIds.includes(a.id));
      const total = attendances.reduce(
        (sum, a) => {
          const enr = store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.find((e) => e.id === a.enrollmentId);
          const pkg = enr ? store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.find((p) => p.id === enr.packageId) : null;
          return sum + (pkg ? pkg.tentorFee : 1e5);
        },
        0
      );
      return { count: attendances.length, total };
    }
    tentors = store_get($$store_subs ??= {}, "$dbStore", dbStore).users.filter((u) => u.deletedAt === null && u.role === "TENTOR");
    if (tentor) {
      selectedTentorId = tentor.id;
    } else if (!selectedTentorId && tentors.length > 0) {
      selectedTentorId = tentors[0].id;
    }
    Modal($$renderer2, {
      open,
      onClose,
      title: "Ajukan Klaim Honor",
      icon: "payments",
      maxWidth: "560px",
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="alert alert-info" style="margin-top:-4px">`);
        Icon($$renderer3, { name: "verified", size: "sm" });
        $$renderer3.push(`<!----> <span>Hanya sesi <strong>APPROVED yang belum masuk klaim lain</strong> yang dihitung — tidak ada presensi ganda dalam penggajian.</span></div> <form id="form-claim"><div class="field"><label for="f_tentorId">Tentor <i class="req">*</i></label> `);
        $$renderer3.select({ id: "f_tentorId", required: true, value: selectedTentorId }, ($$renderer4) => {
          $$renderer4.option({ value: "" }, ($$renderer5) => {
            $$renderer5.push(`— Pilih tentor —`);
          });
          $$renderer4.push(`<!--[-->`);
          const each_array = ensure_array_like(tentors);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let t = each_array[$$index];
            const info = getTentorSessionCount(t.id);
            $$renderer4.option({ value: t.id }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(t.fullName)} (${escape_html(info.count)} sesi · ± ${escape_html(formatCurrencyIDR(info.total))})`);
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
            $$renderer3.push(`<!----> Batal</button> <button type="submit" form="form-claim" class="btn btn-primary">`);
            Icon($$renderer3, { name: "payments", size: "sm" });
            $$renderer3.push(`<!----> Ajukan Pencairan</button>`);
          }
        }
      }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { open, tentor, onClose });
  });
}
function Payroll_payment_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let tentor;
    let open = fallback($$props["open"], false);
    let claim = fallback($$props["claim"], null);
    let onClose = fallback($$props["onClose"], () => {
    });
    let transferProofUrl = "";
    tentor = claim ? store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === claim?.tentorId) : null;
    Modal($$renderer2, {
      open,
      onClose,
      title: "Proses Transfer Honor Tentor",
      icon: "account_balance_wallet",
      maxWidth: "500px",
      children: ($$renderer3) => {
        if (claim) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="kv"><dt>No. Klaim</dt> <dd>${escape_html(claim.claimNumber)}</dd> <dt>Tentor</dt> <dd>${escape_html(tentor?.fullName || "Tentor")}</dd> <dt>Total Honor</dt> <dd style="color:var(--primary);font-weight:700">${escape_html(formatCurrencyIDR(claim.totalAmount))}</dd> <dt>Jumlah Sesi</dt> <dd>${escape_html(claim.attendanceIds?.length || 0)} sesi</dd></div> <div class="field"><label for="f_transferProof">URL Bukti Transfer Bank</label> <input id="f_transferProof" type="text" placeholder="https://..."${attr("value", transferProofUrl)}/></div>`);
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
            Icon($$renderer3, { name: "check", size: "sm" });
            $$renderer3.push(`<!----> Konfirmasi Telah Ditransfer</button>`);
          }
        }
      }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { open, claim, onClose });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let currentUser, allClaims, requestedClaims, requestedAmount, paidClaims, paidAmount, filteredClaims, paginatedClaims, totalPages;
    let statusFilter = "";
    let currentPage = 1;
    const itemsPerPage = 8;
    let claimModalOpen = false;
    let paymentModalOpen = false;
    let selectedClaim = null;
    function getUserName(userId) {
      if (!userId) return "—";
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === userId)?.fullName || "—";
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
    currentUser = store_get($$store_subs ??= {}, "$authStore", authStore);
    allClaims = store_get($$store_subs ??= {}, "$dbStore", dbStore).payrollClaims.filter((c) => {
      if (c.deletedAt !== null) return false;
      if (!currentUser) return false;
      if (currentUser.role === "SUPER_ADMIN") return true;
      return c.tentorId === currentUser.id;
    });
    requestedClaims = allClaims.filter((c) => c.status === "REQUESTED");
    requestedAmount = requestedClaims.reduce((sum, c) => sum + c.totalAmount, 0);
    paidClaims = allClaims.filter((c) => c.status === "PAID");
    paidAmount = paidClaims.reduce((sum, c) => sum + c.totalAmount, 0);
    filteredClaims = allClaims.filter((c) => !statusFilter);
    paginatedClaims = filteredClaims.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    totalPages = Math.max(1, Math.ceil(filteredClaims.length / itemsPerPage));
    $$renderer2.push(`<div class="page-head"><div><h3>`);
    Icon($$renderer2, { name: "payments", size: "lg" });
    $$renderer2.push(`<!----> Klaim Gaji</h3> <div class="desc">`);
    if (currentUser?.role === "SUPER_ADMIN") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`Proses klaim honor tentor. Honor dihitung otomatis dari sesi APPROVED.`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`Ajukan klaim honor mengajar dari sesi les yang telah diverifikasi.`);
    }
    $$renderer2.push(`<!--]--></div></div> `);
    if (currentUser?.role === "TENTOR") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button type="button" class="btn btn-primary">`);
      Icon($$renderer2, { name: "payments", size: "sm" });
      $$renderer2.push(`<!----> Ajukan Klaim</button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (currentUser?.role === "SUPER_ADMIN") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="stat-grid"><div class="stat"><div class="s-icon tone-amber">`);
      Icon($$renderer2, { name: "schedule", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(requestedClaims.length)}</div> <div class="s-lbl">Menunggu Proses</div></div></div> <div class="stat"><div class="s-icon tone-rose">`);
      Icon($$renderer2, { name: "payments", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(formatCurrencyIDR(requestedAmount))}</div> <div class="s-lbl">Nominal Menunggu</div></div></div> <div class="stat"><div class="s-icon tone-emerald">`);
      Icon($$renderer2, { name: "verified", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(paidClaims.length)}</div> <div class="s-lbl">Klaim Dibayar</div></div></div> <div class="stat"><div class="s-icon tone-violet">`);
      Icon($$renderer2, { name: "account_balance_wallet", size: "lg" });
      $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(formatCurrencyIDR(paidAmount))}</div> <div class="s-lbl">Total Dibayar</div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="filter-bar">`);
    $$renderer2.select({ class: "filter-select", value: statusFilter }, ($$renderer3) => {
      $$renderer3.option({ value: "" }, ($$renderer4) => {
        $$renderer4.push(`Semua Status`);
      });
      $$renderer3.option({ value: "REQUESTED" }, ($$renderer4) => {
        $$renderer4.push(`Diajukan`);
      });
      $$renderer3.option({ value: "PAID" }, ($$renderer4) => {
        $$renderer4.push(`Dibayar`);
      });
      $$renderer3.option({ value: "REJECTED" }, ($$renderer4) => {
        $$renderer4.push(`Ditolak`);
      });
    });
    $$renderer2.push(`</div> <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>No. Klaim</th>`);
    if (currentUser?.role === "SUPER_ADMIN") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<th>Tentor</th>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--><th>Periode</th><th class="num">Sesi</th><th class="num">Total</th><th>Status</th><th style="text-align:right">Aksi</th></tr></thead><tbody>`);
    if (paginatedClaims.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td${attr("colspan", currentUser?.role === "SUPER_ADMIN" ? 7 : 6)} class="empty">Tidak ada klaim untuk filter ini.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(paginatedClaims);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let c = each_array[$$index];
        $$renderer2.push(`<tr><td>${escape_html(c.claimNumber)}</td>`);
        if (currentUser?.role === "SUPER_ADMIN") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<td>${escape_html(getUserName(c.tentorId))}</td>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--><td>${escape_html(getMonthLabel(c.periodMonth, c.periodYear))}</td><td class="num">${escape_html(c.attendanceIds.length)}</td><td class="num"><strong>${escape_html(formatCurrencyIDR(c.totalAmount))}</strong></td><td><span${attr_class(`badge ${c.status === "PAID" ? "b-paid" : c.status === "REJECTED" ? "b-rejected" : "b-requested"}`)}>${escape_html(c.status)}</span></td><td><div class="actions">`);
        if (currentUser?.role === "SUPER_ADMIN" && c.status === "REQUESTED") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<button type="button" class="btn-icon" data-tip="Proses Cair">`);
          Icon($$renderer2, { name: "payments", size: "sm" });
          $$renderer2.push(`<!----></button> <button type="button" class="btn-icon btn-icon-danger" data-tip="Tolak">`);
          Icon($$renderer2, { name: "close", size: "sm" });
          $$renderer2.push(`<!----></button>`);
        } else if (c.transferProofUrl) {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<a${attr("href", c.transferProofUrl)} target="_blank" rel="noreferrer" class="btn-icon" data-tip="Bukti Transfer">`);
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
    if (filteredClaims.length > itemsPerPage) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="page-nav"><div class="page-info">Menampilkan ${escape_html((currentPage - 1) * itemsPerPage + 1)}–${escape_html(Math.min(currentPage * itemsPerPage, filteredClaims.length))} dari ${escape_html(filteredClaims.length)} data</div> <div class="page-btns"><button type="button" class="page-btn"${attr("disabled", currentPage <= 1, true)}>«</button> <!--[-->`);
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
    if (currentUser && currentUser.role === "TENTOR") {
      $$renderer2.push("<!--[0-->");
      Payroll_claim_modal($$renderer2, {
        open: claimModalOpen,
        tentor: currentUser,
        onClose: () => {
          claimModalOpen = false;
        }
      });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    Payroll_payment_modal($$renderer2, {
      open: paymentModalOpen,
      claim: selectedClaim,
      onClose: () => {
        paymentModalOpen = false;
      }
    });
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
