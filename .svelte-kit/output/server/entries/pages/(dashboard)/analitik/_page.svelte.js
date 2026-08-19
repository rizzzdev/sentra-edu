import { s as store_get, e as escape_html, b as ensure_array_like, j as attr_style, d as stringify, a as attr, c as attr_class, u as unsubscribe_stores } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { C as Confirmation_dialog } from "../../../../chunks/confirmation-dialog.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
import { t as toastStore } from "../../../../chunks/toast-store.js";
import { f as formatCurrencyIDR } from "../../../../chunks/formatting.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let paidInvoices, totalRevenue, paidClaims, totalHonor, allAtt, approvedN, decidedN, verifyRate, monthItems, maxMonthVal, topTentors, maxTentorSessions, jobStatusCount, candStatusCount;
    let resetDialogOpen = false;
    const monthNamesShort = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des"
    ];
    function handleResetDatabase() {
      const response = dbStore.resetToFactoryDefaults();
      resetDialogOpen = false;
      if (!response.error) {
        toastStore.success(response.message);
      } else {
        toastStore.error(response.message);
      }
    }
    paidInvoices = store_get($$store_subs ??= {}, "$dbStore", dbStore).invoices.filter((i) => i.deletedAt === null && i.status === "PAID");
    totalRevenue = paidInvoices.reduce((s, i) => s + i.amount, 0);
    paidClaims = store_get($$store_subs ??= {}, "$dbStore", dbStore).payrollClaims.filter((c) => c.deletedAt === null && c.status === "PAID");
    totalHonor = paidClaims.reduce((s, c) => s + c.totalAmount, 0);
    allAtt = store_get($$store_subs ??= {}, "$dbStore", dbStore).attendances.filter((a) => a.deletedAt === null);
    approvedN = allAtt.filter((a) => a.status === "APPROVED").length;
    decidedN = allAtt.filter((a) => a.status === "APPROVED" || a.status === "REJECTED").length;
    verifyRate = decidedN ? Math.round(approvedN / decidedN * 100) : 0;
    monthItems = Array.from({ length: 6 }, (_, index) => {
      const mi = 5 - index;
      const now = /* @__PURE__ */ new Date();
      const d = new Date(now.getFullYear(), now.getMonth() - mi, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const sppVal = store_get($$store_subs ??= {}, "$dbStore", dbStore).invoices.filter((i) => i.deletedAt === null && i.status === "PAID" && i.periodMonth === m && i.periodYear === y).reduce((s, i) => s + i.amount, 0);
      const honorVal = store_get($$store_subs ??= {}, "$dbStore", dbStore).payrollClaims.filter((c) => c.deletedAt === null && c.status === "PAID" && c.periodMonth === m && c.periodYear === y).reduce((s, c) => s + c.totalAmount, 0);
      return {
        label: `${monthNamesShort[d.getMonth()]} ${y}`,
        spp: sppVal,
        honor: honorVal
      };
    });
    maxMonthVal = Math.max(1, ...monthItems.map((m) => Math.max(m.spp, m.honor)));
    topTentors = (() => {
      const tentorSessions = {};
      store_get($$store_subs ??= {}, "$dbStore", dbStore).attendances.filter((a) => a.deletedAt === null && a.status === "APPROVED").forEach((a) => {
        tentorSessions[a.tentorId] = (tentorSessions[a.tentorId] || 0) + 1;
      });
      return Object.keys(tentorSessions).sort((a, b) => tentorSessions[b] - tentorSessions[a]).slice(0, 8).map((tid) => {
        const u = store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((user) => user.id === tid);
        return { label: u?.fullName || "Tentor", value: tentorSessions[tid] };
      });
    })();
    maxTentorSessions = Math.max(1, ...topTentors.map((t) => t.value));
    jobStatusCount = (() => {
      const counts = {};
      store_get($$store_subs ??= {}, "$dbStore", dbStore).jobs.filter((j) => j.deletedAt === null).forEach((j) => {
        counts[j.status] = (counts[j.status] || 0) + 1;
      });
      return counts;
    })();
    candStatusCount = (() => {
      const counts = {};
      store_get($$store_subs ??= {}, "$dbStore", dbStore).candidates.filter((c) => c.deletedAt === null).forEach((c) => {
        counts[c.status] = (counts[c.status] || 0) + 1;
      });
      return counts;
    })();
    $$renderer2.push(`<div class="page-head"><div><h3>`);
    Icon($$renderer2, { name: "monitoring", size: "lg" });
    $$renderer2.push(`<!----> Analitik</h3> <div class="desc">Ringkasan data operasional SentraEdu.</div></div></div> <div class="stat-grid"><div class="stat"><div class="s-icon tone-emerald">`);
    Icon($$renderer2, { name: "account_balance_wallet", size: "lg" });
    $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(formatCurrencyIDR(totalRevenue))}</div> <div class="s-lbl">Pendapatan SPP (Lunas)</div></div></div> <div class="stat"><div class="s-icon tone-violet">`);
    Icon($$renderer2, { name: "payments", size: "lg" });
    $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(formatCurrencyIDR(totalHonor))}</div> <div class="s-lbl">Honor Tentor Dibayar</div></div></div> <div class="stat"><div class="s-icon tone-sky">`);
    Icon($$renderer2, { name: "location_on", size: "lg" });
    $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(allAtt.length)}</div> <div class="s-lbl">Total Sesi Tercatat</div></div></div> <div class="stat"><div class="s-icon tone-amber">`);
    Icon($$renderer2, { name: "verified", size: "lg" });
    $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(verifyRate)}%</div> <div class="s-lbl">Presensi Disetujui</div></div></div></div> <div class="card"><div class="card-head">`);
    Icon($$renderer2, { name: "bar_chart", size: "md" });
    $$renderer2.push(`<!----> Pendapatan &amp; Honor per Bulan (6 bulan terakhir)</div> <div class="card-body"><div class="chart-legend"><span><span class="dot" style="background:var(--primary)"></span>SPP</span> <span><span class="dot" style="background:var(--accent)"></span>Honor</span></div> <div class="bar-chart"><!--[-->`);
    const each_array = ensure_array_like(monthItems);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let m = each_array[$$index];
      $$renderer2.push(`<div class="bar-col"><div class="bar-pair"><div class="bar"${attr_style(`height: ${stringify(Math.max(2, Math.round(m.spp / maxMonthVal * 110)))}px`)}${attr("title", `SPP: ${stringify(formatCurrencyIDR(m.spp))}`)}></div> <div class="bar alt"${attr_style(`height: ${stringify(Math.max(2, Math.round(m.honor / maxMonthVal * 110)))}px`)}${attr("title", `Honor: ${stringify(formatCurrencyIDR(m.honor))}`)}></div></div> <div class="bar-label">${escape_html(m.label)}</div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> `);
    if (topTentors.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="card"><div class="card-head">`);
      Icon($$renderer2, { name: "emoji_events", size: "md" });
      $$renderer2.push(`<!----> Top Tentor (Sesi Disetujui)</div> <div class="card-body"><!--[-->`);
      const each_array_1 = ensure_array_like(topTentors);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let t = each_array_1[$$index_1];
        $$renderer2.push(`<div class="hbar-row"><div class="hbar-name"${attr("title", t.label)}>${escape_html(t.label)}</div> <div class="hbar-track"><div class="hbar-fill"${attr_style(`width: ${stringify(t.value / maxTentorSessions * 100)}%`)}></div></div> <div class="hbar-val">${escape_html(t.value)} sesi</div></div>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="card"><div class="card-head">`);
    Icon($$renderer2, { name: "work", size: "md" });
    $$renderer2.push(`<!----> Status Lowongan</div> <div class="card-body"><div class="chip-row"><!--[-->`);
    const each_array_2 = ensure_array_like(Object.keys(jobStatusCount));
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let s = each_array_2[$$index_2];
      $$renderer2.push(`<span style="display:inline-flex;align-items:center;gap:6px;margin:4px 8px 4px 0"><span${attr_class(`badge ${s === "AVAILABLE" ? "b-available" : s === "NEGOTIATING" ? "b-negotiating" : s === "ASSIGNED" ? "b-assigned" : "b-cancelled"}`)}>${escape_html(s)}</span> <span style="font-weight:700;font-size:1.05rem">${escape_html(jobStatusCount[s])}</span></span>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="card"><div class="card-head">`);
    Icon($$renderer2, { name: "badge", size: "md" });
    $$renderer2.push(`<!----> Pipeline Rekrutmen Tentor</div> <div class="card-body"><div class="chip-row"><!--[-->`);
    const each_array_3 = ensure_array_like(Object.keys(candStatusCount));
    for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
      let s = each_array_3[$$index_3];
      $$renderer2.push(`<span style="display:inline-flex;align-items:center;gap:6px;margin:4px 8px 4px 0"><span${attr_class(`badge ${s === "ACCEPTED" ? "b-accepted" : s === "REJECTED" ? "b-rejected" : s === "TESTED" ? "b-tested" : s === "INTERVIEWED" ? "b-interviewed" : "b-pending"}`)}>${escape_html(s)}</span> <span style="font-weight:700;font-size:1.05rem">${escape_html(candStatusCount[s])}</span></span>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="card"><div class="card-head">`);
    Icon($$renderer2, { name: "database", size: "md" });
    $$renderer2.push(`<!----> Manajemen Data Prototype</div> <div class="card-body"><p style="font-size:.84rem;color:var(--muted-fg);margin-bottom:12px">Seluruh data tersimpan di localStorage browser. Export untuk backup/pindah perangkat, import untuk memuat data dari file JSON.</p> <div class="quick-actions"><button type="button" class="btn btn-outline">`);
    Icon($$renderer2, { name: "download", size: "sm" });
    $$renderer2.push(`<!----> Export Data</button> <input type="file" accept=".json" class="hidden"/> <button type="button" class="btn btn-outline">`);
    Icon($$renderer2, { name: "upload", size: "sm" });
    $$renderer2.push(`<!----> Import Data</button> <button type="button" class="btn btn-danger">`);
    Icon($$renderer2, { name: "restart_alt", size: "sm" });
    $$renderer2.push(`<!----> Reset Data</button></div></div></div> `);
    Confirmation_dialog($$renderer2, {
      open: resetDialogOpen,
      title: "Reset Data Prototype",
      message: "Apakah Anda yakin ingin mereset seluruh data kembali ke bawaan sistem? Data kustom akan hilang.",
      confirmText: "Ya, Reset",
      confirmVariant: "danger",
      onConfirm: handleResetDatabase,
      onCancel: () => {
        resetDialogOpen = false;
      }
    });
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
