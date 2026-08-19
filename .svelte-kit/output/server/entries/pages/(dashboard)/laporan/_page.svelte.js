import { s as store_get, e as escape_html, b as ensure_array_like, j as attr_style, d as stringify, a as attr, c as attr_class, u as unsubscribe_stores } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
import { f as formatCurrencyIDR } from "../../../../chunks/formatting.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let paidInvs, unpaidInvs, revenue, receivable, paidClaims, reqClaims, honor, pendingHonor, monthItems, maxMonthVal, invStatus, claimStatus, tentorSessions, sortedTentorIds, levelPrograms;
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
    function getUserName(userId) {
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === userId)?.fullName || "Tentor";
    }
    paidInvs = store_get($$store_subs ??= {}, "$dbStore", dbStore).invoices.filter((i) => i.deletedAt === null && i.status === "PAID");
    unpaidInvs = store_get($$store_subs ??= {}, "$dbStore", dbStore).invoices.filter((i) => i.deletedAt === null && i.status === "UNPAID");
    revenue = paidInvs.reduce((s, i) => s + i.amount, 0);
    receivable = unpaidInvs.reduce((s, i) => s + i.amount, 0);
    paidClaims = store_get($$store_subs ??= {}, "$dbStore", dbStore).payrollClaims.filter((c) => c.deletedAt === null && c.status === "PAID");
    reqClaims = store_get($$store_subs ??= {}, "$dbStore", dbStore).payrollClaims.filter((c) => c.deletedAt === null && c.status === "REQUESTED");
    honor = paidClaims.reduce((s, c) => s + c.totalAmount, 0);
    pendingHonor = reqClaims.reduce((s, c) => s + c.totalAmount, 0);
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
    invStatus = (() => {
      const statusMap = {};
      store_get($$store_subs ??= {}, "$dbStore", dbStore).invoices.filter((i) => i.deletedAt === null).forEach((i) => {
        statusMap[i.status] = statusMap[i.status] || { count: 0, total: 0 };
        statusMap[i.status].count++;
        statusMap[i.status].total += i.amount;
      });
      return statusMap;
    })();
    claimStatus = (() => {
      const statusMap = {};
      store_get($$store_subs ??= {}, "$dbStore", dbStore).payrollClaims.filter((c) => c.deletedAt === null).forEach((c) => {
        statusMap[c.status] = statusMap[c.status] || { count: 0, total: 0 };
        statusMap[c.status].count++;
        statusMap[c.status].total += c.totalAmount;
      });
      return statusMap;
    })();
    tentorSessions = (() => {
      const sessionMap = {};
      store_get($$store_subs ??= {}, "$dbStore", dbStore).attendances.filter((a) => a.deletedAt === null).forEach((a) => {
        sessionMap[a.tentorId] = sessionMap[a.tentorId] || { total: 0, approved: 0, submitted: 0 };
        sessionMap[a.tentorId].total++;
        if (a.status === "APPROVED") sessionMap[a.tentorId].approved++;
        if (a.status === "SUBMITTED") sessionMap[a.tentorId].submitted++;
      });
      return sessionMap;
    })();
    sortedTentorIds = Object.keys(tentorSessions).sort((a, b) => tentorSessions[b].total - tentorSessions[a].total);
    levelPrograms = (() => {
      const map = {};
      store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.filter((e) => e.deletedAt === null).forEach((e) => {
        const cls = store_get($$store_subs ??= {}, "$dbStore", dbStore).classes.find((c) => c.id === e.classId);
        const lvl = cls ? store_get($$store_subs ??= {}, "$dbStore", dbStore).educationLevels.find((l) => l.id === cls.educationLevelId) : null;
        const name = lvl?.levelName || "Lainnya";
        map[name] = (map[name] || 0) + 1;
      });
      return map;
    })();
    $$renderer2.push(`<div class="page-head"><div><h3>`);
    Icon($$renderer2, { name: "summarize", size: "lg" });
    $$renderer2.push(`<!----> Laporan</h3> <div class="desc">Rekapitulasi keuangan, presensi, dan program les.</div></div></div> <div class="stat-grid"><div class="stat"><div class="s-icon tone-emerald">`);
    Icon($$renderer2, { name: "account_balance_wallet", size: "lg" });
    $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(formatCurrencyIDR(revenue))}</div> <div class="s-lbl">Pendapatan SPP (Lunas)</div></div></div> <div class="stat"><div class="s-icon tone-amber">`);
    Icon($$renderer2, { name: "schedule", size: "lg" });
    $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(formatCurrencyIDR(receivable))}</div> <div class="s-lbl">Piutang SPP</div></div></div> <div class="stat"><div class="s-icon tone-violet">`);
    Icon($$renderer2, { name: "payments", size: "lg" });
    $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(formatCurrencyIDR(honor))}</div> <div class="s-lbl">Honor Tentor Dibayar</div></div></div> <div class="stat"><div class="s-icon tone-rose">`);
    Icon($$renderer2, { name: "hourglass_top", size: "lg" });
    $$renderer2.push(`<!----></div> <div><div class="s-val">${escape_html(formatCurrencyIDR(pendingHonor))}</div> <div class="s-lbl">Honor Menunggu Proses</div></div></div></div> <div class="card"><div class="card-head">`);
    Icon($$renderer2, { name: "bar_chart", size: "md" });
    $$renderer2.push(`<!----> Pendapatan SPP vs Honor Tentor (6 bulan terakhir)</div> <div class="card-body"><div class="chart-legend"><span><span class="dot" style="background:var(--primary)"></span>SPP</span> <span><span class="dot" style="background:var(--accent)"></span>Honor</span></div> <div class="bar-chart"><!--[-->`);
    const each_array = ensure_array_like(monthItems);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let m = each_array[$$index];
      $$renderer2.push(`<div class="bar-col"><div class="bar-pair"><div class="bar"${attr_style(`height: ${stringify(Math.max(2, Math.round(m.spp / maxMonthVal * 110)))}px`)}${attr("title", `SPP: ${stringify(formatCurrencyIDR(m.spp))}`)}></div> <div class="bar alt"${attr_style(`height: ${stringify(Math.max(2, Math.round(m.honor / maxMonthVal * 110)))}px`)}${attr("title", `Honor: ${stringify(formatCurrencyIDR(m.honor))}`)}></div></div> <div class="bar-label">${escape_html(m.label)}</div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="grid-2"><div class="card"><div class="card-head">`);
    Icon($$renderer2, { name: "receipt_long", size: "md" });
    $$renderer2.push(`<!----> Rekap Tagihan SPP</div> <div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Status</th><th class="num">Jumlah</th><th class="num">Nominal</th></tr></thead><tbody>`);
    if (Object.keys(invStatus).length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="3" class="empty">Belum ada tagihan.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(Object.keys(invStatus));
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let s = each_array_1[$$index_1];
        $$renderer2.push(`<tr><td><span${attr_class(`badge ${s === "PAID" ? "b-paid" : s === "OVERDUE" ? "b-rejected" : "b-unpaid"}`)}>${escape_html(s)}</span></td><td class="num">${escape_html(invStatus[s].count)}</td><td class="num">${escape_html(formatCurrencyIDR(invStatus[s].total))}</td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div></div> <div class="card"><div class="card-head">`);
    Icon($$renderer2, { name: "payments", size: "md" });
    $$renderer2.push(`<!----> Rekap Klaim Honor</div> <div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Status</th><th class="num">Jumlah</th><th class="num">Nominal</th></tr></thead><tbody>`);
    if (Object.keys(claimStatus).length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="3" class="empty">Belum ada klaim.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_2 = ensure_array_like(Object.keys(claimStatus));
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let s = each_array_2[$$index_2];
        $$renderer2.push(`<tr><td><span${attr_class(`badge ${s === "PAID" ? "b-paid" : s === "REJECTED" ? "b-rejected" : "b-requested"}`)}>${escape_html(s)}</span></td><td class="num">${escape_html(claimStatus[s].count)}</td><td class="num">${escape_html(formatCurrencyIDR(claimStatus[s].total))}</td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div></div></div> <div class="grid-2"><div class="card"><div class="card-head">`);
    Icon($$renderer2, { name: "location_on", size: "md" });
    $$renderer2.push(`<!----> Rekap Presensi per Tentor</div> <div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Tentor</th><th class="num">Total</th><th class="num">Disetujui</th><th class="num">Menunggu</th></tr></thead><tbody>`);
    if (sortedTentorIds.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="4" class="empty">Belum ada presensi.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_3 = ensure_array_like(sortedTentorIds);
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let tid = each_array_3[$$index_3];
        $$renderer2.push(`<tr><td><strong>${escape_html(getUserName(tid))}</strong></td><td class="num">${escape_html(tentorSessions[tid].total)}</td><td class="num">${escape_html(tentorSessions[tid].approved)}</td><td class="num">${escape_html(tentorSessions[tid].submitted)}</td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div></div> <div class="card"><div class="card-head">`);
    Icon($$renderer2, { name: "group", size: "md" });
    $$renderer2.push(`<!----> Rekap Program Les per Jenjang</div> <div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Jenjang</th><th class="num">Program Aktif</th></tr></thead><tbody>`);
    if (Object.keys(levelPrograms).length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="2" class="empty">Belum ada siswa.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_4 = ensure_array_like(Object.keys(levelPrograms));
      for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
        let lv = each_array_4[$$index_4];
        $$renderer2.push(`<tr><td><strong>${escape_html(lv)}</strong></td><td class="num">${escape_html(levelPrograms[lv])}</td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
