import { g as getContext, f as fallback, c as attr_class, d as stringify, e as escape_html, b as ensure_array_like, a as attr, h as bind_props, s as store_get, u as unsubscribe_stores, i as slot } from "../../../chunks/index.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { a as authStore } from "../../../chunks/auth-store.js";
import { I as Icon } from "../../../chunks/icon.js";
import { t as themeStore } from "../../../chunks/theme-store.js";
import { d as dbStore } from "../../../chunks/db-store.js";
import { t as toastStore } from "../../../chunks/toast-store.js";
const getStores = () => {
  const stores = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function Sidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let navList, initials;
    let currentUser = $$props["currentUser"];
    let currentPath = fallback($$props["currentPath"], "/dashboard");
    let mobileOpen = fallback($$props["mobileOpen"], false);
    let onCloseMobile = fallback($$props["onCloseMobile"], () => {
    });
    const roleNavMap = {
      SUPER_ADMIN: [
        {
          path: "/dashboard",
          label: "Dashboard",
          icon: "space_dashboard",
          group: "Beranda"
        },
        {
          path: "/jobs",
          label: "Lowongan Les",
          icon: "work",
          group: "Operasional"
        },
        {
          path: "/students",
          label: "Siswa",
          icon: "group",
          group: "Operasional"
        },
        {
          path: "/attendance",
          label: "Verifikasi Presensi",
          icon: "fact_check",
          group: "Operasional"
        },
        {
          path: "/payroll",
          label: "Klaim Gaji",
          icon: "payments",
          group: "Operasional"
        },
        {
          path: "/invoices",
          label: "Tagihan SPP",
          icon: "receipt_long",
          group: "Operasional"
        },
        {
          path: "/candidates",
          label: "Rekrutmen Tentor",
          icon: "badge",
          group: "SDM"
        },
        {
          path: "/subjects",
          label: "Mata Pelajaran",
          icon: "menu_book",
          group: "Master Data"
        },
        {
          path: "/levels",
          label: "Jenjang",
          icon: "school",
          group: "Master Data"
        },
        {
          path: "/packages",
          label: "Paket Les",
          icon: "sell",
          group: "Master Data"
        },
        {
          path: "/users",
          label: "Akun Pengguna",
          icon: "manage_accounts",
          group: "Master Data"
        },
        {
          path: "/analitik",
          label: "Analitik",
          icon: "monitoring",
          group: "Insight"
        },
        {
          path: "/laporan",
          label: "Laporan",
          icon: "summarize",
          group: "Insight"
        },
        {
          path: "/profile",
          label: "Profil Saya",
          icon: "person",
          group: "Akun"
        }
      ],
      TENTOR: [
        {
          path: "/dashboard",
          label: "Dashboard",
          icon: "space_dashboard",
          group: "Beranda"
        },
        {
          path: "/jobboard",
          label: "Cari Lowongan",
          icon: "search",
          group: "Pekerjaan"
        },
        {
          path: "/attendance",
          label: "Presensi Saya",
          icon: "location_on",
          group: "Pekerjaan"
        },
        {
          path: "/payroll",
          label: "Klaim Gaji",
          icon: "payments",
          group: "Pekerjaan"
        },
        {
          path: "/profile",
          label: "Profil Saya",
          icon: "person",
          group: "Akun"
        }
      ],
      STUDENT: [
        {
          path: "/dashboard",
          label: "Dashboard",
          icon: "space_dashboard",
          group: "Beranda"
        },
        {
          path: "/program",
          label: "Program Les Aktif",
          icon: "school",
          group: "Belajar"
        },
        {
          path: "/attendance",
          label: "Daftar Presensi",
          icon: "fact_check",
          group: "Belajar"
        },
        {
          path: "/reports",
          label: "Laporan Hasil Belajar",
          icon: "summarize",
          group: "Belajar"
        },
        {
          path: "/profile",
          label: "Profil Saya",
          icon: "person",
          group: "Akun"
        }
      ],
      WALI_MURID: [
        {
          path: "/dashboard",
          label: "Dashboard",
          icon: "space_dashboard",
          group: "Beranda"
        },
        {
          path: "/children",
          label: "Program Les Anak",
          icon: "school",
          group: "Monitoring Anak"
        },
        {
          path: "/attendance",
          label: "Presensi Anak",
          icon: "fact_check",
          group: "Monitoring Anak"
        },
        {
          path: "/reports",
          label: "Laporan Hasil Belajar",
          icon: "summarize",
          group: "Monitoring Anak"
        },
        {
          path: "/invoices",
          label: "Tagihan SPP",
          icon: "receipt_long",
          group: "Keuangan"
        },
        {
          path: "/profile",
          label: "Profil Saya",
          icon: "person",
          group: "Akun"
        }
      ]
    };
    const roleBadgeMap = {
      SUPER_ADMIN: {
        label: "Super Admin",
        badgeClass: "b-admin",
        icon: "admin_panel_settings"
      },
      TENTOR: { label: "Tentor", badgeClass: "b-tentor", icon: "school" },
      STUDENT: { label: "Siswa", badgeClass: "b-student", icon: "school" },
      WALI_MURID: {
        label: "Wali Murid",
        badgeClass: "b-neutral",
        icon: "family_restroom"
      }
    };
    navList = roleNavMap[currentUser.role] || roleNavMap.STUDENT;
    initials = currentUser.fullName.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "U";
    $$renderer2.push(`<aside${attr_class(`sidebar ${mobileOpen ? "open" : ""}`)}><div class="side-brand"><div class="side-brand-top"><img class="logo" src="/logo-sentraedu.jpg" alt="SentraEdu" style="width:36px;height:36px;border-radius:11px;object-fit:cover"/> <span class="brand-name"><span style="color:var(--primary)">Sentra</span><span style="color:var(--accent)">Edu</span></span></div> <div class="side-role"><span${attr_class(`badge ${stringify(roleBadgeMap[currentUser.role].badgeClass)}`)}>`);
    Icon($$renderer2, { name: roleBadgeMap[currentUser.role].icon, size: "xs" });
    $$renderer2.push(`<!----> ${escape_html(roleBadgeMap[currentUser.role].label)}</span></div></div> <nav class="side-nav"><div class="nav-label">Menu</div> <!--[-->`);
    const each_array = ensure_array_like(navList);
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let item = each_array[index];
      if (item.group && (index === 0 || navList[index - 1].group !== item.group)) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="nav-group-label">${escape_html(item.group)}</div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <a${attr("href", item.path)}${attr_class(`nav-item ${currentPath === item.path ? "active" : ""}`)}>`);
      Icon($$renderer2, { name: item.icon, size: "md" });
      $$renderer2.push(`<!----> <span>${escape_html(item.label)}</span></a>`);
    }
    $$renderer2.push(`<!--]--></nav> <div class="side-foot"><div class="side-user"><div class="avatar">${escape_html(initials)}</div> <div><div class="u-name">${escape_html(currentUser.fullName)}</div> <div class="u-mail">${escape_html(currentUser.email)}</div></div></div> <button type="button" class="btn-logout">`);
    Icon($$renderer2, { name: "logout", size: "sm" });
    $$renderer2.push(`<!----> <span>Keluar</span></button></div></aside>`);
    bind_props($$props, { currentUser, currentPath, mobileOpen, onCloseMobile });
  });
}
function Navbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let unreadCount;
    let currentUser = $$props["currentUser"];
    let title = fallback($$props["title"], "Dashboard");
    let onToggleMobileMenu = fallback($$props["onToggleMobileMenu"], () => {
    });
    let onOpenNotifications = fallback($$props["onOpenNotifications"], () => {
    });
    const roleDisplayNames = {
      SUPER_ADMIN: "Super Admin",
      TENTOR: "Tentor",
      STUDENT: "Siswa",
      WALI_MURID: "Wali Murid"
    };
    unreadCount = (store_get($$store_subs ??= {}, "$dbStore", dbStore).notifications || []).filter((item) => item.userId === currentUser.id && !item.read).length;
    $$renderer2.push(`<header class="topbar"><div><div class="crumb">${escape_html(roleDisplayNames[currentUser.role] || currentUser.role)}</div> <h2>${escape_html(title)}</h2></div> <div class="spacer"></div> <button type="button" class="top-btn" title="Notifikasi" aria-label="Notifikasi">`);
    Icon($$renderer2, { name: "notifications", size: "md" });
    $$renderer2.push(`<!----> `);
    if (unreadCount > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="notif-dot">${escape_html(unreadCount > 9 ? "9+" : unreadCount)}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></button> <button type="button" class="top-btn" title="Ganti tema" aria-label="Ganti tema terang/gelap">`);
    Icon($$renderer2, {
      name: store_get($$store_subs ??= {}, "$themeStore", themeStore) === "dark" ? "light_mode" : "dark_mode",
      size: "md"
    });
    $$renderer2.push(`<!----></button> <button type="button" class="burger" aria-label="Buka menu">`);
    Icon($$renderer2, { name: "menu", size: "md" });
    $$renderer2.push(`<!----></button></header>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { currentUser, title, onToggleMobileMenu, onOpenNotifications });
  });
}
function Notification_dropdown($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let userNotifications, unreadCount;
    let open = fallback($$props["open"], false);
    let currentUser = $$props["currentUser"];
    let onClose = fallback($$props["onClose"], () => {
    });
    function timeAgo(dateString) {
      const diff = (Date.now() - new Date(dateString).getTime()) / 1e3;
      if (diff < 60) return "baru saja";
      if (diff < 3600) return Math.floor(diff / 60) + "m lalu";
      if (diff < 86400) return Math.floor(diff / 3600) + "j lalu";
      return Math.floor(diff / 86400) + "h lalu";
    }
    userNotifications = (store_get($$store_subs ??= {}, "$dbStore", dbStore).notifications || []).filter((notif) => notif.userId === currentUser.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    unreadCount = userNotifications.filter((n) => !n.read).length;
    if (open) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="modal-overlay" role="presentation" tabindex="-1"><div class="modal" style="width:460px;max-width:95vw" role="dialog" aria-modal="true" tabindex="0"><div class="modal-head"><div class="modal-title">`);
      Icon($$renderer2, { name: "notifications", size: "md" });
      $$renderer2.push(`<!----> <span>Notifikasi</span></div> <button type="button" class="modal-x" aria-label="Tutup">`);
      Icon($$renderer2, { name: "close", size: "sm" });
      $$renderer2.push(`<!----></button></div> <div class="modal-body" style="padding:0"><div class="notif-list">`);
      if (userNotifications.length === 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="notif-empty">`);
        Icon($$renderer2, { name: "notifications_off", size: "lg" });
        $$renderer2.push(`<!----> <div>Belum ada notifikasi.</div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<!--[-->`);
        const each_array = ensure_array_like(userNotifications);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let n = each_array[$$index];
          $$renderer2.push(`<button type="button"${attr_class(`notif-item ${n.read ? "read" : "unread"}`)}><span class="n-ico">`);
          Icon($$renderer2, { name: n.icon || "notifications", size: "md" });
          $$renderer2.push(`<!----></span> <span style="flex:1;min-width:0"><span class="n-title">${escape_html(n.title)}</span> <div class="n-msg">${escape_html(n.message)}</div> <div class="n-time">`);
          Icon($$renderer2, { name: "schedule", size: "xs" });
          $$renderer2.push(`<!----> ${escape_html(timeAgo(n.createdAt))}</div></span> <span class="n-dot-rd"></span></button>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div></div> <div class="modal-foot"><button type="button" class="btn btn-outline">`);
      Icon($$renderer2, { name: "close", size: "sm" });
      $$renderer2.push(`<!----> Tutup</button> `);
      if (unreadCount > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<button type="button" class="btn btn-soft">`);
        Icon($$renderer2, { name: "done_all", size: "sm" });
        $$renderer2.push(`<!----> Tandai Semua Dibaca (${escape_html(unreadCount)})</button>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { open, currentUser, onClose });
  });
}
function Toast_container($$renderer) {
  var $$store_subs;
  const iconMap = {
    success: "check_circle",
    error: "error",
    warning: "warning",
    info: "info"
  };
  $$renderer.push(`<div id="toasts"><!--[-->`);
  const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$toastStore", toastStore));
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let toast = each_array[$$index];
    $$renderer.push(`<div${attr_class(`toast ${stringify(toast.type)}`)}>`);
    Icon($$renderer, { name: iconMap[toast.type] || "info", size: "md" });
    $$renderer.push(`<!----> <span>${escape_html(toast.message)}</span></div>`);
  }
  $$renderer.push(`<!--]--></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
}
function Dashboard_layout_template($$renderer, $$props) {
  let currentUser = $$props["currentUser"];
  let currentPath = fallback($$props["currentPath"], "/dashboard");
  let pageTitle = fallback($$props["pageTitle"], "Dashboard");
  let mobileSidebarOpen = false;
  let notificationsOpen = false;
  $$renderer.push(`<div class="app">`);
  Sidebar($$renderer, {
    currentUser,
    currentPath,
    mobileOpen: mobileSidebarOpen,
    onCloseMobile: () => {
      mobileSidebarOpen = false;
    }
  });
  $$renderer.push(`<!----> <div class="main">`);
  Navbar($$renderer, {
    currentUser,
    title: pageTitle,
    onToggleMobileMenu: () => {
      mobileSidebarOpen = !mobileSidebarOpen;
    },
    onOpenNotifications: () => {
      notificationsOpen = true;
    }
  });
  $$renderer.push(`<!----> <main class="content"><!--[-->`);
  slot($$renderer, $$props, "default", {});
  $$renderer.push(`<!--]--></main></div> <div${attr_class(`backdrop ${mobileSidebarOpen ? "show" : ""}`)} aria-hidden="true"></div> `);
  Notification_dropdown($$renderer, {
    open: notificationsOpen,
    currentUser,
    onClose: () => {
      notificationsOpen = false;
    }
  });
  $$renderer.push(`<!----> `);
  Toast_container($$renderer);
  $$renderer.push(`<!----></div>`);
  bind_props($$props, { currentUser, currentPath, pageTitle });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let currentPath, currentPageTitle;
    const pageTitleMap = {
      "/dashboard": "Dashboard Ikhtisar",
      "/jobs": "Lowongan Les Privat",
      "/students": "Data Siswa & Pendaftaran",
      "/attendance": "Presensi & Laporan Materi",
      "/payroll": "Klaim & Pembayaran Honor Tentor",
      "/invoices": "Tagihan SPP & Pembayaran",
      "/candidates": "Rekrutmen & Seleksi Tentor",
      "/subjects": "Data Master Mata Pelajaran",
      "/levels": "Data Master Jenjang & Kelas",
      "/packages": "Data Master Paket Les",
      "/users": "Manajemen Akun Pengguna",
      "/analitik": "Analitik Operasional & Finansial",
      "/laporan": "Laporan & Ekspor Data",
      "/profile": "Profil Akun Pengguna",
      "/jobboard": "Bursa Lowongan Mengajar",
      "/program": "Program Les & Jadwal Belajar",
      "/children": "Program Les Anak"
    };
    currentPath = store_get($$store_subs ??= {}, "$page", page).url.pathname;
    currentPageTitle = pageTitleMap[currentPath] || "SentraEdu";
    if (store_get($$store_subs ??= {}, "$authStore", authStore)) {
      $$renderer2.push("<!--[0-->");
      Dashboard_layout_template($$renderer2, {
        currentUser: store_get($$store_subs ??= {}, "$authStore", authStore),
        currentPath,
        pageTitle: currentPageTitle,
        children: ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          slot($$renderer3, $$props, "default", {});
          $$renderer3.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg)"><span style="font-size:.88rem;color:var(--muted-fg)">Mengalihkan ke halaman masuk...</span></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
