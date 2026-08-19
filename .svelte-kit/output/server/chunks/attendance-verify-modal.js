import { f as fallback, s as store_get, u as unsubscribe_stores, h as bind_props, e as escape_html, c as attr_class } from "./index.js";
import { M as Modal } from "./modal.js";
import { I as Icon } from "./icon.js";
import { d as dbStore } from "./db-store.js";
import "./toast-store.js";
import { f as formatCurrencyIDR } from "./formatting.js";
function Attendance_verify_modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let enrollment, student, tentor, subject, cls, pkg;
    let open = fallback($$props["open"], false);
    let attendance = fallback($$props["attendance"], null);
    let onClose = fallback($$props["onClose"], () => {
    });
    enrollment = attendance ? store_get($$store_subs ??= {}, "$dbStore", dbStore).enrollments.find((e) => e.id === attendance?.enrollmentId) : null;
    student = enrollment ? store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === enrollment?.studentId) : null;
    tentor = attendance ? store_get($$store_subs ??= {}, "$dbStore", dbStore).users.find((u) => u.id === attendance?.tentorId) : null;
    subject = enrollment ? store_get($$store_subs ??= {}, "$dbStore", dbStore).subjects.find((s) => s.id === enrollment?.subjectId) : null;
    cls = enrollment ? store_get($$store_subs ??= {}, "$dbStore", dbStore).classes.find((c) => c.id === enrollment?.classId) : null;
    pkg = enrollment ? store_get($$store_subs ??= {}, "$dbStore", dbStore).packages.find((p) => p.id === enrollment?.packageId) : null;
    {
      $$renderer2.push("<!--[0-->");
      Modal($$renderer2, {
        open,
        onClose,
        title: "Detail Presensi",
        icon: "fact_check",
        maxWidth: "560px",
        children: ($$renderer3) => {
          if (attendance) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="kv"><dt>Tanggal</dt> <dd>${escape_html(attendance.sessionDate)}</dd> <dt>Lowongan / Mapel</dt> <dd>${escape_html(subject?.name || "—")} (${escape_html(cls?.className || "—")})</dd> <dt>Tentor</dt> <dd>${escape_html(tentor?.fullName || "—")}</dd> <dt>Siswa</dt> <dd>${escape_html(student?.fullName || "—")}</dd> <dt>Mode Les</dt> <dd><span class="badge b-available">OFFLINE</span></dd> <dt>Durasi</dt> <dd>90 menit</dd> <dt>Jumlah Sesi</dt> <dd>1 sesi (90 menit/sesi)</dd> <dt>Estimasi Fee Sesi</dt> <dd>${escape_html(formatCurrencyIDR(pkg?.tentorFee || 1e5))}</dd> <dt>Topik Materi</dt> <dd>${escape_html(attendance.topic)}</dd> <dt>Catatan</dt> <dd>${escape_html(attendance.studentNotes || "—")}</dd> <dt>Koordinat Check-in</dt> <dd>${escape_html(attendance.latitudeCheckIn ?? "—")}, ${escape_html(attendance.longitudeCheckIn ?? "—")}</dd> <dt>Status Radius</dt> <dd>`);
            if (attendance.isRadiusValid) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<span class="gps-pill gps-ok">`);
              Icon($$renderer3, { name: "verified", size: "xs" });
              $$renderer3.push(`<!----> dalam radius</span>`);
            } else {
              $$renderer3.push("<!--[-1-->");
              $$renderer3.push(`<span class="gps-pill gps-warn">`);
              Icon($$renderer3, { name: "warning", size: "xs" });
              $$renderer3.push(`<!----> di luar radius 200m</span>`);
            }
            $$renderer3.push(`<!--]--></dd> <dt>Status</dt> <dd><span${attr_class(`badge ${attendance.status === "APPROVED" ? "b-approved" : attendance.status === "REJECTED" ? "b-rejected" : "b-submitted"}`)}>${escape_html(attendance.status)}</span></dd></div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]-->`);
        },
        $$slots: {
          default: true,
          footer: ($$renderer3) => {
            {
              if (attendance?.status === "SUBMITTED") {
                $$renderer3.push("<!--[0-->");
                $$renderer3.push(`<button type="button" class="btn btn-danger">`);
                Icon($$renderer3, { name: "close", size: "sm" });
                $$renderer3.push(`<!----> Tolak</button> <button type="button" class="btn btn-primary">`);
                Icon($$renderer3, { name: "check", size: "sm" });
                $$renderer3.push(`<!----> Setujui</button>`);
              } else {
                $$renderer3.push("<!--[-1-->");
                $$renderer3.push(`<button type="button" class="btn btn-outline">`);
                Icon($$renderer3, { name: "close", size: "sm" });
                $$renderer3.push(`<!----> Tutup</button>`);
              }
              $$renderer3.push(`<!--]-->`);
            }
          }
        }
      });
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { open, attendance, onClose });
  });
}
export {
  Attendance_verify_modal as A
};
