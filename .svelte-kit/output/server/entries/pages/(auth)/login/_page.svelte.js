import { s as store_get, a as attr, b as ensure_array_like, e as escape_html, u as unsubscribe_stores } from "../../../../chunks/index.js";
import { I as Icon } from "../../../../chunks/icon.js";
import "../../../../chunks/auth-store.js";
import { t as themeStore } from "../../../../chunks/theme-store.js";
import "../../../../chunks/toast-store.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let emailInput = "";
    let passwordInput = "";
    const PERSONAS = [
      {
        role: "SUPER_ADMIN",
        icon: "admin_panel_settings",
        label: "Admin",
        desc: "Data master, lowongan, presensi, rekrutmen",
        email: "admin@sentraedu.id"
      },
      {
        role: "TENTOR",
        icon: "school",
        label: "Tentor",
        desc: "Lamar les, presensi GPS, klaim honor",
        email: "tentor.andi@sentraedu.id"
      },
      {
        role: "STUDENT",
        icon: "school",
        label: "Siswa",
        desc: "Lihat les aktif, presensi, laporan",
        email: "raka@sentraedu.id"
      },
      {
        role: "WALI_MURID",
        icon: "family_restroom",
        label: "Wali Murid",
        desc: "Pantau les anak & bayar SPP",
        email: "wali.raka@sentraedu.id"
      }
    ];
    $$renderer2.push(`<div class="auth-page" style="display:flex;min-height:100vh;align-items:center;justify-content:center;padding:2rem 1.5rem"><div class="auth-card" style="width:100%;max-width:460px;background:var(--surface);border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow-md);padding:2.2rem"><div style="display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.15rem;margin-bottom:16px"><img class="logo" src="/logo-sentraedu.jpg" alt="SentraEdu" style="width:36px;height:36px;border-radius:11px;object-fit:cover"/> <span class="brand-name"><span style="color:var(--primary)">Sentra</span><span style="color:var(--accent)">Edu</span></span></div> <div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><h1 style="font-size:1.4rem;display:flex;align-items:center;gap:10px">`);
    Icon($$renderer2, { name: "lock", size: "lg", filled: true });
    $$renderer2.push(`<!----> Masuk</h1> <button type="button" class="top-btn" title="Ganti tema" aria-label="Ganti tema terang/gelap">`);
    Icon($$renderer2, {
      name: store_get($$store_subs ??= {}, "$themeStore", themeStore) === "dark" ? "light_mode" : "dark_mode",
      size: "md"
    });
    $$renderer2.push(`<!----></button></div> <p style="color:var(--muted-fg);font-size:.9rem;margin:6px 0 18px">Masuk menggunakan akun Anda, atau gunakan tombol login cepat sesuai peran.</p> <form novalidate=""><div class="field"><label for="login-email">Email</label> <div class="input-wrap"><input type="email" id="login-email" placeholder="nama@sentraedu.id" autocomplete="username"${attr("value", emailInput)} style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:10px;font-size:.92rem;background:var(--surface);color:var(--fg)"/></div></div> <div class="field"><label for="login-password">Password</label> <div class="input-wrap"><input type="password" id="login-password" placeholder="••••••••" autocomplete="current-password"${attr("value", passwordInput)} style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:10px;font-size:.92rem;background:var(--surface);color:var(--fg)"/></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <button type="submit" class="btn btn-primary" style="width:100%;padding:11px">`);
    Icon($$renderer2, { name: "login", size: "sm" });
    $$renderer2.push(`<!----> Masuk</button></form> <div style="display:flex;align-items:center;gap:12px;margin:20px 0 14px;color:var(--muted-fg);font-size:.78rem"><span style="flex:1;height:1px;background:var(--border)"></span> atau login cepat sebagai <span style="flex:1;height:1px;background:var(--border)"></span></div> <div class="persona-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><!--[-->`);
    const each_array = ensure_array_like(PERSONAS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let p = each_array[$$index];
      $$renderer2.push(`<button type="button" class="persona-btn" style="display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:12px;transition:all .12s;cursor:pointer"><span style="color:var(--primary);font-size:22px">`);
      Icon($$renderer2, { name: p.icon, size: "md", filled: true });
      $$renderer2.push(`<!----></span> <span style="font-weight:700;font-size:.88rem;color:var(--fg)">${escape_html(p.label)}</span> <span style="color:var(--muted-fg);font-size:.72rem">${escape_html(p.desc)}</span></button>`);
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
