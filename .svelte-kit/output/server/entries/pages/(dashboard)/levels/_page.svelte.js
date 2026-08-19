import { s as store_get, a as attr, e as escape_html, b as ensure_array_like, c as attr_class, u as unsubscribe_stores } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { d as dbStore } from "../../../../chunks/db-store.js";
import "../../../../chunks/toast-store.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let allLevels, filteredLevels, paginatedLevels, totalPages;
    let searchQuery = "";
    let currentPage = 1;
    const itemsPerPage = 8;
    function getClassCount(levelId) {
      return store_get($$store_subs ??= {}, "$dbStore", dbStore).classes.filter((c) => c.deletedAt === null && c.educationLevelId === levelId).length;
    }
    allLevels = store_get($$store_subs ??= {}, "$dbStore", dbStore).educationLevels.filter((l) => l.deletedAt === null);
    filteredLevels = allLevels.filter((l) => !searchQuery);
    paginatedLevels = filteredLevels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    totalPages = Math.max(1, Math.ceil(filteredLevels.length / itemsPerPage));
    $$renderer2.push(`<div class="page-head"><div><h3>`);
    Icon($$renderer2, { name: "school", size: "lg" });
    $$renderer2.push(`<!----> Jenjang</h3> <div class="desc">Master jenjang pendidikan. Tarif honor diatur per kelas pada menu Paket Les.</div></div></div> <div class="filter-bar"><div class="filter-search">`);
    Icon($$renderer2, { name: "search", size: "sm" });
    $$renderer2.push(`<!----> <input type="text" placeholder="Cari jenjang..."${attr("value", searchQuery)}/></div></div> <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl"><thead><tr><th>Jenjang</th><th class="num">Jumlah Kelas</th><th>Deskripsi</th></tr></thead><tbody>`);
    if (paginatedLevels.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="3" class="empty">${escape_html("Belum ada jenjang.")}</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(paginatedLevels);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let l = each_array[$$index];
        $$renderer2.push(`<tr><td><strong>${escape_html(l.levelName)}</strong></td><td class="num">${escape_html(getClassCount(l.id))} kelas</td><td>${escape_html(l.description || "—")}</td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div> `);
    if (filteredLevels.length > itemsPerPage) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="page-nav"><div class="page-info">Menampilkan ${escape_html((currentPage - 1) * itemsPerPage + 1)}–${escape_html(Math.min(currentPage * itemsPerPage, filteredLevels.length))} dari ${escape_html(filteredLevels.length)} data</div> <div class="page-btns"><button type="button" class="page-btn"${attr("disabled", currentPage <= 1, true)}>«</button> <!--[-->`);
      const each_array_1 = ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let p = each_array_1[$$index_1];
        $$renderer2.push(`<button type="button"${attr_class(`page-btn ${currentPage === p ? "active" : ""}`)}>${escape_html(p)}</button>`);
      }
      $$renderer2.push(`<!--]--> <button type="button" class="page-btn"${attr("disabled", currentPage >= totalPages, true)}>»</button></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
