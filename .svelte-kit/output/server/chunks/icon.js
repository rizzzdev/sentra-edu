import { f as fallback, c as attr_class, e as escape_html, h as bind_props, d as stringify } from "./index.js";
function Icon($$renderer, $$props) {
  let name = $$props["name"];
  let size = fallback($$props["size"], "md");
  let filled = fallback($$props["filled"], false);
  let className = fallback($$props["className"], "");
  const sizeClassMap = {
    xs: "text-[16px]",
    // 16px (4px multiple)
    sm: "text-[18px]",
    md: "text-[20px]",
    // 20px (4px multiple)
    lg: "text-[24px]",
    // 24px (4px multiple)
    xl: "text-[32px]"
    // 32px (4px multiple)
  };
  $$renderer.push(`<span${attr_class(`mat select-none align-middle ${filled ? "filled" : ""} ${stringify(sizeClassMap[size] || "text-[20px]")} ${stringify(className)}`)} aria-hidden="true">${escape_html(name)}</span>`);
  bind_props($$props, { name, size, filled, className });
}
export {
  Icon as I
};
