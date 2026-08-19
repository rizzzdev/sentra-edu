import { f as fallback, j as attr_style, e as escape_html, i as slot, h as bind_props } from "./index.js";
import { I as Icon } from "./icon.js";
function Modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let computedStyle;
    let title = fallback($$props["title"], "");
    let icon = fallback($$props["icon"], "edit_note");
    let maxWidth = fallback($$props["maxWidth"], "560px");
    let open = fallback($$props["open"], true);
    let onClose = fallback($$props["onClose"], () => {
    });
    computedStyle = maxWidth.includes("px") ? `max-width: ${maxWidth}` : maxWidth.includes("max-w-") ? `max-width: ${maxWidth === "max-w-md" ? "480px" : maxWidth === "max-w-xl" ? "640px" : maxWidth === "max-w-2xl" ? "720px" : "560px"}` : `max-width: ${maxWidth}`;
    if (open) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="modal-overlay" role="presentation" tabindex="-1"><div class="modal"${attr_style(computedStyle)} role="dialog" aria-modal="true" tabindex="0"><div class="modal-head"><div class="modal-title">`);
      Icon($$renderer2, { name: icon, size: "md" });
      $$renderer2.push(`<!----> <span>${escape_html(title)}</span></div> <button type="button" class="modal-x" aria-label="Tutup jendela modal">`);
      Icon($$renderer2, { name: "close", size: "sm" });
      $$renderer2.push(`<!----></button></div> <div class="modal-body"><!--[-->`);
      slot($$renderer2, $$props, "default", {});
      $$renderer2.push(`<!--]--></div> <div class="modal-foot"><!--[-->`);
      slot($$renderer2, $$props, "footer", {});
      $$renderer2.push(`<!--]--></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { title, icon, maxWidth, open, onClose });
  });
}
export {
  Modal as M
};
