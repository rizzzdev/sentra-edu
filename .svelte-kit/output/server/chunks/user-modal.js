import { f as fallback, h as bind_props, e as escape_html, a as attr } from "./index.js";
import { M as Modal } from "./modal.js";
import { I as Icon } from "./icon.js";
import "./db-store.js";
import "./toast-store.js";
function User_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let open = fallback($$props["open"], false);
    let editingUser = fallback($$props["editingUser"], null);
    let onClose = fallback($$props["onClose"], () => {
    });
    let fullName = "";
    let email = "";
    let phone = "";
    let role = "TENTOR";
    let password = "";
    if (editingUser) {
      fullName = editingUser.fullName;
      email = editingUser.email;
      phone = editingUser.phone || "";
      role = editingUser.role;
      password = "";
    } else {
      fullName = "";
      email = "";
      phone = "";
      role = "TENTOR";
      password = "";
    }
    Modal($$renderer2, {
      open,
      onClose,
      title: editingUser ? "Ubah Pengguna" : "Tambah Pengguna",
      icon: "person_add",
      maxWidth: "500px",
      children: ($$renderer3) => {
        $$renderer3.push(`<form id="form-user"><div class="field"><label for="f_fullName">Nama Lengkap <i class="req">*</i></label> <input id="f_fullName" type="text" placeholder="Nama lengkap" required=""${attr("value", fullName)}/></div> <div class="field"><label for="f_email">Email (untuk login) <i class="req">*</i></label> <input id="f_email" type="email" placeholder="email@domain.com" required=""${attr("value", email)}/></div> <div class="field"><label for="f_phone">Telepon</label> <input id="f_phone" type="tel" placeholder="08xx-xxxx-xxxx"${attr("value", phone)}/></div> <div class="field"><label for="f_role">Peran <i class="req">*</i></label> `);
        $$renderer3.select({ id: "f_role", required: true, value: role }, ($$renderer4) => {
          $$renderer4.option({ value: "SUPER_ADMIN" }, ($$renderer5) => {
            $$renderer5.push(`SUPER_ADMIN`);
          });
          $$renderer4.option({ value: "TENTOR" }, ($$renderer5) => {
            $$renderer5.push(`TENTOR`);
          });
          $$renderer4.option({ value: "STUDENT" }, ($$renderer5) => {
            $$renderer5.push(`STUDENT`);
          });
          $$renderer4.option({ value: "WALI_MURID" }, ($$renderer5) => {
            $$renderer5.push(`WALI_MURID`);
          });
        });
        $$renderer3.push(`</div> <div class="field"><label for="f_password">${escape_html(editingUser ? "Password (kosongkan jika tidak diubah)" : "Password")} `);
        if (!editingUser) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<i class="req">*</i>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></label> <input id="f_password" type="password"${attr("placeholder", editingUser ? "Kosongkan jika tidak diubah" : "default: password123")}${attr("value", password)}/></div></form>`);
      },
      $$slots: {
        default: true,
        footer: ($$renderer3) => {
          {
            $$renderer3.push(`<button type="button" class="btn btn-outline">`);
            Icon($$renderer3, { name: "close", size: "sm" });
            $$renderer3.push(`<!----> Batal</button> <button type="submit" form="form-user" class="btn btn-primary">`);
            Icon($$renderer3, { name: "save", size: "sm" });
            $$renderer3.push(`<!----> ${escape_html(editingUser ? "Simpan Perubahan" : "Tambah Pengguna")}</button>`);
          }
        }
      }
    });
    bind_props($$props, { open, editingUser, onClose });
  });
}
export {
  User_modal as U
};
