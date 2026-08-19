import { f as fallback, h as bind_props, e as escape_html, c as attr_class } from "./index.js";
import { M as Modal } from "./modal.js";
import { I as Icon } from "./icon.js";
function Confirmation_dialog($$renderer, $$props) {
  let open = fallback($$props["open"], false);
  let title = fallback($$props["title"], "Konfirmasi");
  let message = fallback($$props["message"], "Apakah Anda yakin ingin melanjutkan tindakan ini?");
  let confirmText = fallback($$props["confirmText"], "Ya, Lanjutkan");
  let cancelText = fallback($$props["cancelText"], "Batal");
  let confirmVariant = fallback($$props["confirmVariant"], "danger");
  let icon = fallback($$props["icon"], "help");
  let onConfirm = fallback($$props["onConfirm"], () => {
  });
  let onCancel = fallback($$props["onCancel"], () => {
  });
  Modal($$renderer, {
    open,
    onClose: onCancel,
    title,
    icon,
    maxWidth: "460px",
    children: ($$renderer2) => {
      $$renderer2.push(`<p class="confirm-msg">${escape_html(message)}</p>`);
    },
    $$slots: {
      default: true,
      footer: ($$renderer2) => {
        {
          $$renderer2.push(`<button type="button" class="btn btn-outline">`);
          Icon($$renderer2, { name: "close", size: "sm" });
          $$renderer2.push(`<!----> ${escape_html(cancelText)}</button> <button type="button"${attr_class(`btn ${confirmVariant === "danger" ? "btn-danger" : "btn-primary"}`)}>`);
          Icon($$renderer2, { name: "check", size: "sm" });
          $$renderer2.push(`<!----> ${escape_html(confirmText)}</button>`);
        }
      }
    }
  });
  bind_props($$props, {
    open,
    title,
    message,
    confirmText,
    cancelText,
    confirmVariant,
    icon,
    onConfirm,
    onCancel
  });
}
export {
  Confirmation_dialog as C
};
