import "clsx";
import "../../chunks/auth-store.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import "../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="flex items-center justify-center min-h-screen bg-[var(--color-bg)]"><div class="animate-pulse flex flex-col items-center gap-3"><img src="/logo-sentraedu.jpg" alt="SentraEdu" class="w-12 h-12 rounded-[var(--radius-sm)] shadow-md"/> <span class="text-sm font-semibold text-[var(--color-fg-muted)]">Memuat SentraEdu...</span></div></div>`);
  });
}
export {
  _page as default
};
