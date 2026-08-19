/* ============================================================
   SentraEdu — Prototype (localStorage sebagai database)
   Semua logika bisnis ada di objek `Biz` (murni, tanpa DOM)
   sehingga bisa diuji lewat Node. UI memanggil Biz lalu re-render.
   ============================================================ */
const DB_KEY = "bms_db_v13";
const SESSION_KEY = "bms_session_v9";
const THEME_KEY = "bms_theme";

/* ---------- TEMA (light / dark) ---------- */
function getTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}
function applyTheme() {
  document.documentElement.dataset.theme = getTheme();
  document.querySelectorAll("[data-theme-icon]").forEach(function (el) {
    const name = getTheme() === "dark" ? "light_mode" : "dark_mode";
    const span = el.querySelector(".mat");
    if (span) span.textContent = name;
    else el.textContent = name;
  });
}
function toggleTheme() {
  localStorage.setItem(THEME_KEY, getTheme() === "dark" ? "light" : "dark");
  applyTheme();
}
function themeBtnHTML() {
  return (
    '<button class="top-btn" data-action="theme-toggle" data-theme-icon title="Ganti tema" aria-label="Ganti tema terang/gelap">' +
    ic(getTheme() === "dark" ? "light_mode" : "dark_mode") +
    "</button>"
  );
}

const ROLE_LABEL = {
  SUPER_ADMIN: "Super Admin",
  TENTOR: "Tentor",
  STUDENT: "Siswa",
  WALI_MURID: "Wali Murid",
};

/* ============================================================
   SEED DATA v2 — data koheren agar semua peran bisa disimulasi
   ============================================================ */
function buildSeed() {
  const db = {
    version: 13,
    seededAt: "2026-08-17",
    educationLevels: [
      {
        id: "lv-tk",
        levelName: "TK",
        description: "Calistung & kecerdasan dasar",
      },
      { id: "lv-sd", levelName: "SD", description: "Pendampingan belajar SD" },
      {
        id: "lv-smp",
        levelName: "SMP",
        description: "Persiapan ujian & masuk SMA",
      },
      { id: "lv-sma", levelName: "SMA", description: "Persiapan UTBK / PTN" },
      {
        id: "lv-khs",
        levelName: "ALUMNI/KHUSUS",
        description: "Mahasiswa & kursus khusus",
      },
    ],
    classes: [
      {
        id: "cl-tk-a",
        className: "TK A",
        educationLevelId: "lv-tk",
        baseRatePer90Min: 100000,
        description: "Kelompok A (usia 4-5 tahun)",
      },
      {
        id: "cl-tk-b",
        className: "TK B",
        educationLevelId: "lv-tk",
        baseRatePer90Min: 100000,
        description: "Kelompok B (usia 5-6 tahun)",
      },
      {
        id: "cl-sd-1",
        className: "Kelas 1 SD",
        educationLevelId: "lv-sd",
        baseRatePer90Min: 110000,
        description: "",
      },
      {
        id: "cl-sd-2",
        className: "Kelas 2 SD",
        educationLevelId: "lv-sd",
        baseRatePer90Min: 110000,
        description: "",
      },
      {
        id: "cl-sd-3",
        className: "Kelas 3 SD",
        educationLevelId: "lv-sd",
        baseRatePer90Min: 110000,
        description: "",
      },
      {
        id: "cl-sd-4",
        className: "Kelas 4 SD",
        educationLevelId: "lv-sd",
        baseRatePer90Min: 110000,
        description: "",
      },
      {
        id: "cl-sd-5",
        className: "Kelas 5 SD",
        educationLevelId: "lv-sd",
        baseRatePer90Min: 110000,
        description: "",
      },
      {
        id: "cl-sd-6",
        className: "Kelas 6 SD",
        educationLevelId: "lv-sd",
        baseRatePer90Min: 110000,
        description: "Persiapan ujian akhir SD",
      },
      {
        id: "cl-smp-7",
        className: "Kelas 7 SMP",
        educationLevelId: "lv-smp",
        baseRatePer90Min: 125000,
        description: "",
      },
      {
        id: "cl-smp-8",
        className: "Kelas 8 SMP",
        educationLevelId: "lv-smp",
        baseRatePer90Min: 125000,
        description: "",
      },
      {
        id: "cl-smp-9",
        className: "Kelas 9 SMP",
        educationLevelId: "lv-smp",
        baseRatePer90Min: 125000,
        description: "Persiapan ujian & masuk SMA",
      },
      {
        id: "cl-sma-10",
        className: "Kelas 10 SMA",
        educationLevelId: "lv-sma",
        baseRatePer90Min: 140000,
        description: "",
      },
      {
        id: "cl-sma-11",
        className: "Kelas 11 SMA",
        educationLevelId: "lv-sma",
        baseRatePer90Min: 145000,
        description: "",
      },
      {
        id: "cl-sma-12",
        className: "Kelas 12 SMA",
        educationLevelId: "lv-sma",
        baseRatePer90Min: 150000,
        description: "Persiapan UTBK / ujian akhir",
      },
      {
        id: "cl-umum",
        className: "Kelas Umum",
        educationLevelId: "lv-khs",
        baseRatePer90Min: 175000,
        description: "Kursus khusus / alumni",
      },
    ],
    subjects: [
      {
        id: "sj-mtk",
        name: "Matematika",
        description: "Matematika dasar hingga lanjutan",
      },
      {
        id: "sj-ing",
        name: "Bahasa Inggris",
        description: "Grammar, speaking & TOEFL",
      },
      { id: "sj-fis", name: "Fisika", description: "Fisika SMP / SMA" },
      { id: "sj-kim", name: "Kimia", description: "Kimia SMA" },
      { id: "sj-bio", name: "Biologi", description: "Biologi SMA" },
      {
        id: "sj-bindo",
        name: "Bahasa Indonesia",
        description: "Bahasa Indonesia & sastra",
      },
    ],
    packages: [
      {
        id: "pkg-bulanan-private",
        name: "Paket Bulanan Private",
        mode: "PRIVATE",
        period: "BULANAN",
        price: 1600000,
        sessionsPerPeriod: 8,
        maxStudents: 1,
        tentorFee: 150000,
        description: "Les privat 1 guru 1 siswa, 8 pertemuan per bulan (90 menit/sesi).",
        active: true,
      },
      {
        id: "pkg-bulanan-kelompok",
        name: "Paket Bulanan Kelompok",
        mode: "KELOMPOK",
        period: "BULANAN",
        price: 900000,
        sessionsPerPeriod: 8,
        maxStudents: 5,
        tentorFee: 60000,
        description: "Les kelompok kecil (maks 5 siswa), 8 pertemuan per bulan (90 menit/sesi).",
        active: true,
      },
      {
        id: "pkg-harian-private",
        name: "Paket Harian Private",
        mode: "PRIVATE",
        period: "HARIAN",
        price: 175000,
        sessionsPerPeriod: 1,
        maxStudents: 1,
        tentorFee: 125000,
        description: "Les privat sekali pertemuan (90 menit) — bayar per sesi.",
        active: true,
      },
      {
        id: "pkg-harian-kelompok",
        name: "Paket Harian Kelompok",
        mode: "KELOMPOK",
        period: "HARIAN",
        price: 100000,
        sessionsPerPeriod: 1,
        maxStudents: 5,
        tentorFee: 60000,
        description: "Les kelompok sekali pertemuan (90 menit) — bayar per sesi per siswa.",
        active: true,
      },
      {
        id: "pkg-intensif-bulanan",
        name: "Paket Intensif UTBK Private (Bulanan)",
        mode: "PRIVATE",
        period: "BULANAN",
        price: 2400000,
        sessionsPerPeriod: 12,
        maxStudents: 1,
        tentorFee: 180000,
        description: "Intensif persiapan UTBK, 12 pertemuan per bulan (90 menit/sesi).",
        active: true,
      },
      {
        id: "pkg-intensif-harian",
        name: "Paket Intensif Harian Private (180 menit)",
        mode: "PRIVATE",
        period: "HARIAN",
        price: 350000,
        sessionsPerPeriod: 1,
        maxStudents: 1,
        tentorFee: 250000,
        description: "Sesi intensif 180 menit sekali pertemuan — bayar per sesi.",
        active: true,
      },
    ],
    users: [
      {
        id: "u-admin",
        email: "admin@sentraedu.id",
        password: "admin123",
        fullName: "Admin Pusat",
        phone: "0812-0000-0001",
        role: "SUPER_ADMIN",
        position: "Manajer Operasional Pusat",
      },
      {
        id: "u-tentor-andi",
        email: "tentor.andi@sentraedu.id",
        password: "tentor123",
        fullName: "Andi Pratama",
        phone: "0812-0000-0004",
        role: "TENTOR",
        education: "S1 Fisika",
        experienceYears: 2,
        subjectIds: ["sj-fis", "sj-mtk"],
        levelIds: ["lv-sma", "lv-smp"],
      },
      {
        id: "u-tentor-dewi",
        email: "tentor.dewi@sentraedu.id",
        password: "tentor123",
        fullName: "Dewi Lestari",
        phone: "0812-0000-0005",
        role: "TENTOR",
        education: "S1 Biologi",
        experienceYears: 3,
        subjectIds: ["sj-bio"],
        levelIds: ["lv-sma"],
      },
      {
        id: "u-tentor-bagas",
        email: "tentor.bagas@sentraedu.id",
        password: "tentor123",
        fullName: "Bagas Saputra",
        phone: "0812-0000-0012",
        role: "TENTOR",
        education: "S1 Matematika",
        experienceYears: 2,
        subjectIds: ["sj-mtk"],
        levelIds: ["lv-smp"],
      },
      {
        id: "u-tentor-citra",
        email: "tentor.citra@sentraedu.id",
        password: "tentor123",
        fullName: "Citra Dewi",
        phone: "0812-0000-0014",
        role: "TENTOR",
        education: "S1 Pendidikan Bahasa Inggris",
        experienceYears: 4,
        subjectIds: ["sj-ing", "sj-mtk"],
        levelIds: ["lv-smp", "lv-sma"],
      },
      {
        id: "u-tentor-eka",
        email: "tentor.eka@sentraedu.id",
        password: "tentor123",
        fullName: "Eka Putri",
        phone: "0812-0000-0015",
        role: "TENTOR",
        education: "S1 Fisika",
        experienceYears: 5,
        subjectIds: ["sj-fis", "sj-kim"],
        levelIds: ["lv-sma"],
      },
      {
        id: "u-tentor-fikri",
        email: "tentor.fikri@sentraedu.id",
        password: "tentor123",
        fullName: "Fikri Ramadhan",
        phone: "0812-0000-0016",
        role: "TENTOR",
        education: "S1 Matematika",
        experienceYears: 3,
        subjectIds: ["sj-mtk", "sj-bindo"],
        levelIds: ["lv-sd", "lv-smp"],
      },
      {
        id: "u-student-raka",
        email: "wali.raka@sentraedu.id",
        password: "siswa123",
        fullName: "Raka Pratama",
        phone: "0812-0000-0006",
        role: "WALI_MURID",
        school: "SMA Negeri 1 Jakarta",
      },
      {
        id: "u-student-ayu",
        email: "wali.ayu@sentraedu.id",
        password: "siswa123",
        fullName: "Ayu Lestari",
        phone: "0812-0000-0007",
        role: "WALI_MURID",
        school: "SMP Negeri 3 Bandung",
      },
      {
        id: "u-student-dika",
        email: "wali.dika@sentraedu.id",
        password: "siswa123",
        fullName: "Dika Firmansyah",
        phone: "0812-0000-0008",
        role: "WALI_MURID",
        school: "SDN Manyar 1 Surabaya",
      },
      {
        id: "u-student-sari",
        email: "wali.sari@sentraedu.id",
        password: "siswa123",
        fullName: "Sari Wulandari",
        phone: "0812-0000-0009",
        role: "WALI_MURID",
        school: "SMA Negeri 2 Surabaya",
      },
      {
        id: "u-student-putra",
        email: "wali.putra@sentraedu.id",
        password: "siswa123",
        fullName: "Putra Nugroho",
        phone: "0812-0000-0010",
        role: "WALI_MURID",
        school: "SMA Cendekia Surabaya",
      },
      {
        id: "u-student-nina",
        email: "wali.nina@sentraedu.id",
        password: "siswa123",
        fullName: "Nina Safitri",
        phone: "0812-0000-0017",
        role: "WALI_MURID",
        school: "SMPN 8 Bandung",
      },
      {
        id: "u-student-rizki",
        email: "wali.rizki@sentraedu.id",
        password: "siswa123",
        fullName: "Rizki Maulana",
        phone: "0812-0000-0018",
        role: "WALI_MURID",
        school: "SMAN 3 Jakarta",
      },
      {
        id: "u-student-amel",
        email: "wali.amel@sentraedu.id",
        password: "siswa123",
        fullName: "Amelia Putri",
        phone: "0812-0000-0019",
        role: "WALI_MURID",
        school: "SDN 2 Surabaya",
      },
      {
        id: "u-student-bima",
        email: "wali.bima@sentraedu.id",
        password: "siswa123",
        fullName: "Bima Aditya",
        phone: "0812-0000-0020",
        role: "WALI_MURID",
        school: "SMAN 5 Jakarta",
      },
      {
        id: "u-student-tasya",
        email: "wali.tasya@sentraedu.id",
        password: "siswa123",
        fullName: "Tasya Kamila",
        phone: "0812-0000-0021",
        role: "WALI_MURID",
        school: "SMAN 4 Bandung",
      },
      {
        id: "u-student-farhan",
        email: "wali.farhan@sentraedu.id",
        password: "siswa123",
        fullName: "Farhan Hakim",
        phone: "0812-0000-0022",
        role: "WALI_MURID",
        school: "SMA Labschool Jakarta",
      },
      {
        id: "u-student-dinda",
        email: "wali.dinda@sentraedu.id",
        password: "siswa123",
        fullName: "Dinda Puspita",
        phone: "0812-0000-0023",
        role: "WALI_MURID",
        school: "SMPN 12 Jakarta",
      },
      {
        id: "u-student-aldo",
        email: "wali.aldo@sentraedu.id",
        password: "siswa123",
        fullName: "Aldo Saputra",
        phone: "0812-0000-0024",
        role: "WALI_MURID",
        school: "SDN Dago 2 Bandung",
      },
      {
        id: "u-student-gita",
        email: "wali.gita@sentraedu.id",
        password: "siswa123",
        fullName: "Gita Anjani",
        phone: "0812-0000-0025",
        role: "WALI_MURID",
        school: "SMPN 5 Bandung",
      },
      {
        id: "u-student-rangga",
        email: "wali.rangga@sentraedu.id",
        password: "siswa123",
        fullName: "Rangga Mahesa",
        phone: "0812-0000-0026",
        role: "WALI_MURID",
        school: "SMAN 1 Surabaya",
      },
      {
        id: "u-student-lala",
        email: "wali.lala@sentraedu.id",
        password: "siswa123",
        fullName: "Lala Nurhaliza",
        phone: "0812-0000-0027",
        role: "WALI_MURID",
        school: "SDN Rawamangun 01",
      },
      {
        id: "u-student-irfan",
        email: "wali.irfan@sentraedu.id",
        password: "siswa123",
        fullName: "Irfan Fauzi",
        phone: "0812-0000-0028",
        role: "WALI_MURID",
        school: "SMAN 2 Bandung",
      },
      {
        id: "u-student-maya",
        email: "wali.maya@sentraedu.id",
        password: "siswa123",
        fullName: "Maya Kirana",
        phone: "0812-0000-0029",
        role: "WALI_MURID",
        school: "SMPN 1 Surabaya",
      },
      {
        id: "u-student-kevin",
        email: "wali.kevin@sentraedu.id",
        password: "siswa123",
        fullName: "Kevin Adrian",
        phone: "0812-0000-0030",
        role: "WALI_MURID",
        school: "SMA Cakra Buana Jakarta",
      },
      {
        id: "u-student-zahra",
        email: "wali.zahra@sentraedu.id",
        password: "siswa123",
        fullName: "Zahra Aulia",
        phone: "0812-0000-0031",
        role: "WALI_MURID",
        school: "SDN Kertajaya 5 Surabaya",
      },
      {
        id: "u-student-rani",
        email: "wali.rani@sentraedu.id",
        password: "siswa123",
        fullName: "Rani Anggraini",
        phone: "0812-0000-0032",
        role: "WALI_MURID",
        school: "SMAN 5 Surabaya",
      },
      {
        id: "u-student-hafiz",
        email: "wali.hafiz@sentraedu.id",
        password: "siswa123",
        fullName: "Hafiz Ramadhan",
        phone: "0812-0000-0033",
        role: "WALI_MURID",
        school: "SMPN 3 Jakarta",
      },
      {
        id: "u-siswa-raka",
        email: "raka@sentraedu.id",
        password: "siswa123",
        fullName: "Raka Pratama",
        phone: "0812-0000-1001",
        role: "STUDENT",
        school: "SMA Negeri 1 Jakarta",
        waliId: "u-student-raka",
      },
      {
        id: "u-siswa-ayu",
        email: "ayu@sentraedu.id",
        password: "siswa123",
        fullName: "Ayu Lestari",
        phone: "0812-0000-1002",
        role: "STUDENT",
        school: "SMP Negeri 3 Bandung",
        waliId: "u-student-ayu",
      },
      {
        id: "u-siswa-dika",
        email: "dika@sentraedu.id",
        password: "siswa123",
        fullName: "Dika Firmansyah",
        phone: "0812-0000-1003",
        role: "STUDENT",
        school: "SDN Manyar 1 Surabaya",
        waliId: "u-student-dika",
      },
      {
        id: "u-siswa-sari",
        email: "sari@sentraedu.id",
        password: "siswa123",
        fullName: "Sari Wulandari",
        phone: "0812-0000-1004",
        role: "STUDENT",
        school: "SMA Negeri 2 Surabaya",
        waliId: "u-student-sari",
      },
      {
        id: "u-siswa-putra",
        email: "putra@sentraedu.id",
        password: "siswa123",
        fullName: "Putra Nugroho",
        phone: "0812-0000-1005",
        role: "STUDENT",
        school: "SMA Cendekia Surabaya",
        waliId: "u-student-putra",
      },
      {
        id: "u-siswa-nina",
        email: "nina@sentraedu.id",
        password: "siswa123",
        fullName: "Nina Safitri",
        phone: "0812-0000-1006",
        role: "STUDENT",
        school: "SMPN 8 Bandung",
        waliId: "u-student-nina",
      },
      {
        id: "u-siswa-rizki",
        email: "rizki@sentraedu.id",
        password: "siswa123",
        fullName: "Rizki Maulana",
        phone: "0812-0000-1007",
        role: "STUDENT",
        school: "SMAN 3 Jakarta",
        waliId: "u-student-rizki",
      },
      {
        id: "u-siswa-bima",
        email: "bima@sentraedu.id",
        password: "siswa123",
        fullName: "Bima Aditya",
        phone: "0812-0000-1008",
        role: "STUDENT",
        school: "SMAN 5 Jakarta",
        waliId: "u-student-bima",
      },
      {
        id: "u-siswa-farhan",
        email: "farhan@sentraedu.id",
        password: "siswa123",
        fullName: "Farhan Hakim",
        phone: "0812-0000-1009",
        role: "STUDENT",
        school: "SMA Labschool Jakarta",
        waliId: "u-student-farhan",
      },
      {
        id: "u-siswa-kevin",
        email: "kevin@sentraedu.id",
        password: "siswa123",
        fullName: "Kevin Adrian",
        phone: "0812-0000-1010",
        role: "STUDENT",
        school: "SMA Cakra Buana Jakarta",
        waliId: "u-student-kevin",
      },
    ],
    enrollments: [
      {
        id: "e-raka",
        studentId: "u-siswa-raka",
        classId: "cl-sma-12",
        subjectId: "sj-mtk",
        parentName: "Budi Santoso",
        parentPhone: "0812-0000-0002",
        fullAddress: "Jl. Sudirman No. 10, Jakarta",
        latitude: -6.2088,
        longitude: 106.8456,
      },
      {
        id: "e-ayu",
        studentId: "u-siswa-ayu",
        classId: "cl-smp-9",
        subjectId: "sj-ing",
        parentName: "Siti Rahayu",
        parentPhone: "0812-0000-0003",
        fullAddress: "Jl. Riau No. 21, Bandung",
        latitude: -6.9,
        longitude: 107.61,
      },
      {
        id: "e-dika",
        studentId: "u-siswa-dika",
        classId: "cl-sd-6",
        subjectId: "sj-mtk",
        parentName: "Hendra Firmansyah",
        parentPhone: "0812-0000-0008",
        fullAddress: "Jl. Manyar No. 5, Surabaya",
        latitude: -7.2575,
        longitude: 112.7521,
      },
      {
        id: "e-sari",
        studentId: "u-siswa-sari",
        classId: "cl-sma-12",
        subjectId: "sj-bio",
        parentName: "Wulan Sari",
        parentPhone: "0812-0000-0009",
        fullAddress: "Jl. Dharmahusada No. 12, Surabaya",
        latitude: -7.27,
        longitude: 112.76,
      },
      {
        id: "e-putra",
        studentId: "u-siswa-putra",
        classId: "cl-sma-12",
        subjectId: "sj-kim",
        parentName: "Putra Nugroho",
        parentPhone: "0812-0000-0010",
        fullAddress: "Jl. Rungkut No. 8, Surabaya",
        latitude: -7.33,
        longitude: 112.77,
      },
      {
        id: "e-nina",
        studentId: "u-siswa-nina",
        classId: "cl-smp-8",
        subjectId: "sj-ing",
        parentName: "Hendra Safitri",
        parentPhone: "0812-0000-0017",
        fullAddress: "Jl. Cihampelas No. 30, Bandung",
        latitude: -6.895,
        longitude: 107.605,
      },
      {
        id: "e-rizki",
        studentId: "u-siswa-rizki",
        classId: "cl-sma-11",
        subjectId: "sj-fis",
        parentName: "Maulana Yusuf",
        parentPhone: "0812-0000-0018",
        fullAddress: "Jl. Gatot Subroto No. 22, Jakarta",
        latitude: -6.22,
        longitude: 106.82,
      },
      {
        id: "e-amel",
        studentId: "u-siswa-amel",
        classId: "cl-sd-4",
        subjectId: "sj-mtk",
        parentName: "Budi Putra",
        parentPhone: "0812-0000-0019",
        fullAddress: "Jl. Pemuda No. 14, Surabaya",
        latitude: -7.245,
        longitude: 112.74,
      },
      {
        id: "e-bima",
        studentId: "u-siswa-bima",
        classId: "cl-sma-12",
        subjectId: "sj-kim",
        parentName: "Aditya Nugraha",
        parentPhone: "0812-0000-0020",
        fullAddress: "Jl. Thamrin No. 55, Jakarta",
        latitude: -6.195,
        longitude: 106.83,
      },
      {
        id: "e-tasya",
        studentId: "u-siswa-tasya",
        classId: "cl-sma-10",
        subjectId: "sj-bio",
        parentName: "Kamila Zahra",
        parentPhone: "0812-0000-0021",
        fullAddress: "Jl. Dago Asri No. 9, Bandung",
        latitude: -6.88,
        longitude: 107.62,
      },
      {
        id: "e-farhan",
        studentId: "u-siswa-farhan",
        classId: "cl-sma-12",
        subjectId: "sj-fis",
        parentName: "Hakim Sanjaya",
        parentPhone: "0812-0000-0022",
        fullAddress: "Jl. Kramat Raya No. 7, Jakarta",
        latitude: -6.194,
        longitude: 106.849,
      },
      {
        id: "e-dinda",
        studentId: "u-siswa-dinda",
        classId: "cl-smp-9",
        subjectId: "sj-mtk",
        parentName: "Puspita Handayani",
        parentPhone: "0812-0000-0023",
        fullAddress: "Jl. Pangeran Antasari No. 12, Jakarta",
        latitude: -6.2383,
        longitude: 106.805,
      },
      {
        id: "e-aldo",
        studentId: "u-siswa-aldo",
        classId: "cl-sd-1",
        subjectId: "sj-bindo",
        parentName: "Budi Saputra",
        parentPhone: "0812-0000-0024",
        fullAddress: "Jl. Ir. H. Juanda No. 33, Bandung",
        latitude: -6.903,
        longitude: 107.613,
      },
      {
        id: "e-gita",
        studentId: "u-siswa-gita",
        classId: "cl-smp-8",
        subjectId: "sj-mtk",
        parentName: "Anjani Kusuma",
        parentPhone: "0812-0000-0025",
        fullAddress: "Jl. Buah Batu No. 58, Bandung",
        latitude: -6.94,
        longitude: 107.62,
      },
      {
        id: "e-rangga",
        studentId: "u-siswa-rangga",
        classId: "cl-sma-11",
        subjectId: "sj-bio",
        parentName: "Mahesa Jaya",
        parentPhone: "0812-0000-0026",
        fullAddress: "Jl. Kertajaya No. 21, Surabaya",
        latitude: -7.288,
        longitude: 112.789,
      },
      {
        id: "e-lala",
        studentId: "u-siswa-lala",
        classId: "cl-sd-3",
        subjectId: "sj-bindo",
        parentName: "Nurhaliza Dewi",
        parentPhone: "0812-0000-0027",
        fullAddress: "Jl. Rawamangun Muka No. 4, Jakarta",
        latitude: -6.198,
        longitude: 106.884,
      },
      {
        id: "e-irfan",
        studentId: "u-siswa-irfan",
        classId: "cl-sma-11",
        subjectId: "sj-ing",
        parentName: "Fauzi Ramli",
        parentPhone: "0812-0000-0028",
        fullAddress: "Jl. Setiabudi No. 98, Bandung",
        latitude: -6.87,
        longitude: 107.596,
      },
      {
        id: "e-maya",
        studentId: "u-siswa-maya",
        classId: "cl-smp-7",
        subjectId: "sj-ing",
        parentName: "Kirana Sari",
        parentPhone: "0812-0000-0029",
        fullAddress: "Jl. Pucang Anom No. 15, Surabaya",
        latitude: -7.309,
        longitude: 112.74,
      },
      {
        id: "e-kevin",
        studentId: "u-siswa-kevin",
        classId: "cl-sma-12",
        subjectId: "sj-mtk",
        parentName: "Adrian Wijaya",
        parentPhone: "0812-0000-0030",
        fullAddress: "Jl. Raya Bekasi Timur No. 19, Jakarta",
        latitude: -6.19,
        longitude: 106.925,
      },
      {
        id: "e-zahra",
        studentId: "u-siswa-zahra",
        classId: "cl-sd-5",
        subjectId: "sj-mtk",
        parentName: "Aulia Rahman",
        parentPhone: "0812-0000-0031",
        fullAddress: "Jl. Kertajaya Indah No. 8, Surabaya",
        latitude: -7.283,
        longitude: 112.786,
      },
      {
        id: "e-rani",
        studentId: "u-siswa-rani",
        classId: "cl-sma-10",
        subjectId: "sj-kim",
        parentName: "Anggraini Puspita",
        parentPhone: "0812-0000-0032",
        fullAddress: "Jl. Kusuma Bangsa No. 45, Surabaya",
        latitude: -7.275,
        longitude: 112.749,
      },
      {
        id: "e-hafiz",
        studentId: "u-siswa-hafiz",
        classId: "cl-smp-7",
        subjectId: "sj-bindo",
        parentName: "Ramadhan Hakim",
        parentPhone: "0812-0000-0033",
        fullAddress: "Jl. Jatibaru No. 27, Jakarta",
        latitude: -6.185,
        longitude: 106.814,
      },
    ],
    jobs: [
      {
        id: "j-1",
        title: "Les Privat Matematika Kelas 12 SMA",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-raka",
        classId: "cl-sma-12",
        subjectId: "sj-mtk",
        assignedTentorId: null,
        preferredSchedule: "Selasa & Kamis 17:00 WIB",
        transportAllowance: 15000,
        latitude: -6.2088,
        longitude: 106.8456,
        additionalNotes: "Persiapan UTBK, siswa aktif dan rajin.",
      },
      {
        id: "j-2",
        title: "Les Privat Bahasa Inggris Kelas 9 SMP",
        jobType: "REGULAR",
        status: "NEGOTIATING",
        studentEnrollmentId: "e-ayu",
        classId: "cl-smp-9",
        subjectId: "sj-ing",
        assignedTentorId: null,
        preferredSchedule: "Senin & Rabu 16:00 WIB",
        transportAllowance: 10000,
        latitude: -6.9,
        longitude: 107.61,
        additionalNotes: "Fokus speaking & persiapan ujian sekolah.",
      },
      {
        id: "j-3",
        title: "Les Privat Fisika Kelas 12 SMA",
        jobType: "TEMPORARY_REPLACEMENT",
        status: "ASSIGNED",
        studentEnrollmentId: "e-raka",
        classId: "cl-sma-12",
        subjectId: "sj-fis",
        assignedTentorId: "u-tentor-andi",
        preferredSchedule: "Sabtu 09:00 WIB",
        transportAllowance: 20000,
        latitude: -6.2088,
        longitude: 106.8456,
        additionalNotes: "Pengganti sementara selama 1 bulan.",
      },
      {
        id: "j-4",
        title: "Les Privat Matematika Kelas 6 SD",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-dika",
        classId: "cl-sd-6",
        subjectId: "sj-mtk",
        assignedTentorId: null,
        preferredSchedule: "Senin, Rabu & Jumat 15:30 WIB",
        transportAllowance: 5000,
        latitude: -7.2575,
        longitude: 112.7521,
        additionalNotes: "Persiapan ujian akhir SD.",
      },
      {
        id: "j-5",
        title: "Les Privat Biologi Kelas 12 SMA",
        jobType: "REGULAR",
        status: "ASSIGNED",
        studentEnrollmentId: "e-sari",
        classId: "cl-sma-12",
        subjectId: "sj-bio",
        assignedTentorId: "u-tentor-dewi",
        preferredSchedule: "Sabtu 13:00 WIB",
        transportAllowance: 10000,
        latitude: -7.27,
        longitude: 112.76,
        additionalNotes: "Persiapan UTBK SBMPTN.",
      },
      {
        id: "j-6",
        title: "Les Privat Kimia Kelas 12 SMA",
        jobType: "REGULAR",
        status: "ASSIGNED",
        studentEnrollmentId: "e-putra",
        classId: "cl-sma-12",
        subjectId: "sj-kim",
        assignedTentorId: "u-tentor-bagas",
        preferredSchedule: "Minggu 09:00 WIB",
        transportAllowance: 10000,
        latitude: -7.33,
        longitude: 112.77,
        additionalNotes: "Fokus stoikiometri & termokimia.",
      },
      {
        id: "j-7",
        title: "Les Privat Bahasa Inggris Kelas 9 SMP (Sabtu)",
        jobType: "REGULAR",
        status: "ASSIGNED",
        studentEnrollmentId: "e-ayu",
        classId: "cl-smp-9",
        subjectId: "sj-ing",
        assignedTentorId: "u-tentor-bagas",
        preferredSchedule: "Sabtu 10:00 WIB",
        transportAllowance: 10000,
        latitude: -6.9,
        longitude: 107.61,
        additionalNotes: "Pendalaman grammar & speaking.",
      },
      {
        id: "j-8",
        title: "Les Privat Bahasa Inggris Kelas 8 SMP",
        jobType: "REGULAR",
        status: "ASSIGNED",
        studentEnrollmentId: "e-nina",
        classId: "cl-smp-8",
        subjectId: "sj-ing",
        assignedTentorId: "u-tentor-citra",
        preferredSchedule: "Selasa & Jumat 16:00 WIB",
        transportAllowance: 10000,
        latitude: -6.895,
        longitude: 107.605,
        additionalNotes: "Fokus grammar & speaking.",
      },
      {
        id: "j-9",
        title: "Les Privat Fisika Kelas 11 SMA",
        jobType: "REGULAR",
        status: "ASSIGNED",
        studentEnrollmentId: "e-rizki",
        classId: "cl-sma-11",
        subjectId: "sj-fis",
        assignedTentorId: "u-tentor-eka",
        preferredSchedule: "Senin & Kamis 17:30 WIB",
        transportAllowance: 15000,
        latitude: -6.22,
        longitude: 106.82,
        additionalNotes: "Persiapan penilaian akhir semester.",
      },
      {
        id: "j-10",
        title: "Les Privat Matematika Kelas 4 SD",
        jobType: "REGULAR",
        status: "ASSIGNED",
        studentEnrollmentId: "e-amel",
        classId: "cl-sd-4",
        subjectId: "sj-mtk",
        assignedTentorId: "u-tentor-fikri",
        preferredSchedule: "Rabu & Sabtu 15:00 WIB",
        transportAllowance: 5000,
        latitude: -7.245,
        longitude: 112.74,
        additionalNotes: "Belajar sambil bermain, siswa ceria.",
      },
      {
        id: "j-11",
        title: "Les Privat Kimia Kelas 12 SMA",
        jobType: "REGULAR",
        status: "ASSIGNED",
        studentEnrollmentId: "e-bima",
        classId: "cl-sma-12",
        subjectId: "sj-kim",
        assignedTentorId: "u-tentor-eka",
        preferredSchedule: "Minggu 10:00 WIB",
        transportAllowance: 10000,
        latitude: -6.195,
        longitude: 106.83,
        additionalNotes: "Fokus stoikiometri & reaksi redoks.",
      },
      {
        id: "j-12",
        title: "Les Privat Biologi Kelas 10 SMA",
        jobType: "REGULAR",
        status: "ASSIGNED",
        studentEnrollmentId: "e-tasya",
        classId: "cl-sma-10",
        subjectId: "sj-bio",
        assignedTentorId: "u-tentor-dewi",
        preferredSchedule: "Jumat 16:30 WIB",
        transportAllowance: 10000,
        latitude: -6.88,
        longitude: 107.62,
        additionalNotes: "Biologi sel & ekosistem.",
      },
      {
        id: "j-13",
        title: "Les Privat Bahasa Inggris Kelas 9 SMP (Reguler)",
        jobType: "REGULAR",
        status: "ASSIGNED",
        studentEnrollmentId: "e-ayu",
        classId: "cl-smp-9",
        subjectId: "sj-ing",
        assignedTentorId: "u-tentor-citra",
        preferredSchedule: "Kamis 15:30 WIB",
        transportAllowance: 10000,
        latitude: -6.9,
        longitude: 107.61,
        additionalNotes: "Pendalaman tenses & writing.",
      },
      {
        id: "j-14",
        title: "Les Privat Matematika Kelas 6 SD (Reguler)",
        jobType: "REGULAR",
        status: "ASSIGNED",
        studentEnrollmentId: "e-dika",
        classId: "cl-sd-6",
        subjectId: "sj-mtk",
        assignedTentorId: "u-tentor-fikri",
        preferredSchedule: "Senin & Kamis 15:00 WIB",
        transportAllowance: 5000,
        latitude: -7.2575,
        longitude: 112.7521,
        additionalNotes: "Persiapan ujian akhir SD.",
      },
      {
        id: "j-15",
        title: "Les Privat Matematika Kelas 8 SMP (Baru)",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-nina",
        classId: "cl-smp-8",
        subjectId: "sj-mtk",
        assignedTentorId: null,
        preferredSchedule: "Senin & Kamis 17:00 WIB",
        transportAllowance: 10000,
        latitude: -6.895,
        longitude: 107.605,
        additionalNotes: "Siswa ingin menambah mapel Matematika.",
      },
      {
        id: "j-16",
        title: "Les Privat Fisika Kelas 11 SMA (Pengganti)",
        jobType: "TEMPORARY_REPLACEMENT",
        status: "AVAILABLE",
        studentEnrollmentId: "e-rizki",
        classId: "cl-sma-11",
        subjectId: "sj-fis",
        assignedTentorId: null,
        preferredSchedule: "Senin & Kamis 17:30 WIB",
        transportAllowance: 15000,
        latitude: -6.22,
        longitude: 106.82,
        additionalNotes: "Pengganti sementara 2 minggu.",
      },
      {
        id: "j-17",
        title: "Les Privat Fisika Kelas 12 SMA",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-farhan",
        classId: "cl-sma-12",
        subjectId: "sj-fis",
        assignedTentorId: null,
        preferredSchedule: "Selasa & Jumat 16:30 WIB",
        transportAllowance: 15000,
        latitude: -6.194,
        longitude: 106.849,
        additionalNotes: "Persiapan UTBK, siswa kelas unggulan.",
      },
      {
        id: "j-18",
        title: "Les Privat Matematika Kelas 9 SMP",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-dinda",
        classId: "cl-smp-9",
        subjectId: "sj-mtk",
        assignedTentorId: null,
        preferredSchedule: "Rabu & Sabtu 15:30 WIB",
        transportAllowance: 10000,
        latitude: -6.2383,
        longitude: 106.805,
        additionalNotes: "Persiapan ujian sekolah & masuk SMA.",
      },
      {
        id: "j-19",
        title: "Les Privat Bahasa Indonesia Kelas 1 SD",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-aldo",
        classId: "cl-sd-1",
        subjectId: "sj-bindo",
        assignedTentorId: null,
        preferredSchedule: "Senin & Kamis 14:00 WIB",
        transportAllowance: 5000,
        latitude: -6.903,
        longitude: 107.613,
        additionalNotes: "Belajar membaca & menulis permulaan.",
      },
      {
        id: "j-20",
        title: "Les Privat Matematika Kelas 8 SMP",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-gita",
        classId: "cl-smp-8",
        subjectId: "sj-mtk",
        assignedTentorId: null,
        preferredSchedule: "Selasa & Jumat 16:00 WIB",
        transportAllowance: 10000,
        latitude: -6.94,
        longitude: 107.62,
        additionalNotes: "Fokus aljabar & persamaan linear.",
      },
      {
        id: "j-21",
        title: "Les Privat Biologi Kelas 11 SMA",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-rangga",
        classId: "cl-sma-11",
        subjectId: "sj-bio",
        assignedTentorId: null,
        preferredSchedule: "Sabtu 10:00 WIB",
        transportAllowance: 10000,
        latitude: -7.288,
        longitude: 112.789,
        additionalNotes: "Persiapan semester, materi sel & anatomi.",
      },
      {
        id: "j-22",
        title: "Les Privat Bahasa Indonesia Kelas 3 SD",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-lala",
        classId: "cl-sd-3",
        subjectId: "sj-bindo",
        assignedTentorId: null,
        preferredSchedule: "Senin & Rabu 15:00 WIB",
        transportAllowance: 5000,
        latitude: -6.198,
        longitude: 106.884,
        additionalNotes: "Pendampingan membaca & menulis cerita.",
      },
      {
        id: "j-23",
        title: "Les Privat Bahasa Inggris Kelas 11 SMA",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-irfan",
        classId: "cl-sma-11",
        subjectId: "sj-ing",
        assignedTentorId: null,
        preferredSchedule: "Kamis & Minggu 09:00 WIB",
        transportAllowance: 15000,
        latitude: -6.87,
        longitude: 107.596,
        additionalNotes: "Fokus grammar & persiapan TOEFL.",
      },
      {
        id: "j-24",
        title: "Les Privat Bahasa Inggris Kelas 7 SMP",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-maya",
        classId: "cl-smp-7",
        subjectId: "sj-ing",
        assignedTentorId: null,
        preferredSchedule: "Selasa & Kamis 15:30 WIB",
        transportAllowance: 10000,
        latitude: -7.309,
        longitude: 112.74,
        additionalNotes: "Pendalaman vocabulary & speaking.",
      },
      {
        id: "j-25",
        title: "Les Privat Matematika Kelas 12 SMA (UTBK)",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-kevin",
        classId: "cl-sma-12",
        subjectId: "sj-mtk",
        assignedTentorId: null,
        preferredSchedule: "Sabtu 13:00 WIB",
        transportAllowance: 15000,
        latitude: -6.19,
        longitude: 106.925,
        additionalNotes: "Intensif persiapan UTBK, latihan soal HOTS.",
      },
      {
        id: "j-26",
        title: "Les Privat Matematika Kelas 5 SD",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-zahra",
        classId: "cl-sd-5",
        subjectId: "sj-mtk",
        assignedTentorId: null,
        preferredSchedule: "Senin & Rabu 15:00 WIB",
        transportAllowance: 5000,
        latitude: -7.283,
        longitude: 112.786,
        additionalNotes: "Persiapan ujian akhir semester.",
      },
      {
        id: "j-27",
        title: "Les Privat Kimia Kelas 12 SMA (Pengganti)",
        jobType: "TEMPORARY_REPLACEMENT",
        status: "AVAILABLE",
        studentEnrollmentId: "e-bima",
        classId: "cl-sma-12",
        subjectId: "sj-kim",
        assignedTentorId: null,
        preferredSchedule: "Minggu 10:00 WIB",
        transportAllowance: 10000,
        latitude: -6.195,
        longitude: 106.83,
        additionalNotes: "Pengganti sementara 2 minggu, materi redoks.",
      },
      {
        id: "j-28",
        title: "Les Privat Bahasa Inggris Kelas 10 SMA",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-tasya",
        classId: "cl-sma-10",
        subjectId: "sj-ing",
        assignedTentorId: null,
        preferredSchedule: "Rabu & Sabtu 16:00 WIB",
        transportAllowance: 10000,
        latitude: -6.88,
        longitude: 107.62,
        additionalNotes: "Pendampingan English in daily life.",
      },
      {
        id: "j-29",
        title: "Les Privat Kimia Kelas 10 SMA",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-rani",
        classId: "cl-sma-10",
        subjectId: "sj-kim",
        assignedTentorId: null,
        preferredSchedule: "Jumat 16:30 WIB",
        transportAllowance: 10000,
        latitude: -7.275,
        longitude: 112.749,
        additionalNotes: "Fokus stoikiometri dasar & ikatan kimia.",
      },
      {
        id: "j-30",
        title: "Les Privat Bahasa Indonesia Kelas 7 SMP",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-hafiz",
        classId: "cl-smp-7",
        subjectId: "sj-bindo",
        assignedTentorId: null,
        preferredSchedule: "Senin & Kamis 17:00 WIB",
        transportAllowance: 10000,
        latitude: -6.185,
        longitude: 106.814,
        additionalNotes: "Pendalaman materi teks deskripsi & narasi.",
      },
      {
        id: "j-31",
        title: "Les Privat Matematika Kelas 12 SMA (Intensif)",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-farhan",
        classId: "cl-sma-12",
        subjectId: "sj-mtk",
        assignedTentorId: null,
        preferredSchedule: "Sabtu & Minggu 09:00 WIB",
        transportAllowance: 15000,
        latitude: -6.194,
        longitude: 106.849,
        additionalNotes: "Tambahan mapel Matematika untuk UTBK.",
      },
      {
        id: "j-32",
        title: "Les Privat Bahasa Inggris Kelas 9 SMP",
        jobType: "REGULAR",
        status: "AVAILABLE",
        studentEnrollmentId: "e-dinda",
        classId: "cl-smp-9",
        subjectId: "sj-ing",
        assignedTentorId: null,
        preferredSchedule: "Selasa 16:00 WIB",
        transportAllowance: 10000,
        latitude: -6.2383,
        longitude: 106.805,
        additionalNotes: "Persiapan ujian sekolah Bahasa Inggris.",
      },
    ],
    applications: [
      {
        id: "a-1",
        jobPostingId: "j-2",
        tentorId: "u-tentor-andi",
        status: "PENDING",
        notes: "Saya bersedia mengajar, mohon dipertimbangkan.",
      },
    ],
    attendances: [
      {
        id: "att-1",
        jobPostingId: "j-3",
        studentEnrollmentId: "e-raka",
        tentorId: "u-tentor-andi",
        sessionDate: "2026-08-03",
        startTime: "2026-08-03T09:00:00",
        endTime: "2026-08-03T10:30:00",
        durationMinutes: 90,
        latitudeCheckIn: -6.2085,
        longitudeCheckIn: 106.846,
        topicTaught: "Fisika: Besaran, Satuan & Dimensi",
        activityNotes: "Latihan soal konversi satuan.",
        status: "APPROVED",
        approvedById: "u-admin",
        rejectionReason: null,
        payrollClaimId: null,
        invoiceId: "inv-1",
        outOfRadius: false,
      },
      {
        id: "att-2",
        jobPostingId: "j-3",
        studentEnrollmentId: "e-raka",
        tentorId: "u-tentor-andi",
        sessionDate: "2026-08-06",
        startTime: "2026-08-06T09:00:00",
        endTime: "2026-08-06T10:30:00",
        durationMinutes: 90,
        latitudeCheckIn: -6.2086,
        longitudeCheckIn: 106.8458,
        topicTaught: "Fisika: Gerak Lurus & GLBB",
        activityNotes: "Pembahasan grafik kecepatan-waktu.",
        status: "APPROVED",
        approvedById: "u-admin",
        rejectionReason: null,
        payrollClaimId: null,
        invoiceId: "inv-1",
        outOfRadius: false,
      },
      {
        id: "att-3",
        jobPostingId: "j-3",
        studentEnrollmentId: "e-raka",
        tentorId: "u-tentor-andi",
        sessionDate: "2026-08-10",
        startTime: "2026-08-10T09:00:00",
        endTime: "2026-08-10T10:30:00",
        durationMinutes: 90,
        latitudeCheckIn: -6.2084,
        longitudeCheckIn: 106.8462,
        topicTaught: "Fisika: Hukum Newton I & II",
        activityNotes: "Latihan studi kasus gaya gesek.",
        status: "APPROVED",
        approvedById: "u-admin",
        rejectionReason: null,
        payrollClaimId: null,
        invoiceId: "inv-1",
        outOfRadius: false,
      },
      {
        id: "att-4",
        jobPostingId: "j-3",
        studentEnrollmentId: "e-raka",
        tentorId: "u-tentor-andi",
        sessionDate: "2026-08-14",
        startTime: "2026-08-14T09:00:00",
        endTime: "2026-08-14T10:30:00",
        durationMinutes: 90,
        latitudeCheckIn: -6.21,
        longitudeCheckIn: 106.85,
        topicTaught: "Fisika: Dinamika Partikel",
        activityNotes: "Pembahasan soal UTS bab 3.",
        status: "SUBMITTED",
        approvedById: null,
        rejectionReason: null,
        payrollClaimId: null,
        invoiceId: null,
        outOfRadius: true,
      },
      {
        id: "att-5",
        jobPostingId: "j-5",
        studentEnrollmentId: "e-sari",
        tentorId: "u-tentor-dewi",
        sessionDate: "2026-07-06",
        startTime: "2026-07-06T13:00:00",
        endTime: "2026-07-06T14:30:00",
        durationMinutes: 90,
        latitudeCheckIn: -7.2698,
        longitudeCheckIn: 112.7601,
        topicTaught: "Biologi: Sel & Jaringan",
        activityNotes: "Praktik mengamati sel.",
        status: "APPROVED",
        approvedById: "u-admin",
        rejectionReason: null,
        payrollClaimId: null,
        invoiceId: "inv-3",
        outOfRadius: false,
      },
      {
        id: "att-6",
        jobPostingId: "j-5",
        studentEnrollmentId: "e-sari",
        tentorId: "u-tentor-dewi",
        sessionDate: "2026-07-13",
        startTime: "2026-07-13T13:00:00",
        endTime: "2026-07-13T14:30:00",
        durationMinutes: 90,
        latitudeCheckIn: -7.2701,
        longitudeCheckIn: 112.7599,
        topicTaught: "Biologi: Genetika Dasar",
        activityNotes: "Latihan soal pewarisan sifat.",
        status: "APPROVED",
        approvedById: "u-admin",
        rejectionReason: null,
        payrollClaimId: null,
        invoiceId: "inv-3",
        outOfRadius: false,
      },
      {
        id: "att-7",
        jobPostingId: "j-6",
        studentEnrollmentId: "e-putra",
        tentorId: "u-tentor-bagas",
        sessionDate: "2026-07-08",
        startTime: "2026-07-08T09:00:00",
        endTime: "2026-07-08T10:30:00",
        durationMinutes: 90,
        latitudeCheckIn: -7.3299,
        longitudeCheckIn: 112.7701,
        topicTaught: "Kimia: Stoikiometri",
        activityNotes: "Perhitungan mol & massa.",
        status: "APPROVED",
        approvedById: "u-admin",
        rejectionReason: null,
        payrollClaimId: null,
        invoiceId: "inv-4",
        outOfRadius: false,
      },
      {
        id: "att-8",
        jobPostingId: "j-6",
        studentEnrollmentId: "e-putra",
        tentorId: "u-tentor-bagas",
        sessionDate: "2026-07-15",
        startTime: "2026-07-15T09:00:00",
        endTime: "2026-07-15T10:30:00",
        durationMinutes: 90,
        latitudeCheckIn: -7.3301,
        longitudeCheckIn: 112.7699,
        topicTaught: "Kimia: Termokimia",
        activityNotes: "Latihan entalpi reaksi.",
        status: "APPROVED",
        approvedById: "u-admin",
        rejectionReason: null,
        payrollClaimId: null,
        invoiceId: "inv-4",
        outOfRadius: false,
      },
      {
        id: "att-9",
        jobPostingId: "j-7",
        studentEnrollmentId: "e-ayu",
        tentorId: "u-tentor-bagas",
        sessionDate: "2026-07-10",
        startTime: "2026-07-10T10:00:00",
        endTime: "2026-07-10T11:30:00",
        durationMinutes: 90,
        latitudeCheckIn: -6.8998,
        longitudeCheckIn: 107.6101,
        topicTaught: "English: Tenses Review",
        activityNotes: "Latihan present & past tense.",
        status: "APPROVED",
        approvedById: "u-admin",
        rejectionReason: null,
        payrollClaimId: "pc-3",
        invoiceId: "inv-2",
        outOfRadius: false,
      },
      {
        id: "att-10",
        jobPostingId: "j-7",
        studentEnrollmentId: "e-ayu",
        tentorId: "u-tentor-bagas",
        sessionDate: "2026-07-17",
        startTime: "2026-07-17T10:00:00",
        endTime: "2026-07-17T11:30:00",
        durationMinutes: 90,
        latitudeCheckIn: -6.9002,
        longitudeCheckIn: 107.6099,
        topicTaught: "English: Speaking Practice",
        activityNotes: "Simulasi percakapan sehari-hari.",
        status: "APPROVED",
        approvedById: "u-admin",
        rejectionReason: null,
        payrollClaimId: "pc-3",
        invoiceId: "inv-2",
        outOfRadius: false,
      },
    ],
    invoices: [
      {
        id: "inv-1",
        invoiceNumber: "INV/2026/08/JKT-001",
        monthPeriod: 8,
        yearPeriod: 2026,
        studentId: "u-siswa-raka",
        totalSessions: 3,
        totalAmount: 510000,
        status: "UNPAID",
        paidAt: null,
      },
      {
        id: "inv-2",
        invoiceNumber: "INV/2026/07/BDG-001",
        monthPeriod: 7,
        yearPeriod: 2026,
        studentId: "u-siswa-ayu",
        totalSessions: 2,
        totalAmount: 270000,
        status: "PAID",
        paidAt: "2026-08-05T10:00:00",
      },
      {
        id: "inv-3",
        invoiceNumber: "INV/2026/07/SBY-001",
        monthPeriod: 7,
        yearPeriod: 2026,
        studentId: "u-siswa-sari",
        totalSessions: 2,
        totalAmount: 320000,
        status: "UNPAID",
        paidAt: null,
      },
      {
        id: "inv-4",
        invoiceNumber: "INV/2026/07/SBY-002",
        monthPeriod: 7,
        yearPeriod: 2026,
        studentId: "u-siswa-putra",
        totalSessions: 2,
        totalAmount: 320000,
        status: "UNPAID",
        paidAt: null,
      },
    ],
    payrollClaims: [
      {
        id: "pc-1",
        claimNumber: "PRL/2026/06/JKT-001",
        monthPeriod: 6,
        yearPeriod: 2026,
        tentorId: "u-tentor-andi",
        totalSessions: 12,
        baseHonorAmount: 1800000,
        transportAmount: 180000,
        totalClaimAmount: 1980000,
        status: "PAID",
        processedById: "u-admin",
        paymentProofUrl: null,
        paidAt: "2026-07-05T09:00:00",
      },
      {
        id: "pc-2",
        claimNumber: "PRL/2026/06/SBY-001",
        monthPeriod: 6,
        yearPeriod: 2026,
        tentorId: "u-tentor-dewi",
        totalSessions: 8,
        baseHonorAmount: 1200000,
        transportAmount: 80000,
        totalClaimAmount: 1280000,
        status: "PAID",
        processedById: "u-admin",
        paymentProofUrl: null,
        paidAt: "2026-07-06T09:00:00",
      },
      {
        id: "pc-3",
        claimNumber: "PRL/2026/07/BDG-001",
        monthPeriod: 7,
        yearPeriod: 2026,
        tentorId: "u-tentor-bagas",
        totalSessions: 2,
        baseHonorAmount: 250000,
        transportAmount: 20000,
        totalClaimAmount: 270000,
        status: "REQUESTED",
        processedById: null,
        paymentProofUrl: null,
        paidAt: null,
      },
      {
        id: "pc-4",
        claimNumber: "PRL/2026/07/JKT-001",
        monthPeriod: 7,
        yearPeriod: 2026,
        tentorId: "u-tentor-andi",
        totalSessions: 2,
        baseHonorAmount: 300000,
        transportAmount: 40000,
        totalClaimAmount: 340000,
        status: "REQUESTED",
        processedById: null,
        paymentProofUrl: null,
        paidAt: null,
      },
    ],
    candidates: [
      {
        id: "c-1",
        fullName: "Fajar Ramadhan",
        email: "fajar.r@email.com",
        phone: "0813-0000-0101",
        education: "S1 Matematika",
        subjectIds: ["sj-mtk", "sj-fis"],
        levelIds: ["lv-sma", "lv-smp"],
        experienceYears: 1,
        source: "Media Sosial",
        status: "REGISTERED",
        registeredAt: "2026-08-15",
        testScheduledAt: null,
        testScore: null,
        testNotes: "",
        interviewScheduledAt: null,
        interviewNotes: "",
        rejectionReason: null,
        tentorUserId: null,
      },
      {
        id: "c-2",
        fullName: "Nadia Putri",
        email: "nadia.p@email.com",
        phone: "0813-0000-0102",
        education: "S1 Pendidikan Bahasa Inggris",
        subjectIds: ["sj-ing"],
        levelIds: ["lv-smp"],
        experienceYears: 2,
        source: "Website",
        status: "TEST_SCHEDULED",
        registeredAt: "2026-08-10",
        testScheduledAt: "2026-08-20T10:00:00",
        testScore: null,
        testNotes: "",
        interviewScheduledAt: null,
        interviewNotes: "",
        rejectionReason: null,
        tentorUserId: null,
      },
      {
        id: "c-3",
        fullName: "Yoga Prasetyo",
        email: "yoga.p@email.com",
        phone: "0813-0000-0103",
        education: "S1 Fisika",
        subjectIds: ["sj-fis"],
        levelIds: ["lv-sma"],
        experienceYears: 0,
        source: "Kampus",
        status: "TESTED",
        registeredAt: "2026-08-08",
        testScheduledAt: "2026-08-12T09:00:00",
        testScore: 82,
        testNotes: "Tes mapel Fisika lulus, penguasaan materi baik.",
        interviewScheduledAt: null,
        interviewNotes: "",
        rejectionReason: null,
        tentorUserId: null,
      },
      {
        id: "c-4",
        fullName: "Intan Permata",
        email: "intan.p@email.com",
        phone: "0813-0000-0104",
        education: "S1 Biologi",
        subjectIds: ["sj-bio"],
        levelIds: ["lv-sma"],
        experienceYears: 3,
        source: "Referensi",
        status: "INTERVIEW_SCHEDULED",
        registeredAt: "2026-08-05",
        testScheduledAt: "2026-08-07T13:00:00",
        testScore: 88,
        testNotes: "Skor tes tinggi.",
        interviewScheduledAt: "2026-08-21T14:00:00",
        interviewNotes: "",
        rejectionReason: null,
        tentorUserId: null,
      },
      {
        id: "c-5",
        fullName: "Rizky Hidayat",
        email: "rizky.h@email.com",
        phone: "0813-0000-0105",
        education: "S1 Kimia",
        subjectIds: ["sj-kim"],
        levelIds: ["lv-sma"],
        experienceYears: 1,
        source: "Media Sosial",
        status: "INTERVIEWED",
        registeredAt: "2026-08-02",
        testScheduledAt: "2026-08-04T10:00:00",
        testScore: 90,
        testNotes: "Tes lulus dengan baik.",
        interviewScheduledAt: "2026-08-10T11:00:00",
        interviewNotes:
          "Komunikasi baik, motivasi mengajar tinggi, siap mulai bulan depan.",
        rejectionReason: null,
        tentorUserId: null,
      },
      {
        id: "c-6",
        fullName: "Bagas Saputra",
        email: "tentor.bagas@sentraedu.id",
        phone: "0812-0000-0012",
        education: "S1 Matematika",
        subjectIds: ["sj-mtk"],
        levelIds: ["lv-smp"],
        experienceYears: 2,
        source: "Website",
        status: "ACCEPTED",
        registeredAt: "2026-07-20",
        testScheduledAt: "2026-07-22T09:00:00",
        testScore: 92,
        testNotes: "Tes lulus.",
        interviewScheduledAt: "2026-07-25T14:00:00",
        interviewNotes: "Disetujui, ditempatkan mengajar Matematika SMP.",
        rejectionReason: null,
        tentorUserId: "u-tentor-bagas",
      },
      {
        id: "c-7",
        fullName: "Sarah Amelia",
        email: "sarah.a@email.com",
        phone: "0813-0000-0106",
        education: "D3 Akuntansi",
        subjectIds: ["sj-mtk"],
        levelIds: ["lv-sd"],
        experienceYears: 0,
        source: "Walk-in",
        status: "REJECTED",
        registeredAt: "2026-07-28",
        testScheduledAt: "2026-07-30T09:00:00",
        testScore: 45,
        testNotes: "Skor tes di bawah standar.",
        interviewScheduledAt: null,
        interviewNotes: "",
        rejectionReason: "Tes akademik di bawah standar (45/100).",
        tentorUserId: null,
      },
      {
        id: "c-8",
        fullName: "Dimas Arya",
        email: "dimas.a@email.com",
        phone: "0813-0000-0107",
        education: "S1 Matematika",
        subjectIds: ["sj-mtk"],
        levelIds: ["lv-smp"],
        experienceYears: 0,
        source: "Kampus",
        status: "REGISTERED",
        registeredAt: "2026-08-16",
        testScheduledAt: null,
        testScore: null,
        testNotes: "",
        interviewScheduledAt: null,
        interviewNotes: "",
        rejectionReason: null,
        tentorUserId: null,
      },
      {
        id: "c-9",
        fullName: "Putri Ayu",
        email: "putri.ayu@email.com",
        phone: "0813-0000-0108",
        education: "S1 Kimia",
        subjectIds: ["sj-kim"],
        levelIds: ["lv-sma"],
        experienceYears: 1,
        source: "Media Sosial",
        status: "TESTED",
        registeredAt: "2026-08-12",
        testScheduledAt: "2026-08-14T09:00:00",
        testScore: 78,
        testNotes: "Penguasaan materi cukup baik.",
        interviewScheduledAt: null,
        interviewNotes: "",
        rejectionReason: null,
        tentorUserId: null,
      },
    ],
    notifications: [
      {
        id: "n-1",
        userId: "u-admin",
        title: "Lamaran baru masuk",
        message:
          'Andi Pratama melamar lowongan "Les Privat Bahasa Inggris Kelas 9 SMP".',
        icon: "work",
        read: false,
        createdAt: "2026-08-16T09:20:00",
      },
      {
        id: "n-2",
        userId: "u-tentor-andi",
        title: "Penugasan baru",
        message:
          'Anda ditugaskan mengajar "Les Privat Fisika Kelas 12 SMA" — Sabtu 09:00 WIB.',
        icon: "event_available",
        read: false,
        createdAt: "2026-08-15T14:05:00",
      },
      {
        id: "n-3",
        userId: "u-tentor-andi",
        title: "Presensi disetujui",
        message: "3 sesi Fisika bulan Agustus disetujui oleh Admin Jakarta.",
        icon: "fact_check",
        read: false,
        createdAt: "2026-08-14T11:40:00",
      },
      {
        id: "n-4",
        userId: "u-admin",
        title: "Presensi baru menunggu verifikasi",
        message:
          "Andi Pratama mengirim presensi 14 Agu — terdeteksi di luar radius 200m, perlu verifikasi manual.",
        icon: "gps_fixed",
        read: false,
        createdAt: "2026-08-14T09:30:00",
      },
      {
        id: "n-5",
        userId: "u-admin",
        title: "Klaim gaji diajukan",
        message:
          "Andi Pratama mengajukan klaim honor Juli 2026: 2 sesi, total Rp 340.000.",
        icon: "payments",
        read: false,
        createdAt: "2026-08-12T10:15:00",
      },
      {
        id: "n-6",
        userId: "u-student-raka",
        title: "Tagihan SPP diterbitkan",
        message: "INV/2026/08/JKT-001 sebesar Rp 510.000 untuk 3 sesi Agustus.",
        icon: "receipt_long",
        read: false,
        createdAt: "2026-08-11T08:00:00",
      },
      {
        id: "n-7",
        userId: "u-student-ayu",
        title: "Pembayaran diterima",
        message: "Tagihan INV/2026/07/BDG-001 sebesar Rp 270.000 telah lunas.",
        icon: "payments",
        read: true,
        createdAt: "2026-08-05T10:00:00",
      },
      {
        id: "n-8",
        userId: "u-admin",
        title: "Kandidat siap diputuskan",
        message:
          "Rizky Hidayat telah menyelesaikan wawancara — siap untuk keputusan penerimaan.",
        icon: "badge",
        read: false,
        createdAt: "2026-08-13T16:20:00",
      },
      {
        id: "n-9",
        userId: "u-admin",
        title: "Ringkasan mingguan",
        message: "7 lowongan aktif, 10 presensi, 4 tagihan SPP.",
        icon: "notifications",
        read: true,
        createdAt: "2026-08-15T07:00:00",
      },
      {
        id: "n-10",
        userId: "u-tentor-bagas",
        title: "Klaim gaji diproses",
        message:
          "Klaim PRL/2026/07/BDG-001 (Rp 270.000) menunggu persetujuan Admin Bandung.",
        icon: "payments",
        read: true,
        createdAt: "2026-08-03T09:00:00",
      },
    ],
  };

  /* ============================================================
     NORMALISASI v13 — paket les (PRD baru):
     - enrollment.packageId   : paket langganan siswa
     - job.mode               : OFFLINE | ONLINE
     - job.packageId          : paket les yang dipilih lowongan
     Lowongan ONLINE tidak memakai koordinat GPS lokasi les.
     ============================================================ */
  const JOB_MODE = {
    "j-8": "ONLINE",
    "j-23": "ONLINE",
    "j-24": "ONLINE",
    "j-28": "ONLINE",
    "j-32": "ONLINE",
  };
  const JOB_PKG = {
    "j-1": "pkg-intensif-bulanan",
    "j-2": "pkg-bulanan-private",
    "j-3": "pkg-harian-private",
    "j-4": "pkg-bulanan-kelompok",
    "j-5": "pkg-bulanan-private",
    "j-6": "pkg-bulanan-private",
    "j-7": "pkg-harian-private",
    "j-8": "pkg-bulanan-private",
    "j-9": "pkg-bulanan-private",
    "j-10": "pkg-bulanan-kelompok",
    "j-11": "pkg-bulanan-private",
    "j-12": "pkg-bulanan-private",
    "j-13": "pkg-bulanan-private",
    "j-14": "pkg-bulanan-kelompok",
    "j-15": "pkg-bulanan-private",
    "j-16": "pkg-harian-private",
    "j-17": "pkg-bulanan-private",
    "j-18": "pkg-bulanan-private",
    "j-19": "pkg-bulanan-kelompok",
    "j-20": "pkg-bulanan-private",
    "j-21": "pkg-bulanan-private",
    "j-22": "pkg-bulanan-kelompok",
    "j-23": "pkg-bulanan-private",
    "j-24": "pkg-bulanan-kelompok",
    "j-25": "pkg-intensif-bulanan",
    "j-26": "pkg-bulanan-kelompok",
    "j-27": "pkg-harian-private",
    "j-28": "pkg-bulanan-private",
    "j-29": "pkg-bulanan-private",
    "j-30": "pkg-bulanan-kelompok",
    "j-31": "pkg-intensif-bulanan",
    "j-32": "pkg-harian-private",
  };
  const ENR_PKG = {
    "e-raka": "pkg-intensif-bulanan",
    "e-ayu": "pkg-bulanan-private",
    "e-dika": "pkg-bulanan-kelompok",
    "e-sari": "pkg-bulanan-private",
    "e-putra": "pkg-bulanan-private",
    "e-nina": "pkg-bulanan-private",
    "e-rizki": "pkg-bulanan-private",
    "e-amel": "pkg-bulanan-kelompok",
    "e-bima": "pkg-bulanan-private",
    "e-tasya": "pkg-bulanan-private",
    "e-farhan": "pkg-bulanan-private",
    "e-dinda": "pkg-bulanan-private",
    "e-aldo": "pkg-bulanan-kelompok",
    "e-gita": "pkg-bulanan-private",
    "e-rangga": "pkg-bulanan-private",
    "e-lala": "pkg-bulanan-kelompok",
    "e-irfan": "pkg-bulanan-private",
    "e-maya": "pkg-bulanan-private",
    "e-kevin": "pkg-intensif-bulanan",
    "e-zahra": "pkg-bulanan-kelompok",
    "e-rani": "pkg-bulanan-private",
    "e-hafiz": "pkg-bulanan-kelompok",
  };
  db.jobs.forEach(function (j) {
    j.mode = JOB_MODE[j.id] || "OFFLINE";
    j.packageId = JOB_PKG[j.id] || "pkg-bulanan-private";
    if (j.mode === "ONLINE") {
      j.latitude = null;
      j.longitude = null;
    }
  });
  db.enrollments.forEach(function (e) {
    e.packageId = ENR_PKG[e.id] || "pkg-bulanan-private";
  });

  /* ============================================================
     GENERATOR DATA RIWAYAT 2024–2026
     Job historis (j-8..j-14) -> sesi APPROVED tiap bulan ->
     klaim gaji & invoice SPP terkait, agar semua laporan/analitik
     terisi data lintas tahun. Periode berjalan (Agu 2026) sengaja
     belum diklaim/ditagih agar alur klaim & invoice tetap bisa dicoba.
     ============================================================ */
  const p2 = function (n) {
    return String(n).padStart(2, "0");
  };
  const p3 = function (n) {
    return String(n).padStart(3, "0");
  };

  const HIST_JOBS = [
    {
      id: "j-8",
      tentor: "u-tentor-citra",
      start: "16:00",
      end: "17:30",
      topics: [
        "English: Tenses Review",
        "English: Vocabulary Building",
        "English: Listening Practice",
        "English: Speaking Drill",
        "English: Reading Comprehension",
        "English: Grammar Exercises",
        "English: Writing Skills",
        "English: Daily Conversation",
      ],
    },
    {
      id: "j-9",
      tentor: "u-tentor-eka",
      start: "17:30",
      end: "19:00",
      topics: [
        "Fisika: Kinematika Gerak",
        "Fisika: Dinamika & Gaya",
        "Fisika: Usaha & Energi",
        "Fisika: Momentum & Impuls",
        "Fisika: Getaran & Gelombang",
        "Fisika: Termodinamika",
        "Fisika: Listrik Statis",
        "Fisika: Listrik Dinamis",
      ],
    },
    {
      id: "j-10",
      tentor: "u-tentor-fikri",
      start: "15:00",
      end: "16:30",
      topics: [
        "Matematika: Penjumlahan & Pengurangan",
        "Matematika: Perkalian & Pembagian",
        "Matematika: Pecahan Sederhana",
        "Matematika: Bangun Datar",
        "Matematika: Pengukuran",
        "Matematika: Soal Cerita",
        "Matematika: Keliling & Luas",
        "Matematika: Latihan Ulangan",
      ],
    },
    {
      id: "j-11",
      tentor: "u-tentor-eka",
      start: "10:00",
      end: "11:30",
      topics: [
        "Kimia: Struktur Atom",
        "Kimia: Ikatan Kimia",
        "Kimia: Stoikiometri",
        "Kimia: Larutan & Konsentrasi",
        "Kimia: Asam Basa",
        "Kimia: Termokimia",
        "Kimia: Laju Reaksi",
        "Kimia: Redoks & Elektrokimia",
      ],
    },
    {
      id: "j-12",
      tentor: "u-tentor-dewi",
      start: "16:30",
      end: "18:00",
      topics: [
        "Biologi: Sel & Organel",
        "Biologi: Jaringan Tumbuhan",
        "Biologi: Sistem Gerak",
        "Biologi: Peredaran Darah",
        "Biologi: Pernapasan",
        "Biologi: Pencernaan",
        "Biologi: Ekosistem",
        "Biologi: Pewarisan Sifat",
      ],
    },
    {
      id: "j-13",
      tentor: "u-tentor-citra",
      start: "15:30",
      end: "17:00",
      topics: [
        "English: Tenses & Time Expressions",
        "English: Conditional Sentences",
        "English: Passive Voice",
        "English: Narrative Text",
        "English: Descriptive Text",
        "English: Report Text",
        "English: Vocabulary & Idioms",
        "English: Exam Simulation",
      ],
    },
    {
      id: "j-14",
      tentor: "u-tentor-fikri",
      start: "15:00",
      end: "16:30",
      topics: [
        "Matematika: Bilangan Bulat",
        "Matematika: FPB & KPK",
        "Matematika: Pecahan",
        "Matematika: Perbandingan",
        "Matematika: Bangun Ruang",
        "Matematika: Statistika Dasar",
        "Matematika: Latihan Ujian",
        "Matematika: Soal Cerita Lanjutan",
      ],
    },
  ];

  // bulan: Feb 2024 – Agu 2026
  const months = [];
  for (let y = 2024; y <= 2026; y++) {
    const mStart = y === 2024 ? 2 : 1;
    const mEnd = y === 2026 ? 8 : 12;
    for (let m = mStart; m <= mEnd; m++) months.push([y, m]);
  }

  const claimGroups = {}; // tentor|y|m -> [sesi]
  const invGroups = {}; // siswa|y|m -> [sesi]
  months.forEach(function (ym, mi) {
    HIST_JOBS.forEach(function (hj, ji) {
      const job = jobById(db, hj.id);
      [6, 20].forEach(function (day, di) {
        const sd = ym[0] + "-" + p2(ym[1]) + "-" + p2(day);
        const a = {
          id: "att-gen-" + p3(mi * 14 + ji * 2 + di + 1),
          jobPostingId: hj.id,
          studentEnrollmentId: job.studentEnrollmentId,
          tentorId: hj.tentor,
          sessionDate: sd,
          startTime: sd + "T" + hj.start + ":00",
          endTime: sd + "T" + hj.end + ":00",
          durationMinutes: 90,
          latitudeCheckIn: Number(
            (job.latitude + (di ? 0.0002 : -0.0002)).toFixed(4),
          ),
          longitudeCheckIn: Number(
            (job.longitude + (di ? -0.0002 : 0.0002)).toFixed(4),
          ),
          topicTaught: hj.topics[(mi + di) % hj.topics.length],
          activityNotes: "",
          status: "APPROVED",
          approvedById: "u-admin",
          rejectionReason: null,
          payrollClaimId: null,
          invoiceId: null,
          outOfRadius: (mi * 7 + ji + di) % 37 === 0,
        };
        db.attendances.push(a);
        const gk = hj.tentor + "|" + ym[0] + "|" + ym[1];
        (claimGroups[gk] = claimGroups[gk] || []).push(a);
        const enr = db.enrollments.find(function (e) {
          return e.id === job.studentEnrollmentId;
        });
        const stuId = enr ? enr.studentId : job.studentEnrollmentId;
        const ik = stuId + "|" + ym[0] + "|" + ym[1];
        (invGroups[ik] = invGroups[ik] || []).push(a);
      });
    });
  });

  // 2 sesi terbaru (Agu 2026) menunggu verifikasi Admin
  db.attendances.push(
    {
      id: "att-11",
      jobPostingId: "j-8",
      studentEnrollmentId: "e-nina",
      tentorId: "u-tentor-citra",
      sessionDate: "2026-08-11",
      startTime: "2026-08-11T16:00:00",
      endTime: "2026-08-11T17:30:00",
      durationMinutes: 90,
      latitudeCheckIn: -6.895,
      longitudeCheckIn: 107.605,
      topicTaught: "English: Present Perfect vs Past Simple",
      activityNotes: "Latihan dialog sehari-hari.",
      status: "SUBMITTED",
      approvedById: null,
      rejectionReason: null,
      payrollClaimId: null,
      invoiceId: null,
      outOfRadius: false,
    },
    {
      id: "att-12",
      jobPostingId: "j-10",
      studentEnrollmentId: "e-amel",
      tentorId: "u-tentor-fikri",
      sessionDate: "2026-08-13",
      startTime: "2026-08-13T15:00:00",
      endTime: "2026-08-13T16:30:00",
      durationMinutes: 90,
      latitudeCheckIn: -7.2451,
      longitudeCheckIn: 112.7401,
      topicTaught: "Matematika: Pembagian Bersusun",
      activityNotes: "Latihan soal cerita.",
      status: "SUBMITTED",
      approvedById: null,
      rejectionReason: null,
      payrollClaimId: null,
      invoiceId: null,
      outOfRadius: false,
    },
  );

  // --- klaim gaji: satu per (tentor, periode), PAID utk historis, REQUESTED utk Jul 2026 ---
  let ci = 0;
  Object.keys(claimGroups).forEach(function (gk) {
    const parts = gk.split("|");
    const tentorId = parts[0],
      y = Number(parts[1]),
      m = Number(parts[2]);
    if (y === 2026 && m >= 8) return; // periode berjalan: klaim belum diajukan
    if (
      db.payrollClaims.some(function (c) {
        return (
          c.tentorId === tentorId && c.monthPeriod === m && c.yearPeriod === y
        );
      })
    )
      return;
    const list = claimGroups[gk];
    const base = list.reduce(function (s, a) {
      return s + classRate(db, jobById(db, a.jobPostingId).classId);
    }, 0);
    const transport = list.reduce(function (s, a) {
      return s + Number(jobById(db, a.jobPostingId).transportAllowance);
    }, 0);
    const isRecent = y === 2026 && m === 7;
    const claim = {
      id: "pc-gen-" + p3(++ci),
      claimNumber:
        "PRL/" +
        y +
        "/" +
        p2(m) +
        "/" +
        "ADM".replace(/^BR-/, "") +
        "-" +
        p3(ci),
      monthPeriod: m,
      yearPeriod: y,
      tentorId: tentorId,
      totalSessions: list.length,
      baseHonorAmount: base,
      transportAmount: transport,
      totalClaimAmount: base + transport,
      status: isRecent ? "REQUESTED" : "PAID",
      processedById: "u-admin",
      paymentProofUrl: isRecent ? null : "Transfer bank (historis)",
      paidAt: isRecent ? null : y + "-" + p2(m) + "-05T09:00:00",
    };
    db.payrollClaims.push(claim);
    list.forEach(function (a) {
      a.payrollClaimId = claim.id;
    });
  });

  // 1 contoh klaim ditolak (historis): sesi dilepas agar bisa diklaim ulang
  const rej = db.payrollClaims.find(function (c) {
    return (
      c.tentorId === "u-tentor-citra" &&
      c.monthPeriod === 3 &&
      c.yearPeriod === 2025
    );
  });
  if (rej) {
    rej.status = "REJECTED";
    rej.paymentProofUrl = "Catatan kehadiran tidak lengkap (historis).";
    rej.processedById = "u-admin";
    db.attendances.forEach(function (a) {
      if (a.payrollClaimId === rej.id) a.payrollClaimId = null;
    });
  }

  // --- invoice SPP: satu per (siswa, periode), PAID utk historis, UNPAID utk Jul 2026 ---
  let ii = 0;
  Object.keys(invGroups).forEach(function (ik) {
    const parts = ik.split("|");
    const studentId = parts[0],
      y = Number(parts[1]),
      m = Number(parts[2]);
    if (y === 2026 && m >= 8) return; // periode berjalan: tagihan belum diterbitkan
    if (
      db.invoices.some(function (x) {
        return (
          x.studentId === studentId && x.monthPeriod === m && x.yearPeriod === y
        );
      })
    )
      return;
    if (
      !db.users.some(function (u) {
        return u.id === studentId;
      })
    )
      return;
    const list = invGroups[ik];
    const bill = billingTotal(db, list);
    const isRecent = y === 2026 && m === 7;
    const inv = {
      id: "inv-gen-" + p3(++ii),
      invoiceNumber:
        "INV/" +
        y +
        "/" +
        p2(m) +
        "/" +
        "ADM".replace(/^BR-/, "") +
        "-" +
        p3(ii),
      monthPeriod: m,
      yearPeriod: y,
      studentId: studentId,
      totalSessions: list.length,
      totalAmount: bill.total,
      packageIds: bill.packageIds,
      status: isRecent ? "UNPAID" : "PAID",
      paidAt: isRecent ? null : y + "-" + p2(m) + "-10T08:00:00",
    };
    db.invoices.push(inv);
    list.forEach(function (a) {
      a.invoiceId = inv.id;
    });
  });

  return db;
}

/* ============================================================
   DB HELPERS
   ============================================================ */
function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const db = buildSeed();
    saveDB(db);
    return db;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return buildSeed();
  }
}
function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}
let _uidSeq = 100;
function uid(prefix) {
  _uidSeq += 1;
  return (prefix || "id") + "-" + Date.now().toString(36) + "-" + _uidSeq;
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (e) {
    return null;
  }
}
function setSession(userId) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ userId, loginAt: new Date().toISOString() }),
  );
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
function currentUser() {
  const s = getSession();
  if (!s) return null;
  return (
    loadDB().users.find(function (u) {
      return u.id === s.userId;
    }) || null
  );
}

/* ============================================================
   HELPERS UI
   ============================================================ */
function ic(name, filled) {
  return (
    '<span class="mat' +
    (filled ? " filled" : "") +
    '" aria-hidden="true">' +
    name +
    "</span>"
  );
}
function idr(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}
function fmtDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function fmtDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function attTimeRange(a) {
  try {
    const s = new Date(a.startTime),
      e = new Date(a.endTime);
    return s.toTimeString().slice(0, 5) + "–" + e.toTimeString().slice(0, 5);
  } catch (x) {
    return "";
  }
}
function nextDayDateTime() {
  const d = new Date(Date.now() + 86400000);
  d.setMinutes(0, 0, 0);
  const pad = function (n) {
    return String(n).padStart(2, "0");
  };
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":00"
  );
}
function monthLabel(m, y) {
  const names = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return names[(m - 1) % 12] + " " + y;
}
function timeAgo(iso) {
  if (!iso) return "-";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "baru saja";
  if (min < 60) return min + " menit lalu";
  const h = Math.floor(min / 60);
  if (h < 24) return h + " jam lalu";
  const d = Math.floor(h / 24);
  if (d < 30) return d + " hari lalu";
  return fmtDate(iso);
}
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000,
    toRad = function (x) {
      return (x * Math.PI) / 180;
    };
  const dLat = toRad(lat2 - lat1),
    dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const BADGE_MAP = {
  AVAILABLE: ["Tersedia", "b-available"],
  NEGOTIATING: ["Sedang Negosiasi", "b-negotiating"],
  ASSIGNED: ["Ditugaskan", "b-assigned"],
  CANCELLED: ["Dibatalkan", "b-cancelled"],
  SUBMITTED: ["Menunggu Verifikasi", "b-submitted"],
  APPROVED: ["Disetujui", "b-approved"],
  REJECTED: ["Ditolak", "b-rejected"],
  REQUESTED: ["Diajukan", "b-requested"],
  PAID: ["Dibayar", "b-paid"],
  UNPAID: ["Belum Dibayar", "b-unpaid"],
  PENDING: ["Menunggu", "b-pending"],
  ACCEPTED: ["Diterima", "b-accepted"],
  REGISTERED: ["Pendaftar Baru", "b-pending"],
  TEST_SCHEDULED: ["Tes Dijadwalkan", "b-negotiating"],
  TESTED: ["Tes Selesai", "b-tested"],
  INTERVIEW_SCHEDULED: ["Wawancara Dijadwalkan", "b-assigned"],
  INTERVIEWED: ["Wawancara Selesai", "b-interviewed"],
  SUPER_ADMIN: ["Super Admin", "b-admin"],
  OFFLINE: ["Offline (Luring)", "b-neutral"],
  ONLINE: ["Online (Daring)", "b-assigned"],
  PRIVATE: ["Private", "b-assigned"],
  KELOMPOK: ["Kelompok", "b-negotiating"],

  TENTOR: ["Tentor", "b-tentor"],
  STUDENT: ["Siswa", "b-student"],
  WALI_MURID: ["Wali Murid", "b-student"],
};
function badge(status) {
  const e = BADGE_MAP[status] || [status, "b-neutral"];
  return '<span class="badge ' + e[1] + '">' + e[0] + "</span>";
}

/* Referensi silang */
function levelName(db, id) {
  const l = db.educationLevels.find(function (x) {
    return x.id === id;
  });
  return l ? l.levelName : "—";
}
function className(db, id) {
  const c = db.classes.find(function (x) {
    return x.id === id;
  });
  return c ? c.className : "—";
}
function classRate(db, id) {
  const c = db.classes.find(function (x) {
    return x.id === id;
  });
  return c ? Number(c.baseRatePer90Min) : 0;
}
function classLevel(db, id) {
  const c = db.classes.find(function (x) {
    return x.id === id;
  });
  return c ? levelName(db, c.educationLevelId) : "—";
}
function subjectName(db, id) {
  const s = db.subjects.find(function (x) {
    return x.id === id;
  });
  return s ? s.name : "—";
}
function subjectNames(db, ids) {
  return (ids || [])
    .map(function (id) {
      return subjectName(db, id);
    })
    .join(", ");
}
function levelNames(db, ids) {
  return (ids || [])
    .map(function (id) {
      return levelName(db, id);
    })
    .join(", ");
}
function userName(db, id) {
  const u = db.users.find(function (x) {
    return x.id === id;
  });
  return u ? u.fullName : "—";
}
function studentOf(db, eid) {
  const e = db.enrollments.find(function (x) {
    return x.id === eid;
  });
  return e ? userName(db, e.studentId) : "—";
}
function jobById(db, id) {
  return db.jobs.find(function (x) {
    return x.id === id;
  });
}
function jobStudentIds(db, j) {
  const ids = Array.isArray(j.studentEnrollmentIds)
    ? j.studentEnrollmentIds.slice()
    : [];
  if (!ids.length && j.studentEnrollmentId) ids.push(j.studentEnrollmentId);
  return ids.filter(function (id) {
    return db.enrollments.some(function (e) {
      return e.id === id;
    });
  });
}
function jobStudentLabel(db, j) {
  const names = jobStudentIds(db, j).map(function (id) {
    return studentOf(db, id);
  });
  return names.length ? names.join(", ") : "—";
}
function packageTentorFee(db, pkg) {
  return pkg && Number(pkg.tentorFee) > 0 ? Number(pkg.tentorFee) : 0;
}
function jobSessionFee(db, j) {
  const pkg = j && j.packageId ? packageById(db, j.packageId) : null;
  const pkgFee = packageTentorFee(db, pkg);
  if (pkgFee > 0) return pkgFee;
  return classRate(db, j ? j.classId : null) + Number(j ? j.transportAllowance : 0);
}
function packageById(db, id) {
  return (db.packages || []).find(function (x) {
    return x.id === id;
  });
}
function packageName(db, id) {
  const p = packageById(db, id);
  return p ? p.name : "—";
}
function packageNames(db, ids) {
  return (ids || [])
    .map(function (id) {
      return packageName(db, id);
    })
    .join(", ");
}
function packageLabel(db, p) {
  if (!p) return "—";
  return (
    p.name +
    " — " +
    idr(p.price) +
    (p.period === "BULANAN" ? "/bulan" : "/sesi")
  );
}
function packageModeLabel(p) {
  if (!p) return "—";
  return p.mode === "KELOMPOK" ? "Kelompok" : "Private";
}
function packageOptions(db) {
  return (db.packages || [])
    .filter(function (p) {
      return p.active !== false;
    })
    .map(function (p) {
      return {
        value: p.id,
        label:
          p.name +
          " — " +
          packageModeLabel(p) +
          " · " +
          (p.period === "BULANAN" ? "Bulanan" : "Harian") +
          " · " +
          idr(p.price) +
          (Number(p.tentorFee) > 0
            ? " · Honor " + idr(p.tentorFee) + "/sesi"
            : ""),
      };
    });
}

/* Hitung tagihan SPP dari daftar sesi APPROVED berdasarkan paket les:
   - paket BULANAN -> harga paket flat per lowongan (tiap periode)
   - paket HARIAN  -> harga paket x jumlah sesi pada lowongan tsb
   - tanpa paket   -> fallback lama: (tarif kelas + transport) per sesi */
function billingTotal(db, sessions) {
  const byJob = {};
  sessions.forEach(function (a) {
    (byJob[a.jobPostingId] = byJob[a.jobPostingId] || []).push(a);
  });
  let total = 0;
  const pkgIds = [];
  Object.keys(byJob).forEach(function (jid) {
    const list = byJob[jid];
    const j = jobById(db, jid);
    const pkg = j && j.packageId ? packageById(db, j.packageId) : null;
    if (pkg) {
      if (pkgIds.indexOf(pkg.id) === -1) pkgIds.push(pkg.id);
      total +=
        pkg.period === "BULANAN"
          ? Number(pkg.price)
          : Number(pkg.price) * list.length;
    } else {
      list.forEach(function (a) {
        const jj = jobById(db, a.jobPostingId);
        total += classRate(db, jj ? jj.classId : null);
        if (jj) total += Number(jj.transportAllowance || 0);
      });
    }
  });
  return { total: total, packageIds: pkgIds };
}

/* ============================================================
   BIZ — LAPISAN LOGIKA BISNIS (murni, tanpa DOM)
   Setiap fungsi mengembalikan {ok, message | error}
   ============================================================ */
const Biz = {
  /* ---------- NOTIFIKASI ---------- */
  pushNotify: function (db, userId, title, message, icon) {
    if (!db.notifications) db.notifications = [];
    db.notifications.push({
      id: uid("n"),
      userId: userId,
      title: title,
      message: message,
      icon: icon || "notifications",
      read: false,
      createdAt: new Date().toISOString(),
    });
  },
  unreadCount: function (db, userId) {
    return (db.notifications || []).filter(function (n) {
      return n.userId === userId && !n.read;
    }).length;
  },
  userNotifs: function (db, userId) {
    return (db.notifications || [])
      .filter(function (n) {
        return n.userId === userId;
      })
      .sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  },
  markNotifRead: function (id) {
    const db = loadDB();
    const n = (db.notifications || []).find(function (x) {
      return x.id === id;
    });
    if (n) n.read = true;
    saveDB(db);
    return { ok: true, message: "Notifikasi ditandai dibaca." };
  },
  markAllNotifRead: function (userId) {
    const db = loadDB();
    (db.notifications || []).forEach(function (n) {
      if (n.userId === userId) n.read = true;
    });
    saveDB(db);
    return { ok: true, message: "Semua notifikasi ditandai dibaca." };
  },
  matchingTentors: function (db, job) {
    // tentor yang mapel & jenjangnya cocok dengan lowongan (untuk notifikasi lowongan baru)
    const cls = db.classes.find(function (c) {
      return c.id === job.classId;
    });
    const lvl = cls ? cls.educationLevelId : null;
    return db.users.filter(function (u) {
      if (u.role !== "TENTOR") return false;
      if ((u.subjectIds || []).indexOf(job.subjectId) === -1) return false;
      if (lvl && (u.levelIds || []).indexOf(lvl) === -1) return false;
      const bs = [];
      return true;
    });
  },

  /* ---------- MASTER DATA ---------- */
  saveSubject: function (data, id) {
    const db = loadDB();
    if (!data.name)
      return { ok: false, error: "Nama mata pelajaran wajib diisi." };
    if (id) {
      const s = db.subjects.find(function (x) {
        return x.id === id;
      });
      if (s)
        Object.assign(s, {
          name: data.name,
          description: data.description || "",
        });
    } else {
      if (
        db.subjects.some(function (s) {
          return s.name.toLowerCase() === data.name.trim().toLowerCase();
        })
      )
        return { ok: false, error: "Nama mapel sudah ada." };
      db.subjects.push({
        id: uid("sj"),
        name: data.name.trim(),
        description: data.description || "",
      });
    }
    saveDB(db);
    return { ok: true, message: "Mata pelajaran disimpan." };
  },

  deleteSubject: function (id) {
    const db = loadDB();
    if (
      db.jobs.some(function (j) {
        return j.subjectId === id;
      })
    )
      return { ok: false, error: "Mapel dipakai oleh lowongan les." };
    if (
      db.enrollments.some(function (e) {
        return e.subjectId === id;
      })
    )
      return { ok: false, error: "Mapel dipakai oleh siswa terdaftar." };
    if (
      db.candidates.some(function (c) {
        return (c.subjectIds || []).indexOf(id) !== -1;
      })
    )
      return { ok: false, error: "Mapel dipakai oleh kandidat rekrutmen." };
    db.subjects = db.subjects.filter(function (s) {
      return s.id !== id;
    });
    saveDB(db);
    return { ok: true, message: "Mata pelajaran dihapus." };
  },

  saveLevel: function (data, id) {
    const db = loadDB();
    if (!data.levelName)
      return { ok: false, error: "Nama jenjang wajib diisi." };
    if (id) {
      const l = db.educationLevels.find(function (x) {
        return x.id === id;
      });
      if (l)
        Object.assign(l, {
          levelName: data.levelName,
          description: data.description || "",
        });
    } else {
      db.educationLevels.push({
        id: uid("lv"),
        levelName: data.levelName,
        description: data.description || "",
      });
    }
    saveDB(db);
    return { ok: true, message: "Jenjang disimpan." };
  },

  saveClass: function (data, id) {
    const db = loadDB();
    if (
      !data.className ||
      !data.educationLevelId ||
      !data.baseRatePer90Min ||
      Number(data.baseRatePer90Min) <= 0
    ) {
      return {
        ok: false,
        error: "Nama kelas, jenjang, dan tarif ( > 0 ) wajib diisi.",
      };
    }
    const dup = db.classes.find(function (c) {
      return (
        c.className.toLowerCase() === data.className.trim().toLowerCase() &&
        c.id !== id
      );
    });
    if (dup) return { ok: false, error: "Nama kelas sudah ada." };
    if (id) {
      const c = db.classes.find(function (x) {
        return x.id === id;
      });
      if (c)
        Object.assign(c, {
          className: data.className.trim(),
          educationLevelId: data.educationLevelId,
          baseRatePer90Min: Number(data.baseRatePer90Min),
          description: data.description || "",
        });
    } else {
      db.classes.push({
        id: uid("cl"),
        className: data.className.trim(),
        educationLevelId: data.educationLevelId,
        baseRatePer90Min: Number(data.baseRatePer90Min),
        description: data.description || "",
      });
    }
    saveDB(db);
    return { ok: true, message: "Kelas disimpan." };
  },

  deleteClass: function (id) {
    const db = loadDB();
    if (
      db.jobs.some(function (j) {
        return j.classId === id;
      })
    )
      return { ok: false, error: "Kelas dipakai oleh lowongan les." };
    if (
      db.enrollments.some(function (e) {
        return e.classId === id;
      })
    )
      return { ok: false, error: "Kelas dipakai oleh siswa terdaftar." };
    db.classes = db.classes.filter(function (c) {
      return c.id !== id;
    });
    saveDB(db);
    return { ok: true, message: "Kelas dihapus." };
  },

  deleteLevel: function (id) {
    const db = loadDB();
    if (
      db.classes.some(function (c) {
        return c.educationLevelId === id;
      })
    )
      return {
        ok: false,
        error: "Jenjang masih memiliki kelas. Hapus kelasnya dulu.",
      };
    if (
      db.candidates.some(function (c) {
        return (c.levelIds || []).indexOf(id) !== -1;
      })
    )
      return { ok: false, error: "Jenjang dipakai oleh kandidat rekrutmen." };
    db.educationLevels = db.educationLevels.filter(function (l) {
      return l.id !== id;
    });
    saveDB(db);
    return { ok: true, message: "Jenjang dihapus." };
  },

  savePackage: function (data, id) {
    const db = loadDB();
    if (!data.name || !data.mode || !data.period)
      return {
        ok: false,
        error: "Nama paket, mode, dan periode wajib diisi.",
      };
    if (!data.price || Number(data.price) <= 0)
      return { ok: false, error: "Harga paket wajib diisi ( > 0 )." };
    const dup = (db.packages || []).find(function (p) {
      return p.name.toLowerCase() === data.name.trim().toLowerCase() && p.id !== id;
    });
    if (dup) return { ok: false, error: "Nama paket sudah ada." };
    const body = {
      name: data.name.trim(),
      mode: data.mode,
      period: data.period,
      price: Number(data.price),
      tentorFee: Number(data.tentorFee || 0),
      sessionsPerPeriod: Number(data.sessionsPerPeriod || 1),
      maxStudents:
        data.mode === "KELOMPOK"
          ? Number(data.maxStudents || 5)
          : Number(data.maxStudents || 1),
      description: data.description || "",
      active: data.active === "1" || data.active === true,
    };
    if (id) {
      const p = (db.packages || []).find(function (x) {
        return x.id === id;
      });
      if (p) Object.assign(p, body);
    } else {
      if (!db.packages) db.packages = [];
      body.id = uid("pkg");
      db.packages.push(body);
    }
    saveDB(db);
    return { ok: true, message: "Paket les disimpan." };
  },

  deletePackage: function (id) {
    const db = loadDB();
    if (
      db.jobs.some(function (j) {
        return j.packageId === id;
      })
    )
      return { ok: false, error: "Paket dipakai oleh lowongan les." };
    if (
      db.enrollments.some(function (e) {
        return e.packageId === id;
      })
    )
      return { ok: false, error: "Paket dipakai oleh siswa terdaftar." };
    db.packages = (db.packages || []).filter(function (p) {
      return p.id !== id;
    });
    saveDB(db);
    return { ok: true, message: "Paket les dihapus." };
  },

  saveUser: function (data, id) {
    const db = loadDB();
    if (!data.fullName || !data.email || !data.role)
      return { ok: false, error: "Nama, email, dan peran wajib diisi." };
    const email = data.email.trim().toLowerCase();
    const dup = db.users.find(function (u) {
      return u.email.toLowerCase() === email && u.id !== id;
    });
    if (dup) return { ok: false, error: "Email sudah terdaftar." };
    if (!id && !data.password)
      return { ok: false, error: "Password wajib diisi untuk akun baru." };
    if (id) {
      const u = db.users.find(function (x) {
        return x.id === id;
      });
      if (u) {
        Object.assign(u, {
          fullName: data.fullName,
          email: email,
          phone: data.phone || "",
          role: data.role,
        });
        if (data.password) u.password = data.password;
      }
    } else {
      db.users.push({
        id: uid("u"),
        fullName: data.fullName,
        email: email,
        phone: data.phone || "",
        role: data.role,
        password: data.password,
      });
    }
    saveDB(db);
    return { ok: true, message: "Akun pengguna disimpan." };
  },

  deleteUser: function (id) {
    const db = loadDB();
    const u = db.users.find(function (x) {
      return x.id === id;
    });
    if (!u) return { ok: false, error: "Akun tidak ditemukan." };
    if (
      db.enrollments.some(function (e) {
        return e.studentId === id;
      })
    )
      return {
        ok: false,
        error: "Akun terdaftar sebagai siswa pada program les.",
      };
    if (
      db.jobs.some(function (j) {
        return j.assignedTentorId === id;
      })
    )
      return { ok: false, error: "Akun terhubung dengan lowongan les." };
    if (
      db.attendances.some(function (a) {
        return a.tentorId === id || a.approvedById === id;
      })
    )
      return { ok: false, error: "Akun memiliki riwayat presensi." };
    if (
      db.applications.some(function (a) {
        return a.tentorId === id;
      })
    )
      return { ok: false, error: "Akun memiliki lamaran lowongan." };
    if (
      db.invoices.some(function (i) {
        return i.studentId === id;
      })
    )
      return { ok: false, error: "Akun memiliki tagihan SPP." };
    if (
      db.payrollClaims.some(function (c) {
        return c.tentorId === id || c.processedById === id;
      })
    )
      return { ok: false, error: "Akun memiliki klaim gaji." };
    db.notifications = (db.notifications || []).filter(function (n) {
      return n.userId !== id;
    });
    db.users = db.users.filter(function (x) {
      return x.id !== id;
    });
    saveDB(db);
    return { ok: true, message: "Akun dihapus." };
  },

  /* ---------- SISWA / ENROLLMENT ---------- */
  saveEnrollment: function (data, id) {
    const db = loadDB();
    if (
      !data.classId ||
      !data.subjectId ||
      !data.packageId ||
      !data.fullAddress ||
      data.latitude === null ||
      data.longitude === null
    ) {
      return {
        ok: false,
        error: "Lengkapi kelas, mapel, paket les, alamat, dan koordinat siswa.",
      };
    }
    if (!packageById(db, data.packageId))
      return { ok: false, error: "Paket les tidak ditemukan." };
    let studentId = data.studentId;
    if (data.newStudent === "1") {
      if (!data.newName || !data.newEmail || !data.newPassword)
        return { ok: false, error: "Lengkapi data akun siswa baru." };
      const email = data.newEmail.trim().toLowerCase();
      if (
        db.users.some(function (u) {
          return u.email.toLowerCase() === email;
        })
      )
        return { ok: false, error: "Email akun siswa sudah terdaftar." };
      const nu = {
        id: uid("u"),
        fullName: data.newName,
        email: email,
        phone: data.newPhone || "",
        role: "WALI_MURID",
        password: data.newPassword,
      };
      db.users.push(nu);
      studentId = nu.id;
    }
    if (!studentId)
      return { ok: false, error: "Pilih akun siswa atau buat akun baru." };
    if (id) {
      const e = db.enrollments.find(function (x) {
        return x.id === id;
      });
      if (e)
        Object.assign(e, {
          studentId: studentId,
          classId: data.classId,
          subjectId: data.subjectId,
          packageId: data.packageId,
          parentName: data.parentName || "",
          parentPhone: data.parentPhone || "",
          fullAddress: data.fullAddress,
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
        });
    } else {
      db.enrollments.push({
        id: uid("e"),
        studentId: studentId,
        classId: data.classId,
        subjectId: data.subjectId,
        packageId: data.packageId,
        parentName: data.parentName || "",
        parentPhone: data.parentPhone || "",
        fullAddress: data.fullAddress,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
      });
    }
    // pastikan role user = STUDENT
    db.users.forEach(function (u) {
      if (u.id === studentId && u.role !== "STUDENT") u.role = "STUDENT";
    });
    saveDB(db);
    return { ok: true, message: "Data siswa disimpan." };
  },

  deleteEnrollment: function (id) {
    const db = loadDB();
    if (
      db.jobs.some(function (j) {
        return j.studentEnrollmentId === id;
      })
    )
      return { ok: false, error: "Siswa masih memiliki lowongan les." };
    if (
      db.attendances.some(function (a) {
        return a.studentEnrollmentId === id;
      })
    )
      return { ok: false, error: "Siswa memiliki riwayat presensi." };
    db.enrollments = db.enrollments.filter(function (e) {
      return e.id !== id;
    });
    saveDB(db);
    return { ok: true, message: "Data siswa dihapus." };
  },

  updateProfile: function (userId, data) {
    const db = loadDB();
    const u = db.users.find(function (x) {
      return x.id === userId;
    });
    if (!u) return { ok: false, error: "Akun tidak ditemukan." };
    if (!data.fullName || !data.email)
      return { ok: false, error: "Nama dan email wajib diisi." };
    const email = data.email.trim().toLowerCase();
    if (
      db.users.some(function (x) {
        return x.email.toLowerCase() === email && x.id !== userId;
      })
    )
      return { ok: false, error: "Email sudah dipakai akun lain." };
    if (data.password && data.password.length < 6)
      return { ok: false, error: "Password minimal 6 karakter." };
    // validasi field khusus role sebelum disimpan
    if (u.role === "TENTOR") {
      const subjects = Array.isArray(data.subjectIds)
        ? data.subjectIds
        : data.subjectIds
          ? [data.subjectIds]
          : [];
      const levels = Array.isArray(data.levelIds)
        ? data.levelIds
        : data.levelIds
          ? [data.levelIds]
          : [];
      if (!subjects.length || !levels.length)
        return {
          ok: false,
          error: "Mapel & jenjang yang bisa diajar wajib diisi minimal 1.",
        };
    }
    u.fullName = data.fullName;
    u.email = email;
    u.phone = data.phone || "";
    if (data.password) u.password = data.password;
    if (u.role === "TENTOR") {
      u.subjectIds = Array.isArray(data.subjectIds)
        ? data.subjectIds
        : data.subjectIds
          ? [data.subjectIds]
          : [];
      u.levelIds = Array.isArray(data.levelIds)
        ? data.levelIds
        : data.levelIds
          ? [data.levelIds]
          : [];

      u.education = data.education || "";
      u.experienceYears = Number(data.experienceYears || 0);
    } else if (u.role === "WALI_MURID") {
      u.education = data.education || "";
      u.experienceYears = Number(data.experienceYears || 0);
    } else if (u.role === "SUPER_ADMIN") {
      u.position = data.position || "";
    } else if (u.role === "STUDENT") {
      u.school = data.school || "";
    }
    saveDB(db);
    return { ok: true, message: "Profil berhasil diperbarui." };
  },

  /* ---------- LOWONGAN & ALUR PENUGASAN ---------- */
  saveJob: function (data, id) {
    const db = loadDB();
    if (!data.title || data.title.length < 5)
      return { ok: false, error: "Judul lowongan minimal 5 karakter." };
    const pkg = data.packageId ? packageById(db, data.packageId) : null;
    let enrIds = Array.isArray(data.studentEnrollmentIds)
      ? data.studentEnrollmentIds.slice()
      : [];
    if (!enrIds.length && data.studentEnrollmentId)
      enrIds = [data.studentEnrollmentId];
    enrIds = enrIds.filter(function (eid) {
      return db.enrollments.some(function (e) {
        return e.id === eid;
      });
    });
    if (!enrIds.length)
      return { ok: false, error: "Pilih minimal satu siswa." };
    if (
      pkg &&
      pkg.mode === "KELOMPOK" &&
      pkg.maxStudents &&
      enrIds.length > pkg.maxStudents
    )
      return {
        ok: false,
        error:
          "Paket kelompok maksimal " + pkg.maxStudents + " siswa per lowongan.",
      };
    if (!pkg || pkg.mode !== "KELOMPOK") enrIds = enrIds.slice(0, 1);
    if (!data.classId || !data.subjectId || !data.preferredSchedule) {
      return { ok: false, error: "Lengkapi kelas, mapel, dan jadwal." };
    }
    const mode = data.mode === "ONLINE" ? "ONLINE" : "OFFLINE";
    if (!data.packageId)
      return { ok: false, error: "Pilih paket les untuk lowongan ini." };
    if (!packageById(db, data.packageId))
      return { ok: false, error: "Paket les tidak ditemukan." };
    const lat = Number(data.latitude),
      lng = Number(data.longitude);
    if (
      mode === "OFFLINE" &&
      (data.latitude === null ||
        data.latitude === undefined ||
        data.latitude === "" ||
        isNaN(lat) ||
        lat < -90 ||
        lat > 90 ||
        data.longitude === null ||
        data.longitude === undefined ||
        data.longitude === "" ||
        isNaN(lng) ||
        lng < -180 ||
        lng > 180)
    ) {
      return {
        ok: false,
        error:
          'Koordinat GPS lokasi les wajib diisi untuk les offline (klik "Ambil Lokasi dari Siswa").',
      };
    }
    if (id) {
      const j = db.jobs.find(function (x) {
        return x.id === id;
      });
      if (j)
        Object.assign(j, {
          title: data.title,
          jobType: data.jobType || "REGULAR",
          mode: mode,
          studentEnrollmentIds: enrIds,
          studentEnrollmentId: enrIds[0],
          classId: data.classId,
          subjectId: data.subjectId,
          packageId: data.packageId,
          preferredSchedule: data.preferredSchedule,
          transportAllowance: Number(data.transportAllowance || 0),
          latitude: mode === "ONLINE" ? null : lat,
          longitude: mode === "ONLINE" ? null : lng,
          additionalNotes: data.additionalNotes || "",
        });
    } else {
      db.jobs.push({
        id: uid("j"),
        title: data.title,
        jobType: data.jobType || "REGULAR",
        mode: mode,
        status: "AVAILABLE",
        studentEnrollmentIds: enrIds,
        studentEnrollmentId: enrIds[0],
        classId: data.classId,
        subjectId: data.subjectId,
        packageId: data.packageId,
        assignedTentorId: null,
        preferredSchedule: data.preferredSchedule,
        transportAllowance: Number(data.transportAllowance || 0),
        latitude: mode === "ONLINE" ? null : lat,
        longitude: mode === "ONLINE" ? null : lng,
        additionalNotes: data.additionalNotes || "",
      });
      // notifikasi lowongan baru untuk tentor yang cocok (mapel & jenjang)
      const jnew = db.jobs[db.jobs.length - 1];
      Biz.matchingTentors(db, jnew).forEach(function (t) {
        Biz.pushNotify(
          db,
          t.id,
          "Lowongan baru tersedia",
          '"' +
            jnew.title +
            '" — ' +
            "" +
            " · estimasi " +
            idr(Biz.sessionFee({ jobPostingId: jnew.id })) +
            "/sesi.",
          "work",
        );
      });
    }
    saveDB(db);
    return { ok: true, message: "Lowongan disimpan." };
  },

  deleteJob: function (id) {
    const db = loadDB();
    if (
      db.attendances.some(function (a) {
        return a.jobPostingId === id;
      })
    )
      return {
        ok: false,
        error: "Lowongan memiliki riwayat presensi, tidak bisa dihapus.",
      };
    db.applications = db.applications.filter(function (a) {
      return a.jobPostingId !== id;
    });
    db.jobs = db.jobs.filter(function (j) {
      return j.id !== id;
    });
    saveDB(db);
    return { ok: true, message: "Lowongan dihapus." };
  },

  applyJob: function (jobId, tentorId) {
    const db = loadDB();
    const j = jobById(db, jobId);
    if (!j) return { ok: false, error: "Lowongan tidak ditemukan." };
    if (j.status !== "AVAILABLE" && j.status !== "NEGOTIATING")
      return {
        ok: false,
        error:
          "Lowongan sudah terkunci (Ditugaskan/Dibatalkan) dan tidak bisa dilamar.",
      };
    if (
      db.applications.some(function (a) {
        return (
          a.jobPostingId === jobId &&
          a.tentorId === tentorId &&
          (a.status === "PENDING" ||
            a.status === "UNDER_REVIEW" ||
            a.status === "ACCEPTED")
        );
      })
    )
      return {
        ok: false,
        error: "Anda sudah memiliki lamaran aktif pada lowongan ini.",
      };
    db.applications.push({
      id: uid("a"),
      jobPostingId: jobId,
      tentorId: tentorId,
      status: "PENDING",
      notes: "",
    });
    j.status = "NEGOTIATING";
    Biz.pushNotify(
      db,
      "u-admin",
      "Lamaran baru masuk",
      userName(db, tentorId) + ' melamar "' + j.title + '".',
      "work",
    );
    saveDB(db);
    return {
      ok: true,
      message:
        "Lamaran terkirim. Status lowongan berubah menjadi Sedang Negosiasi.",
    };
  },

  decideApplication: function (appId, decision) {
    const db = loadDB();
    const app = db.applications.find(function (a) {
      return a.id === appId;
    });
    if (!app) return { ok: false, error: "Lamaran tidak ditemukan." };
    const j = jobById(db, app.jobPostingId);
    if (!j) return { ok: false, error: "Lowongan tidak ditemukan." };
    if (decision === "approve") {
      j.status = "ASSIGNED";
      j.assignedTentorId = app.tentorId;
      db.applications.forEach(function (a) {
        if (a.jobPostingId === j.id)
          a.status = a.id === appId ? "ACCEPTED" : "REJECTED";
      });
      Biz.pushNotify(
        db,
        app.tentorId,
        "Penugasan diterima",
        'Lamaran Anda pada "' +
          j.title +
          '" disetujui oleh Admin ' +
          "Admin" +
          ".",
        "event_available",
      );
      saveDB(db);
      return {
        ok: true,
        message:
          "Penugasan disetujui. Lowongan terkunci untuk " +
          userName(db, app.tentorId) +
          ".",
      };
    }
    app.status = "REJECTED";
    const stillPending = db.applications.some(function (a) {
      return a.jobPostingId === j.id && a.status === "PENDING";
    });
    if (!stillPending && j.status === "NEGOTIATING") j.status = "AVAILABLE";
    saveDB(db);
    return { ok: true, message: "Lamaran ditolak." };
  },

  setJobStatus: function (jobId, status, tentorId) {
    const db = loadDB();
    const j = jobById(db, jobId);
    if (!j) return { ok: false, error: "Lowongan tidak ditemukan." };
    if (status === "ASSIGNED") {
      if (!tentorId)
        return { ok: false, error: "Pilih tentor yang akan ditugaskan." };
      j.status = "ASSIGNED";
      j.assignedTentorId = tentorId;
      db.applications.forEach(function (a) {
        if (a.jobPostingId === jobId && a.status === "PENDING")
          a.status = "REJECTED";
      });
      Biz.pushNotify(
        db,
        tentorId,
        "Penugasan baru",
        'Anda ditugaskan mengajar "' +
          j.title +
          '" — ' +
          (j.preferredSchedule || "jadwal menyusul") +
          ".",
        "event_available",
      );
      saveDB(db);
      return {
        ok: true,
        message:
          "Lowongan dikunci & ditugaskan ke " + userName(db, tentorId) + ".",
      };
    }
    if (status === "AVAILABLE") {
      j.status = "AVAILABLE";
      j.assignedTentorId = null;
      saveDB(db);
      return { ok: true, message: "Lowongan dikembalikan ke status Tersedia." };
    }
    if (status === "CANCELLED") {
      const prevTentor = j.assignedTentorId;
      j.status = "CANCELLED";
      j.assignedTentorId = null;
      db.applications.forEach(function (a) {
        if (a.jobPostingId === jobId && a.status === "PENDING")
          a.status = "REJECTED";
      });
      if (prevTentor)
        Biz.pushNotify(
          db,
          prevTentor,
          "Penugasan dibatalkan",
          'Lowongan "' +
            j.title +
            '" yang Anda ampu dibatalkan oleh Admin ' +
            "Admin" +
            ". Penugasan dilepas.",
          "event_busy",
        );
      saveDB(db);
      return {
        ok: true,
        message:
          "Lowongan dibatalkan. Lamaran tertunda ditolak & tentor yang ditugaskan diberitahu.",
      };
    }
    return { ok: false, error: "Status tidak valid." };
  },

  /* ---------- PRESENSI ---------- */
  createAttendance: function (data, tentor) {
    const db = loadDB();
    const j = jobById(db, data.jobPostingId);
    if (!j) return { ok: false, error: "Lowongan tidak ditemukan." };
    if (j.assignedTentorId !== tentor.id)
      return { ok: false, error: "Anda tidak ditugaskan pada lowongan ini." };
    if (!data.sessionDate || !data.startTime || !data.endTime)
      return { ok: false, error: "Tanggal dan waktu sesi wajib diisi." };
    const sMin = time24ToMin(data.startTime),
      eMin = time24ToMin(data.endTime);
    if (sMin === null || eMin === null)
      return {
        ok: false,
        error:
          "Format jam tidak valid — gunakan format 24 jam HH:MM (cth: 14:30).",
      };
    if (sMin === eMin)
      return { ok: false, error: "Jam mulai dan selesai tidak boleh sama." };
    const dur = eMin > sMin ? eMin - sMin : eMin - sMin + 1440;
    if (dur < 60)
      return {
        ok: false,
        error: "Durasi sesi minimal 60 menit (standar 90 menit).",
      };
    const start = new Date(data.sessionDate + "T" + data.startTime + ":00");
    const end = new Date(data.sessionDate + "T" + data.endTime + ":00");
    if (end <= start) end.setTime(end.getTime() + 24 * 3600000);
    const online = j.mode === "ONLINE";
    const lat = Number(data.latitudeCheckIn),
      lng = Number(data.longitudeCheckIn);
    if (
      !online &&
      (data.latitudeCheckIn === null ||
        data.longitudeCheckIn === null ||
        data.latitudeCheckIn === "" ||
        data.longitudeCheckIn === "" ||
        isNaN(lat) ||
        isNaN(lng))
    ) {
      return {
        ok: false,
        error:
          "Koordinat GPS check-in wajib diisi (klik Ambil Lokasi / Simulasi GPS).",
      };
    }
    if (!data.topicTaught || data.topicTaught.length < 3)
      return { ok: false, error: "Topik materi wajib diisi (min 3 karakter)." };
    const enr = db.enrollments.find(function (e) {
      return e.id === j.studentEnrollmentId;
    });
    const refLat =
      j.latitude !== undefined && j.latitude !== null
        ? j.latitude
        : enr
          ? enr.latitude
          : null;
    const refLng =
      j.longitude !== undefined && j.longitude !== null
        ? j.longitude
        : enr
          ? enr.longitude
          : null;
    const dist =
      !online && refLat !== null && refLng !== null
        ? haversine(lat, lng, refLat, refLng)
        : 0;
    const sessionsCount = Math.round(dur / 9) / 10;
    const students = jobStudentIds(db, j);
    students.forEach(function (eid) {
      db.attendances.push({
        id: uid("att"),
        jobPostingId: j.id,
        studentEnrollmentId: eid,
        tentorId: tentor.id,
        sessionDate: data.sessionDate,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        durationMinutes: dur,
        sessionsCount: sessionsCount,
        latitudeCheckIn: online ? null : lat,
        longitudeCheckIn: online ? null : lng,
        topicTaught: data.topicTaught,
        activityNotes: data.activityNotes || "",
        status: "SUBMITTED",
        approvedById: null,
        rejectionReason: null,
        payrollClaimId: null,
        invoiceId: null,
        outOfRadius: !online && dist > 200,
      });
    });
    Biz.pushNotify(
      db,
      "u-admin",
      "Presensi baru menunggu verifikasi",
      userName(db, tentor.id) +
        " mengirim presensi " +
        fmtDate(data.sessionDate) +
        " — topik: " +
        data.topicTaught +
        (online
          ? " (les online)."
          : dist > 200
            ? " (terdeteksi di luar radius 200m)."
            : "."),
      "fact_check",
    );
    saveDB(db);
    return {
      ok: true,
      message:
        "Presensi terkirim" +
        (online
          ? "."
          : dist > 200
            ? " — terdeteksi di luar radius 200m, menunggu verifikasi manual Admin."
            : "."),
    };
  },

  verifyAttendance: function (attId, approve, reason, admin) {
    const db = loadDB();
    const a = db.attendances.find(function (x) {
      return x.id === attId;
    });
    if (!a) return { ok: false, error: "Presensi tidak ditemukan." };
    if (a.status !== "SUBMITTED")
      return { ok: false, error: "Presensi sudah diverifikasi." };
    if (approve) {
      a.status = "APPROVED";
      a.approvedById = "u-admin";
      a.rejectionReason = null;
      Biz.pushNotify(
        db,
        a.tentorId,
        "Presensi disetujui",
        "Sesi " +
          fmtDate(a.sessionDate) +
          " (" +
          a.topicTaught +
          ") disetujui oleh Admin.",
        "fact_check",
      );
      saveDB(db);
      return {
        ok: true,
        message:
          "Presensi disetujui. Sesi siap untuk klaim gaji & tagihan SPP.",
      };
    }
    if (!reason) return { ok: false, error: "Alasan penolakan wajib diisi." };
    a.status = "REJECTED";
    a.approvedById = "u-admin";
    a.rejectionReason = reason;
    Biz.pushNotify(
      db,
      a.tentorId,
      "Presensi ditolak",
      "Sesi " +
        fmtDate(a.sessionDate) +
        " (" +
        a.topicTaught +
        ") ditolak. Alasan: " +
        reason,
      "fact_check",
    );
    saveDB(db);
    return { ok: true, message: "Presensi ditolak." };
  },

  /* ---------- PAYROLL ---------- */
  claimableSessions: function (db, tentorId, month, year) {
    return db.attendances.filter(function (a) {
      if (
        a.tentorId !== tentorId ||
        a.status !== "APPROVED" ||
        a.payrollClaimId
      )
        return false;
      const j = jobById(db, a.jobPostingId);
      if (!j) return false;
      const d = new Date(a.sessionDate + "T00:00:00");
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  },
  createClaim: function (tentorId, month, year) {
    const db = loadDB();
    const sessions = Biz.claimableSessions(db, tentorId, month, year);
    if (!sessions.length)
      return {
        ok: false,
        error: "Tidak ada sesi APPROVED yang bisa diklaim pada periode ini.",
      };
    if (
      db.payrollClaims.some(function (c) {
        return (
          c.tentorId === tentorId &&
          c.monthPeriod === month &&
          c.yearPeriod === year
        );
      })
    ) {
      return {
        ok: false,
        error: "Klaim untuk tentor & periode ini sudah ada.",
      };
    }
    const honorTotal = sessions.reduce(function (s, a) {
      return s + Biz.sessionFee(a);
    }, 0);
    const ci = db.payrollClaims.length + 1;
    const ym = String(year).slice(-2) + String(month).padStart(2, "0");
    const claim = {
      id: uid("pc"),
      claimNumber:
        "PRL/" +
        year +
        "/" +
        String(month).padStart(2, "0") +
        "/ADM-" +
        String(ci).padStart(3, "0"),
      monthPeriod: month,
      yearPeriod: year,
      tentorId: tentorId,
      totalSessions: sessions.length,
      baseHonorAmount: honorTotal,
      transportAmount: 0,
      totalClaimAmount: honorTotal,
      status: "REQUESTED",
      processedById: null,
      paymentProofUrl: null,
      paidAt: null,
    };
    db.payrollClaims.push(claim);
    sessions.forEach(function (a) {
      a.payrollClaimId = claim.id;
    });
    Biz.pushNotify(
      db,
      tentorId,
      "Klaim honor diajukan",
      "Klaim " +
        claim.claimNumber +
        " untuk periode " +
        monthLabel(month, year) +
        " (" +
        sessions.length +
        " sesi, total " +
        idr(claim.totalClaimAmount) +
        ") telah diajukan.",
      "payments",
    );
    saveDB(db);
    return {
      ok: true,
      message:
        "Klaim honor berhasil diajukan: " +
        claim.claimNumber +
        " (" +
        sessions.length +
        " sesi, " +
        idr(claim.totalClaimAmount) +
        ").",
    };
  },
  sessionFee: function (att) {
    const db = loadDB();
    const j = jobById(db, att.jobPostingId);
    const n = Number(att.sessionsCount || 1);
    return jobSessionFee(db, j) * n;
  },
  processClaim: function (claimId, action, note) {
    const db = loadDB();
    const c = db.payrollClaims.find(function (x) {
      return x.id === claimId;
    });
    if (!c) return { ok: false, error: "Klaim tidak ditemukan." };
    if (c.status !== "REQUESTED")
      return { ok: false, error: "Klaim sudah diproses." };
    if (action === "pay") {
      c.status = "PAID";
      c.processedById = "u-admin";
      c.paymentProofUrl = note || "";
      c.paidAt = new Date().toISOString();
      Biz.pushNotify(
        db,
        c.tentorId,
        "Klaim dibayar",
        "Klaim " +
          c.claimNumber +
          " telah dicairkan. Total: " +
          idr(c.totalClaimAmount) +
          ".",
        "payments",
      );
      saveDB(db);
      return { ok: true, message: "Klaim ditandai sebagai DICAIRKAN." };
    }
    if (action === "reject") {
      if (!note) return { ok: false, error: "Alasan penolakan wajib diisi." };
      c.status = "REJECTED";
      c.processedById = "u-admin";
      c.paymentProofUrl = note;
      db.attendances.forEach(function (a) {
        if (a.payrollClaimId === c.id) a.payrollClaimId = null;
      });
      Biz.pushNotify(
        db,
        c.tentorId,
        "Klaim ditolak",
        "Klaim " + c.claimNumber + " ditolak. Alasan: " + note,
        "payments",
      );
      saveDB(db);
      return {
        ok: true,
        message:
          "Klaim ditolak. Sesi dilepas dari klaim dan bisa diklaim ulang.",
      };
    }
    return { ok: false, error: "Aksi tidak dikenal." };
  },

  /* ---------- INVOICE ---------- */
  invoiceableSessions: function (db, studentId, month, year) {
    const myEnr = db.enrollments
      .filter(function (e) {
        return e.studentId === studentId;
      })
      .map(function (e) {
        return e.id;
      });
    return db.attendances.filter(function (a) {
      if (
        myEnr.indexOf(a.studentEnrollmentId) === -1 ||
        a.status !== "APPROVED" ||
        a.invoiceId
      )
        return false;
      const d = new Date(a.sessionDate + "T00:00:00");
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  },

  generateInvoice: function (studentId, month, year) {
    const db = loadDB();
    const sessions = Biz.invoiceableSessions(db, studentId, month, year);
    if (!sessions.length)
      return {
        ok: false,
        error:
          "Tidak ada sesi APPROVED untuk ditagihkan pada periode tersebut.",
      };
    const bill = billingTotal(db, sessions);
    const inv = {
      id: uid("inv"),
      invoiceNumber:
        "INV/" +
        year +
        "/" +
        String(month).padStart(2, "0") +
        "/" +
        "ADM".replace(/^BR-/, "") +
        "-" +
        String(db.invoices.length + 1).padStart(3, "0"),
      monthPeriod: month,
      yearPeriod: year,
      studentId: studentId,
      totalSessions: sessions.length,
      totalAmount: bill.total,
      packageIds: bill.packageIds,
      status: "UNPAID",
      paidAt: null,
    };
    db.invoices.push(inv);
    sessions.forEach(function (a) {
      a.invoiceId = inv.id;
    });
    Biz.pushNotify(
      db,
      studentId,
      "Tagihan SPP diterbitkan",
      inv.invoiceNumber +
        " sebesar " +
        idr(inv.totalAmount) +
        " untuk " +
        sessions.length +
        " sesi " +
        monthLabel(month, year) +
        ".",
      "receipt_long",
    );
    saveDB(db);
    return {
      ok: true,
      message:
        "Tagihan SPP " +
        monthLabel(month, year) +
        " diterbitkan: " +
        sessions.length +
        " sesi, total " +
        idr(inv.totalAmount) +
        ".",
    };
  },

  deleteInvoice: function (id) {
    const db = loadDB();
    const inv = db.invoices.find(function (x) {
      return x.id === id;
    });
    if (!inv) return { ok: false, error: "Tagihan tidak ditemukan." };
    if (inv.status === "PAID")
      return { ok: false, error: "Tagihan lunas tidak bisa dihapus." };
    db.attendances.forEach(function (a) {
      if (a.invoiceId === id) a.invoiceId = null;
    });
    db.invoices = db.invoices.filter(function (x) {
      return x.id !== id;
    });
    saveDB(db);
    return { ok: true, message: "Tagihan dihapus." };
  },

  payInvoice: function (id) {
    const db = loadDB();
    const inv = db.invoices.find(function (x) {
      return x.id === id;
    });
    if (!inv) return { ok: false, error: "Tagihan tidak ditemukan." };
    if (inv.status === "PAID")
      return { ok: false, error: "Tagihan sudah lunas." };
    inv.status = "PAID";
    inv.paidAt = new Date().toISOString();
    Biz.pushNotify(
      db,
      inv.studentId,
      "Pembayaran SPP diterima",
      userName(db, inv.studentId) +
        " melunasi " +
        inv.invoiceNumber +
        " (" +
        idr(inv.totalAmount) +
        ").",
      "payments",
      );
    saveDB(db);
    return {
      ok: true,
      message: "Pembayaran SPP tercatat (simulasi). Tagihan lunas.",
    };
  },

  /* ---------- REKRUTMEN TENTOR ---------- */
  saveCandidate: function (data, id) {
    const db = loadDB();
    if (!data.fullName || !data.email)
      return { ok: false, error: "Nama dan email wajib diisi." };
    const email = data.email.trim().toLowerCase();
    const dup = db.candidates.find(function (c) {
      return c.email.toLowerCase() === email && c.id !== id;
    });
    if (dup) return { ok: false, error: "Email kandidat sudah terdaftar." };
    if (
      db.users.some(function (u) {
        return u.email.toLowerCase() === email;
      })
    )
      return { ok: false, error: "Email sudah dipakai akun pengguna." };
    const subjects = Array.isArray(data.subjectIds)
      ? data.subjectIds
      : data.subjectIds
        ? [data.subjectIds]
        : [];
    const levels = Array.isArray(data.levelIds)
      ? data.levelIds
      : data.levelIds
        ? [data.levelIds]
        : [];
    if (!subjects.length || !levels.length)
      return {
        ok: false,
        error: "Pilih minimal 1 mapel dan 1 jenjang yang bisa diajar.",
      };
    if (id) {
      const c = db.candidates.find(function (x) {
        return x.id === id;
      });
      if (c)
        Object.assign(c, {
          fullName: data.fullName,
          email: email,
          phone: data.phone || "",
          education: data.education || "",
          subjectIds: subjects,
          levelIds: levels,
          experienceYears: Number(data.experienceYears || 0),
          source: data.source || "",
        });
    } else {
      db.candidates.push({
        id: uid("c"),
        fullName: data.fullName,
        email: email,
        phone: data.phone || "",
        education: data.education || "",
        subjectIds: subjects,
        levelIds: levels,
        experienceYears: Number(data.experienceYears || 0),
        source: data.source || "",
        status: "REGISTERED",
        registeredAt: new Date().toISOString().slice(0, 10),
        testScheduledAt: null,
        testScore: null,
        testNotes: "",
        interviewScheduledAt: null,
        interviewNotes: "",
        rejectionReason: null,
        tentorUserId: null,
      });
    }
    saveDB(db);
    return { ok: true, message: "Kandidat disimpan." };
  },

  deleteCandidate: function (id) {
    const db = loadDB();
    const c = db.candidates.find(function (x) {
      return x.id === id;
    });
    if (!c) return { ok: false, error: "Kandidat tidak ditemukan." };
    if (c.status === "ACCEPTED")
      return {
        ok: false,
        error: "Kandidat yang sudah diterima tidak bisa dihapus.",
      };
    db.candidates = db.candidates.filter(function (x) {
      return x.id !== id;
    });
    saveDB(db);
    return { ok: true, message: "Kandidat dihapus." };
  },

  scheduleTest: function (id, when) {
    const db = loadDB();
    const c = db.candidates.find(function (x) {
      return x.id === id;
    });
    if (!c) return { ok: false, error: "Kandidat tidak ditemukan." };
    if (c.status !== "REGISTERED")
      return {
        ok: false,
        error: "Hanya kandidat Pendaftar Baru yang bisa dijadwalkan tes.",
      };
    if (!when) return { ok: false, error: "Jadwal tes wajib diisi." };
    c.status = "TEST_SCHEDULED";
    c.testScheduledAt = when;
    saveDB(db);
    return { ok: true, message: "Tes dijadwalkan: " + fmtDateTime(when) + "." };
  },

  recordTest: function (id, score, notes) {
    const db = loadDB();
    const c = db.candidates.find(function (x) {
      return x.id === id;
    });
    if (!c) return { ok: false, error: "Kandidat tidak ditemukan." };
    if (c.status !== "TEST_SCHEDULED")
      return { ok: false, error: "Kandidat belum dijadwalkan tes." };
    if (
      score === null ||
      score === undefined ||
      score === "" ||
      Number(score) < 0 ||
      Number(score) > 100
    )
      return { ok: false, error: "Skor tes wajib diisi (0–100)." };
    c.status = "TESTED";
    c.testScore = Number(score);
    c.testNotes = notes || "";
    saveDB(db);
    return { ok: true, message: "Hasil tes dicatat: " + c.testScore + "/100." };
  },

  scheduleInterview: function (id, when) {
    const db = loadDB();
    const c = db.candidates.find(function (x) {
      return x.id === id;
    });
    if (!c) return { ok: false, error: "Kandidat tidak ditemukan." };
    if (c.status !== "TESTED")
      return {
        ok: false,
        error: "Kandidat harus menyelesaikan tes sebelum wawancara.",
      };
    if (!when) return { ok: false, error: "Jadwal wawancara wajib diisi." };
    c.status = "INTERVIEW_SCHEDULED";
    c.interviewScheduledAt = when;
    saveDB(db);
    return {
      ok: true,
      message: "Wawancara dijadwalkan: " + fmtDateTime(when) + ".",
    };
  },

  recordInterview: function (id, notes) {
    const db = loadDB();
    const c = db.candidates.find(function (x) {
      return x.id === id;
    });
    if (!c) return { ok: false, error: "Kandidat tidak ditemukan." };
    if (c.status !== "INTERVIEW_SCHEDULED")
      return { ok: false, error: "Kandidat belum dijadwalkan wawancara." };
    if (!notes) return { ok: false, error: "Hasil wawancara wajib diisi." };
    c.status = "INTERVIEWED";
    c.interviewNotes = notes;
    saveDB(db);
    return {
      ok: true,
      message:
        "Hasil wawancara dicatat. Kandidat siap untuk keputusan penerimaan.",
    };
  },

  acceptCandidate: function (id, data) {
    const db = loadDB();
    const c = db.candidates.find(function (x) {
      return x.id === id;
    });
    if (!c) return { ok: false, error: "Kandidat tidak ditemukan." };
    if (c.status !== "INTERVIEWED")
      return {
        ok: false,
        error: "Kandidat harus melewati wawancara sebelum diterima.",
      };
    if (
      db.users.some(function (u) {
        return u.email.toLowerCase() === c.email.toLowerCase();
      })
    )
      return {
        ok: false,
        error: "Email kandidat sudah menjadi akun pengguna.",
      };
    const nu = {
      id: uid("u"),
      fullName: c.fullName,
      email: c.email.toLowerCase(),
      phone: c.phone || "",
      role: "TENTOR",
      password: (data && data.password) || "tentor123",
      education: c.education || "",
      experienceYears: Number(c.experienceYears || 0),
      subjectIds: c.subjectIds || [],
      levelIds: c.levelIds || [],
    };
    db.users.push(nu);
    c.status = "ACCEPTED";
    c.tentorUserId = nu.id;
    saveDB(db);
    return {
      ok: true,
      message:
        c.fullName +
        " diterima. Akun tentor dibuat: " +
        nu.email +
        " (password awal: " +
        nu.password +
        ").",
    };
  },

  rejectCandidate: function (id, reason) {
    const db = loadDB();
    const c = db.candidates.find(function (x) {
      return x.id === id;
    });
    if (!c) return { ok: false, error: "Kandidat tidak ditemukan." };
    if (c.status === "ACCEPTED" || c.status === "REJECTED")
      return { ok: false, error: "Kandidat sudah diputuskan." };
    if (!reason) return { ok: false, error: "Alasan penolakan wajib diisi." };
    c.status = "REJECTED";
    c.rejectionReason = reason;
    saveDB(db);
    return { ok: true, message: "Kandidat ditolak." };
  },
};

/* ============================================================
   UI KIT — modal, toast, form builder
   ============================================================ */
let modalCtx = null;

function toast(msg, type) {
  const box = document.getElementById("toasts");
  const el = document.createElement("div");
  el.className = "toast " + (type || "success");
  el.innerHTML =
    ic(type === "error" ? "error" : type === "info" ? "info" : "check_circle") +
    "<span>" +
    msg +
    "</span>";
  box.appendChild(el);
  setTimeout(function () {
    el.remove();
  }, 3600);
}

function openModal(opts) {
  closeModal();
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML =
    '<div class="modal" style="max-width:' +
    (opts.width || 540) +
    'px" role="dialog" aria-modal="true">' +
    '<div class="modal-head">' +
    '<div class="modal-title">' +
    ic(opts.icon || "edit_note") +
    "<span>" +
    opts.title +
    "</span></div>" +
    '<button class="modal-x" data-modal-cancel aria-label="Tutup">' +
    ic("close") +
    "</button>" +
    "</div>" +
    '<div class="modal-body">' +
    opts.body +
    "</div>" +
    '<div class="modal-foot">' +
    (opts.footer ||
      '<button class="btn btn-outline" data-modal-cancel>' +
        ic("close") +
        " Tutup</button>") +
    "</div>" +
    "</div>";
  document.body.appendChild(overlay);
  modalCtx = { overlay: overlay };
  overlay.addEventListener("mousedown", function (e) {
    if (e.target === overlay) closeModal();
  });
  overlay.querySelectorAll("[data-modal-cancel]").forEach(function (b) {
    b.addEventListener("click", closeModal);
  });
  const first = overlay.querySelector("input,select,textarea");
  if (first)
    setTimeout(function () {
      first.focus();
    }, 30);
}
function closeModal() {
  if (modalCtx) {
    modalCtx.overlay.remove();
    modalCtx = null;
  }
}

function formFieldsHTML(fields, values) {
  return fields
    .map(function (f) {
      const v =
        values && values[f.name] !== undefined && values[f.name] !== null
          ? values[f.name]
          : f.value !== undefined && f.value !== null
            ? f.value
            : "";
      const id = "f_" + f.name;
      const req = f.required ? ' <i class="req">*</i>' : "";
      let control = "";
      if (f.type === "select") {
        const opts = (f.options || [])
          .map(function (o) {
            const val = typeof o === "object" ? o.value : o;
            const lbl = typeof o === "object" ? o.label : o;
            return (
              '<option value="' +
              val +
              '"' +
              (String(v) === String(val) ? " selected" : "") +
              ">" +
              lbl +
              "</option>"
            );
          })
          .join("");
        control =
          '<select id="' +
          id +
          '" name="' +
          f.name +
          '"' +
          (f.required ? " required" : "") +
          ">" +
          (f.placeholder
            ? '<option value="">' + f.placeholder + "</option>"
            : "") +
          opts +
          "</select>";
      } else if (f.type === "multi") {
        const opts = (f.options || [])
          .map(function (o) {
            const val = typeof o === "object" ? o.value : o;
            const lbl = typeof o === "object" ? o.label : o;
            const checked =
              (Array.isArray(v) && v.indexOf(val) !== -1) ||
              String(v) === String(val);
            return (
              '<label class="multi-opt"><input type="checkbox" name="' +
              f.name +
              '" value="' +
              val +
              '"' +
              (checked ? " checked" : "") +
              "> " +
              lbl +
              "</label>"
            );
          })
          .join("");
        control = '<div class="multi-group" id="' + id + '">' + opts + "</div>";
      } else if (f.type === "students") {
        const isMulti = !!f.multi;
        control =
          '<div id="f_studentFields">' +
          studentControlHTML(f, v) +
          (f._hint ? '<div class="help">' + f._hint + "</div>" : "") +
          "</div>";
      } else if (f.type === "time24") {
        control =
          '<div style="display:flex;align-items:center;gap:8px">' +
          '<input type="text" id="' +
          id +
          '" name="' +
          f.name +
          '" value="' +
          String(v) +
          '" maxlength="5" inputmode="numeric" pattern="([01][0-9]|2[0-3]):[0-5][0-9]"' +
          (f.required ? " required" : "") +
          ' placeholder="HH:MM" style="flex:1;letter-spacing:1px">' +
          '<span class="help" style="margin:0">(24 jam, cth: 14:30)</span>' +
          "</div>";
      } else {
        control =
          '<input type="' +
          (f.type || "text") +
          '" id="' +
          id +
          '" name="' +
          f.name +
          '" value="' +
          v +
          '"' +
          (f.required ? " required" : "") +
          (f.readonly ? " readonly" : "") +
          ' placeholder="' +
          (f.placeholder || "") +
          '"' +
          (f.min !== undefined ? ' min="' + f.min + '"' : "") +
          (f.max !== undefined ? ' max="' + f.max + '"' : "") +
          (f.step !== undefined ? ' step="' + f.step + '"' : "") +
          (f.readonly
            ? ' style="background:var(--muted);color:var(--muted-fg);font-weight:600"'
            : "") +
          " />";
      }
      return (
        '<div class="field">' +
        '<label for="' +
        id +
        '">' +
        f.label +
        req +
        "</label>" +
        control +
        (f.help ? '<div class="help">' + f.help + "</div>" : "") +
        "</div>"
      );
    })
    .join("");
}

function collectForm(fields, form) {
  const out = {};
  fields.forEach(function (f) {
    if (f.type === "students") {
      const multiEls = form.querySelectorAll(
        'input[name="studentEnrollmentIds"]:checked',
      );
      if (multiEls.length) {
        const checked = [];
        multiEls.forEach(function (el) {
          checked.push(el.value);
        });
        out.studentEnrollmentIds = checked;
      } else {
        const sel = form.elements["studentEnrollmentId"];
        out.studentEnrollmentId = sel ? sel.value : "";
      }
      return;
    }
    if (f.type === "multi") {
      const checked = [];
      (
        form.querySelectorAll('input[name="' + f.name + '"]:checked') || []
      ).forEach(function (el) {
        checked.push(el.value);
      });
      out[f.name] = checked;
      return;
    }
    const el = form.elements[f.name];
    if (!el) return;
    let val = el.value;
    if (f.type === "number") val = val === "" ? null : Number(val);
    out[f.name] = val;
  });
  return out;
}

function openFormModal(opts) {
  const body =
    '<form id="modal-form" class="' +
    (opts.formClass || "") +
    '">' +
    formFieldsHTML(opts.fields, opts.values) +
    (opts.bodyExtra || "") +
    "</form>";
  openModal({
    title: opts.title,
    icon: opts.icon || "edit_note",
    width: opts.width || 560,
    body: body,
    footer:
      '<button type="button" class="btn btn-outline" data-modal-cancel>' +
      ic("close") +
      " Batal</button>" +
      '<button type="submit" form="modal-form" class="btn btn-primary">' +
      ic("save") +
      " " +
      (opts.submitLabel || "Simpan") +
      "</button>",
  });
  modalCtx.overlay
    .querySelector("#modal-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      opts.onSubmit(
        collectForm(opts.fields, modalCtx.overlay.querySelector("#modal-form")),
      );
    });
}

function openConfirmModal(opts) {
  openModal({
    title: opts.title || "Konfirmasi",
    icon: opts.icon || "help",
    width: 460,
    body: '<p class="confirm-msg">' + opts.message + "</p>",
    footer:
      '<button type="button" class="btn btn-outline" data-modal-cancel>' +
      ic("close") +
      " Batal</button>" +
      '<button type="button" class="btn ' +
      (opts.danger ? "btn-danger" : "btn-primary") +
      '" id="modal-ok">' +
      ic("check") +
      " " +
      (opts.confirmLabel || "Ya, Lanjutkan") +
      "</button>",
  });
  modalCtx.overlay
    .querySelector("#modal-ok")
    .addEventListener("click", function () {
      closeModal();
      opts.onConfirm();
    });
}

function kvHTML(pairs) {
  return (
    '<dl class="kv">' +
    pairs
      .map(function (p) {
        return "<dt>" + p[0] + "</dt><dd>" + p[1] + "</dd>";
      })
      .join("") +
    "</dl>"
  );
}

/* ============================================================
   EXPORT / IMPORT DATA (JSON)
   ============================================================ */
function buildExportPayload() {
  return {
    app: "sentraedu-prototype",
    dbKey: DB_KEY,
    exportedAt: new Date().toISOString(),
    data: loadDB(),
  };
}

function validateImport(data) {
  const required = [
    "educationLevels",
    "classes",
    "subjects",
    "packages",
    "users",
    "enrollments",
    "jobs",
    "applications",
    "attendances",
    "invoices",
    "payrollClaims",
    "candidates",
    "notifications",
  ];
  if (!data || typeof data !== "object")
    return { ok: false, error: "Struktur file tidak valid." };
  const missing = required.filter(function (k) {
    return !Array.isArray(data[k]);
  });
  if (missing.length)
    return {
      ok: false,
      error: "File tidak valid — koleksi hilang: " + missing.join(", "),
    };

  const errors = [];
  const err = function (msg) {
    if (errors.length < 10) errors.push(msg);
  };
  const idSet = function (coll) {
    const s = new Set();
    (coll || []).forEach(function (x) {
      if (x && x.id) s.add(x.id);
    });
    return s;
  };
  const ids = {
    level: idSet(data.educationLevels),
    class: idSet(data.classes),
    subject: idSet(data.subjects),
    package: idSet(data.packages),
    user: idSet(data.users),
    enrollment: idSet(data.enrollments),
    job: idSet(data.jobs),
    application: idSet(data.applications),
    attendance: idSet(data.attendances),
    invoice: idSet(data.invoices),
    claim: idSet(data.payrollClaims),
  };
  const has = function (set, id) {
    return !id ? true : set.has(id);
  };
  const ENUMS = {
    role: ["SUPER_ADMIN", "TENTOR", "STUDENT", "WALI_MURID"],
    candStatus: [
      "REGISTERED",
      "TEST_SCHEDULED",
      "TESTED",
      "INTERVIEW_SCHEDULED",
      "INTERVIEWED",
      "ACCEPTED",
      "REJECTED",
    ],
    jobType: ["REGULAR", "TEMPORARY_REPLACEMENT"],
    jobMode: ["OFFLINE", "ONLINE"],
    jobStatus: ["AVAILABLE", "NEGOTIATING", "ASSIGNED", "CANCELLED"],
    appStatus: ["PENDING", "UNDER_REVIEW", "ACCEPTED", "REJECTED"],
    attStatus: ["SUBMITTED", "APPROVED", "REJECTED"],
    payrollStatus: ["DRAFT", "REQUESTED", "PAID", "REJECTED"],
    invoiceStatus: ["UNPAID", "PAID", "OVERDUE"],
  };
  const isEnum = function (name, v) {
    return v === undefined || v === null || ENUMS[name].indexOf(v) !== -1;
  };

  // id unik per koleksi
  required.forEach(function (coll) {
    const seen = new Set();
    data[coll].forEach(function (x) {
      if (!x || typeof x !== "object") {
        err(coll + ": entri bukan objek.");
        return;
      }
      if (x.id === undefined || x.id === null || x.id === "")
        err(coll + ": entri tanpa id.");
      else if (seen.has(x.id)) err(coll + ': id duplikat "' + x.id + '".');
      seen.add(x.id);
    });
  });

  data.users.forEach(function (u, i) {
    if (!u.fullName || !u.email || !u.password)
      err("users[" + i + "]: field fullName/email/password wajib.");
    if (!isEnum("role", u.role))
      err("users[" + i + ']: role tidak valid "' + u.role + '".');
    if (u.subjectIds !== undefined && !Array.isArray(u.subjectIds))
      err("users[" + i + "]: subjectIds wajib array.");
    else
      (u.subjectIds || []).forEach(function (s) {
        if (!has(ids.subject, s))
          err("users[" + i + "]: subjectIds berisi id tidak dikenal.");
      });
    if (u.levelIds !== undefined && !Array.isArray(u.levelIds))
      err("users[" + i + "]: levelIds wajib array.");
    else
      (u.levelIds || []).forEach(function (l) {
        if (!has(ids.level, l))
          err("users[" + i + "]: levelIds berisi id tidak dikenal.");
      });
  });
  const emails = {};
  data.users.forEach(function (u) {
    if (u.email) {
      const e = String(u.email).toLowerCase();
      if (emails[e]) err('users: email duplikat "' + u.email + '".');
      emails[e] = true;
    }
  });

  data.classes.forEach(function (c, i) {
    if (!c.className) err("classes[" + i + "]: className wajib.");
    if (!has(ids.level, c.educationLevelId))
      err("classes[" + i + "]: educationLevelId tidak dikenal.");
    if (typeof c.baseRatePer90Min !== "number" || c.baseRatePer90Min <= 0)
      err("classes[" + i + "]: baseRatePer90Min wajib angka > 0.");
  });

  (data.packages || []).forEach(function (p, i) {
    if (!p.name) err("packages[" + i + "]: name wajib.");
    if (p.mode !== "PRIVATE" && p.mode !== "KELOMPOK")
      err("packages[" + i + ']: mode tidak valid "' + p.mode + '".');
    if (p.period !== "BULANAN" && p.period !== "HARIAN")
      err("packages[" + i + ']: period tidak valid "' + p.period + '".');
    if (typeof p.price !== "number" || p.price <= 0)
      err("packages[" + i + "]: price wajib angka > 0.");
  });

  data.enrollments.forEach(function (e, i) {
    if (!has(ids.user, e.studentId))
      err("enrollments[" + i + "]: studentId tidak dikenal.");
    else if (
      (
        data.users.find(function (u) {
          return u.id === e.studentId;
        }) || {}
      ).role !== "STUDENT"
    )
      err("enrollments[" + i + "]: studentId bukan akun STUDENT.");
    if (!has(ids.class, e.classId))
      err("enrollments[" + i + "]: classId tidak dikenal.");
    if (!has(ids.subject, e.subjectId))
      err("enrollments[" + i + "]: subjectId tidak dikenal.");
    if (e.packageId && !has(ids.package, e.packageId))
      err("enrollments[" + i + "]: packageId tidak dikenal.");
    if (typeof e.latitude !== "number" || typeof e.longitude !== "number")
      err("enrollments[" + i + "]: koordinat latitude/longitude wajib angka.");
  });

  data.jobs.forEach(function (j, i) {
    if (!j.title) err("jobs[" + i + "]: title wajib.");
    if (!isEnum("jobType", j.jobType))
      err("jobs[" + i + "]: jobType tidak valid.");
    if (!isEnum("jobMode", j.mode))
      err("jobs[" + i + ']: mode tidak valid "' + j.mode + '".');
    if (!isEnum("jobStatus", j.status))
      err("jobs[" + i + ']: status tidak valid "' + j.status + '".');
    if (!has(ids.enrollment, j.studentEnrollmentId))
      err("jobs[" + i + "]: studentEnrollmentId tidak dikenal.");
    if (!has(ids.class, j.classId))
      err("jobs[" + i + "]: classId tidak dikenal.");
    if (!has(ids.subject, j.subjectId))
      err("jobs[" + i + "]: subjectId tidak dikenal.");
    if (j.packageId && !has(ids.package, j.packageId))
      err("jobs[" + i + "]: packageId tidak dikenal.");
    if (j.mode === "ONLINE") {
      if (j.latitude !== null && j.longitude !== null)
        err(
          "jobs[" +
            i +
            "]: lowongan ONLINE tidak boleh memiliki koordinat GPS.",
        );
    } else if (typeof j.latitude !== "number" || typeof j.longitude !== "number") {
      err(
        "jobs[" +
          i +
          "]: koordinat GPS lokasi les (latitude/longitude) wajib angka — kecuali lowongan ONLINE.",
      );
    }
    if (j.assignedTentorId && !has(ids.user, j.assignedTentorId))
      err("jobs[" + i + "]: assignedTentorId tidak dikenal.");
    if (j.status === "ASSIGNED" && !j.assignedTentorId)
      err("jobs[" + i + "]: status ASSIGNED wajib memiliki assignedTentorId.");
  });

  data.applications.forEach(function (a, i) {
    if (!has(ids.job, a.jobPostingId))
      err("applications[" + i + "]: jobPostingId tidak dikenal.");
    if (!has(ids.user, a.tentorId))
      err("applications[" + i + "]: tentorId tidak dikenal.");
    if (!isEnum("appStatus", a.status))
      err("applications[" + i + "]: status tidak valid.");
  });

  data.attendances.forEach(function (a, i) {
    if (!has(ids.job, a.jobPostingId))
      err("attendances[" + i + "]: jobPostingId tidak dikenal.");
    if (!has(ids.enrollment, a.studentEnrollmentId))
      err("attendances[" + i + "]: studentEnrollmentId tidak dikenal.");
    if (!has(ids.user, a.tentorId))
      err("attendances[" + i + "]: tentorId tidak dikenal.");
    if (!isEnum("attStatus", a.status))
      err("attendances[" + i + "]: status tidak valid.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.sessionDate || ""))
      err("attendances[" + i + "]: sessionDate harus format YYYY-MM-DD.");
    if (a.approvedById && !has(ids.user, a.approvedById))
      err("attendances[" + i + "]: approvedById tidak dikenal.");
    if (a.payrollClaimId && !has(ids.claim, a.payrollClaimId))
      err("attendances[" + i + "]: payrollClaimId tidak dikenal.");
    if (a.invoiceId && !has(ids.invoice, a.invoiceId))
      err("attendances[" + i + "]: invoiceId tidak dikenal.");
  });

  data.invoices.forEach(function (i, x) {
    if (!has(ids.user, i.studentId))
      err("invoices[" + x + "]: studentId tidak dikenal.");
    if (!isEnum("invoiceStatus", i.status))
      err("invoices[" + x + "]: status tidak valid.");
    if (!(i.monthPeriod >= 1 && i.monthPeriod <= 12))
      err("invoices[" + x + "]: monthPeriod di luar 1-12.");
    (i.packageIds || []).forEach(function (pid) {
      if (!has(ids.package, pid))
        err("invoices[" + x + "]: packageIds berisi id tidak dikenal.");
    });
  });

  data.payrollClaims.forEach(function (c, i) {
    if (!has(ids.user, c.tentorId))
      err("payrollClaims[" + i + "]: tentorId tidak dikenal.");
    if (!isEnum("payrollStatus", c.status))
      err("payrollClaims[" + i + "]: status tidak valid.");
    if (!(c.monthPeriod >= 1 && c.monthPeriod <= 12))
      err("payrollClaims[" + i + "]: monthPeriod di luar 1-12.");
    if (c.processedById && !has(ids.user, c.processedById))
      err("payrollClaims[" + i + "]: processedById tidak dikenal.");
  });

  data.candidates.forEach(function (c, i) {
    if (!c.fullName || !c.email)
      err("candidates[" + i + "]: field fullName/email wajib.");
    if (!isEnum("candStatus", c.status))
      err("candidates[" + i + ']: status tidak valid "' + c.status + '".');
    if (!Array.isArray(c.subjectIds) || !c.subjectIds.length)
      err("candidates[" + i + "]: subjectIds wajib array minimal 1 mapel.");
    else
      c.subjectIds.forEach(function (s) {
        if (!has(ids.subject, s))
          err("candidates[" + i + "]: subjectIds berisi id tidak dikenal.");
      });
    if (!Array.isArray(c.levelIds) || !c.levelIds.length)
      err("candidates[" + i + "]: levelIds wajib array minimal 1 jenjang.");
    else
      c.levelIds.forEach(function (l) {
        if (!has(ids.level, l))
          err("candidates[" + i + "]: levelIds berisi id tidak dikenal.");
      });
    if (c.tentorUserId && !has(ids.user, c.tentorUserId))
      err("candidates[" + i + "]: tentorUserId tidak dikenal.");
    if (c.status === "ACCEPTED" && !c.tentorUserId)
      err(
        "candidates[" + i + "]: status ACCEPTED wajib memiliki tentorUserId.",
      );
    if (
      c.testScore !== null &&
      c.testScore !== undefined &&
      (c.testScore < 0 || c.testScore > 100)
    )
      err("candidates[" + i + "]: testScore di luar 0-100.");
  });

  data.notifications.forEach(function (n, i) {
    if (!n.title || !n.message)
      err("notifications[" + i + "]: field title/message wajib.");
    if (!has(ids.user, n.userId))
      err("notifications[" + i + "]: userId tidak dikenal.");
    if (typeof n.read !== "boolean")
      err("notifications[" + i + "]: read wajib boolean.");
    if (n.createdAt && isNaN(new Date(n.createdAt).getTime()))
      err("notifications[" + i + "]: createdAt bukan tanggal valid.");
  });

  if (errors.length) {
    return {
      ok: false,
      error:
        "Validasi gagal: " +
        errors[0] +
        (errors.length > 1
          ? " (+" + (errors.length - 1) + " masalah lain)"
          : ""),
    };
  }
  return { ok: true };
}

function exportData() {
  const payload = buildExportPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download =
    "sentraedu-data-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    a.remove();
    URL.revokeObjectURL(a.href);
  }, 300);
  toast("Data diexport ke file JSON.", "success");
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const parsed = JSON.parse(reader.result);
      const data = parsed && parsed.data ? parsed.data : parsed;
      const v = validateImport(data);
      if (!v.ok) {
        toast(v.error, "error");
        return;
      }
      saveDB(data);
      clearSession();
      toast("Data berhasil diimpor. Silakan login ulang.", "success");
      location.hash = "#/login";
      location.reload();
    } catch (e) {
      toast("File JSON tidak valid: " + e.message, "error");
    }
  };
  reader.onerror = function () {
    toast("Gagal membaca file.", "error");
  };
  reader.readAsText(file);
}

/* ============================================================
   VIEW RENDERERS per ROLE
   ============================================================ */
const state = { view: "dashboard" };

/* Filter state per view (dipakai filter bar + re-render) */
const filters = {};
function getFilter(view, key) {
  return (filters[view] || {})[key] || "";
}
function hasFilter(view) {
  const f = filters[view];
  return !!(
    f &&
    Object.keys(f).some(function (k) {
      return f[k];
    })
  );
}
function clearFilters(view) {
  filters[view] = {};
  reRender();
}

/* ---------- PAGINATION (smart) ---------- */
const pg = {};

function pageInfo(key, total, perPage) {
  perPage = perPage || 10;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  let page = parseInt(pg[key], 10);
  if (isNaN(page) || page < 1) page = 1;
  if (page > pageCount) page = pageCount;
  pg[key] = page;
  return {
    page: page,
    pageCount: pageCount,
    perPage: perPage,
    start: (page - 1) * perPage,
    end: Math.min(page * perPage, total),
    total: total,
  };
}

function pageWindow(page, pageCount) {
  const out = [];
  if (pageCount <= 7) {
    for (let i = 1; i <= pageCount; i++) out.push(i);
    return out;
  }
  out.push(1);
  const start = Math.max(2, page - 2);
  const end = Math.min(pageCount - 1, page + 2);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < pageCount - 1) out.push("…");
  out.push(pageCount);
  return out;
}

function pagerHTML(key, info) {
  if (!info) return "";
  if (info.total === 0) {
    return (
      '<div class="page-nav"><span class="page-info">Menampilkan 0 data</span><div class="page-btns">' +
      '<button type="button" class="page-btn page-prev" disabled="disabled">‹</button>' +
      '<button type="button" class="page-btn" disabled="disabled">1</button>' +
      '<button type="button" class="page-btn page-next" disabled="disabled">›</button>' +
      "</div></div>"
    );
  }
  if (info.pageCount <= 1) {
    return (
      '<div class="page-nav"><span class="page-info">Menampilkan 1–' +
      info.total +
      " dari " +
      info.total +
      "</span><div class='page-btns'>" +
      '<button type="button" class="page-btn page-prev" disabled="disabled">‹</button>' +
      '<button type="button" class="page-btn active" data-action="page" data-view="' +
      key +
      '" data-page="1">1</button>' +
      '<button type="button" class="page-btn page-next" disabled="disabled">›</button>' +
      "</div></div>"
    );
  }
  const win = pageWindow(info.page, info.pageCount);
  const mk = function (p, label, cls, disabled) {
    return (
      '<button type="button" class="page-btn' +
      (cls ? " " + cls : "") +
      '"' +
      (disabled ? ' disabled="disabled"' : "") +
      ' data-action="page" data-view="' +
      key +
      '" data-page="' +
      p +
      '">' +
      label +
      "</button>"
    );
  };
  let html =
    '<div class="page-nav"><span class="page-info">Menampilkan ' +
    (info.total ? info.start + 1 : 0) +
    "–" +
    info.end +
    " dari " +
    info.total +
    "</span><div class='page-btns'>";
  html += mk(info.page - 1, "‹", "page-prev", info.page <= 1);
  win.forEach(function (p) {
    html +=
      p === "…"
        ? '<span class="page-ell">…</span>'
        : mk(p, String(p), p === info.page ? "active" : "", false);
  });
  html += mk(info.page + 1, "›", "page-next", info.page >= info.pageCount);
  return html + "</div></div>";
}

/* Tombol aksi ikon-only + tooltip (data-tip) untuk baris tabel */
function actBtn(iconName, tip, action, id, danger) {
  return (
    '<button type="button" class="btn btn-icon' +
    (danger ? " btn-icon-danger" : " btn-ghost") +
    '" data-tip="' +
    tip +
    '" data-action="' +
    action +
    '" data-id="' +
    id +
    '">' +
    ic(iconName) +
    "</button>"
  );
}

function filterBarHTML(view, opts) {
  const q = getFilter(view, "q");
  let html = '<div class="filter-bar">';
  if (opts.placeholder !== undefined) {
    html +=
      '<div class="filter-search">' +
      ic("search") +
      '<input type="search" data-filter="q" data-view="' +
      view +
      '" value="' +
      q +
      '" placeholder="' +
      opts.placeholder +
      '" />' +
      "</div>";
  }
  if (opts.statusOptions) {
    html +=
      '<select class="filter-select" data-filter="status" data-view="' +
      view +
      '">' +
      '<option value="">' +
      (opts.allLabel || "Semua Status") +
      "</option>" +
      opts.statusOptions
        .map(function (o) {
          return (
            '<option value="' +
            o[0] +
            '"' +
            (getFilter(view, "status") === o[0] ? " selected" : "") +
            ">" +
            o[1] +
            "</option>"
          );
        })
        .join("") +
      "</select>";
  }
  if (opts.extra) html += opts.extra;
  if (hasFilter(view))
    html +=
      '<button class="btn btn-sm btn-ghost" data-action="clear-filters" data-view="' +
      view +
      '">' +
      ic("close") +
      " Bersihkan Filter</button>";
  html += "</div>";
  return html;
}

const NAV = {
  SUPER_ADMIN: [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: "space_dashboard",
      group: "Beranda",
    },
    { key: "jobs", label: "Lowongan Les", icon: "work", group: "Operasional" },
    { key: "students", label: "Siswa", icon: "group", group: "Operasional" },
    {
      key: "attendance",
      label: "Verifikasi Presensi",
      icon: "fact_check",
      group: "Operasional",
    },
    {
      key: "payroll",
      label: "Klaim Gaji",
      icon: "payments",
      group: "Operasional",
    },
    {
      key: "invoices",
      label: "Tagihan SPP",
      icon: "receipt_long",
      group: "Operasional",
    },
    {
      key: "candidates",
      label: "Rekrutmen Tentor",
      icon: "badge",
      group: "SDM",
    },
    {
      key: "subjects",
      label: "Mata Pelajaran",
      icon: "menu_book",
      group: "Master Data",
    },
    { key: "levels", label: "Jenjang", icon: "school", group: "Master Data" },
    {
      key: "packages",
      label: "Paket Les",
      icon: "sell",
      group: "Master Data",
    },
    {
      key: "users",
      label: "Akun Pengguna",
      icon: "manage_accounts",
      group: "Master Data",
    },
    {
      key: "analitik",
      label: "Analitik",
      icon: "monitoring",
      group: "Insight",
    },
    { key: "laporan", label: "Laporan", icon: "summarize", group: "Insight" },
    { key: "profile", label: "Profil Saya", icon: "person", group: "Akun" },
  ],
  TENTOR: [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: "space_dashboard",
      group: "Beranda",
    },
    {
      key: "jobboard",
      label: "Cari Lowongan",
      icon: "search",
      group: "Pekerjaan",
    },
    {
      key: "attendance",
      label: "Presensi Saya",
      icon: "location_on",
      group: "Pekerjaan",
    },
    {
      key: "payroll",
      label: "Klaim Gaji",
      icon: "payments",
      group: "Pekerjaan",
    },
    { key: "profile", label: "Profil Saya", icon: "person", group: "Akun" },
  ],
  STUDENT: [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: "space_dashboard",
      group: "Beranda",
    },
    {
      key: "program",
      label: "Program Les Aktif",
      icon: "school",
      group: "Belajar",
    },
    {
      key: "attendance",
      label: "Daftar Presensi",
      icon: "fact_check",
      group: "Belajar",
    },
    {
      key: "reports",
      label: "Laporan Hasil Belajar",
      icon: "summarize",
      group: "Belajar",
    },
    { key: "profile", label: "Profil Saya", icon: "person", group: "Akun" },
  ],
  WALI_MURID: [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: "space_dashboard",
      group: "Beranda",
    },
    {
      key: "program",
      label: "Program Les Anak",
      icon: "school",
      group: "Monitoring Anak",
    },
    {
      key: "attendance",
      label: "Presensi Anak",
      icon: "fact_check",
      group: "Monitoring Anak",
    },
    {
      key: "reports",
      label: "Laporan Hasil Belajar",
      icon: "summarize",
      group: "Monitoring Anak",
    },
    {
      key: "invoices",
      label: "Tagihan SPP",
      icon: "receipt_long",
      group: "Keuangan",
    },
    { key: "profile", label: "Profil Saya", icon: "person", group: "Akun" },
  ],
};

function pageHead(title, icon, desc, actionBtn) {
  return (
    '<div class="page-head"><div>' +
    "<h3>" +
    ic(icon) +
    " " +
    title +
    "</h3>" +
    (desc ? '<div class="desc">' + desc + "</div>" : "") +
    "</div>" +
    (actionBtn ? actionBtn : "") +
    "</div>"
  );
}

function statCard(label, value, icon, tone) {
  return (
    '<div class="stat"><div class="s-icon ' +
    tone +
    '">' +
    ic(icon) +
    "</div>" +
    '<div><div class="s-val">' +
    value +
    '</div><div class="s-lbl">' +
    label +
    "</div></div></div>"
  );
}

function emptyState(text, icon) {
  return '<div class="empty-state">' + ic(icon || "inbox") + text + "</div>";
}

function fmtCompact(n) {
  n = Number(n || 0);
  if (n >= 1000000000)
    return (
      (n / 1000000000).toLocaleString("id-ID", { maximumFractionDigits: 1 }) +
      " M"
    );
  if (n >= 1000000)
    return (
      (n / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 }) +
      " jt"
    );
  if (n >= 1000)
    return (
      (n / 1000).toLocaleString("id-ID", { maximumFractionDigits: 0 }) + " rb"
    );
  return String(n);
}

function vbarChart(items, fmt) {
  const max = Math.max(
    1,
    ...items.map(function (i) {
      return i.value;
    }),
  );
  return (
    '<div class="bar-chart">' +
    items
      .map(function (i) {
        const h = Math.max(2, Math.round((i.value / max) * 120));
        const disp = fmt ? fmt(i.value) : i.value;
        return (
          '<div class="bar-col" title="' +
          i.label +
          ": " +
          i.value +
          '">' +
          '<div class="bar-value">' +
          disp +
          "</div>" +
          '<div class="bar" style="height:' +
          h +
          'px"></div>' +
          '<div class="bar-label">' +
          i.label +
          "</div></div>"
        );
      })
      .join("") +
    "</div>"
  );
}

function vbarPairChart(items, labelA, labelB) {
  const max = Math.max(
    1,
    ...[].concat.apply(
      [],
      items.map(function (i) {
        return [i.a, i.b];
      }),
    ),
  );
  return (
    '<div class="chart-legend">' +
    '<span><span class="dot" style="background:var(--primary)"></span>' +
    labelA +
    "</span>" +
    '<span><span class="dot" style="background:var(--primary-soft-2)"></span>' +
    labelB +
    "</span></div>" +
    '<div class="bar-chart">' +
    items
      .map(function (i) {
        return (
          '<div class="bar-col" title="' +
          i.label +
          ": " +
          labelA +
          " " +
          i.a +
          " · " +
          labelB +
          " " +
          i.b +
          '">' +
          '<div class="bar-pair">' +
          '<div class="bar" style="height:' +
          Math.max(2, Math.round((i.a / max) * 120)) +
          'px"></div>' +
          '<div class="bar alt" style="height:' +
          Math.max(2, Math.round((i.b / max) * 120)) +
          'px"></div>' +
          "</div>" +
          '<div class="bar-label">' +
          i.label +
          "</div></div>"
        );
      })
      .join("") +
    "</div>"
  );
}

function hbarChart(items) {
  const max = Math.max(
    1,
    ...items.map(function (i) {
      return i.value;
    }),
  );
  return (
    items
      .map(function (i) {
        return (
          '<div class="hbar-row"><div class="hbar-name">' +
          i.label +
          "</div>" +
          '<div class="hbar-track"><div class="hbar-fill" style="width:' +
          Math.max(4, Math.round((i.value / max) * 100)) +
          '%"></div></div>' +
          '<div class="hbar-val">' +
          i.value +
          "</div></div>"
        );
      })
      .join("") || emptyState("Belum ada data.", "bar_chart")
  );
}

/* ---------------- SUPER_ADMIN ---------------- */
const AdminViews = {
  dashboard: function (user, db) {
    const activeJobs = db.jobs.filter(function (j) {
      return j.status === "AVAILABLE" || j.status === "NEGOTIATING";
    }).length;
    const pendingAtt = db.attendances.filter(function (a) {
      return a.status === "SUBMITTED";
    }).length;
    const pendingClaims = db.payrollClaims.filter(function (c) {
      return c.status === "REQUESTED";
    }).length;
    const stats =
      statCard("Lowongan Aktif", activeJobs, "work", "tone-sky") +
      statCard(
        "Akun Tentor",
        db.users.filter(function (u) {
          return u.role === "TENTOR";
        }).length,
        "school",
        "tone-emerald",
      ) +
      statCard(
        "Siswa Terdaftar",
        db.enrollments.length,
        "group",
        "tone-amber",
      ) +
      statCard(
        "Presensi Perlu Verifikasi",
        pendingAtt,
        "fact_check",
        "tone-violet",
      ) +
      statCard("Klaim Gaji Masuk", pendingClaims, "payments", "tone-rose") +
      statCard(
        "Kandidat Rekrutmen",
        (db.candidates || []).length,
        "badge",
        "tone-teal",
      );
    const pendingList = db.attendances.filter(function (a) {
      return a.status === "SUBMITTED";
    });
    const pinfo = pageInfo("admin-dash", pendingList.length);
    const pendingRows = pendingList
      .slice(pinfo.start, pinfo.end)
      .map(function (a) {
        const j = jobById(db, a.jobPostingId);
        return (
          "<tr><td>" +
          fmtDate(a.sessionDate) +
          "</td><td>" +
          userName(db, a.tentorId) +
          "</td><td>" +
          studentOf(db, a.studentEnrollmentId) +
          "</td><td>" +
          a.topicTaught +
          "</td>" +
          '<td><div class="actions">' +
          actBtn("visibility", "Periksa", "att-detail", a.id) +
          "</div></td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Dashboard",
        "space_dashboard",
        "Ringkasan operasional SentraEdu.",
      ) +
      '<div class="stat-grid">' +
      stats +
      "</div>" +
      '<div class="card"><div class="card-head">' +
      ic("fact_check") +
      " Presensi Menunggu Verifikasi</div>" +
      '<div class="card-body flush"><div class="table-wrap" id="tbl-admin-dash"><table class="tbl"><thead><tr><th>Tanggal</th><th>Tentor</th><th>Siswa</th><th>Topik</th><th>Aksi</th></tr></thead><tbody>' +
      (pendingRows ||
        '<tr><td colspan="5" class="empty">Tidak ada presensi menunggu verifikasi. 👍</td></tr>') +
      "</tbody></table></div>" +
      pagerHTML("admin-dash", pinfo) +
      "</div></div>" +
      '<div class="quick-actions">' +
      '<button class="btn btn-primary" data-action="nav" data-view="jobs">' +
      ic("add") +
      " Buat Lowongan</button>" +
      '<button class="btn btn-outline" data-action="nav" data-view="attendance">' +
      ic("fact_check") +
      " Verifikasi Presensi</button>" +
      '<button class="btn btn-outline" data-action="nav" data-view="candidates">' +
      ic("badge") +
      " Rekrutmen Tentor</button>" +
      "</div>"
    );
  },

  jobs: function (user, db) {
    const q = getFilter("jobs", "q").toLowerCase();
    const statusF = getFilter("jobs", "status");
    const list = db.jobs.filter(function (j) {
      return (
        (!q ||
          j.title.toLowerCase().indexOf(q) !== -1 ||
          className(db, j.classId).toLowerCase().indexOf(q) !== -1 ||
          subjectName(db, j.subjectId).toLowerCase().indexOf(q) !== -1 ||
          packageName(db, j.packageId).toLowerCase().indexOf(q) !== -1 ||
          jobStudentLabel(db, j).toLowerCase().indexOf(q) !== -1) &&
        (!statusF || j.status === statusF)
      );
    });
    const nTersedia = db.jobs.filter(function (j) {
      return j.status === "AVAILABLE";
    }).length;
    const nNegosiasi = db.jobs.filter(function (j) {
      return j.status === "NEGOTIATING";
    }).length;
    const nDitugaskan = db.jobs.filter(function (j) {
      return j.status === "ASSIGNED";
    }).length;
    const pinfo = pageInfo("jobs", list.length);
    const rows = list
      .slice(pinfo.start, pinfo.end)
      .map(function (j) {
        const pkg = packageById(db, j.packageId);
        return (
          "<tr><td><strong>" +
          j.title +
          '</strong><div class="sub">' +
          badge(j.mode) +
          " · " +
          j.preferredSchedule +
          "</div>" +
          '<div class="sub">' +
          ic("group") +
          " " +
          jobStudentLabel(db, j) +
          "</div></td><td>" +
          className(db, j.classId) +
          " · " +
          subjectName(db, j.subjectId) +
          "</td><td>" +
          "<span class='sub'>" +
          packageModeLabel(pkg) +
          "</span> " +
          packageName(db, j.packageId) +
          "</td>" +
          '<td class="num">' +
          idr(jobSessionFee(db, j)) +
          "</td><td>" +
          badge(j.status) +
          (j.assignedTentorId
            ? '<div class="sub">' +
              userName(db, j.assignedTentorId) +
              "</div>"
            : "") +
          "</td>" +
          '<td><div class="actions">' +
          actBtn("tune", "Kelola", "manage-job", j.id) +
          actBtn("edit", "Ubah", "edit-job", j.id) +
          actBtn("delete", "Hapus", "del-job", j.id, true) +
          "</div></td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Lowongan Les",
        "work",
        "Daftar lowongan les dengan mode Offline/Online, jenis Private/Kelompok, dan paket les.",
        '<button class="btn btn-primary" data-action="add-job">' +
          ic("add") +
          " Buat Lowongan</button>",
      ) +
      '<div class="stat-grid">' +
      statCard("Total Lowongan", db.jobs.length, "work", "tone-sky") +
      statCard("Tersedia", nTersedia, "event_available", "tone-emerald") +
      statCard("Sedang Negosiasi", nNegosiasi, "handshake", "tone-amber") +
      statCard("Ditugaskan", nDitugaskan, "lock", "tone-violet") +
      "</div>" +
      filterBarHTML("jobs", {
        placeholder: "Cari judul / kelas / mapel / paket / siswa...",
        statusOptions: [
          ["AVAILABLE", "Tersedia"],
          ["NEGOTIATING", "Sedang Negosiasi"],
          ["ASSIGNED", "Ditugaskan"],
          ["CANCELLED", "Dibatalkan"],
        ],
      }) +
      '<div class="card"><div class="card-body flush"><div class="table-wrap" id="tbl-jobs"><table class="tbl"><thead><tr><th>Lowongan</th><th>Kelas · Mapel</th><th>Paket Les</th><th class="num">Honor/Sesi</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="6" class="empty">' +
          (hasFilter("jobs")
            ? "Tidak ada lowongan yang cocok dengan filter."
            : 'Belum ada lowongan. Klik "Buat Lowongan".') +
          "</td></tr>") +
      "</tbody></table></div>" +
      pagerHTML("jobs", pinfo) +
      "</div></div>"
    );
  },

  students: function (user, db) {
    const q = getFilter("students", "q").toLowerCase();
    const levelF = getFilter("students", "status");
    const list = db.enrollments.filter(function (e) {
      const cls = db.classes.find(function (c) {
        return c.id === e.classId;
      });
      const lvl = cls ? cls.educationLevelId : null;
      return (
        (!q ||
          userName(db, e.studentId).toLowerCase().indexOf(q) !== -1 ||
          className(db, e.classId).toLowerCase().indexOf(q) !== -1 ||
          subjectName(db, e.subjectId).toLowerCase().indexOf(q) !== -1 ||
          packageName(db, e.packageId).toLowerCase().indexOf(q) !== -1 ||
          (e.fullAddress || "").toLowerCase().indexOf(q) !== -1) &&
        (!levelF || lvl === levelF)
      );
    });
    const nKelompok = db.enrollments.filter(function (e) {
      const p = packageById(db, e.packageId);
      return p && p.mode === "KELOMPOK";
    }).length;
    const pinfo = pageInfo("students", list.length);
    const rows = list
      .slice(pinfo.start, pinfo.end)
      .map(function (e) {
        const pkg = packageById(db, e.packageId);
        return (
          "<tr><td><strong>" +
          userName(db, e.studentId) +
          "</strong></td><td>" +
          className(db, e.classId) +
          " · " +
          subjectName(db, e.subjectId) +
          "</td><td>" +
          "<span class='sub'>" +
          packageModeLabel(pkg) +
          "</span> " +
          packageName(db, e.packageId) +
          (pkg ? '<div class="sub">' + idr(pkg.price) + "/" + (pkg.period === "BULANAN" ? "bulan" : "sesi") + "</div>" : "") +
          "</td><td>" +
          (e.parentName ? e.parentName + '<div class="sub">' + (e.parentPhone || "—") + "</div>" : "—") +
          "</td>" +
          '<td><div class="actions">' +
          actBtn("person", "Profil", "view-profile", e.studentId) +
          actBtn("edit", "Ubah", "edit-enrollment", e.id) +
          actBtn("delete", "Hapus", "del-enrollment", e.id, true) +
          "</div></td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Siswa",
        "group",
        "Siswa terdaftar beserta paket les yang dilanggan.",
        '<button class="btn btn-primary" data-action="add-student">' +
          ic("person_add") +
          " Daftarkan Siswa</button>",
      ) +
      '<div class="stat-grid">' +
      statCard("Siswa Terdaftar", db.enrollments.length, "group", "tone-sky") +
      statCard(
        "Paket Private",
        db.enrollments.length - nKelompok,
        "person",
        "tone-emerald",
      ) +
      statCard("Paket Kelompok", nKelompok, "groups", "tone-amber") +
      "</div>" +
      filterBarHTML("students", {
        placeholder: "Cari siswa / kelas / mapel / paket / alamat...",
        statusOptions: db.educationLevels.map(function (l) {
          return [l.id, l.levelName];
        }),
        allLabel: "Semua Jenjang",
      }) +
      '<div class="card"><div class="card-body flush"><div class="table-wrap" id="tbl-students"><table class="tbl"><thead><tr><th>Siswa</th><th>Kelas · Mapel</th><th>Paket Les</th><th>Wali</th><th>Aksi</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="5" class="empty">' +
          (hasFilter("students")
            ? "Tidak ada siswa yang cocok dengan filter."
            : 'Belum ada siswa. Klik "Daftarkan Siswa".') +
          "</td></tr>") +
      "</tbody></table></div>" +
      pagerHTML("students", pinfo) +
      "</div></div>"
    );
  },

  attendance: function (user, db) {
    const statusF = getFilter("attendance", "status");
    const list = db.attendances
      .filter(function (a) {
        return !statusF || a.status === statusF;
      })
      .slice()
      .sort(function (a, b) {
        return a.sessionDate < b.sessionDate ? 1 : -1;
      });
    const nSubmitted = db.attendances.filter(function (a) {
      return a.status === "SUBMITTED";
    }).length;
    const pinfo = pageInfo("attendance", list.length);
    const rows = list
      .slice(pinfo.start, pinfo.end)
      .map(function (a) {
        const j = jobById(db, a.jobPostingId);
        return (
          "<tr><td>" +
          fmtDate(a.sessionDate) +
          "</td><td>" +
          userName(db, a.tentorId) +
          "</td><td>" +
          studentOf(db, a.studentEnrollmentId) +
          "</td><td>" +
          (j ? badge(j.mode) : "") +
          " " +
          a.topicTaught +
          (a.outOfRadius
            ? '<div class="sub" style="color:var(--warn)">⚠ di luar radius</div>'
            : "") +
          "</td><td>" +
          badge(a.status) +
          "</td>" +
          '<td><div class="actions">' +
          actBtn("visibility", "Periksa", "att-detail", a.id) +
          (a.status === "SUBMITTED"
            ? actBtn("check", "Setujui", "att-approve", a.id) +
              actBtn("close", "Tolak", "att-reject", a.id, true)
            : "") +
          "</div></td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Verifikasi Presensi",
        "fact_check",
        "Setujui atau tolak presensi tentor. Sesi yang disetujui masuk klaim gaji & tagihan SPP.",
      ) +
      '<div class="stat-grid">' +
      statCard("Menunggu Verifikasi", nSubmitted, "fact_check", "tone-amber") +
      statCard(
        "Disetujui",
        db.attendances.filter(function (a) {
          return a.status === "APPROVED";
        }).length,
        "verified",
        "tone-emerald",
      ) +
      statCard(
        "Ditolak",
        db.attendances.filter(function (a) {
          return a.status === "REJECTED";
        }).length,
        "cancel",
        "tone-rose",
      ) +
      "</div>" +
      filterBarHTML("attendance", {
        placeholder: "",
        statusOptions: [
          ["SUBMITTED", "Menunggu Verifikasi"],
          ["APPROVED", "Disetujui"],
          ["REJECTED", "Ditolak"],
        ],
      }) +
      '<div class="card"><div class="card-body flush"><div class="table-wrap" id="tbl-attendance"><table class="tbl"><thead><tr><th>Tanggal</th><th>Tentor</th><th>Siswa</th><th>Mode · Topik</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="6" class="empty">Tidak ada presensi untuk filter ini.</td></tr>') +
      "</tbody></table></div>" +
      pagerHTML("attendance", pinfo) +
      "</div></div>"
    );
  },

  payroll: function (user, db) {
    const statusF = getFilter("payroll", "status");
    const list = db.payrollClaims
      .filter(function (c) {
        return !statusF || c.status === statusF;
      })
      .slice()
      .sort(function (a, b) {
        return b.yearPeriod - a.yearPeriod || b.monthPeriod - a.monthPeriod;
      });
    const requested = db.payrollClaims.filter(function (c) {
      return c.status === "REQUESTED";
    });
    const paid = db.payrollClaims.filter(function (c) {
      return c.status === "PAID";
    });
    const pinfo = pageInfo("payroll", list.length);
    const rows = list
      .slice(pinfo.start, pinfo.end)
      .map(function (c) {
        return (
          "<tr><td>" +
          c.claimNumber +
          "</td><td>" +
          userName(db, c.tentorId) +
          "</td><td>" +
          monthLabel(c.monthPeriod, c.yearPeriod) +
          "</td>" +
          '<td class="num">' +
          c.totalSessions +
          '</td><td class="num"><strong>' +
          idr(c.totalClaimAmount) +
          "</strong></td><td>" +
          badge(c.status) +
          "</td>" +
          '<td><div class="actions">' +
          actBtn("visibility", "Detail", "claim-detail", c.id) +
          (c.status === "REQUESTED"
            ? actBtn("payments", "Proses Cair", "claim-pay", c.id) +
              actBtn("close", "Tolak", "claim-reject", c.id, true)
            : "") +
          "</div></td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Klaim Gaji",
        "payments",
        "Proses klaim honor tentor. Honor dihitung otomatis dari sesi APPROVED.",
        '<button class="btn btn-primary" data-action="claim-create">' +
          ic("payments") +
          " Buat Klaim</button>",
      ) +
      '<div class="stat-grid">' +
      statCard("Menunggu Proses", requested.length, "schedule", "tone-amber") +
      statCard(
        "Nominal Menunggu",
        idr(
          requested.reduce(function (s, c) {
            return s + Number(c.totalClaimAmount);
          }, 0),
        ),
        "payments",
        "tone-rose",
      ) +
      statCard("Klaim Dibayar", paid.length, "verified", "tone-emerald") +
      statCard(
        "Total Dibayar",
        idr(
          paid.reduce(function (s, c) {
            return s + Number(c.totalClaimAmount);
          }, 0),
        ),
        "account_balance_wallet",
        "tone-violet",
      ) +
      "</div>" +
      filterBarHTML("payroll", {
        placeholder: "",
        statusOptions: [
          ["REQUESTED", "Diajukan"],
          ["PAID", "Dibayar"],
          ["REJECTED", "Ditolak"],
        ],
      }) +
      '<div class="card"><div class="card-body flush"><div class="table-wrap" id="tbl-payroll"><table class="tbl"><thead><tr><th>No. Klaim</th><th>Tentor</th><th>Periode</th><th class="num">Sesi</th><th class="num">Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="7" class="empty">Tidak ada klaim untuk filter ini.</td></tr>') +
      "</tbody></table></div>" +
      pagerHTML("payroll", pinfo) +
      "</div></div>"
    );
  },

  invoices: function (user, db) {
    const q = getFilter("invoices", "q").toLowerCase();
    const statusF = getFilter("invoices", "status");
    const list = db.invoices
      .filter(function (i) {
        return (
          (!q ||
            i.invoiceNumber.toLowerCase().indexOf(q) !== -1 ||
            userName(db, i.studentId).toLowerCase().indexOf(q) !== -1 ||
            packageNames(db, i.packageIds).toLowerCase().indexOf(q) !== -1) &&
          (!statusF || i.status === statusF)
        );
      })
      .slice()
      .sort(function (a, b) {
        return b.yearPeriod - a.yearPeriod || b.monthPeriod - a.monthPeriod;
      });
    const unpaid = db.invoices.filter(function (i) {
      return i.status === "UNPAID";
    });
    const paid = db.invoices.filter(function (i) {
      return i.status === "PAID";
    });
    const pinfo = pageInfo("invoices", list.length);
    const rows = list
      .slice(pinfo.start, pinfo.end)
      .map(function (i) {
        return (
          "<tr><td>" +
          i.invoiceNumber +
          "</td><td>" +
          userName(db, i.studentId) +
          "</td><td>" +
          monthLabel(i.monthPeriod, i.yearPeriod) +
          "</td><td>" +
          (packageNames(db, i.packageIds) || '<span class="sub">Per sesi</span>') +
          "</td>" +
          '<td class="num">' +
          i.totalSessions +
          '</td><td class="num"><strong>' +
          idr(i.totalAmount) +
          "</strong></td><td>" +
          badge(i.status) +
          "</td>" +
          '<td><div class="actions">' +
          (i.status === "UNPAID"
            ? actBtn("payments", "Bayar", "pay-invoice", i.id) +
              actBtn("delete", "Hapus", "del-invoice", i.id, true)
            : "") +
          "</div></td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Tagihan SPP",
        "receipt_long",
        "Invoice tagihan les siswa. Paket BULANAN ditagih flat, paket HARIAN per sesi.",
        '<button class="btn btn-primary" data-action="gen-invoice">' +
          ic("receipt_long") +
          " Generate Tagihan</button>",
      ) +
      '<div class="stat-grid">' +
      statCard("Piutang", unpaid.length + " tagihan", "schedule", "tone-amber") +
      statCard(
        "Total Piutang",
        idr(
          unpaid.reduce(function (s, i) {
            return s + Number(i.totalAmount);
          }, 0),
        ),
        "payments",
        "tone-rose",
      ) +
      statCard("Lunas", paid.length + " tagihan", "verified", "tone-emerald") +
      statCard(
        "Total Lunas",
        idr(
          paid.reduce(function (s, i) {
            return s + Number(i.totalAmount);
          }, 0),
        ),
        "account_balance_wallet",
        "tone-violet",
      ) +
      "</div>" +
      filterBarHTML("invoices", {
        placeholder: "Cari no. invoice / siswa / paket...",
        statusOptions: [
          ["UNPAID", "Belum Dibayar"],
          ["PAID", "Lunas"],
        ],
      }) +
      '<div class="card"><div class="card-body flush"><div class="table-wrap" id="tbl-invoices"><table class="tbl"><thead><tr><th>No. Invoice</th><th>Siswa</th><th>Periode</th><th>Paket</th><th class="num">Sesi</th><th class="num">Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="8" class="empty">' +
          (hasFilter("invoices")
            ? "Tidak ada tagihan yang cocok."
            : 'Belum ada tagihan. Klik "Generate Tagihan".') +
          "</td></tr>") +
      "</tbody></table></div>" +
      pagerHTML("invoices", pinfo) +
      "</div></div>"
    );
  },

  candidates: function (user, db) {
    const statusF = getFilter("candidates", "status");
    const list = (db.candidates || []).filter(function (c) {
      return !statusF || c.status === statusF;
    });
    const pipeline = [
      "REGISTERED",
      "TEST_SCHEDULED",
      "TESTED",
      "INTERVIEW_SCHEDULED",
      "INTERVIEWED",
      "ACCEPTED",
      "REJECTED",
    ];
    const chips = pipeline
      .map(function (s) {
        const n = (db.candidates || []).filter(function (c) {
          return c.status === s;
        }).length;
        return (
          '<span style="display:inline-flex;align-items:center;gap:6px;margin:4px 8px 4px 0">' +
          badge(s) +
          ' <span style="font-weight:700">' +
          n +
          "</span></span>"
        );
      })
      .join("");
    const pinfo = pageInfo("candidates", list.length);
    const rows = list
      .slice(pinfo.start, pinfo.end)
      .map(function (c) {
        let actions = actBtn("visibility", "Detail", "cand-detail", c.id);
        if (c.status === "REGISTERED")
          actions += actBtn("assignment", "Jadwalkan Tes", "cand-schedule-test", c.id);
        else if (c.status === "TEST_SCHEDULED")
          actions += actBtn("fact_check", "Catat Tes", "cand-record-test", c.id);
        else if (c.status === "TESTED")
          actions += actBtn("record_voice_over", "Jadwalkan Wawancara", "cand-schedule-interview", c.id);
        else if (c.status === "INTERVIEW_SCHEDULED")
          actions += actBtn("record_voice_over", "Catat Wawancara", "cand-record-interview", c.id);
        else if (c.status === "INTERVIEWED")
          actions +=
            actBtn("how_to_reg", "Terima", "cand-accept", c.id) +
            actBtn("close", "Tolak", "cand-reject", c.id, true);
        if (
          c.status === "REGISTERED" ||
          c.status === "TEST_SCHEDULED" ||
          c.status === "TESTED" ||
          c.status === "INTERVIEW_SCHEDULED" ||
          c.status === "INTERVIEWED"
        )
          actions += actBtn("edit", "Ubah", "edit-candidate", c.id);
        return (
          "<tr><td><strong>" +
          c.fullName +
          '</strong><div class="sub">' +
          c.email +
          "</div></td><td>" +
          subjectNames(db, c.subjectIds) +
          "</td><td>" +
          (c.source || "—") +
          "</td><td>" +
          badge(c.status) +
          "</td>" +
          '<td><div class="actions">' +
          actions +
          "</div></td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Rekrutmen Tentor",
        "badge",
        "Pipeline rekrutmen: daftar → tes → wawancara → keputusan.",
        '<button class="btn btn-primary" data-action="add-candidate">' +
          ic("person_add") +
          " Daftarkan Kandidat</button>",
      ) +
      '<div class="card"><div class="card-head">' +
      ic("track_changes") +
      " Pipeline Kandidat</div><div class='card-body'>" +
      chips +
      "</div></div>" +
      filterBarHTML("candidates", {
        placeholder: "",
        statusOptions: [
          ["REGISTERED", "Pendaftar Baru"],
          ["TEST_SCHEDULED", "Tes Dijadwalkan"],
          ["TESTED", "Tes Selesai"],
          ["INTERVIEW_SCHEDULED", "Wawancara Dijadwalkan"],
          ["INTERVIEWED", "Wawancara Selesai"],
          ["ACCEPTED", "Diterima"],
          ["REJECTED", "Ditolak"],
        ],
      }) +
      '<div class="card"><div class="card-body flush"><div class="table-wrap" id="tbl-candidates"><table class="tbl"><thead><tr><th>Kandidat</th><th>Mapel</th><th>Sumber</th><th>Tahap</th><th>Aksi</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="5" class="empty">Tidak ada kandidat untuk filter ini.</td></tr>') +
      "</tbody></table></div>" +
      pagerHTML("candidates", pinfo) +
      "</div></div>"
    );
  },

  subjects: function (user, db) {
    const q = getFilter("subjects", "q").toLowerCase();
    const list = db.subjects.filter(function (s) {
      return (
        !q ||
        s.name.toLowerCase().indexOf(q) !== -1 ||
        (s.description || "").toLowerCase().indexOf(q) !== -1
      );
    });
    const pinfo = pageInfo("subjects", list.length);
    const rows = list
      .slice(pinfo.start, pinfo.end)
      .map(function (s) {
        return (
          "<tr><td><strong>" +
          s.name +
          "</strong></td><td>" +
          (s.description || '<span class="sub">—</span>') +
          "</td>" +
          '<td><div class="actions">' +
          actBtn("edit", "Ubah", "edit-subject", s.id) +
          actBtn("delete", "Hapus", "del-subject", s.id, true) +
          "</div></td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Mata Pelajaran",
        "menu_book",
        "Daftar mapel yang tersedia untuk lowongan les.",
        '<button class="btn btn-primary" data-action="add-subject">' +
          ic("add") +
          " Tambah Mapel</button>",
      ) +
      filterBarHTML("subjects", { placeholder: "Cari nama mapel..." }) +
      '<div class="card"><div class="card-body flush"><div class="table-wrap" id="tbl-subjects"><table class="tbl"><thead><tr><th>Nama</th><th>Deskripsi</th><th>Aksi</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="3" class="empty">' +
          (hasFilter("subjects")
            ? "Tidak ada mapel yang cocok."
            : "Belum ada mapel.") +
          "</td></tr>") +
      "</tbody></table></div>" +
      pagerHTML("subjects", pinfo) +
      "</div></div>"
    );
  },

  levels: function (user, db) {
    const q = getFilter("levels", "q").toLowerCase();
    const list = db.educationLevels.filter(function (l) {
      return (
        !q ||
        l.levelName.toLowerCase().indexOf(q) !== -1 ||
        (l.description || "").toLowerCase().indexOf(q) !== -1
      );
    });
    const pinfo = pageInfo("levels", list.length);
    const rows = list
      .slice(pinfo.start, pinfo.end)
      .map(function (l) {
        const nClass = db.classes.filter(function (c) {
          return c.educationLevelId === l.id;
        }).length;
        return (
          "<tr><td><strong>" +
          l.levelName +
          '</strong></td><td class="num">' +
          nClass +
          " kelas</td><td>" +
          (l.description || '<span class="sub">—</span>') +
          "</td>" +
          '<td><div class="actions">' +
          actBtn("edit", "Ubah", "edit-level", l.id) +
          actBtn("delete", "Hapus", "del-level", l.id, true) +
          "</div></td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Jenjang",
        "school",
        "Master jenjang pendidikan. Tarif honor diatur per kelas pada menu Kelas & Tarif.",
        '<button class="btn btn-primary" data-action="add-level">' +
          ic("add") +
          " Tambah Jenjang</button>",
      ) +
      filterBarHTML("levels", { placeholder: "Cari jenjang..." }) +
      '<div class="card"><div class="card-body flush"><div class="table-wrap" id="tbl-levels"><table class="tbl"><thead><tr><th>Jenjang</th><th class="num">Jumlah Kelas</th><th>Deskripsi</th><th>Aksi</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="4" class="empty">' +
          (hasFilter("levels")
            ? "Tidak ada jenjang yang cocok."
            : "Belum ada jenjang.") +
          "</td></tr>") +
      "</tbody></table></div>" +
      pagerHTML("levels", pinfo) +
      "</div></div>"
    );
  },

  packages: function (user, db) {
    const q = getFilter("packages", "q").toLowerCase();
    const modeF = getFilter("packages", "status");
    const list = (db.packages || []).filter(function (p) {
      return (
        (!q ||
          p.name.toLowerCase().indexOf(q) !== -1 ||
          (p.mode || "").toLowerCase().indexOf(q) !== -1 ||
          (p.period || "").toLowerCase().indexOf(q) !== -1) &&
        (!modeF || p.mode === modeF)
      );
    });
    const pinfo = pageInfo("packages", list.length);
    const rows = list
      .slice(pinfo.start, pinfo.end)
      .map(function (p) {
        return (
          "<tr><td><strong>" +
          p.name +
          "</strong><div class='sub'>" +
          (p.description || "—") +
          "</div></td><td>" +
          badge(p.mode === "KELOMPOK" ? "KELOMPOK" : "PRIVATE") +
          "</td><td>" +
          (p.period === "BULANAN" ? "Bulanan" : "Harian") +
          "</td>" +
          '<td class="num">' +
          p.sessionsPerPeriod +
          " sesi</td>" +
          '<td class="num">' +
          (p.mode === "KELOMPOK" ? "maks " + p.maxStudents + " siswa" : "1 siswa") +
          '</td><td class="num"><strong>' +
          idr(p.price) +
          "</strong></td><td class='num'>" +
          (Number(p.tentorFee) > 0 ? idr(p.tentorFee) + "/sesi" : "—") +
          "</td><td>" +
          (p.active === false ? badge("CANCELLED") : badge("AVAILABLE")) +
          "</td>" +
          '<td><div class="actions">' +
          actBtn("edit", "Ubah", "edit-package", p.id) +
          actBtn("delete", "Hapus", "del-package", p.id, true) +
          "</div></td></tr>"
        );
      })
      .join("");
    const classPinfo = pageInfo("packages-honor", db.classes.length);
    const classRows = db.classes
      .slice(classPinfo.start, classPinfo.end)
      .map(function (c) {
        return (
          "<tr><td><strong>" +
          c.className +
          "</strong></td><td>" +
          levelName(db, c.educationLevelId) +
          '</td><td class="num">' +
          idr(c.baseRatePer90Min) +
          "</td>" +
          '<td><div class="actions">' +
          actBtn("edit", "Ubah honor dasar", "edit-class", c.id) +
          "</div></td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Paket Les",
        "sell",
        "Master paket les: mode Private/Kelompok x periode Bulanan/Harian. Biaya wali murid (SPP) dan honor tentor per sesi dikonfigurasi di sini.",
        '<button class="btn btn-primary" data-action="add-package">' +
          ic("add") +
          " Tambah Paket</button>",
      ) +
      '<div class="alert alert-info">' +
      ic("info") +
      "<span><strong>Biaya Wali Murid</strong> = harga paket (SPP). <strong>Honor Tentor per Sesi</strong> = yang diterima tentor per sesi (sudah termasuk transport); bila tidak diisi, memakai honor dasar kelas + transport.</span></div>" +
      filterBarHTML("packages", {
        placeholder: "Cari nama paket...",
        statusOptions: [
          ["PRIVATE", "Private"],
          ["KELOMPOK", "Kelompok"],
        ],
        allLabel: "Semua Mode",
      }) +
      '<div class="card"><div class="card-body flush"><div class="table-wrap" id="tbl-packages"><table class="tbl"><thead><tr><th>Paket</th><th>Mode</th><th>Periode</th><th class="num">Sesi/Periode</th><th class="num">Kapasitas</th><th class="num">Harga (Wali)</th><th class="num">Honor Tentor/Sesi</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="9" class="empty">' +
          (hasFilter("packages")
            ? "Tidak ada paket yang cocok."
            : 'Belum ada paket. Klik "Tambah Paket".') +
          "</td></tr>") +
      "</tbody></table></div>" +
      pagerHTML("packages", pinfo) +
      "</div></div>" +
      '<div class="card"><div class="card-head">' +
      ic("school") +
      ' Honor Dasar Tentor per Kelas (per 90 menit)</div>' +
      '<div class="card-body flush"><div class="table-wrap" id="tbl-packages-honor"><table class="tbl"><thead><tr><th>Kelas</th><th>Jenjang</th><th class="num">Honor Dasar</th><th>Aksi</th></tr></thead><tbody>' +
      (classRows ||
        '<tr><td colspan="4" class="empty">Belum ada kelas.</td></tr>') +
      "</tbody></table></div>" +
      pagerHTML("packages-honor", classPinfo) +
      "</div></div>"
    );
  },

  users: function (user, db) {
    const q = getFilter("users", "q").toLowerCase();
    const roleF = getFilter("users", "status");
    const list = db.users.filter(function (u) {
      return (
        (!q ||
          u.fullName.toLowerCase().indexOf(q) !== -1 ||
          u.email.toLowerCase().indexOf(q) !== -1) &&
        (!roleF || u.role === roleF)
      );
    });
    const pinfo = pageInfo("users", list.length);
    const rows = list.slice(pinfo.start, pinfo.end).map(function (u) {
        return (
          "<tr><td><strong>" +
          u.fullName +
          '</strong><div class="sub">' +
          u.email +
          "</div></td><td>" +
          (u.phone || "—") +
          "</td><td>" +
          badge(u.role) +
          "</td>" +
          '<td><div class="actions">' +
          actBtn("edit", "Ubah", "edit-user", u.id) +
          (u.id === user.id
            ? ""
            : actBtn("delete", "Hapus", "del-user", u.id, true)) +
          "</div></td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Akun Pengguna",
        "manage_accounts",
        "Kelola akun Super Admin, Admin, Tentor, dan Siswa/Wali.",
        '<button class="btn btn-primary" data-action="add-user">' +
          ic("person_add") +
          " Tambah Akun</button>",
      ) +
      filterBarHTML("users", {
        placeholder: "Cari nama / email...",
        statusOptions: [
          ["SUPER_ADMIN", "Super Admin"],
          ["TENTOR", "Tentor"],
          ["STUDENT", "Siswa"],
          ["WALI_MURID", "Wali Murid"],
        ],
        allLabel: "Semua Peran",
      }) +
      '<div class="card"><div class="card-body flush"><div class="table-wrap" id="tbl-users"><table class="tbl"><thead><tr><th>Nama</th><th>Telepon</th><th>Peran</th><th>Aksi</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="4" class="empty">' +
          (hasFilter("users")
            ? "Tidak ada akun yang cocok dengan filter."
            : "Belum ada akun.") +
          "</td></tr>") +
      "</tbody></table></div>" +
      pagerHTML("users", pinfo) +
      "</div></div>"
    );
  },

  analitik: function (user, db) {
    const paidInvoices = db.invoices.filter(function (i) {
      return i.status === "PAID";
    });
    const totalRevenue = paidInvoices.reduce(function (s, i) {
      return s + Number(i.totalAmount);
    }, 0);
    const paidClaims = db.payrollClaims.filter(function (c) {
      return c.status === "PAID";
    });
    const totalHonor = paidClaims.reduce(function (s, c) {
      return s + Number(c.totalClaimAmount);
    }, 0);
    const allAtt = db.attendances;
    const approvedN = allAtt.filter(function (a) {
      return a.status === "APPROVED";
    }).length;
    const decidedN = allAtt.filter(function (a) {
      return a.status === "APPROVED" || a.status === "REJECTED";
    }).length;
    const verifyRate = decidedN ? Math.round((approvedN / decidedN) * 100) : 0;

    const stats =
      statCard(
        "Pendapatan SPP (Lunas)",
        "Rp " + fmtCompact(totalRevenue),
        "account_balance_wallet",
        "tone-emerald",
      ) +
      statCard(
        "Honor Tentor Dibayar",
        "Rp " + fmtCompact(totalHonor),
        "payments",
        "tone-violet",
      ) +
      statCard(
        "Total Sesi Tercatat",
        allAtt.length,
        "location_on",
        "tone-sky",
      ) +
      statCard(
        "Presensi Disetujui",
        verifyRate + "%",
        "verified",
        "tone-amber",
      );

    // === Data untuk chart ===
    // Pendapatan & Honor per bulan (6 bulan terakhir)
    var monthNamesShort = [
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
      "Des",
    ];
    var now = new Date();
    var monthItems = [];
    for (var mi = 5; mi >= 0; mi--) {
      var d = new Date(now.getFullYear(), now.getMonth() - mi, 1);
      var m = d.getMonth() + 1,
        y = d.getFullYear();
      var sppVal = db.invoices
        .filter(function (i) {
          return (
            i.status === "PAID" && i.monthPeriod === m && i.yearPeriod === y
          );
        })
        .reduce(function (s, i) {
          return s + Number(i.totalAmount);
        }, 0);
      var honorVal = db.payrollClaims
        .filter(function (c) {
          return (
            c.status === "PAID" && c.monthPeriod === m && c.yearPeriod === y
          );
        })
        .reduce(function (s, c) {
          return s + Number(c.totalClaimAmount);
        }, 0);
      monthItems.push({
        label: monthNamesShort[d.getMonth()] + " " + y,
        a: sppVal,
        b: honorVal,
      });
    }
    // Top tentor
    var tentorSessions = {};
    db.attendances
      .filter(function (a) {
        return a.status === "APPROVED";
      })
      .forEach(function (a) {
        tentorSessions[a.tentorId] = (tentorSessions[a.tentorId] || 0) + 1;
      });
    var topTentors = Object.keys(tentorSessions)
      .sort(function (a, b) {
        return tentorSessions[b] - tentorSessions[a];
      })
      .slice(0, 8)
      .map(function (tid) {
        return { label: userName(db, tid), value: tentorSessions[tid] };
      });
    // Status lowongan chips
    var jobStatusCount = {};
    db.jobs.forEach(function (j) {
      jobStatusCount[j.status] = (jobStatusCount[j.status] || 0) + 1;
    });
    var chips = Object.keys(jobStatusCount)
      .map(function (s) {
        return (
          '<span style="display:inline-flex;align-items:center;gap:6px;margin:4px 8px 4px 0">' +
          badge(s) +
          ' <span style="font-weight:700;font-size:1.05rem">' +
          jobStatusCount[s] +
          "</span></span>"
        );
      })
      .join("");
    // Pipeline rekrutmen
    var candStatusCount = {};
    (db.candidates || []).forEach(function (c) {
      candStatusCount[c.status] = (candStatusCount[c.status] || 0) + 1;
    });
    var recChart = Object.keys(candStatusCount)
      .map(function (s) {
        return (
          '<span style="display:inline-flex;align-items:center;gap:6px;margin:4px 8px 4px 0">' +
          badge(s) +
          ' <span style="font-weight:700;font-size:1.05rem">' +
          candStatusCount[s] +
          "</span></span>"
        );
      })
      .join("");

    return (
      pageHead(
        "Analitik",
        "monitoring",
        "Ringkasan data operasional SentraEdu.",
      ) +
      '<div class="stat-grid">' +
      stats +
      "</div>" +
      '<div class="card"><div class="card-head">' +
      ic("bar_chart") +
      ' Pendapatan & Honor per Bulan (6 bulan terakhir)</div><div class="card-body">' +
      vbarPairChart(monthItems, "SPP", "Honor") +
      "</div></div>" +
      (topTentors.length
        ? '<div class="card"><div class="card-head">' +
          ic("emoji_events") +
          ' Top Tentor (Sesi Disetujui)</div><div class="card-body">' +
          hbarChart(topTentors) +
          "</div></div>"
        : "") +
      '<div class="card"><div class="card-head">' +
      ic("work") +
      ' Status Lowongan</div><div class="card-body"><div class="chip-row">' +
      (chips || '<span class="sub">Belum ada data.</span>') +
      "</div></div></div>" +
      '<div class="card"><div class="card-head">' +
      ic("badge") +
      ' Pipeline Rekrutmen Tentor</div><div class="card-body"><div class="chip-row">' +
      (recChart || '<span class="sub">Belum ada data.</span>') +
      "</div></div></div>" +
      '<div class="card"><div class="card-head">' +
      ic("database") +
      ' Manajemen Data Prototype</div><div class="card-body">' +
      '<p style="font-size:.84rem;color:var(--muted-fg);margin-bottom:12px">Seluruh data tersimpan di localStorage browser. Export untuk backup/pindah perangkat, import untuk memuat data dari file JSON.</p>' +
      '<div class="quick-actions">' +
      '<button class="btn btn-outline" data-action="export-data">' +
      ic("download") +
      " Export Data</button>" +
      '<button class="btn btn-outline" data-action="import-data">' +
      ic("upload") +
      " Import Data</button>" +
      '<button class="btn btn-danger" data-action="reset-data">' +
      ic("restart_alt") +
      " Reset Data</button>" +
      "</div></div></div>"
    );
  },

  laporan: function (user, db) {
    const paidInvs = db.invoices.filter(function (i) {
      return i.status === "PAID";
    });
    const unpaidInvs = db.invoices.filter(function (i) {
      return i.status === "UNPAID";
    });
    const revenue = paidInvs.reduce(function (s, i) {
      return s + Number(i.totalAmount);
    }, 0);
    const receivable = unpaidInvs.reduce(function (s, i) {
      return s + Number(i.totalAmount);
    }, 0);
    const paidClaims = db.payrollClaims.filter(function (c) {
      return c.status === "PAID";
    });
    const reqClaims = db.payrollClaims.filter(function (c) {
      return c.status === "REQUESTED";
    });
    const honor = paidClaims.reduce(function (s, c) {
      return s + Number(c.totalClaimAmount);
    }, 0);
    const pendingHonor = reqClaims.reduce(function (s, c) {
      return s + Number(c.totalClaimAmount);
    }, 0);

    var monthNamesShort = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    var now = new Date();
    var monthItems = [];
    for (var mi = 5; mi >= 0; mi--) {
      var d = new Date(now.getFullYear(), now.getMonth() - mi, 1);
      var m = d.getMonth() + 1,
        y = d.getFullYear();
      var sppVal = db.invoices
        .filter(function (i) {
          return i.status === "PAID" && i.monthPeriod === m && i.yearPeriod === y;
        })
        .reduce(function (s, i) {
          return s + Number(i.totalAmount);
        }, 0);
      var honorVal = db.payrollClaims
        .filter(function (c) {
          return c.status === "PAID" && c.monthPeriod === m && c.yearPeriod === y;
        })
        .reduce(function (s, c) {
          return s + Number(c.totalClaimAmount);
        }, 0);
      monthItems.push({
        label: monthNamesShort[d.getMonth()] + " " + y,
        a: sppVal,
        b: honorVal,
      });
    }

    const invStatus = {};
    db.invoices.forEach(function (i) {
      invStatus[i.status] = invStatus[i.status] || { n: 0, total: 0 };
      invStatus[i.status].n++;
      invStatus[i.status].total += Number(i.totalAmount);
    });
    const invKeys = Object.keys(invStatus);
    const invPinfo = pageInfo("lap-spp", invKeys.length);
    const invRows = invKeys
      .slice(invPinfo.start, invPinfo.end)
      .map(function (s) {
        return (
          "<tr><td>" +
          badge(s) +
          "</td>" +
          '<td class="num">' +
          invStatus[s].n +
          "</td><td class='num'>" +
          idr(invStatus[s].total) +
          "</td></tr>"
        );
      })
      .join("");

    const claimStatus = {};
    db.payrollClaims.forEach(function (c) {
      claimStatus[c.status] = claimStatus[c.status] || { n: 0, total: 0 };
      claimStatus[c.status].n++;
      claimStatus[c.status].total += Number(c.totalClaimAmount);
    });
    const claimKeys = Object.keys(claimStatus);
    const claimPinfo = pageInfo("lap-klaim", claimKeys.length);
    const claimRows = claimKeys
      .slice(claimPinfo.start, claimPinfo.end)
      .map(function (s) {
        return (
          "<tr><td>" +
          badge(s) +
          "</td>" +
          '<td class="num">' +
          claimStatus[s].n +
          "</td><td class='num'>" +
          idr(claimStatus[s].total) +
          "</td></tr>"
        );
      })
      .join("");

    const tentorSessions = {};
    db.attendances.forEach(function (a) {
      tentorSessions[a.tentorId] = tentorSessions[a.tentorId] || {
        approved: 0,
        submitted: 0,
        total: 0,
      };
      tentorSessions[a.tentorId].total++;
      if (a.status === "APPROVED") tentorSessions[a.tentorId].approved++;
      if (a.status === "SUBMITTED") tentorSessions[a.tentorId].submitted++;
    });
    const attKeys = Object.keys(tentorSessions).sort(function (a, b) {
      return tentorSessions[b].total - tentorSessions[a].total;
    });
    const attPinfo = pageInfo("lap-tentor", attKeys.length);
    const attRows = attKeys
      .slice(attPinfo.start, attPinfo.end)
      .map(function (tid) {
        const d = tentorSessions[tid];
        return (
          "<tr><td><strong>" +
          userName(db, tid) +
          "</strong></td>" +
          '<td class="num">' +
          d.total +
          "</td>" +
          '<td class="num">' +
          d.approved +
          "</td>" +
          '<td class="num">' +
          d.submitted +
          "</td></tr>"
        );
      })
      .join("");

    const byLevel = {};
    db.enrollments.forEach(function (e) {
      const lv = classLevel(db, e.classId);
      byLevel[lv] = byLevel[lv] || { programs: 0, students: 0 };
      byLevel[lv].programs++;
    });
    const levelKeys = Object.keys(byLevel);
    const levelPinfo = pageInfo("lap-program", levelKeys.length);
    const levelRows = levelKeys
      .slice(levelPinfo.start, levelPinfo.end)
      .map(function (lv) {
        return (
          "<tr><td><strong>" +
          lv +
          "</strong></td>" +
          '<td class="num">' +
          byLevel[lv].programs +
          "</td></tr>"
        );
      })
      .join("");

    return (
      pageHead(
        "Laporan",
        "summarize",
        "Rekapitulasi keuangan, presensi, dan program les.",
      ) +
      '<div class="stat-grid">' +
      statCard("Pendapatan SPP (Lunas)", idr(revenue), "account_balance_wallet", "tone-emerald") +
      statCard("Piutang SPP", idr(receivable), "schedule", "tone-amber") +
      statCard("Honor Tentor Dibayar", idr(honor), "payments", "tone-violet") +
      statCard("Honor Menunggu Proses", idr(pendingHonor), "hourglass_top", "tone-rose") +
      "</div>" +
      '<div class="card"><div class="card-head">' +
      ic("bar_chart") +
      ' Pendapatan SPP vs Honor Tentor (6 bulan terakhir)</div><div class="card-body">' +
      vbarPairChart(monthItems, "SPP", "Honor") +
      "</div></div>" +
      '<div class="grid-2">' +
      '<div class="card"><div class="card-head">' +
      ic("receipt_long") +
      ' Rekap Tagihan SPP</div>' +
      '<div class="card-body flush"><div class="table-wrap" id="tbl-lap-spp"><table class="tbl"><thead><tr><th>Status</th><th class="num">Jumlah</th><th class="num">Nominal</th></tr></thead><tbody>' +
      (invRows ||
        '<tr><td colspan="3" class="empty">Belum ada tagihan.</td></tr>') +
      "</tbody></table></div>" +
      pagerHTML("lap-spp", invPinfo) +
      "</div></div>" +
      '<div class="card"><div class="card-head">' +
      ic("payments") +
      ' Rekap Klaim Honor</div>' +
      '<div class="card-body flush"><div class="table-wrap" id="tbl-lap-klaim"><table class="tbl"><thead><tr><th>Status</th><th class="num">Jumlah</th><th class="num">Nominal</th></tr></thead><tbody>' +
      (claimRows ||
        '<tr><td colspan="3" class="empty">Belum ada klaim.</td></tr>') +
      "</tbody></table></div>" +
      pagerHTML("lap-klaim", claimPinfo) +
      "</div></div>" +
      "</div>" +
      '<div class="grid-2">' +
      '<div class="card"><div class="card-head">' +
      ic("location_on") +
      ' Rekap Presensi per Tentor</div>' +
      '<div class="card-body flush"><div class="table-wrap" id="tbl-lap-tentor"><table class="tbl"><thead><tr><th>Tentor</th><th class="num">Total</th><th class="num">Disetujui</th><th class="num">Menunggu</th></tr></thead><tbody>' +
      (attRows ||
        '<tr><td colspan="4" class="empty">Belum ada presensi.</td></tr>') +
      "</tbody></table></div>" +
      pagerHTML("lap-tentor", attPinfo) +
      "</div></div>" +
      '<div class="card"><div class="card-head">' +
      ic("group") +
      ' Rekap Program Les per Jenjang</div>' +
      '<div class="card-body flush"><div class="table-wrap" id="tbl-lap-program"><table class="tbl"><thead><tr><th>Jenjang</th><th class="num">Program Aktif</th></tr></thead><tbody>' +
      (levelRows ||
        '<tr><td colspan="2" class="empty">Belum ada siswa.</td></tr>') +
      "</tbody></table></div>" +
      pagerHTML("lap-program", levelPinfo) +
      "</div></div>" +
      "</div>"
    );
  },
};

/* ---------------- TENTOR ---------------- */
const TentorViews = {
  dashboard: function (user, db) {
    const openJobs = db.jobs.filter(function (j) {
      return j.status === "AVAILABLE" || j.status === "NEGOTIATING";
    });
    const myAtt = db.attendances.filter(function (a) {
      return a.tentorId === user.id;
    });
    const approved = myAtt.filter(function (a) {
      return a.status === "APPROVED";
    });
    const claims = db.payrollClaims.filter(function (c) {
      return c.tentorId === user.id;
    });
    const stats =
      statCard("Lowongan Terbuka", openJobs.length, "search", "tone-sky") +
      statCard("Sesi Disetujui", approved.length, "verified", "tone-emerald") +
      statCard(
        "Total Sesi Tercatat",
        myAtt.length,
        "location_on",
        "tone-amber",
      ) +
      statCard("Riwayat Penggajian", claims.length, "payments", "tone-violet");
    const myJobs = db.jobs.filter(function (j) {
      return j.assignedTentorId === user.id;
    });
    const jobPinfo = pageInfo("tentor-jobs", myJobs.length);
    const jobRows = myJobs
      .slice(jobPinfo.start, jobPinfo.end)
      .map(function (j) {
        return (
          "<tr><td><strong>" +
          j.title +
          '</strong><div class="sub">' +
          badge(j.mode || "OFFLINE") +
          " " +
          (packageName(db, j.packageId) || "") +
          " · " +
          j.preferredSchedule +
          "</div></td><td>" +
          className(db, j.classId) +
          " · " +
          subjectName(db, j.subjectId) +
          "</td><td>" +
          badge(j.status) +
          "</td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Dashboard",
        "space_dashboard",
        "Cari lowongan, lakukan presensi, dan pantau penggajian Anda.",
      ) +
      '<div class="stat-grid">' +
      stats +
      "</div>" +
      '<div class="card"><div class="card-head">' +
      ic("assignment") +
      " Penugasan Saya</div>" +
      '<div class="card-body flush"><div class="table-wrap" id="tbl-tentor-jobs"><table class="tbl"><thead><tr><th>Lowongan</th><th>Kelas · Mapel</th><th>Status</th></tr></thead><tbody>' +
      (jobRows ||
        '<tr><td colspan="3" class="empty">Belum ada penugasan. Cari lowongan di menu "Cari Lowongan".</td></tr>') +
      "</tbody></table></div>" +
      pagerHTML("tentor-jobs", jobPinfo) +
      "</div></div>" +
      '<div class="quick-actions">' +
      '<button class="btn btn-primary" data-action="nav" data-view="jobboard">' +
      ic("search") +
      " Cari Lowongan</button>" +
      '<button class="btn btn-outline" data-action="nav" data-view="attendance">' +
      ic("location_on") +
      " Presensi Hari Ini</button>" +
      '<button class="btn btn-outline" data-action="nav" data-view="payroll">' +
      ic("payments") +
      " Riwayat Penggajian</button>" +
      "</div>"
    );
  },

  jobboard: function (user, db) {
    const q = getFilter("jobboard", "q").toLowerCase();
    const openJobs = db.jobs.filter(function (j) {
      if (j.status !== "AVAILABLE" && j.status !== "NEGOTIATING") return false;
      if (false) return false;
      if (
        q &&
        j.title.toLowerCase().indexOf(q) === -1 &&
        className(db, j.classId).toLowerCase().indexOf(q) === -1 &&
        subjectName(db, j.subjectId).toLowerCase().indexOf(q) === -1
      )
        return false;
      return true;
    });
    const cards = openJobs
      .map(function (j) {
        const applied = db.applications.some(function (a) {
          return a.jobPostingId === j.id && a.tentorId === user.id;
        });
        let actionBtn = "";
        if (
          (j.status === "AVAILABLE" || j.status === "NEGOTIATING") &&
          !applied
        ) {
          actionBtn =
            '<button class="btn btn-sm btn-primary" data-action="apply-job" data-id="' +
            j.id +
            '">' +
            ic("send") +
            " Ajukan Lamaran</button>";
        } else if (applied) {
          actionBtn =
            '<span class="badge b-pending">' +
            ic("schedule") +
            " Lamaran terkirim</span>";
        }
        return (
          '<div class="job-card"><div class="j-top"><div class="j-title">' +
          j.title +
          "</div>" +
          badge(j.status) +
          badge(j.mode || "OFFLINE") +
          "</div>" +
          '<div class="j-meta">' +
          "<span>" +
          ic("schedule") +
          j.preferredSchedule +
          "</span>" +
          "<span>" +
          ic("sell") +
          packageName(db, j.packageId) +
          "</span>" +
          "<span>" +
          ic("group") +
          jobStudentLabel(db, j) +
          "</span>" +
          "<span>" +
          ic("school") +
          className(db, j.classId) +
          " · " +
          subjectName(db, j.subjectId) +
          "</span>" +
          (j.latitude !== undefined && j.longitude !== undefined
            ? "<span>" +
              ic("location_on") +
              "Lokasi les: " +
              j.latitude +
              ", " +
              j.longitude +
              "</span>"
            : "") +
          (j.additionalNotes
            ? "<span>" + ic("notes") + j.additionalNotes + "</span>"
            : "") +
          "</div>" +
          '<div class="j-foot"><span class="j-fee">Estimasi honor/sesi: <strong>' +
          idr(jobSessionFee(db, j)) +
          '</strong> <span class="sub">(sesuai paket les)</span></span>' +
          actionBtn +
          "</div>" +
          "</div>"
        );
      })
      .join("");
    return (
      pageHead(
        "Cari Lowongan",
        "search",
        "Feed lowongan les. Lamaran Anda otomatis mengubah status lowongan menjadi Sedang Negosiasi.",
      ) +
      filterBarHTML("jobboard", {
        placeholder: "Cari judul / jenjang / mapel...",
        extra: "",
      }) +
      (cards ||
        emptyState(
          hasFilter("jobboard")
            ? "Tidak ada lowongan yang cocok dengan filter."
            : "Belum ada lowongan les tersedia saat ini.",
          "work_off",
        ))
    );
  },

  attendance: function (user, db) {
    const myJobs = db.jobs.filter(function (j) {
      return j.assignedTentorId === user.id && j.status === "ASSIGNED";
    });
    const checkinCards = myJobs
      .map(function (j) {
        return (
          '<div class="job-card"><div class="j-top"><div class="j-title">' +
          j.title +
          "</div>" +
          badge(j.status) +
          "</div>" +
          '<div class="j-meta"><span>' +
          ic("schedule") +
          j.preferredSchedule +
          "</span>" +
          (j.latitude !== undefined && j.longitude !== undefined
            ? "<span>" +
              ic("location_on") +
              "Lokasi les: " +
              j.latitude +
              ", " +
              j.longitude +
              "</span>"
            : "") +
          "</div>" +
          '<div class="j-foot"><button class="btn btn-sm btn-primary" data-action="checkin" data-id="' +
          j.id +
          '">' +
          ic("location_on") +
          " Check-in Presensi</button></div></div>"
        );
      })
      .join("");
    const myAtt = db.attendances
      .filter(function (a) {
        return a.tentorId === user.id;
      })
      .slice()
      .sort(function (a, b) {
        return a.sessionDate < b.sessionDate ? 1 : -1;
      });
    const attPinfo = pageInfo("tentor-att", myAtt.length);
    const rows = myAtt
      .slice(attPinfo.start, attPinfo.end)
      .map(function (a) {
        const j = jobById(db, a.jobPostingId);
        return (
          "<tr><td>" +
          fmtDate(a.sessionDate) +
          "</td><td>" +
          (j ? j.title : "—") +
          '<div class="sub">' +
          a.durationMinutes +
          " menit</div></td><td>" +
          a.topicTaught +
          "</td>" +
          "<td>" +
          badge(a.status) +
          (a.outOfRadius
            ? '<div class="sub" style="color:var(--warn)">⚠ di luar radius</div>'
            : "") +
          "</td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Presensi Saya",
        "location_on",
        "Check-in GPS saat tiba di lokasi siswa, isi jurnal materi, lalu kirim untuk diverifikasi Admin.",
        "",
      ) +
      '<div class="card"><div class="card-head">' +
      ic("location_on") +
      ' Check-in Hari Ini</div><div class="card-body">' +
      (checkinCards ||
        emptyState(
          "Belum ada penugasan aktif. Lowongan yang Anda menangkan akan muncul di sini.",
          "event_busy",
        )) +
      "</div></div>" +
      '<div class="card"><div class="card-head">' +
      ic("history") +
      " Riwayat Presensi</div>" +
      '<div class="card-body flush"><div class="table-wrap" id="tbl-tentor-att"><table class="tbl"><thead><tr><th>Tanggal</th><th>Lowongan</th><th>Topik Materi</th><th>Status</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="4" class="empty">Belum ada riwayat presensi.</td></tr>') +
      "</tbody></table></div>" +
      pagerHTML("tentor-att", attPinfo) +
      "</div></div>"
    );
  },

  payroll: function (user, db) {
    const claims = db.payrollClaims
      .filter(function (c) {
        return c.tentorId === user.id;
      })
      .slice()
      .sort(function (a, b) {
        return b.yearPeriod - a.yearPeriod || b.monthPeriod - a.monthPeriod;
      });
    const payPinfo = pageInfo("tentor-payroll", claims.length);
    const rows = claims
      .slice(payPinfo.start, payPinfo.end)
      .map(function (c) {
        return (
          "<tr><td>" +
          c.claimNumber +
          "</td><td>" +
          monthLabel(c.monthPeriod, c.yearPeriod) +
          "</td>" +
          '<td class="num">' +
          c.totalSessions +
          '</td><td class="num"><strong>' +
          idr(c.totalClaimAmount) +
          "</strong></td>" +
          "<td>" +
          badge(c.status) +
          "</td>" +
          "<td>" +
          actBtn("visibility", "Lihat detail", "claim-detail", c.id) +
          "</td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Riwayat Penggajian",
        "payments",
        "Pengajuan klaim honor kini dikelola oleh Admin. Anda hanya dapat memantau riwayat & status penggajian Anda.",
        "",
      ) +
      '<div class="alert alert-info">' +
      ic("info") +
      "<span>Pengajuan & pencairan honor diproses oleh Admin. Honor dihitung otomatis dari sesi berstatus <strong>APPROVED</strong> ((honor dasar kelas + transport) per sesi) — presensi tidak akan dihitung ganda.</span></div>" +
      '<div class="card"><div class="card-head">' +
      ic("receipt_long") +
      " Riwayat Penggajian Saya</div>" +
      '<div class="card-body flush"><div class="table-wrap" id="tbl-tentor-payroll"><table class="tbl"><thead><tr><th>No. Klaim</th><th>Periode</th><th class="num">Sesi</th><th class="num">Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="6" class="empty">Belum ada riwayat penggajian.</td></tr>') +
      "</tbody></table></div>" +
      pagerHTML("tentor-payroll", payPinfo) +
      "</div></div>"
    );
  },
};

/* ---------------- REKRUTMEN TENTOR ---------------- */
/* ---------------- STUDENT ---------------- */
/* ---------------- STUDENT (Siswa) ---------------- */
const StudentViews = {
  dashboard: function (user, db) {
    const myEnr = db.enrollments.filter(function (e) {
      return e.studentId === user.id;
    });
    const ids = myEnr.map(function (e) {
      return e.id;
    });
    const myAtt = db.attendances.filter(function (a) {
      return ids.indexOf(a.studentEnrollmentId) !== -1;
    });
    const approved = myAtt.filter(function (a) {
      return a.status === "APPROVED";
    });
    const stats =
      statCard("Program Les Aktif", myEnr.length, "school", "tone-sky") +
      statCard("Sesi Disetujui", approved.length, "verified", "tone-emerald") +
      statCard(
        "Total Sesi Tercatat",
        myAtt.length,
        "location_on",
        "tone-amber",
      );
    return (
      pageHead(
        "Dashboard",
        "space_dashboard",
        "Pantau les aktif, presensi, dan laporan hasil belajar Anda.",
      ) +
      '<div class="stat-grid">' +
      stats +
      "</div>" +
      '<div class="quick-actions">' +
      '<button class="btn btn-primary" data-action="nav" data-view="program">' +
      ic("school") +
      " Lihat Program Les</button>" +
      '<button class="btn btn-outline" data-action="nav" data-view="attendance">' +
      ic("fact_check") +
      " Lihat Presensi</button>" +
      '<button class="btn btn-outline" data-action="nav" data-view="reports">' +
      ic("summarize") +
      " Laporan Hasil Belajar</button>" +
      "</div>"
    );
  },

  program: function (user, db) {
    const myEnr = db.enrollments.filter(function (e) {
      return e.studentId === user.id;
    });
    const cards = myEnr
      .map(function (e) {
        return (
          '<div class="job-card"><div class="j-top"><div class="j-title">' +
          className(db, e.classId) +
          " · " +
          subjectName(db, e.subjectId) +
          '</div><span class="badge b-assigned">' +
          ic("check") +
          " Aktif</span></div>" +
          '<div class="j-meta">' +
          "<span>" +
          ic("sell") +
          packageName(db, e.packageId) +
          " · " +
          packageModeLabel(packageById(db, e.packageId)) +
          "</span>" +
          "<span>" +
          ic("family_restroom") +
          "Wali: " +
          (e.parentName || "—") +
          " (" +
          (e.parentPhone || "—") +
          ")</span>" +
          "<span>" +
          ic("pin_drop") +
          e.fullAddress +
          "</span>" +
          "</div></div>"
        );
      })
      .join("");
    return (
      pageHead(
        "Program Les Aktif",
        "school",
        "Program bimbingan belajar yang sedang berjalan.",
      ) + (cards || emptyState("Belum ada program les terdaftar.", "school"))
    );
  },

  attendance: function (user, db) {
    const q = getFilter("student-attendance", "q").toLowerCase();
    const myEnr = db.enrollments
      .filter(function (e) {
        return e.studentId === user.id;
      })
      .map(function (e) {
        return e.id;
      });
    const myAtt = db.attendances
      .filter(function (a) {
        if (myEnr.indexOf(a.studentEnrollmentId) === -1) return false;
        if (!q) return true;
        const j = jobById(db, a.jobPostingId);
        return (
          a.topicTaught.toLowerCase().indexOf(q) !== -1 ||
          userName(db, a.tentorId).toLowerCase().indexOf(q) !== -1
        );
      })
      .slice()
      .sort(function (a, b) {
        return a.sessionDate < b.sessionDate ? 1 : -1;
      });
    const sattPinfo = pageInfo("student-attendance", myAtt.length);
    const rows = myAtt
      .slice(sattPinfo.start, sattPinfo.end)
      .map(function (a) {
        const j = jobById(db, a.jobPostingId);
        return (
          "<tr><td>" +
          fmtDate(a.sessionDate) +
          "</td><td>" +
          userName(db, a.tentorId) +
          "</td><td>" +
          subjectName(db, j ? j.subjectId : null) +
          "</td><td>" +
          a.topicTaught +
          "</td>" +
          "<td>" +
          (a.activityNotes || '<span class="sub">—</span>') +
          "</td><td>" +
          badge(a.status) +
          "</td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Daftar Presensi",
        "fact_check",
        "Riwayat kehadiran tentor pada sesi les Anda.",
      ) +
      filterBarHTML("student-attendance", {
        placeholder: "Cari tentor / topik...",
      }) +
      '<div class="card"><div class="card-body flush"><div class="table-wrap" id="tbl-student-attendance"><table class="tbl"><thead><tr><th>Tanggal</th><th>Tentor</th><th>Mapel</th><th>Topik</th><th>Catatan</th><th>Status</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="6" class="empty">' +
          (hasFilter("student-attendance")
            ? "Tidak ada presensi yang cocok."
            : "Belum ada presensi tercatat.") +
          "</td></tr>") +
      "</tbody></table></div>" +
      pagerHTML("student-attendance", sattPinfo) +
      "</div></div>"
    );
  },

  reports: function (user, db) {
    const myEnr = db.enrollments.filter(function (e) {
      return e.studentId === user.id;
    });
    const ids = myEnr.map(function (e) {
      return e.id;
    });
    const myAtt = db.attendances.filter(function (a) {
      return ids.indexOf(a.studentEnrollmentId) !== -1;
    });
    const approved = myAtt.filter(function (a) {
      return a.status === "APPROVED";
    });
    // Group by subject
    const bySubject = {};
    approved.forEach(function (a) {
      const j = jobById(db, a.jobPostingId);
      const sName = j ? subjectName(db, j.subjectId) : "Lainnya";
      if (!bySubject[sName]) bySubject[sName] = { count: 0, topics: [] };
      bySubject[sName].count++;
      if (bySubject[sName].topics.indexOf(a.topicTaught) === -1)
        bySubject[sName].topics.push(a.topicTaught);
    });
    const subjKeys = Object.keys(bySubject);
    const srPinfo = pageInfo("student-reports", subjKeys.length);
    const rows = subjKeys
      .slice(srPinfo.start, srPinfo.end)
      .map(function (s) {
        const d = bySubject[s];
        return (
          "<tr><td><strong>" +
          s +
          '</strong></td><td class="num">' +
          d.count +
          " sesi</td><td>" +
          d.topics.join(", ") +
          "</td></tr>"
        );
      })
      .join("");
    const totalSessions = approved.length;
    const totalHours = Math.round(
      approved.reduce(function (s, a) {
        return s + Number(a.durationMinutes || 0);
      }, 0) / 60,
    );
    return (
      pageHead(
        "Laporan Hasil Belajar",
        "summarize",
        "Ringkasan progress belajar berdasarkan sesi yang telah disetujui.",
      ) +
      '<div class="stat-grid">' +
      statCard("Total Sesi Disetujui", totalSessions, "verified", "tone-sky") +
      statCard(
        "Total Jam Belajar",
        totalHours + " jam",
        "schedule",
        "tone-emerald",
      ) +
      statCard(
        "Jumlah Mapel",
        Object.keys(bySubject).length,
        "menu_book",
        "tone-amber",
      ) +
      "</div>" +
      '<div class="card"><div class="card-head">' +
      ic("menu_book") +
      " Rekap per Mata Pelajaran</div>" +
      '<div class="card-body flush"><div class="table-wrap" id="tbl-student-reports"><table class="tbl"><thead><tr><th>Mapel</th><th class="num">Sesi</th><th>Topik yang Dipelajari</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="3" class="empty">Belum ada sesi yang disetujui.</td></tr>') +
      "</tbody></table></div>" +
      pagerHTML("student-reports", srPinfo) +
      "</div></div>"
    );
  },
};

/* ---------------- WALI MURID ---------------- */
const WaliViews = {
  dashboard: function (user, db) {
    const childIds = (db.enrollments || [])
      .filter(function (e) {
        return (
          e.parentName &&
          db.users.some(function (u) {
            return (
              u.id === e.studentId &&
              u.role === "STUDENT" &&
              u.waliId === user.id
            );
          })
        );
      })
      .map(function (e) {
        return e.studentId;
      });
    // Fallback: find students linked via waliId
    const myStudents = db.users.filter(function (u) {
      return u.role === "STUDENT" && u.waliId === user.id;
    });
    const myStudentIds = myStudents.map(function (s) {
      return s.id;
    });
    const myEnr = db.enrollments.filter(function (e) {
      return myStudentIds.indexOf(e.studentId) !== -1;
    });
    const enrIds = myEnr.map(function (e) {
      return e.id;
    });
    const myAtt = db.attendances.filter(function (a) {
      return enrIds.indexOf(a.studentEnrollmentId) !== -1;
    });
    const approved = myAtt.filter(function (a) {
      return a.status === "APPROVED";
    });
    const invs = db.invoices.filter(function (i) {
      return myStudentIds.indexOf(i.studentId) !== -1;
    });
    const unpaid = invs.filter(function (i) {
      return i.status === "UNPAID";
    });
    const unpaidTotal = unpaid.reduce(function (s, i) {
      return s + Number(i.totalAmount);
    }, 0);
    const stats =
      statCard("Program Les Anak", myEnr.length, "school", "tone-sky") +
      statCard("Sesi Disetujui", approved.length, "verified", "tone-emerald") +
      statCard(
        "Tagihan Belum Dibayar",
        unpaid.length,
        "receipt_long",
        "tone-amber",
      ) +
      statCard("Total Tagihan", idr(unpaidTotal), "payments", "tone-rose");
    const wdInvPinfo = pageInfo("wali-dash", invs.length);
    const invRows = invs
      .slice(wdInvPinfo.start, wdInvPinfo.end)
      .map(function (i) {
        return (
          "<tr><td>" +
          i.invoiceNumber +
          "</td><td>" +
          userName(db, i.studentId) +
          "</td><td>" +
          monthLabel(i.monthPeriod, i.yearPeriod) +
          '</td><td class="num"><strong>' +
          idr(i.totalAmount) +
          "</strong></td><td>" +
          badge(i.status) +
          "</td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Dashboard Wali Murid",
        "space_dashboard",
        "Pantau les, presensi, dan tagihan SPP anak Anda.",
      ) +
      '<div class="stat-grid">' +
      stats +
      "</div>" +
      '<div class="card"><div class="card-head">' +
      ic("receipt_long") +
      " Tagihan SPP Terbaru</div>" +
      '<div class="card-body flush"><div class="table-wrap" id="tbl-wali-dash"><table class="tbl"><thead><tr><th>No. Invoice</th><th>Anak</th><th>Periode</th><th class="num">Total</th><th>Status</th></tr></thead><tbody>' +
      (invRows ||
        '<tr><td colspan="5" class="empty">Belum ada tagihan.</td></tr>') +
      "</tbody></table></div>" +
      pagerHTML("wali-dash", wdInvPinfo) +
      "</div></div>" +
      '<div class="quick-actions">' +
      '<button class="btn btn-primary" data-action="nav" data-view="program">' +
      ic("school") +
      " Program Les Anak</button>" +
      '<button class="btn btn-outline" data-action="nav" data-view="invoices">' +
      ic("receipt_long") +
      " Tagihan SPP</button>" +
      "</div>"
    );
  },

  program: function (user, db) {
    const myStudents = db.users.filter(function (u) {
      return u.role === "STUDENT" && u.waliId === user.id;
    });
    const myStudentIds = myStudents.map(function (s) {
      return s.id;
    });
    const myEnr = db.enrollments.filter(function (e) {
      return myStudentIds.indexOf(e.studentId) !== -1;
    });
    const cards = myEnr
      .map(function (e) {
        return (
          '<div class="job-card"><div class="j-top"><div class="j-title">' +
          userName(db, e.studentId) +
          " — " +
          className(db, e.classId) +
          " · " +
          subjectName(db, e.subjectId) +
          '</div><span class="badge b-assigned">' +
          ic("check") +
          " Aktif</span></div>" +
          '<div class="j-meta">' +
          "<span>" +
          ic("sell") +
          packageName(db, e.packageId) +
          " · " +
          packageModeLabel(packageById(db, e.packageId)) +
          "</span>" +
          "<span>" +
          ic("pin_drop") +
          e.fullAddress +
          "</span>" +
          "</div></div>"
        );
      })
      .join("");
    return (
      pageHead(
        "Program Les Anak",
        "school",
        "Program bimbingan belajar anak yang sedang berjalan.",
      ) +
      (cards || emptyState("Belum ada program les untuk anak Anda.", "school"))
    );
  },

  attendance: function (user, db) {
    const q = getFilter("wali-attendance", "q").toLowerCase();
    const myStudents = db.users.filter(function (u) {
      return u.role === "STUDENT" && u.waliId === user.id;
    });
    const myStudentIds = myStudents.map(function (s) {
      return s.id;
    });
    const myEnr = db.enrollments
      .filter(function (e) {
        return myStudentIds.indexOf(e.studentId) !== -1;
      })
      .map(function (e) {
        return e.id;
      });
    const myAtt = db.attendances
      .filter(function (a) {
        if (myEnr.indexOf(a.studentEnrollmentId) === -1) return false;
        if (!q) return true;
        const j = jobById(db, a.jobPostingId);
        return (
          a.topicTaught.toLowerCase().indexOf(q) !== -1 ||
          userName(db, a.tentorId).toLowerCase().indexOf(q) !== -1
        );
      })
      .slice()
      .sort(function (a, b) {
        return a.sessionDate < b.sessionDate ? 1 : -1;
      });
    const wattPinfo = pageInfo("wali-attendance", myAtt.length);
    const rows = myAtt
      .slice(wattPinfo.start, wattPinfo.end)
      .map(function (a) {
        const j = jobById(db, a.jobPostingId);
        const enr = db.enrollments.find(function (e) {
          return e.id === a.studentEnrollmentId;
        });
        return (
          "<tr><td>" +
          fmtDate(a.sessionDate) +
          "</td><td>" +
          userName(db, enr ? enr.studentId : null) +
          "</td><td>" +
          userName(db, a.tentorId) +
          "</td><td>" +
          subjectName(db, j ? j.subjectId : null) +
          "</td><td>" +
          a.topicTaught +
          "</td>" +
          "<td>" +
          badge(a.status) +
          "</td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Presensi Anak",
        "fact_check",
        "Riwayat kehadiran tentor pada sesi les anak Anda.",
      ) +
      filterBarHTML("wali-attendance", {
        placeholder: "Cari tentor / topik...",
      }) +
      '<div class="card"><div class="card-body flush"><div class="table-wrap" id="tbl-wali-attendance"><table class="tbl"><thead><tr><th>Tanggal</th><th>Anak</th><th>Tentor</th><th>Mapel</th><th>Topik</th><th>Status</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="6" class="empty">' +
          (hasFilter("wali-attendance")
            ? "Tidak ada presensi yang cocok."
            : "Belum ada presensi tercatat.") +
          "</td></tr>") +
      "</tbody></table></div>" +
      pagerHTML("wali-attendance", wattPinfo) +
      "</div></div>"
    );
  },

  reports: function (user, db) {
    const myStudents = db.users.filter(function (u) {
      return u.role === "STUDENT" && u.waliId === user.id;
    });
    const myStudentIds = myStudents.map(function (s) {
      return s.id;
    });
    const myEnr = db.enrollments.filter(function (e) {
      return myStudentIds.indexOf(e.studentId) !== -1;
    });
    const enrIds = myEnr.map(function (e) {
      return e.id;
    });
    const approved = db.attendances.filter(function (a) {
      return (
        enrIds.indexOf(a.studentEnrollmentId) !== -1 && a.status === "APPROVED"
      );
    });
    // Group by student
    const byStudent = {};
    approved.forEach(function (a) {
      const enr = db.enrollments.find(function (e) {
        return e.id === a.studentEnrollmentId;
      });
      const sName = enr ? userName(db, enr.studentId) : "—";
      if (!byStudent[sName]) byStudent[sName] = { count: 0, hours: 0 };
      byStudent[sName].count++;
      byStudent[sName].hours += Number(a.durationMinutes || 0);
    });
    const stKeys = Object.keys(byStudent);
    const wrPinfo = pageInfo("wali-reports", stKeys.length);
    const rows = stKeys
      .slice(wrPinfo.start, wrPinfo.end)
      .map(function (s) {
        const d = byStudent[s];
        return (
          "<tr><td><strong>" +
          s +
          '</strong></td><td class="num">' +
          d.count +
          ' sesi</td><td class="num">' +
          Math.round(d.hours / 60) +
          " jam</td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Laporan Hasil Belajar Anak",
        "summarize",
        "Ringkasan progress belajar anak berdasarkan sesi yang telah disetujui.",
      ) +
      '<div class="card"><div class="card-head">' +
      ic("group") +
      " Rekap per Anak</div>" +
      '<div class="card-body flush"><div class="table-wrap" id="tbl-wali-reports"><table class="tbl"><thead><tr><th>Anak</th><th class="num">Sesi</th><th class="num">Total Jam</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="3" class="empty">Belum ada sesi yang disetujui.</td></tr>') +
      "</tbody></table></div>" +
      pagerHTML("wali-reports", wrPinfo) +
      "</div></div>"
    );
  },

  invoices: function (user, db) {
    const q = getFilter("wali-invoices", "q").toLowerCase();
    const statusF = getFilter("wali-invoices", "status");
    const myStudents = db.users.filter(function (u) {
      return u.role === "STUDENT" && u.waliId === user.id;
    });
    const myStudentIds = myStudents.map(function (s) {
      return s.id;
    });
    const invs = db.invoices
      .filter(function (i) {
        if (myStudentIds.indexOf(i.studentId) === -1) return false;
        if (statusF && i.status !== statusF) return false;
        if (
          q &&
          i.invoiceNumber.toLowerCase().indexOf(q) === -1 &&
          userName(db, i.studentId).toLowerCase().indexOf(q) === -1
        )
          return false;
        return true;
      })
      .slice()
      .sort(function (a, b) {
        return b.yearPeriod - a.yearPeriod || b.monthPeriod - a.monthPeriod;
      });
    const wiPinfo = pageInfo("wali-invoices", invs.length);
    const rows = invs
      .slice(wiPinfo.start, wiPinfo.end)
      .map(function (i) {
        return (
          "<tr><td>" +
          i.invoiceNumber +
          "</td><td>" +
          userName(db, i.studentId) +
          "</td><td>" +
          monthLabel(i.monthPeriod, i.yearPeriod) +
          "</td>" +
          '<td class="num">' +
          i.totalSessions +
          '</td><td class="num"><strong>' +
          idr(i.totalAmount) +
          "</strong></td>" +
          "<td>" +
          badge(i.status) +
          (i.paidAt
            ? '<div class="sub">Lunas ' + fmtDate(i.paidAt) + "</div>"
            : "") +
          "</td>" +
          "<td>" +
          (i.status === "UNPAID"
            ? actBtn("payments", "Bayar sekarang", "pay-invoice", i.id)
            : "") +
          "</td></tr>"
        );
      })
      .join("");
    return (
      pageHead(
        "Tagihan SPP",
        "receipt_long",
        "Invoice tagihan les bulanan anak Anda.",
      ) +
      filterBarHTML("wali-invoices", {
        placeholder: "Cari no. invoice / nama anak...",
        statusOptions: [
          ["UNPAID", "Belum Dibayar"],
          ["PAID", "Lunas"],
        ],
      }) +
      '<div class="card"><div class="card-body flush"><div class="table-wrap" id="tbl-wali-invoices"><table class="tbl"><thead><tr><th>No. Invoice</th><th>Anak</th><th>Periode</th><th class="num">Sesi</th><th class="num">Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' +
      (rows ||
        '<tr><td colspan="7" class="empty">' +
          (hasFilter("wali-invoices")
            ? "Tidak ada tagihan yang cocok."
            : "Belum ada tagihan SPP.") +
          "</td></tr>") +
      "</tbody></table></div>" +
      pagerHTML("wali-invoices", wiPinfo) +
      "</div></div>"
    );
  },
};

/* ============================================================
   PROFIL PENGGUNA (semua role) & MODAL PROFIL (dilihat Admin)
   ============================================================ */
function roleProfileStats(user, db) {
  if (user.role === "SUPER_ADMIN") {
    return (
      statCard("Akun Aktif", db.users.length, "people", "tone-sky") +
      statCard(
        "Akun Tentor",
        db.users.filter(function (u) {
          return u.role === "TENTOR";
        }).length,
        "school",
        "tone-emerald",
      ) +
      statCard(
        "Siswa Terdaftar",
        db.enrollments.length,
        "group",
        "tone-amber",
      ) +
      statCard(
        "Kandidat Rekrutmen",
        (db.candidates || []).length,
        "badge",
        "tone-teal",
      )
    );
  }
  if (user.role === "WALI_MURID") {
    var myStu = db.users.filter(function (u) {
      return u.role === "STUDENT" && u.waliId === user.id;
    });
    var myStuIds = myStu.map(function (s) {
      return s.id;
    });
    var myEnr = db.enrollments
      .filter(function (e) {
        return myStuIds.indexOf(e.studentId) !== -1;
      })
      .map(function (e) {
        return e.id;
      });
    var unpaid = db.invoices.filter(function (i) {
      return myStuIds.indexOf(i.studentId) !== -1 && i.status === "UNPAID";
    });
    return (
      statCard(
        "Program Les Anak",
        db.enrollments.filter(function (e) {
          return myStuIds.indexOf(e.studentId) !== -1;
        }).length,
        "school",
        "tone-sky",
      ) +
      statCard(
        "Sesi Disetujui",
        db.attendances.filter(function (a) {
          return (
            myEnr.indexOf(a.studentEnrollmentId) !== -1 &&
            a.status === "APPROVED"
          );
        }).length,
        "verified",
        "tone-emerald",
      ) +
      statCard(
        "Tagihan Belum Bayar",
        unpaid.length,
        "receipt_long",
        "tone-amber",
      ) +
      statCard(
        "Total Tagihan",
        idr(
          unpaid.reduce(function (s, i) {
            return s + Number(i.totalAmount);
          }, 0),
        ),
        "payments",
        "tone-rose",
      )
    );
  }
  if (user.role === "TENTOR") {
    return (
      statCard(
        "Penugasan Aktif",
        db.jobs.filter(function (j) {
          return j.assignedTentorId === user.id && j.status === "ASSIGNED";
        }).length,
        "work",
        "tone-sky",
      ) +
      statCard(
        "Sesi Disetujui",
        db.attendances.filter(function (a) {
          return a.tentorId === user.id && a.status === "APPROVED";
        }).length,
        "verified",
        "tone-emerald",
      ) +
      statCard(
        "Total Sesi Tercatat",
        db.attendances.filter(function (a) {
          return a.tentorId === user.id;
        }).length,
        "location_on",
        "tone-amber",
      ) +
      statCard(
        "Klaim Gaji Saya",
        db.payrollClaims.filter(function (c) {
          return c.tentorId === user.id;
        }).length,
        "payments",
        "tone-violet",
      )
    );
  }
  if (user.role === "STUDENT") {
    const myEnr = db.enrollments
      .filter(function (e) {
        return e.studentId === user.id;
      })
      .map(function (e) {
        return e.id;
      });
    const unpaid = db.invoices.filter(function (i) {
      return i.studentId === user.id && i.status === "UNPAID";
    });
    return (
      statCard("Program Les", myEnr.length, "school", "tone-sky") +
      statCard(
        "Sesi Tercatat",
        db.attendances.filter(function (a) {
          return myEnr.indexOf(a.studentEnrollmentId) !== -1;
        }).length,
        "location_on",
        "tone-emerald",
      ) +
      statCard(
        "Tagihan Belum Bayar",
        unpaid.length,
        "receipt_long",
        "tone-amber",
      ) +
      statCard(
        "Total Tagihan",
        idr(
          unpaid.reduce(function (s, i) {
            return s + Number(i.totalAmount);
          }, 0),
        ),
        "payments",
        "tone-rose",
      )
    );
  }
  return "";
}

function chipList(db, ids, nameFn) {
  const arr = ids || [];
  if (!arr.length) return "—";
  return arr
    .map(function (id) {
      return (
        '<span class="badge b-assigned" style="margin:2px 4px 2px 0">' +
        nameFn(db, id) +
        "</span>"
      );
    })
    .join("");
}

function profileDetailRows(user, db) {
  if (user.role === "SUPER_ADMIN") return [["Jabatan", user.position || "—"]];
  if (user.role === "WALI_MURID") {
    return [
      [
        "Anak",
        chipList(
          db,
          db.users
            .filter(function (u) {
              return u.role === "STUDENT" && u.waliId === user.id;
            })
            .map(function (u) {
              return u.id;
            }),
          userName,
        ),
      ],
    ];
  }
  if (user.role === "TENTOR") {
    return [
      ["Pendidikan Terakhir", user.education || "—"],
      ["Pengalaman Mengajar", (user.experienceYears || 0) + " tahun"],
      ["Mapel yang Bisa Diajar", chipList(db, user.subjectIds, subjectName)],
      ["Jenjang yang Bisa Diajar", chipList(db, user.levelIds, levelName)],
    ];
  }
  if (user.role === "STUDENT") {
    const enr = db.enrollments.filter(function (e) {
      return e.studentId === user.id;
    });
    return [
      ["Asal Sekolah", user.school || "—"],
      [
        "Wali",
        enr
          .map(function (e) {
            return (e.parentName || "—") + " (" + (e.parentPhone || "—") + ")";
          })
          .join(", ") || "—",
      ],
    ];
  }
  return [];
}

function renderProfileView(user, db) {
  const initials = user.fullName
    .split(" ")
    .map(function (w) {
      return w[0];
    })
    .slice(0, 2)
    .join("");
  const detailRows = profileDetailRows(user, db);
  return (
    pageHead(
      "Profil Saya",
      "person",
      "Informasi akun Anda — perubahan langsung berlaku, termasuk untuk login berikutnya.",
      '<button class="btn btn-primary" data-action="edit-profile">' +
        ic("edit") +
        " Ubah Profil</button>",
    ) +
    '<div class="grid-2">' +
    '<div class="card"><div class="card-body" style="display:flex;gap:18px;align-items:center">' +
    '<div class="avatar" style="width:64px;height:64px;font-size:1.4rem">' +
    initials +
    "</div>" +
    "<div>" +
    '<div style="font-size:1.2rem;font-weight:800">' +
    user.fullName +
    "</div>" +
    '<div style="color:var(--muted-fg);font-size:.86rem">' +
    user.email +
    "</div>" +
    '<div style="margin-top:8px">' +
    roleBadge(user.role) +
    "</div>" +
    "</div></div></div>" +
    '<div class="card"><div class="card-body">' +
    kvHTML([
      ["Nama Lengkap", user.fullName],
      ["Email", user.email],
      ["Telepon", user.phone || "—"],
      ["Peran", ROLE_LABEL[user.role]],
    ]) +
    "</div></div>" +
    "</div>" +
    '<div class="card"><div class="card-head">' +
    ic("badge") +
    ' Detail Profil</div><div class="card-body">' +
    kvHTML(detailRows) +
    "</div></div>" +
    '<div class="card"><div class="card-head">' +
    ic("insights") +
    " Ringkasan Aktivitas</div>" +
    '<div class="card-body"><div class="stat-grid" style="margin-bottom:0">' +
    roleProfileStats(user, db) +
    "</div></div></div>"
  );
}

function profileModal(db, userId) {
  const u = db.users.find(function (x) {
    return x.id === userId;
  });
  if (!u) return;
  let body =
    '<div class="card" style="margin-bottom:14px"><div class="card-head">' +
    ic("person") +
    ' Informasi Akun</div><div class="card-body">' +
    kvHTML([
      ["Nama", u.fullName],
      ["Email", u.email],
      ["Telepon", u.phone || "—"],
      ["Peran", roleBadge(u.role)],
    ]) +
    "</div></div>";
  if (u.role === "TENTOR") {
    const approved = db.attendances.filter(function (a) {
      return a.tentorId === u.id && a.status === "APPROVED";
    });
    const active = db.jobs.filter(function (j) {
      return j.assignedTentorId === u.id && j.status === "ASSIGNED";
    });
    const subjects = [];
    active.forEach(function (j) {
      if (subjects.indexOf(j.subjectId) === -1) subjects.push(j.subjectId);
    });
    const paidClaims = db.payrollClaims.filter(function (c) {
      return c.tentorId === u.id && c.status === "PAID";
    });
    body +=
      '<div class="card" style="margin-bottom:14px"><div class="card-head">' +
      ic("badge") +
      ' Data Diri Tentor</div><div class="card-body">' +
      kvHTML([
        ["Pendidikan Terakhir", u.education || "—"],
        ["Pengalaman Mengajar", (u.experienceYears || 0) + " tahun"],
        ["Mapel yang Bisa Diajar", chipList(db, u.subjectIds, subjectName)],
        ["Jenjang yang Bisa Diajar", chipList(db, u.levelIds, levelName)],
      ]) +
      "</div></div>" +
      '<div class="card" style="margin-bottom:14px"><div class="card-head">' +
      ic("insights") +
      ' Rekam Jejak Mengajar</div><div class="card-body">' +
      kvHTML([
        ["Sesi Disetujui", approved.length + " sesi"],
        ["Penugasan Aktif", active.length + " lowongan"],
        [
          "Mapel Diampu",
          subjects
            .map(function (s) {
              return subjectName(db, s);
            })
            .join(", ") || "—",
        ],
        [
          "Total Honor Diklaim",
          idr(
            paidClaims.reduce(function (s, c) {
              return s + Number(c.totalClaimAmount);
            }, 0),
          ),
        ],
      ]) +
      "</div></div>";
  }
  if (u.role === "STUDENT") {
    const enr = db.enrollments.filter(function (e) {
      return e.studentId === u.id;
    });
    body = body.replace(
      "</div></div>",
      kvHTML([["Asal Sekolah", u.school || "—"]]) + "</div></div>",
    );
    body +=
      '<div class="card" style="margin-bottom:14px"><div class="card-head">' +
      ic("school") +
      ' Program Les</div><div class="card-body">' +
      (enr
        .map(function (e) {
          return kvHTML([
            [
              "Kelas · Mapel",
              className(db, e.classId) + " · " + subjectName(db, e.subjectId),
            ],
            [
              "Wali",
              (e.parentName || "—") + " (" + (e.parentPhone || "—") + ")",
            ],
            ["Alamat Les", e.fullAddress],
          ]);
        })
        .join("") ||
        '<p style="color:var(--muted-fg);font-size:.85rem">Belum ada program les terdaftar.</p>') +
      "</div></div>";
  }
  openModal({
    title: "Profil — " + u.fullName,
    icon: "person",
    width: 540,
    body: body,
  });
}

/* ============================================================
   FORM DEFINITIONS (untuk modal CRUD)
   ============================================================ */
function levelOptions(db) {
  return db.educationLevels.map(function (l) {
    return { value: l.id, label: l.levelName };
  });
}
function classOptions(db) {
  return db.classes.map(function (c) {
    return {
      value: c.id,
      label: c.className + " — honor " + idr(c.baseRatePer90Min) + "/90 mnt",
    };
  });
}
function subjectOptions(db) {
  return db.subjects.map(function (s) {
    return { value: s.id, label: s.name };
  });
}

const masterForms = {
  subjectFields: function (values) {
    return [
      {
        name: "name",
        label: "Nama Mapel",
        required: true,
        placeholder: "cth: Matematika",
        value: values && values.name,
      },
      {
        name: "description",
        label: "Deskripsi",
        type: "textarea",
        rows: 2,
        placeholder: "Opsional",
        value: values && values.description,
      },
    ];
  },
  levelFields: function (values) {
    return [
      {
        name: "levelName",
        label: "Nama Jenjang",
        required: true,
        placeholder: "cth: SMA",
        value: values && values.levelName,
      },
      {
        name: "description",
        label: "Deskripsi",
        type: "textarea",
        rows: 2,
        placeholder: "Opsional",
        value: values && values.description,
      },
    ];
  },
  classFields: function (db, values) {
    return [
      {
        name: "className",
        label: "Nama Kelas",
        required: true,
        placeholder: "cth: Kelas 10 SMA",
        value: values && values.className,
      },
      {
        name: "educationLevelId",
        label: "Jenjang",
        type: "select",
        required: true,
        placeholder: "— Pilih jenjang —",
        options: levelOptions(db),
        value: values && values.educationLevelId,
      },
      {
        name: "baseRatePer90Min",
        label: "Tarif Dasar / 90 Menit (Rp)",
        type: "number",
        required: true,
        min: 0,
        step: 5000,
        value: values ? values.baseRatePer90Min : 100000,
      },
      {
        name: "description",
        label: "Deskripsi",
        type: "textarea",
        rows: 2,
        placeholder: "Opsional",
        value: values && values.description,
      },
    ];
  },
  userFields: function (db, values, isNew) {
    return [
      {
        name: "fullName",
        label: "Nama Lengkap",
        required: true,
        value: values && values.fullName,
      },
      {
        name: "email",
        label: "Email (untuk login)",
        type: "email",
        required: true,
        value: values && values.email,
      },
      {
        name: "phone",
        label: "Telepon",
        placeholder: "08xx-xxxx-xxxx",
        value: values && values.phone,
      },
      {
        name: "role",
        label: "Peran",
        type: "select",
        required: true,
        options: ["SUPER_ADMIN", "TENTOR", "STUDENT", "WALI_MURID"],
        value: values ? values.role : "TENTOR",
      },
      {
        name: "password",
        label: isNew ? "Password" : "Password (kosongkan jika tidak diubah)",
        type: "password",
        required: !!isNew,
        value: "",
      },
    ];
  },
};

function packageFields(values) {
  return [
    {
      name: "name",
      label: "Nama Paket",
      required: true,
      placeholder: "cth: Paket Bulanan Private",
      value: values && values.name,
    },
    {
      name: "mode",
      label: "Mode",
      type: "select",
      required: true,
      options: [
        { value: "PRIVATE", label: "Private (1 guru : 1 siswa)" },
        { value: "KELOMPOK", label: "Kelompok (1 guru : beberapa siswa)" },
      ],
      value: values ? values.mode : "PRIVATE",
    },
    {
      name: "period",
      label: "Periode Tagihan",
      type: "select",
      required: true,
      options: [
        { value: "BULANAN", label: "Bulanan (tagihan flat per bulan)" },
        { value: "HARIAN", label: "Harian (tagihan per sesi)" },
      ],
      value: values ? values.period : "BULANAN",
    },
    {
      name: "price",
      label: "Biaya Wali Murid (Rp)",
      type: "number",
      required: true,
      min: 0,
      step: 50000,
      help: "Harga paket yang dibayar wali murid (SPP).",
      value: values ? values.price : 1000000,
    },
    {
      name: "tentorFee",
      label: "Honor Tentor per Sesi (Rp)",
      type: "number",
      required: true,
      min: 0,
      step: 5000,
      help: "Yang diterima tentor per sesi (sudah termasuk transport).",
      value: values ? values.tentorFee : 100000,
    },
    {
      name: "sessionsPerPeriod",
      label: "Jumlah Sesi per Periode",
      type: "number",
      required: true,
      min: 1,
      step: 1,
      value: values ? values.sessionsPerPeriod : 8,
    },
    {
      name: "maxStudents",
      label: "Maks Siswa (untuk mode Kelompok)",
      type: "number",
      min: 1,
      step: 1,
      value: values ? values.maxStudents : 5,
    },
    {
      name: "active",
      label: "Status Aktif",
      type: "select",
      options: [
        { value: "1", label: "Aktif" },
        { value: "0", label: "Nonaktif" },
      ],
      value: values ? (values.active === false ? "0" : "1") : "1",
    },
    {
      name: "description",
      label: "Deskripsi",
      type: "textarea",
      rows: 2,
      placeholder: "Opsional",
      value: values && values.description,
    },
  ];
}

const DAY_ORDER = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];
const DAY_OPTIONS = DAY_ORDER.map(function (d) {
  return { value: d, label: d };
});

function parseSchedule(str) {
  const out = { days: [], time: "" };
  if (!str) return out;
  DAY_ORDER.forEach(function (d) {
    if (String(str).indexOf(d) !== -1) out.days.push(d);
  });
  const m = String(str).match(/\d{1,2}:\d{2}/);
  if (m) out.time = m[0].length === 4 ? "0" + m[0] : m[0];
  return out;
}

function time24ToMin(t) {
  const m = /^([01][0-9]|2[0-3]):([0-5][0-9])$/.exec(String(t || "").trim());
  return m ? +m[1] * 60 + +m[2] : null;
}

function formatSchedule(days, time) {
  const picked = DAY_ORDER.filter(function (d) {
    return (days || []).indexOf(d) !== -1;
  });
  const names = picked.reduce(function (acc, d, i) {
    if (i === 0) return d;
    return i === picked.length - 1 ? acc + " & " + d : acc + ", " + d;
  }, "");
  return names + (time ? " " + time + " WIB" : "");
}

function enrollmentFields(db, values) {
  const studentUsers = db.users.filter(function (u) {
    return u.role === "STUDENT";
  });
  return [
    {
      name: "studentId",
      label: "Akun Siswa",
      type: "select",
      required: true,
      placeholder: "— Pilih akun siswa —",
      options: studentUsers.map(function (u) {
        return { value: u.id, label: u.fullName + " (" + u.email + ")" };
      }),
    },
    {
      name: "newStudent",
      label: "atau buat akun siswa baru?",
      type: "select",
      options: [
        { value: "0", label: "Tidak — pakai akun yang sudah ada" },
        { value: "1", label: "Ya — buat akun siswa baru" },
      ],
      value: "0",
    },
    {
      name: "newName",
      label: "Nama Siswa (akun baru)",
      placeholder: "Nama lengkap siswa",
    },
    {
      name: "newEmail",
      label: "Email Wali (akun baru)",
      type: "email",
      placeholder: "wali@email.com",
    },
    { name: "newPassword", label: "Password (akun baru)", type: "password" },
    {
      name: "newPhone",
      label: "Telepon Wali (akun baru)",
      placeholder: "08xx-xxxx-xxxx",
    },
    {
      name: "classId",
      label: "Kelas",
      type: "select",
      required: true,
      placeholder: "— Pilih kelas —",
      options: classOptions(db),
      value: values && values.classId,
    },
    {
      name: "subjectId",
      label: "Mata Pelajaran",
      type: "select",
      required: true,
      placeholder: "— Pilih mapel —",
      options: subjectOptions(db),
      value: values && values.subjectId,
    },
    {
      name: "packageId",
      label: "Paket Les",
      type: "select",
      required: true,
      placeholder: "— Pilih paket les —",
      options: packageOptions(db),
      value: values && values.packageId,
    },
    {
      name: "parentName",
      label: "Nama Wali",
      value: values && values.parentName,
    },
    {
      name: "parentPhone",
      label: "Telepon Wali",
      value: values && values.parentPhone,
    },
    {
      name: "fullAddress",
      label: "Alamat Rumah (lokasi les)",
      required: true,
      value: values && values.fullAddress,
    },
    {
      name: "latitude",
      label: "Latitude",
      type: "number",
      required: true,
      step: 0.0001,
      value: values ? values.latitude : -6.2,
    },
    {
      name: "longitude",
      label: "Longitude",
      type: "number",
      required: true,
      step: 0.0001,
      value: values ? values.longitude : 106.8,
    },
  ];
}

function enrollmentOptions(db) {
  return db.enrollments.map(function (e) {
    return {
      value: e.id,
      label:
        userName(db, e.studentId) +
        " — " +
        className(db, e.classId) +
        " " +
        subjectName(db, e.subjectId),
    };
  });
}

function studentControlHTML(f, v) {
  const isMulti = !!f.multi;
  const selIds = Array.isArray(v) ? v.slice() : v ? [v] : [];
  const opts = f.options || [];
  if (isMulti) {
    return (
      '<div class="multi-group" id="f_studentEnrollmentIds">' +
      opts
        .map(function (o) {
          const val = typeof o === "object" ? o.value : o;
          const lbl = typeof o === "object" ? o.label : o;
          return (
            '<label class="multi-opt"><input type="checkbox" name="studentEnrollmentIds" value="' +
            val +
            '"' +
            (selIds.indexOf(val) !== -1 ? " checked" : "") +
            "> " +
            lbl +
            "</label>"
          );
        })
        .join("") +
      "</div>"
    );
  }
  return (
    '<select id="f_studentEnrollmentId" name="studentEnrollmentId"' +
    (f.required ? " required" : "") +
    ">" +
    (f.placeholder ? '<option value="">' + f.placeholder + "</option>" : "") +
    opts
      .map(function (o) {
        const val = typeof o === "object" ? o.value : o;
        const lbl = typeof o === "object" ? o.label : o;
        return (
          '<option value="' +
          val +
          '"' +
          (String(selIds[0]) === String(val) ? " selected" : "") +
          ">" +
          lbl +
          "</option>"
        );
      })
      .join("") +
    "</select>"
  );
}

/* Swap kontrol pemilihan siswa mengikuti jenis paket (Private/Kelompok). */
function bindJobStudentSwitcher(db) {
  const pkgSel = document.getElementById("f_packageId");
  const wrap = document.getElementById("f_studentFields");
  if (!pkgSel || !wrap) return;
  const render = function () {
    const p = packageById(db, pkgSel.value);
    const isMulti = !!(p && p.mode === "KELOMPOK");
    const sel = [];
    wrap
      .querySelectorAll('input[name="studentEnrollmentIds"]:checked')
      .forEach(function (el) {
        sel.push(el.value);
      });
    const single = wrap.querySelector("#f_studentEnrollmentId");
    if (single && single.value) sel.unshift(single.value);
    const fake = {
      multi: isMulti,
      required: true,
      placeholder: "— Pilih siswa SentraEdu —",
      options: enrollmentOptions(db),
    };
    wrap.innerHTML =
      studentControlHTML(fake, isMulti ? sel : sel[0] || "") +
      '<div class="help">' +
      (isMulti
        ? "Kelompok — bisa pilih banyak siswa (maks " +
          (p ? p.maxStudents : 5) +
          " siswa)."
        : "Private — satu siswa per lowongan.") +
      "</div>";
  };
  pkgSel.addEventListener("change", render);
}

function jobFields(db, values) {
  const sched = parseSchedule(values && values.preferredSchedule);
  const isOnline = values && values.mode === "ONLINE";
  const pkg = values && values.packageId ? packageById(db, values.packageId) : null;
  const isGroup = !!(pkg && pkg.mode === "KELOMPOK");
  const selIds =
    values && Array.isArray(values.studentEnrollmentIds)
      ? values.studentEnrollmentIds.slice()
      : values && values.studentEnrollmentId
        ? [values.studentEnrollmentId]
        : [];
  return [
    {
      name: "title",
      label: "Judul Lowongan",
      required: true,
      placeholder: "cth: Les Privat Matematika Kelas 12 SMA",
      value: values && values.title,
    },
    {
      name: "jobType",
      label: "Tipe Lowongan",
      type: "select",
      options: [
        { value: "REGULAR", label: "Reguler" },
        { value: "TEMPORARY_REPLACEMENT", label: "Pengganti Sementara" },
      ],
      value: values ? values.jobType : "REGULAR",
    },
    {
      name: "studentEnrollmentIds",
      label: "Siswa",
      type: "students",
      required: true,
      multi: isGroup,
      placeholder: "— Pilih siswa SentraEdu —",
      options: enrollmentOptions(db),
      _hint: isGroup
        ? "Kelompok — bisa pilih banyak siswa (maks " +
          (pkg ? pkg.maxStudents : 5) +
          " siswa)."
        : "Private — satu siswa per lowongan.",
      value: isGroup ? selIds : selIds[0] || "",
    },
    {
      name: "classId",
      label: "Kelas",
      type: "select",
      required: true,
      placeholder: "— Pilih kelas —",
      options: classOptions(db),
      value: values && values.classId,
    },
    {
      name: "subjectId",
      label: "Mata Pelajaran",
      type: "select",
      required: true,
      placeholder: "— Pilih mapel —",
      options: subjectOptions(db),
      value: values && values.subjectId,
    },
    {
      name: "mode",
      label: "Mode Les",
      type: "select",
      required: true,
      options: [
        { value: "OFFLINE", label: "Offline (tatap muka langsung)" },
        { value: "ONLINE", label: "Online (daring / video call)" },
      ],
      value: values ? values.mode : "OFFLINE",
    },
    {
      name: "packageId",
      label: "Paket Les (mode & harga SPP)",
      type: "select",
      required: true,
      placeholder: "— Pilih paket les —",
      options: packageOptions(db),
      value: values && values.packageId,
    },
    {
      name: "preferredDays",
      label: "Hari Preferensi (boleh pilih beberapa)",
      type: "multi",
      required: true,
      options: DAY_OPTIONS,
      value: sched.days,
    },
    {
      name: "preferredTime",
      label: "Jam Mulai",
      type: "time24",
      required: true,
      value: sched.time,
    },
    {
      name: "transportAllowance",
      label: "Tunjangan Transport (Rp/sesi)",
      type: "number",
      min: 0,
      step: 5000,
      value: values ? values.transportAllowance : 0,
    },
    {
      name: "latitude",
      label: "Latitude — Lokasi Les (GPS)",
      type: "number",
      required: !isOnline,
      step: 0.000001,
      help: isOnline ? "Tidak diperlukan untuk les online." : "",
      value:
        values && values.latitude !== undefined && values.latitude !== null
          ? values.latitude
          : "",
    },
    {
      name: "longitude",
      label: "Longitude — Lokasi Les (GPS)",
      type: "number",
      required: !isOnline,
      step: 0.000001,
      help: isOnline ? "Tidak diperlukan untuk les online." : "",
      value:
        values && values.longitude !== undefined && values.longitude !== null
          ? values.longitude
          : "",
    },
    {
      name: "additionalNotes",
      label: "Catatan Tambahan",
      type: "textarea",
      rows: 2,
      placeholder: "cth: Guru ramah, sabar, fokus UTBK",
      value: values && values.additionalNotes,
    },
  ];
}

function jobGpsBoxHTML() {
  return (
    '<div id="job-gps-box">' +
    '<div class="quick-actions" style="margin-bottom:10px">' +
    '<button type="button" class="btn btn-sm btn-soft" data-action="job-gps-student">' +
    ic("home_pin") +
    " Ambil Lokasi dari Siswa</button>" +
    '</div><div id="job-gps-status"></div></div>'
  );
}

function updateJobGpsStatus() {
  const box = document.getElementById("job-gps-status");
  if (!box) return;
  const fLat = document.getElementById("f_latitude");
  const fLng = document.getElementById("f_longitude");
  if (!fLat || !fLng || fLat.value === "" || fLng.value === "") {
    box.innerHTML =
      '<span class="gps-pill gps-warn">' +
      ic("warning") +
      " Koordinat GPS lokasi les wajib diisi</span>";
    return;
  }
  box.innerHTML =
    '<span class="gps-pill gps-ok">' +
    ic("verified") +
    " Lokasi les terpasang: " +
    fLat.value +
    ", " +
    fLng.value +
    "</span>";
}

function profileEditFields(db, user) {
  const common = [
    {
      name: "fullName",
      label: "Nama Lengkap",
      required: true,
      value: user.fullName,
    },
    {
      name: "email",
      label: "Email (untuk login)",
      type: "email",
      required: true,
      value: user.email,
    },
    { name: "phone", label: "Telepon", value: user.phone || "" },
    {
      name: "password",
      label: "Password Baru (kosongkan jika tidak diubah)",
      type: "password",
      value: "",
    },
  ];
  let extra = [];
  if (user.role === "TENTOR") {
    extra = [
      {
        name: "education",
        label: "Pendidikan Terakhir",
        placeholder: "cth: S1 Pendidikan Matematika",
        value: user.education || "",
      },
      {
        name: "experienceYears",
        label: "Pengalaman Mengajar (tahun)",
        type: "number",
        min: 0,
        step: 1,
        value: user.experienceYears || 0,
      },
      {
        name: "subjectIds",
        label: "Mapel yang Bisa Diajar",
        type: "multi",
        required: true,
        options: subjectOptions(db),
        value: user.subjectIds || [],
      },
      {
        name: "levelIds",
        label: "Jenjang yang Bisa Diajar",
        type: "multi",
        required: true,
        options: levelOptions(db),
        value: user.levelIds || [],
      },
    ];
  } else if (user.role === "SUPER_ADMIN") {
    extra = [
      {
        name: "position",
        label: "Jabatan",
        placeholder: "cth: Manajer Operasional Pusat",
        value: user.position || "",
      },
    ];
  } else if (user.role === "STUDENT") {
    extra = [
      {
        name: "school",
        label: "Asal Sekolah",
        placeholder: "cth: SMA Negeri 1 Jakarta",
        value: user.school || "",
      },
    ];
  }
  return common.concat(extra);
}

function candidateFields(db, values) {
  return [
    {
      name: "fullName",
      label: "Nama Lengkap",
      required: true,
      placeholder: "cth: Fajar Ramadhan",
      value: values && values.fullName,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "calon@email.com",
      value: values && values.email,
    },
    {
      name: "phone",
      label: "Telepon",
      placeholder: "08xx-xxxx-xxxx",
      value: values && values.phone,
    },
    {
      name: "education",
      label: "Pendidikan Terakhir",
      placeholder: "cth: S1 Pendidikan Matematika",
      value: values && values.education,
    },
    {
      name: "subjectIds",
      label: "Mapel yang Bisa Diajar (boleh lebih dari satu)",
      type: "multi",
      required: true,
      options: subjectOptions(db),
      value: values && values.subjectIds,
    },
    {
      name: "levelIds",
      label: "Jenjang yang Bisa Diajar (boleh lebih dari satu)",
      type: "multi",
      required: true,
      options: levelOptions(db),
      value: values && values.levelIds,
    },
    {
      name: "experienceYears",
      label: "Pengalaman Mengajar (tahun)",
      type: "number",
      min: 0,
      step: 1,
      value: values ? values.experienceYears : 0,
    },
    {
      name: "source",
      label: "Sumber Pendaftaran",
      type: "select",
      options: [
        "Media Sosial",
        "Referensi",
        "Website",
        "Walk-in",
        "Kampus",
        "Lainnya",
      ],
      value: values ? values.source : "Media Sosial",
    },
  ];
}

/* ============================================================
   HANDLER ACTION (event delegation)
   ============================================================ */
function reRender() {
  const user = currentUser();
  if (user) renderContent(user);
  refreshNotifBadge(user);
}
function applyResult(r) {
  if (r.ok) {
    toast(r.message, "success");
    closeModal();
    reRender();
  } else toast(r.error, "error");
}

const Actions = {
  /* ---- navigasi & umum ---- */
  nav: function (id, ds) {
    state.view = ds.view;
    reRender();
    document.querySelector(".sidebar").classList.remove("open");
    document.querySelector(".backdrop").classList.remove("show");
    updateMenuIcon();
  },
  page: function (id, ds) {
    const n = parseInt(ds.page, 10);
    pg[ds.view] = isNaN(n) || n < 1 ? 1 : n;
    reRender();
    setTimeout(function () {
      const el = document.getElementById("tbl-" + ds.view);
      if (el && el.scrollIntoView)
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  },
  logout: function () {
    clearSession();
    location.hash = "#/login";
  },
  "menu-toggle": function () {
    document.querySelector(".sidebar").classList.toggle("open");
    document.querySelector(".backdrop").classList.toggle("show");
    updateMenuIcon();
  },
  "menu-close": function () {
    document.querySelector(".sidebar").classList.remove("open");
    document.querySelector(".backdrop").classList.remove("show");
    updateMenuIcon();
  },
  "notif-open": function () {
    openNotifModal();
  },
  "notif-read": function (id) {
    Biz.markNotifRead(id);
    reRender();
    openNotifModal();
  },
  "notif-read-all": function () {
    const u = currentUser();
    if (u) {
      Biz.markAllNotifRead(u.id);
      reRender();
      openNotifModal();
    }
  },
  "theme-toggle": function () {
    toggleTheme();
    if (currentUser()) reRender();
  },
  "export-data": function () {
    exportData();
  },
  "import-data": function () {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.addEventListener("change", function () {
      if (input.files && input.files[0]) importData(input.files[0]);
    });
    input.click();
  },
  "clear-filters": function (id, ds) {
    clearFilters(ds.view);
  },
  "reset-data": function () {
    openConfirmModal({
      title: "Reset Data Demo",
      icon: "restart_alt",
      danger: true,
      message:
        "Hapus semua data dan kembalikan ke data seeding awal? Seluruh perubahan Anda akan hilang.",
      confirmLabel: "Ya, Reset",
      onConfirm: function () {
        localStorage.removeItem(DB_KEY);
        clearSession();
        location.hash = "#/login";
        location.reload();
      },
    });
  },

  /* ---- CRUD master (admin) ---- */

  "add-subject": function () {
    openFormModal({
      title: "Tambah Mata Pelajaran",
      icon: "add_book",
      fields: masterForms.subjectFields(),
      onSubmit: function (d) {
        applyResult(Biz.saveSubject(d));
      },
    });
  },
  "edit-subject": function (id) {
    const s = loadDB().subjects.find(function (x) {
      return x.id === id;
    });
    openFormModal({
      title: "Ubah Mata Pelajaran",
      icon: "edit_book",
      fields: masterForms.subjectFields(s),
      onSubmit: function (d) {
        applyResult(Biz.saveSubject(d, id));
      },
    });
  },
  "del-subject": function (id) {
    openConfirmModal({
      title: "Hapus Mapel",
      icon: "delete",
      danger: true,
      message: "Yakin ingin menghapus mata pelajaran ini?",
      confirmLabel: "Hapus",
      onConfirm: function () {
        applyResult(Biz.deleteSubject(id));
      },
    });
  },

  "add-level": function () {
    openFormModal({
      title: "Tambah Jenjang & Tarif",
      icon: "add_chart",
      fields: masterForms.levelFields(),
      onSubmit: function (d) {
        applyResult(Biz.saveLevel(d));
      },
    });
  },
  "edit-level": function (id) {
    const l = loadDB().educationLevels.find(function (x) {
      return x.id === id;
    });
    openFormModal({
      title: "Ubah Jenjang & Tarif",
      icon: "edit_chart",
      fields: masterForms.levelFields(l),
      onSubmit: function (d) {
        applyResult(Biz.saveLevel(d, id));
      },
    });
  },
  "del-level": function (id) {
    openConfirmModal({
      title: "Hapus Jenjang",
      icon: "delete",
      danger: true,
      message: "Yakin ingin menghapus jenjang ini?",
      confirmLabel: "Hapus",
      onConfirm: function () {
        applyResult(Biz.deleteLevel(id));
      },
    });
  },

  "add-class": function () {
    openFormModal({
      title: "Tambah Kelas",
      icon: "add_chart",
      fields: masterForms.classFields(loadDB()),
      onSubmit: function (d) {
        applyResult(Biz.saveClass(d));
      },
    });
  },
  "edit-class": function (id) {
    const db = loadDB();
    const c = db.classes.find(function (x) {
      return x.id === id;
    });
    openFormModal({
      title: "Ubah Kelas & Tarif",
      icon: "edit_chart",
      fields: masterForms.classFields(db, c),
      onSubmit: function (d) {
        applyResult(Biz.saveClass(d, id));
      },
    });
  },
  "del-class": function (id) {
    openConfirmModal({
      title: "Hapus Kelas",
      icon: "delete",
      danger: true,
      message: "Yakin ingin menghapus kelas ini?",
      confirmLabel: "Hapus",
      onConfirm: function () {
        applyResult(Biz.deleteClass(id));
      },
    });
  },

  "add-package": function () {
    openFormModal({
      title: "Tambah Paket Les",
      icon: "add_chart",
      width: 600,
      fields: packageFields(),
      onSubmit: function (d) {
        applyResult(Biz.savePackage(d));
      },
    });
  },
  "edit-package": function (id) {
    const p = (loadDB().packages || []).find(function (x) {
      return x.id === id;
    });
    openFormModal({
      title: "Ubah Paket Les",
      icon: "edit_chart",
      width: 600,
      fields: packageFields(p),
      onSubmit: function (d) {
        applyResult(Biz.savePackage(d, id));
      },
    });
  },
  "del-package": function (id) {
    openConfirmModal({
      title: "Hapus Paket",
      icon: "delete",
      danger: true,
      message:
        "Yakin ingin menghapus paket les ini? Paket yang dipakai lowongan/siswa tidak bisa dihapus.",
      confirmLabel: "Hapus",
      onConfirm: function () {
        applyResult(Biz.deletePackage(id));
      },
    });
  },

  "add-user": function () {
    openFormModal({
      title: "Tambah Akun Pengguna",
      icon: "person_add",
      fields: masterForms.userFields(loadDB(), null, true),
      onSubmit: function (d) {
        applyResult(Biz.saveUser(d));
      },
    });
  },
  "edit-user": function (id) {
    const u = loadDB().users.find(function (x) {
      return x.id === id;
    });
    openFormModal({
      title: "Ubah Akun",
      icon: "manage_accounts",
      fields: masterForms.userFields(loadDB(), u, false),
      onSubmit: function (d) {
        applyResult(Biz.saveUser(d, id));
      },
    });
  },
  "del-user": function (id) {
    openConfirmModal({
      title: "Hapus Akun",
      icon: "delete",
      danger: true,
      message:
        "Yakin ingin menghapus akun ini? Data terkait akan dicegah untuk dihapus.",
      confirmLabel: "Hapus",
      onConfirm: function () {
        applyResult(Biz.deleteUser(id));
      },
    });
  },
  "edit-profile": function () {
    const u = currentUser();
    if (!u) return;
    openFormModal({
      title: "Ubah Profil Saya",
      icon: "manage_accounts",
      width: u.role === "TENTOR" ? 640 : 520,
      fields: profileEditFields(loadDB(), u),
      submitLabel: "Simpan Profil",
      onSubmit: function (d) {
        applyResult(Biz.updateProfile(u.id, d));
      },
    });
  },
  "view-profile": function (id) {
    profileModal(loadDB(), id);
  },

  /* ---- siswa / enrollment ---- */
  "add-student": function () {
    const db = loadDB();
    const user = currentUser();
    const fields = enrollmentFields(db);

    openFormModal({
      title: "Daftarkan Siswa",
      icon: "person_add",
      width: 640,
      fields: fields,
      onSubmit: function (d) {
        applyResult(Biz.saveEnrollment(d));
      },
    });
  },
  "edit-enrollment": function (id) {
    const db = loadDB();
    const e = db.enrollments.find(function (x) {
      return x.id === id;
    });
    openFormModal({
      title: "Ubah Data Siswa",
      icon: "edit_note",
      width: 640,
      fields: enrollmentFields(db, e),
      onSubmit: function (d) {
        applyResult(Biz.saveEnrollment(d, id));
      },
    });
  },
  "del-enrollment": function (id) {
    openConfirmModal({
      title: "Hapus Siswa",
      icon: "delete",
      danger: true,
      message: "Yakin ingin menghapus data siswa ini?",
      confirmLabel: "Hapus",
      onConfirm: function () {
        applyResult(Biz.deleteEnrollment(id));
      },
    });
  },

  /* ---- lowongan ---- */
  "add-job": function () {
    const db = loadDB();
    const user = currentUser();
    if (
      !db.enrollments.some(function (e) {
        return true;
      })
    ) {
      toast(
        "Daftarkan siswa terlebih dahulu sebelum membuat lowongan.",
        "error",
      );
      return;
    }
    openFormModal({
      title: "Buat Lowongan Les",
      icon: "add_circle",
      width: 640,
      bodyExtra: jobGpsBoxHTML(),
      fields: jobFields(db, null, user),
      onSubmit: function (d) {
        d.preferredSchedule = formatSchedule(d.preferredDays, d.preferredTime);
        delete d.preferredDays;
        delete d.preferredTime;
        const ids = Array.isArray(d.studentEnrollmentIds)
          ? d.studentEnrollmentIds
          : d.studentEnrollmentId
            ? [d.studentEnrollmentId]
            : [];
        d.studentEnrollmentIds = ids;
        d.studentEnrollmentId = ids[0] || "";
        applyResult(Biz.saveJob(d, null, user));
      },
    });
    setTimeout(function () {
      bindJobStudentSwitcher(db);
      updateJobGpsStatus();
    }, 60);
  },
  "edit-job": function (id) {
    const db = loadDB();
    const j = db.jobs.find(function (x) {
      return x.id === id;
    });
    const user = currentUser();
    openFormModal({
      title: "Ubah Lowongan",
      icon: "edit_note",
      width: 640,
      bodyExtra: j.mode === "ONLINE" ? "" : jobGpsBoxHTML(),
      fields: jobFields(db, j, user),
      onSubmit: function (d) {
        d.preferredSchedule = formatSchedule(d.preferredDays, d.preferredTime);
        delete d.preferredDays;
        delete d.preferredTime;
        const ids = Array.isArray(d.studentEnrollmentIds)
          ? d.studentEnrollmentIds
          : d.studentEnrollmentId
            ? [d.studentEnrollmentId]
            : [];
        d.studentEnrollmentIds = ids;
        d.studentEnrollmentId = ids[0] || "";
        applyResult(Biz.saveJob(d, id, user));
      },
    });
    setTimeout(function () {
      bindJobStudentSwitcher(db);
      if (j.mode !== "ONLINE") updateJobGpsStatus();
    }, 60);
  },
  "job-gps-student": function () {
    const db = loadDB();
    const sel = document.getElementById("f_studentEnrollmentId");
    let enrId = sel && sel.value ? sel.value : "";
    if (!enrId) {
      const checked = document.querySelector(
        '#modal-form input[name="studentEnrollmentIds"]:checked',
      );
      if (checked) enrId = checked.value;
    }
    const enr = enrId
      ? db.enrollments.find(function (e) {
          return e.id === enrId;
        })
      : null;
    if (!enr) {
      toast("Pilih siswa terlebih dahulu.", "error");
      return;
    }
    const fLat = document.getElementById("f_latitude");
    const fLng = document.getElementById("f_longitude");
    if (fLat) fLat.value = enr.latitude.toFixed(6);
    if (fLng) fLng.value = enr.longitude.toFixed(6);
    updateJobGpsStatus();
  },
  "del-job": function (id) {
    openConfirmModal({
      title: "Hapus Lowongan",
      icon: "delete",
      danger: true,
      message: "Yakin ingin menghapus lowongan ini?",
      confirmLabel: "Hapus",
      onConfirm: function () {
        applyResult(Biz.deleteJob(id));
      },
    });
  },

  "manage-job": function (id) {
    const db = loadDB();
    const j = jobById(db, id);
    if (!j) return;
    const apps = db.applications.filter(function (a) {
      return a.jobPostingId === id;
    });
    const pending = apps.filter(function (a) {
      return a.status === "PENDING";
    });
    let appsHtml =
      '<div class="card" style="border:1px solid var(--border);border-radius:12px;margin-bottom:14px"><div class="card-head" style="padding:10px 14px;font-size:.85rem">' +
      ic("group") +
      " Lamaran Masuk (" +
      apps.length +
      ')</div><div class="card-body flush">';
    if (!apps.length) {
      appsHtml +=
        '<div style="padding:14px;font-size:.84rem;color:var(--muted-fg)">Belum ada tentor yang melamar.</div>';
    } else {
      appsHtml +=
        '<table class="tbl"><thead><tr><th>Tentor</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' +
        apps
          .map(function (a) {
            return (
              "<tr><td><strong>" +
              userName(db, a.tentorId) +
              '</strong><div class="sub">' +
              (a.notes || "") +
              "</div></td><td>" +
              badge(a.status) +
              "</td>" +
              '<td><div class="actions">' +
              '<button class="btn btn-sm btn-outline" data-action="view-profile" data-id="' +
              a.tentorId +
              '">' +
              ic("person") +
              " Profil</button>" +
              (a.status === "PENDING" && j.status !== "ASSIGNED"
                ? '<button class="btn btn-sm btn-primary" data-action="app-approve" data-id="' +
                  a.id +
                  '">' +
                  ic("check") +
                  " Setujui</button>" +
                  '<button class="btn btn-sm btn-danger" data-action="app-reject" data-id="' +
                  a.id +
                  '">' +
                  ic("close") +
                  " Tolak</button>"
                : "") +
              "</div></td></tr>"
            );
          })
          .join("") +
        "</tbody></table>";
    }
    appsHtml += "</div></div>";
    let statusHtml =
      '<div class="card" style="border:1px solid var(--border);border-radius:12px"><div class="card-head" style="padding:10px 14px;font-size:.85rem">' +
      ic("tune") +
      ' Ubah Status Lowongan</div><div class="card-body">';
    if (j.status === "AVAILABLE") {
      statusHtml +=
        '<p style="font-size:.85rem;color:var(--muted-fg);margin-bottom:10px">Lowongan tersedia. Tentor bisa melamar dari feed lowongan.</p>';
    } else if (j.status === "NEGOTIATING") {
      statusHtml +=
        '<p style="font-size:.85rem;color:var(--muted-fg);margin-bottom:10px">Sedang dinegosiasikan. Setujui salah satu pelamar, atau kembalikan ke status Tersedia.</p>' +
        '<div class="quick-actions">' +
        '<button class="btn btn-sm btn-outline" data-action="job-back" data-id="' +
        j.id +
        '">' +
        ic("undo") +
        " Kembalikan ke Tersedia</button>" +
        (pending.length
          ? '<button class="btn btn-sm btn-primary" data-action="job-assign" data-id="' +
            j.id +
            '">' +
            ic("lock") +
            " Setujui Penugasan</button>"
          : "") +
        "</div>";
    } else if (j.status === "ASSIGNED") {
      statusHtml +=
        '<p style="font-size:.85rem;color:var(--muted-fg);margin-bottom:10px">Ditugaskan ke <strong>' +
        userName(db, j.assignedTentorId) +
        "</strong>. Job terkunci — tidak bisa dilamar tentor lain.</p>" +
        '<button class="btn btn-sm btn-danger" data-action="job-cancel" data-id="' +
        j.id +
        '">' +
        ic("block") +
        " Batalkan Lowongan</button>";
    } else {
      statusHtml +=
        '<p style="font-size:.85rem;color:var(--muted-fg);margin-bottom:10px">Lowongan dibatalkan. Buka kembali lowongan ini agar tentor bisa melamar lagi.</p>' +
        '<div class="quick-actions">' +
        '<button class="btn btn-sm btn-outline" data-action="job-back" data-id="' +
        j.id +
        '">' +
        ic("undo") +
        " Kembalikan ke Tersedia</button>" +
        "</div>";
    }
    statusHtml += "</div></div>";
    openModal({
      title: "Kelola Lowongan",
      icon: "tune",
      width: 680,
      body:
        kvHTML([
          ["Judul", j.title],
          ["Siswa", jobStudentLabel(db, j)],
          [
            "Kelas · Mapel",
            className(db, j.classId) + " · " + subjectName(db, j.subjectId),
          ],
          ["Mode", badge(j.mode || "OFFLINE")],
          ["Paket Les", packageName(db, j.packageId)],
          ["Jadwal", j.preferredSchedule],
          [
            "Estimasi Honor/Sesi",
            idr(jobSessionFee(db, j)),
          ],
          [
            "Lokasi Les (GPS)",
            j.latitude !== undefined &&
            j.latitude !== null &&
            j.longitude !== undefined &&
            j.longitude !== null
              ? j.latitude + ", " + j.longitude
              : "—",
          ],
          ["Status", badge(j.status)],
        ]) +
        appsHtml +
        statusHtml,
    });
  },

  "app-approve": function (id) {
    applyResult(Biz.decideApplication(id, "approve"));
  },
  "app-reject": function (id) {
    openConfirmModal({
      title: "Tolak Lamaran",
      icon: "close",
      danger: true,
      message: "Tolak lamaran tentor ini?",
      confirmLabel: "Tolak",
      onConfirm: function () {
        applyResult(Biz.decideApplication(id, "reject"));
      },
    });
  },
  "job-back": function (id) {
    applyResult(Biz.setJobStatus(id, "AVAILABLE"));
  },
  "job-cancel": function (id) {
    openConfirmModal({
      title: "Batalkan Lowongan",
      icon: "block",
      danger: true,
      message: "Batalkan lowongan ini? Penugasan tentor akan dilepas.",
      confirmLabel: "Batalkan",
      onConfirm: function () {
        applyResult(Biz.setJobStatus(id, "CANCELLED"));
      },
    });
  },
  "job-assign": function (id) {
    const db = loadDB();
    const j = jobById(db, id);
    const pending = db.applications.filter(function (a) {
      return a.jobPostingId === id && a.status === "PENDING";
    });
    if (!pending.length) {
      toast("Tidak ada pelamar untuk ditugaskan.", "error");
      return;
    }
    openFormModal({
      title: "Setujui Penugasan",
      icon: "lock",
      width: 480,
      fields: [
        {
          name: "tentorId",
          label: "Pilih Tentor",
          type: "select",
          required: true,
          options: pending.map(function (a) {
            const n = db.attendances.filter(function (x) {
              return x.tentorId === a.tentorId && x.status === "APPROVED";
            }).length;
            return {
              value: a.tentorId,
              label: userName(db, a.tentorId) + " (" + n + " sesi disetujui)",
            };
          }),
        },
      ],
      submitLabel: "Kunci Penugasan",
      onSubmit: function (d) {
        applyResult(Biz.setJobStatus(id, "ASSIGNED", d.tentorId));
      },
    });
  },

  /* ---- tentor: lamar & presensi ---- */
  "apply-job": function (id) {
    const user = currentUser();
    applyResult(Biz.applyJob(id, user.id));
  },

  checkin: function (id) {
    const db = loadDB();
    const j = jobById(db, id);
    const enr = db.enrollments.find(function (e) {
      return e.id === j.studentEnrollmentId;
    });
    const isOnline = (j.mode || "OFFLINE") === "ONLINE";
    const today = new Date().toISOString().slice(0, 10);
    const sched = parseSchedule(j.preferredSchedule);
    const startHM = sched.time || "09:00";
    const startDt = new Date("2000-01-01T" + startHM + ":00");
    const endDt = new Date(startDt.getTime() + 90 * 60000);
    const endHM = endDt.toTimeString().slice(0, 5);
    const durMin = Math.round((endDt - startDt) / 60000);
    openFormModal({
      title: "Check-in Presensi",
      icon: "location_on",
      width: 620,
      bodyExtra:
        (isOnline
          ? ""
          : '<div id="gps-box">' +
            '<div class="quick-actions" style="margin-bottom:10px">' +
            '<button type="button" class="btn btn-sm btn-soft" data-action="gps-get">' +
            ic("gps_fixed") +
            " Ambil Lokasi GPS</button>" +
            '<button type="button" class="btn btn-sm btn-outline" data-action="gps-sim" data-job="' +
            j.id +
            '" data-enr="' +
            enr.id +
            '">' +
            ic("my_location") +
            " Simulasi GPS (lokasi les)</button>" +
            "</div>" +
            '<div id="gps-status"></div>' +
            "</div>") +
        '<div class="alert alert-info">' +
        ic("schedule") +
        '<span>Jam mulai & selesai <strong>terisi otomatis</strong> dari preferensi lowongan ("' +
        j.preferredSchedule +
        '") namun <strong>bisa diubah</strong> dengan format <strong>24 jam</strong> (cth: 14:30). Sesi lintas tengah malam didukung (cth: 22:00–01:00). <strong>Lama pembelajaran</strong> & <strong>jumlah sesi</strong> dihitung otomatis dan bersifat <strong>read-only</strong>.' +
        (isOnline
          ? " Les <strong>online</strong> tidak memerlukan lokasi GPS."
          : "") +
        "</span></div>",
      fields: [
        {
          name: "sessionDate",
          label: "Tanggal Sesi",
          type: "date",
          required: true,
          value: today,
        },
        {
          name: "startTime",
          label: "Jam Mulai",
          type: "time24",
          required: true,
          value: startHM,
        },
        {
          name: "endTime",
          label: "Jam Selesai",
          type: "time24",
          required: true,
          value: endHM,
        },
        {
          name: "durationMinutes",
          label: "Lama Pembelajaran (menit)",
          type: "number",
          value: durMin,
          readonly: true,
          help: "Dihitung otomatis dari jam mulai & selesai — tidak bisa diubah.",
        },
        {
          name: "sessionsCount",
          label: "Jumlah Sesi (90 menit/sesi)",
          type: "number",
          value: Math.round(durMin / 9) / 10,
          readonly: true,
          help: "Dihitung otomatis: lama pembelajaran ÷ 90 menit — dipakai untuk perhitungan fee per sesi.",
        },
        {
          name: "latitudeCheckIn",
          label: "Latitude (GPS)",
          type: "number",
          required: !isOnline,
          step: 0.000001,
        },
        {
          name: "longitudeCheckIn",
          label: "Longitude (GPS)",
          type: "number",
          required: !isOnline,
          step: 0.000001,
        },
        {
          name: "topicTaught",
          label: "Topik Materi",
          required: true,
          placeholder: "cth: Matematika: Turunan & Aplikasinya",
        },
        {
          name: "activityNotes",
          label: "Catatan Kegiatan",
          type: "textarea",
          rows: 2,
          placeholder: "cth: Latihan soal studi kasus",
        },
      ],
      submitLabel: "Kirim Presensi",
      onSubmit: function (d) {
        applyResult(Biz.createAttendance(d, currentUser()));
      },
    });
    setTimeout(function () {
      const fs = document.getElementById("f_startTime");
      const fe = document.getElementById("f_endTime");
      const fd = document.getElementById("f_durationMinutes");
      const fsess = document.getElementById("f_sessionsCount");
      if (!fs || !fe || !fd || !fsess) return;
      const upd = function () {
        const s = time24ToMin(fs.value),
          e = time24ToMin(fe.value);
        fs.classList.toggle("inp-invalid", s === null);
        fe.classList.toggle("inp-invalid", e === null);
        if (s === null || e === null || s === e) {
          fd.value = "";
          fsess.value = "";
          return;
        }
        const d = e > s ? e - s : e - s + 1440;
        fd.value = d;
        fsess.value = Math.round(d / 9) / 10;
      };
      fs.addEventListener("change", upd);
      fe.addEventListener("change", upd);
      upd();
    }, 60);
  },

  "gps-get": function () {
    const setGPS = function (lat, lng) {
      const fLat = document.getElementById("f_latitudeCheckIn");
      const fLng = document.getElementById("f_longitudeCheckIn");
      if (fLat) fLat.value = lat.toFixed(6);
      if (fLng) fLng.value = lng.toFixed(6);
      updateGpsStatus();
    };
    if (!navigator.geolocation) {
      toast("Browser tidak mendukung geolocation.", "error");
      return;
    }
    toast("Meminta lokasi GPS...", "info");
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        setGPS(pos.coords.latitude, pos.coords.longitude);
        toast("Lokasi GPS didapat.", "success");
      },
      function () {
        toast("Izin lokasi ditolak. Gunakan Simulasi GPS.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  },

  "gps-sim": function (id, ds) {
    const db = loadDB();
    const enr = db.enrollments.find(function (e) {
      return e.id === ds.enr;
    });
    if (!enr) return;
    const jitter = 0.0004;
    const fLat = document.getElementById("f_latitudeCheckIn");
    const fLng = document.getElementById("f_longitudeCheckIn");
    if (fLat)
      fLat.value = (enr.latitude + (Math.random() - 0.5) * jitter).toFixed(6);
    if (fLng)
      fLng.value = (enr.longitude + (Math.random() - 0.5) * jitter).toFixed(6);
    updateGpsStatus();
  },

  /* ---- verifikasi presensi ---- */
  "att-detail": function (id) {
    const db = loadDB();
    const a = db.attendances.find(function (x) {
      return x.id === id;
    });
    if (!a) return;
    const j = jobById(db, a.jobPostingId);
    const enr = db.enrollments.find(function (e) {
      return e.id === a.studentEnrollmentId;
    });
    const refLat =
      j && j.latitude !== undefined && j.latitude !== null
        ? j.latitude
        : enr
          ? enr.latitude
          : null;
    const refLng =
      j && j.longitude !== undefined && j.longitude !== null
        ? j.longitude
        : enr
          ? enr.longitude
          : null;
    const dist =
      a.latitudeCheckIn !== null &&
      a.latitudeCheckIn !== undefined &&
      refLat !== null &&
      refLng !== null
        ? haversine(a.latitudeCheckIn, a.longitudeCheckIn, refLat, refLng)
        : null;
    openModal({
      title: "Detail Presensi",
      icon: "fact_check",
      width: 560,
      body: kvHTML([
        ["Tanggal", fmtDate(a.sessionDate)],
        ["Lowongan", j ? j.title : "—"],
        ["Tentor", userName(db, a.tentorId)],
        ["Siswa", studentOf(db, a.studentEnrollmentId)],
        ["Mode Les", badge((j && j.mode) || "OFFLINE")],
        ["Durasi", a.durationMinutes + " menit"],
        ["Jumlah Sesi", (a.sessionsCount || 1) + " sesi (90 menit/sesi)"],
        ["Estimasi Fee Sesi", idr(Biz.sessionFee(a))],
        ["Topik Materi", a.topicTaught],
        ["Catatan", a.activityNotes || "—"],
        [
          "Koordinat Check-in",
          a.latitudeCheckIn !== null && a.latitudeCheckIn !== undefined
            ? a.latitudeCheckIn + ", " + a.longitudeCheckIn
            : "Les online — tanpa GPS",
        ],
        [
          "Jarak ke Rumah Siswa",
          dist !== null
            ? dist +
              " m " +
              (dist > 200
                ? '<span class="gps-pill gps-warn">' +
                  ic("warning") +
                  " di luar radius 200m</span>"
                : '<span class="gps-pill gps-ok">' +
                  ic("verified") +
                  " dalam radius</span>")
            : "—",
        ],
        ["Status", badge(a.status)],
        ["Diverifikasi Oleh", userName(db, a.approvedById) || "—"],
        ["Alasan Tolak", a.rejectionReason || "—"],
      ]),
    });
  },
  "att-approve": function (id) {
    openConfirmModal({
      title: "Setujui Presensi",
      icon: "check",
      message:
        "Setujui presensi ini? Sesi akan masuk klaim gaji tentor & tagihan SPP siswa.",
      confirmLabel: "Setujui",
      onConfirm: function () {
        applyResult(Biz.verifyAttendance(id, true, null, currentUser()));
      },
    });
  },
  "att-reject": function (id) {
    openFormModal({
      title: "Tolak Presensi",
      icon: "close",
      width: 480,
      fields: [
        {
          name: "reason",
          label: "Alasan Penolakan",
          type: "textarea",
          required: true,
          rows: 3,
          placeholder: "cth: Koordinat tidak sesuai lokasi siswa",
        },
      ],
      submitLabel: "Tolak Presensi",
      onSubmit: function (d) {
        applyResult(Biz.verifyAttendance(id, false, d.reason, currentUser()));
      },
    });
  },

  /* ---- payroll ---- */
  "claim-create": function () {
    const db = loadDB();
    const user = currentUser();
    const now = new Date();
    const tentors = db.users.filter(function (u) {
      return u.role === "TENTOR";
    });
    const tentorOpts = tentors
      .map(function (t) {
        const list = Biz.claimableSessions(
          db,
          t.id,
          now.getMonth() + 1,
          now.getFullYear(),
        );
        const total = list.reduce(function (s, a) {
          return s + Biz.sessionFee(a);
        }, 0);
        return {
          value: t.id,
          label:
            t.fullName +
            (list.length
              ? " (" + list.length + " sesi · ± " + idr(total) + ")"
              : " (0 sesi)"),
        };
      })
      .filter(function (o) {
        return o.label.indexOf("(0 sesi)") === -1;
      });
    if (!tentorOpts.length) {
      toast(
        "Belum ada sesi APPROVED yang belum masuk klaim lain pada bulan ini.",
        "error",
      );
      return;
    }
    openFormModal({
      title: "Ajukan Klaim Honor",
      icon: "payments",
      width: 560,
      bodyExtra:
        '<div class="alert alert-info" style="margin-top:-4px">' +
        ic("verified") +
        "<span>Hanya sesi <strong>APPROVED yang belum masuk klaim lain</strong> yang dihitung — tidak ada presensi ganda dalam penggajian.</span></div>",
      fields: [
        {
          name: "tentorId",
          label: "Tentor",
          type: "select",
          required: true,
          options: tentorOpts,
        },
        {
          name: "month",
          label: "Bulan",
          type: "select",
          required: true,
          options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (m) {
            return { value: m, label: monthLabel(m, now.getFullYear()) };
          }),
          value: now.getMonth() + 1,
        },
        {
          name: "year",
          label: "Tahun",
          type: "number",
          required: true,
          min: 2026,
          value: now.getFullYear(),
        },
      ],
      submitLabel: "Ajukan Pencairan",
      onSubmit: function (d) {
        applyResult(
          Biz.createClaim(d.tentorId, Number(d.month), Number(d.year)),
        );
      },
    });
  },

  "claim-detail": function (id) {
    const db = loadDB();
    const c = db.payrollClaims.find(function (x) {
      return x.id === id;
    });
    if (!c) return;
    openModal({
      title: "Detail Klaim",
      icon: "receipt_long",
      width: 540,
      body: kvHTML([
        ["No. Klaim", c.claimNumber],
        ["Tentor", userName(db, c.tentorId)],

        ["Periode", monthLabel(c.monthPeriod, c.yearPeriod)],
        ["Jumlah Sesi", c.totalSessions],
        ["Honor Dasar", idr(c.baseHonorAmount)],
        ["Transport", idr(c.transportAmount)],
        ["Total Klaim", "<strong>" + idr(c.totalClaimAmount) + "</strong>"],
        ["Status", badge(c.status)],
        ["Diproses Oleh", userName(db, c.processedById) || "—"],
        ["Catatan / Bukti", c.paymentProofUrl || "—"],
        ["Dibayar Pada", fmtDate(c.paidAt)],
      ]),
    });
  },
  "claim-pay": function (id) {
    openFormModal({
      title: "Proses Klaim",
      icon: "payments",
      width: 480,
      fields: [
        {
          name: "note",
          label: "Catatan / Bukti Transfer",
          type: "textarea",
          rows: 3,
          placeholder: "cth: Transfer BCA ke 1234567890 a.n. Andi Pratama",
        },
      ],
      submitLabel: "Tandai DICAIRKAN",
      onSubmit: function (d) {
        applyResult(Biz.processClaim(id, "pay", d.note));
      },
    });
  },
  "claim-reject": function (id) {
    openFormModal({
      title: "Tolak Klaim",
      icon: "close",
      width: 480,
      fields: [
        {
          name: "note",
          label: "Alasan Penolakan",
          type: "textarea",
          required: true,
          rows: 3,
        },
      ],
      submitLabel: "Tolak Klaim",
      onSubmit: function (d) {
        applyResult(Biz.processClaim(id, "reject", d.note));
      },
    });
  },

  /* ---- invoice ---- */
  "gen-invoice": function () {
    const db = loadDB();
    const user = currentUser();
    const enr = db.enrollments.filter(function (e) {
      return true;
    });
    if (!enr.length) {
      toast("Belum ada siswa terdaftar.", "error");
      return;
    }
    const now = new Date();
    openFormModal({
      title: "Generate Tagihan SPP",
      icon: "receipt_long",
      width: 540,
      bodyExtra:
        '<div class="alert alert-info" style="margin-top:-4px">' +
        ic("auto_awesome") +
        "<span>Total dihitung otomatis dari sesi APPROVED siswa pada periode terpilih.</span></div>",
      fields: [
        {
          name: "studentId",
          label: "Siswa",
          type: "select",
          required: true,
          options: enr.map(function (e) {
            return {
              value: e.studentId,
              label:
                userName(db, e.studentId) +
                " — " +
                className(db, e.classId) +
                " " +
                subjectName(db, e.subjectId),
            };
          }),
        },
        {
          name: "month",
          label: "Bulan",
          type: "select",
          required: true,
          options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (m) {
            return { value: m, label: monthLabel(m, now.getFullYear()) };
          }),
          value: now.getMonth() + 1,
        },
        {
          name: "year",
          label: "Tahun",
          type: "number",
          required: true,
          min: 2026,
          value: now.getFullYear(),
        },
      ],
      submitLabel: "Terbitkan Tagihan",
      onSubmit: function (d) {
        applyResult(
          Biz.generateInvoice(d.studentId, Number(d.month), Number(d.year)),
        );
      },
    });
  },
  "del-invoice": function (id) {
    openConfirmModal({
      title: "Hapus Tagihan",
      icon: "delete",
      danger: true,
      message:
        "Hapus tagihan ini? Sesi akan dilepas dan bisa ditagihkan ulang.",
      confirmLabel: "Hapus",
      onConfirm: function () {
        applyResult(Biz.deleteInvoice(id));
      },
    });
  },
  "pay-invoice": function (id) {
    openConfirmModal({
      title: "Bayar Tagihan",
      icon: "payments",
      message:
        "Bayar tagihan ini sekarang? (Simulasi pembayaran — di produksi via QRIS/VA Fase 2).",
      confirmLabel: "Ya, Bayar",
      onConfirm: function () {
        applyResult(Biz.payInvoice(id));
      },
    });
  },

  /* ---- rekrutmen tentor ---- */
  "add-candidate": function () {
    openFormModal({
      title: "Daftarkan Kandidat",
      icon: "person_add",
      width: 620,
      fields: candidateFields(loadDB()),
      onSubmit: function (d) {
        applyResult(Biz.saveCandidate(d));
      },
    });
  },
  "edit-candidate": function (id) {
    const db = loadDB();
    const c = db.candidates.find(function (x) {
      return x.id === id;
    });
    openFormModal({
      title: "Ubah Kandidat",
      icon: "edit_note",
      width: 620,
      fields: candidateFields(db, c),
      onSubmit: function (d) {
        applyResult(Biz.saveCandidate(d, id));
      },
    });
  },
  "del-candidate": function (id) {
    openConfirmModal({
      title: "Hapus Kandidat",
      icon: "delete",
      danger: true,
      message: "Yakin ingin menghapus kandidat ini?",
      confirmLabel: "Hapus",
      onConfirm: function () {
        applyResult(Biz.deleteCandidate(id));
      },
    });
  },
  "cand-schedule-test": function (id) {
    openFormModal({
      title: "Jadwalkan Tes",
      icon: "assignment",
      width: 480,
      bodyExtra:
        '<div class="alert alert-info" style="margin-top:-4px">' +
        ic("info") +
        "<span>Tes mengajar / mapel untuk menilai penguasaan materi kandidat.</span></div>",
      fields: [
        {
          name: "testScheduledAt",
          label: "Jadwal Tes",
          type: "datetime-local",
          required: true,
          value: nextDayDateTime(),
        },
      ],
      submitLabel: "Jadwalkan",
      onSubmit: function (d) {
        applyResult(Biz.scheduleTest(id, d.testScheduledAt));
      },
    });
  },
  "cand-record-test": function (id) {
    openFormModal({
      title: "Catat Hasil Tes",
      icon: "fact_check",
      width: 480,
      fields: [
        {
          name: "testScore",
          label: "Skor Tes (0–100)",
          type: "number",
          required: true,
          min: 0,
          max: 100,
          step: 1,
        },
        {
          name: "testNotes",
          label: "Catatan Hasil Tes",
          type: "textarea",
          rows: 3,
          placeholder: "cth: Penguasaan materi baik, perlu latihan pedagogi",
        },
      ],
      submitLabel: "Simpan Hasil",
      onSubmit: function (d) {
        applyResult(Biz.recordTest(id, d.testScore, d.testNotes));
      },
    });
  },
  "cand-schedule-interview": function (id) {
    openFormModal({
      title: "Jadwalkan Wawancara",
      icon: "record_voice_over",
      width: 480,
      fields: [
        {
          name: "interviewScheduledAt",
          label: "Jadwal Wawancara",
          type: "datetime-local",
          required: true,
          value: nextDayDateTime(),
        },
      ],
      submitLabel: "Jadwalkan",
      onSubmit: function (d) {
        applyResult(Biz.scheduleInterview(id, d.interviewScheduledAt));
      },
    });
  },
  "cand-record-interview": function (id) {
    openFormModal({
      title: "Catat Hasil Wawancara",
      icon: "record_voice_over",
      width: 480,
      fields: [
        {
          name: "interviewNotes",
          label: "Hasil Wawancara",
          type: "textarea",
          required: true,
          rows: 3,
          placeholder: "cth: Komunikasi baik, siap ditempatkan",
        },
      ],
      submitLabel: "Simpan Hasil",
      onSubmit: function (d) {
        applyResult(Biz.recordInterview(id, d.interviewNotes));
      },
    });
  },
  "cand-accept": function (id) {
    const db = loadDB();
    const c = db.candidates.find(function (x) {
      return x.id === id;
    });
    if (!c) return;
    openFormModal({
      title: "Terima Kandidat",
      icon: "how_to_reg",
      width: 520,
      bodyExtra:
        '<div class="alert alert-info" style="margin-top:-4px">' +
        ic("auto_awesome") +
        "<span>Kandidat diterima → akun <strong>Tentor</strong> otomatis dibuat dengan email <strong>" +
        c.email +
        "</strong>. Ia bisa langsung login & melihat feed lowongan.</span></div>",
      fields: [
        {
          name: "password",
          label: "Password Awal (kosongkan untuk default)",
          type: "password",
          placeholder: "default: tentor123",
        },
      ],
      submitLabel: "Terima & Buat Akun",
      onSubmit: function (d) {
        applyResult(Biz.acceptCandidate(id, d));
      },
    });
  },
  "cand-reject": function (id) {
    openFormModal({
      title: "Tolak Kandidat",
      icon: "block",
      width: 480,
      fields: [
        {
          name: "reason",
          label: "Alasan Penolakan",
          type: "textarea",
          required: true,
          rows: 3,
          placeholder: "cth: Skor tes di bawah standar",
        },
      ],
      submitLabel: "Tolak Kandidat",
      onSubmit: function (d) {
        applyResult(Biz.rejectCandidate(id, d.reason));
      },
    });
  },
  "cand-detail": function (id) {
    const db = loadDB();
    const c = db.candidates.find(function (x) {
      return x.id === id;
    });
    if (!c) return;
    const u = db.users.find(function (x) {
      return x.id === c.tentorUserId;
    });
    openModal({
      title: "Detail Kandidat",
      icon: "badge",
      width: 560,
      body: kvHTML([
        ["Nama", c.fullName],
        ["Email / Telepon", c.email + " · " + (c.phone || "—")],
        ["Pendidikan", c.education || "—"],
        ["Mapel yang Bisa Diajar", subjectNames(db, c.subjectIds) || "—"],
        ["Jenjang yang Bisa Diajar", levelNames(db, c.levelIds) || "—"],
        ["Pengalaman", c.experienceYears + " tahun"],
        ["Sumber", c.source || "—"],
        ["Tanggal Daftar", fmtDate(c.registeredAt)],
        ["Jadwal Tes", fmtDateTime(c.testScheduledAt)],
        [
          "Skor Tes",
          c.testScore !== null && c.testScore !== undefined
            ? c.testScore + "/100"
            : "—",
        ],
        ["Catatan Tes", c.testNotes || "—"],
        ["Jadwal Wawancara", fmtDateTime(c.interviewScheduledAt)],
        ["Hasil Wawancara", c.interviewNotes || "—"],
        ["Tahap", badge(c.status)],
        [
          "Akun Tentor",
          c.tentorUserId
            ? userName(db, c.tentorUserId) + " (" + (u || {}).email + ")"
            : "—",
        ],
        ["Alasan Tolak", c.rejectionReason || "—"],
      ]),
    });
  },
};

/* ============================================================
   SHELL & RENDER
   ============================================================ */
function roleBadge(role) {
  const map = {
    SUPER_ADMIN: ["admin_panel_settings", "tone-violet"],
    TENTOR: ["school", "tone-emerald"],
    STUDENT: ["school", "tone-amber"],
    WALI_MURID: ["family_restroom", "tone-amber"],
  };
  const e = map[role] || ["person", "tone-sky"];
  return (
    '<span class="badge ' +
    e[1] +
    '">' +
    ic(e[0]) +
    " " +
    ROLE_LABEL[role] +
    "</span>"
  );
}

function notifBellHTML(user) {
  const db = loadDB();
  const unread = Biz.unreadCount(db, user.id);
  return (
    '<button class="top-btn" data-action="notif-open" title="Notifikasi" aria-label="Notifikasi">' +
    ic("notifications") +
    (unread
      ? '<span class="notif-dot">' + (unread > 9 ? "9+" : unread) + "</span>"
      : "") +
    "</button>"
  );
}

function openNotifModal() {
  const user = currentUser();
  if (!user) return;
  const db = loadDB();
  const items = Biz.userNotifs(db, user.id);
  const unread = Biz.unreadCount(db, user.id);
  const list = items.length
    ? items
        .map(function (n) {
          return (
            '<button class="notif-item ' +
            (n.read ? "read" : "unread") +
            '" data-action="notif-read" data-id="' +
            n.id +
            '">' +
            '<span class="n-ico">' +
            ic(n.icon || "notifications") +
            "</span>" +
            '<span style="flex:1;min-width:0"><span class="n-title">' +
            n.title +
            "</span>" +
            '<div class="n-msg">' +
            n.message +
            "</div>" +
            '<div class="n-time">' +
            ic("schedule") +
            " " +
            timeAgo(n.createdAt) +
            "</div></span>" +
            '<span class="n-dot-rd"></span>' +
            "</button>"
          );
        })
        .join("")
    : '<div class="notif-empty">' +
      ic("notifications_off") +
      "Belum ada notifikasi.</div>";
  openModal({
    title: "Notifikasi",
    icon: "notifications",
    width: 460,
    body: '<div class="notif-list">' + list + "</div>",
    footer:
      '<button class="btn btn-outline" data-modal-cancel>' +
      ic("close") +
      " Tutup</button>" +
      (unread
        ? '<button class="btn btn-soft" data-action="notif-read-all">' +
          ic("done_all") +
          " Tandai Semua Dibaca (" +
          unread +
          ")</button>"
        : ""),
  });
}

function updateMenuIcon() {
  const btn = document.querySelector(".topbar .burger");
  if (!btn) return;
  const open = document.querySelector(".sidebar").classList.contains("open");
  btn.innerHTML = ic(open ? "close" : "menu");
  btn.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
}

function refreshNotifBadge(user) {
  if (!user) return;
  const db = loadDB();
  const unread = Biz.unreadCount(db, user.id);
  const btn = document.querySelector('.top-btn[data-action="notif-open"]');
  if (!btn) return;
  const old = btn.querySelector(".notif-dot");
  if (old) old.remove();
  if (unread) {
    const dot = document.createElement("span");
    dot.className = "notif-dot";
    dot.textContent = unread > 9 ? "9+" : unread;
    btn.appendChild(dot);
  }
}

function renderApp() {
  const user = currentUser();
  if (!user) {
    location.hash = "#/login";
    return;
  }
  const nav = NAV[user.role];
  if (
    !nav.some(function (n) {
      return n.key === state.view;
    })
  )
    state.view = "dashboard";
  var navHtml = "";
  var lastGroup = "";
  nav.forEach(function (n) {
    if (n.group && n.group !== lastGroup) {
      lastGroup = n.group;
      navHtml += '<div class="nav-group-label">' + n.group + "</div>";
    }
    navHtml +=
      '<button class="nav-item' +
      (n.key === state.view ? " active" : "") +
      '" data-action="nav" data-view="' +
      n.key +
      '">' +
      ic(n.icon) +
      " " +
      n.label +
      "</button>";
  });
  var navItems = navHtml;
  const initials = user.fullName
    .split(" ")
    .map(function (w) {
      return w[0];
    })
    .slice(0, 2)
    .join("");
  document.getElementById("app").innerHTML =
    '<div class="app">' +
    '<aside class="sidebar">' +
    '<div class="side-brand"><div class="side-brand-top"><img class="logo" src="logo-sentraedu.jpg" alt="SentraEdu" style="width:36px;height:36px;border-radius:11px;object-fit:cover"><span class="brand-name"><span style="color:var(--primary)">Sentra</span><span style="color:var(--accent)">Edu</span></span></div>' +
    '<div class="side-role">' +
    roleBadge(user.role) +
    "</div></div>" +
    '<nav class="side-nav"><div class="nav-label">Menu</div>' +
    navItems +
    "</nav>" +
    '<div class="side-foot">' +
    '<div class="side-user"><div class="avatar">' +
    initials +
    "</div><div>" +
    '<div class="u-name">' +
    user.fullName +
    '</div><div class="u-mail">' +
    user.email +
    "</div></div></div>" +
    '<button class="btn-logout" data-action="logout">' +
    ic("logout") +
    " Keluar</button>" +
    "</div>" +
    "</aside>" +
    '<div class="main">' +
    '<header class="topbar">' +
    '<div><div class="crumb">' +
    ROLE_LABEL[user.role] +
    "</div><h2>" +
    (
      nav.find(function (n) {
        return n.key === state.view;
      }) || {}
    ).label +
    "</h2></div>" +
    '<div class="spacer"></div>' +
    notifBellHTML(user) +
    themeBtnHTML() +
    '<button class="burger" data-action="menu-toggle" aria-label="Buka menu">' +
    ic("menu") +
    "</button>" +
    "</header>" +
    '<main class="content" id="view-root"></main>' +
    "</div>" +
    '<div class="backdrop" data-action="menu-toggle"></div>' +
    "</div>";
  renderContent(user);
}

function renderContent(user) {
  const db = loadDB();
  const root = document.getElementById("view-root");
  if (!root) return;
  if (state.view === "profile") {
    root.innerHTML = renderProfileView(user, db);
    return;
  }
  const views = {
    SUPER_ADMIN: AdminViews,
    TENTOR: TentorViews,
    STUDENT: StudentViews,
    WALI_MURID: WaliViews,
  }[user.role];
  const fn = views[state.view] || views.dashboard;
  root.innerHTML = fn(user, db);
}

/* GPS status di modal check-in */
function updateGpsStatus() {
  const box = document.getElementById("gps-status");
  if (!box) return;
  const fLat = document.getElementById("f_latitudeCheckIn");
  const fLng = document.getElementById("f_longitudeCheckIn");
  if (!fLat || !fLng || fLat.value === "" || fLng.value === "") {
    box.innerHTML = "";
    return;
  }
  const btn = document.querySelector('[data-action="gps-sim"]');
  const jobId = btn && btn.dataset ? btn.dataset.job : null;
  const job = jobId
    ? loadDB().jobs.find(function (x) {
        return x.id === jobId;
      })
    : null;
  const enrId = btn && btn.dataset ? btn.dataset.enr : null;
  const enr = enrId
    ? loadDB().enrollments.find(function (e) {
        return e.id === enrId;
      })
    : null;
  const refLat =
    job && job.latitude !== undefined && job.latitude !== null
      ? job.latitude
      : enr
        ? enr.latitude
        : null;
  const refLng =
    job && job.longitude !== undefined && job.longitude !== null
      ? job.longitude
      : enr
        ? enr.longitude
        : null;
  if (refLat === null || refLng === null) {
    box.innerHTML = "";
    return;
  }
  const dist = haversine(
    Number(fLat.value),
    Number(fLng.value),
    refLat,
    refLng,
  );
  box.innerHTML =
    dist <= 200
      ? '<span class="gps-pill gps-ok">' +
        ic("verified") +
        " Dalam radius valid (" +
        dist +
        " m dari lokasi les)</span>"
      : '<span class="gps-pill gps-warn">' +
        ic("warning") +
        " Di luar radius 200m (" +
        dist +
        " m) — akan ditandai untuk verifikasi manual</span>";
}

/* ============================================================
   LOGIN
   ============================================================ */
function doLogin(email, password) {
  const db = loadDB();
  const user = db.users.find(function (u) {
    return (
      u.email.toLowerCase() === String(email).trim().toLowerCase() &&
      u.password === String(password)
    );
  });
  if (!user) return null;
  setSession(user.id);
  return user;
}

const PERSONAS = [
  {
    role: "SUPER_ADMIN",
    icon: "admin_panel_settings",
    label: "Admin",
    desc: "Data master, lowongan, presensi, rekrutmen",
    email: "admin@sentraedu.id",
  },
  {
    role: "TENTOR",
    icon: "school",
    label: "Tentor",
    desc: "Lamar les, presensi GPS, klaim honor",
    email: "tentor.andi@sentraedu.id",
  },
  {
    role: "STUDENT",
    icon: "school",
    label: "Siswa",
    desc: "Lihat les aktif, presensi, laporan",
    email: "raka@sentraedu.id",
  },
  {
    role: "WALI_MURID",
    icon: "family_restroom",
    label: "Wali Murid",
    desc: "Pantau les anak & bayar SPP",
    email: "wali.raka@sentraedu.id",
  },
];

function renderLogin() {
  document.getElementById("app").innerHTML =
    '<div class="auth-page" style="display:flex;min-height:100vh;align-items:center;justify-content:center;padding:2rem 1.5rem">' +
    '<div class="auth-card" style="width:100%;max-width:460px;background:var(--surface);border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow-md);padding:2.2rem">' +
    '<div style="display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.15rem;margin-bottom:16px">' +
    '<img class="logo" src="logo-sentraedu.jpg" alt="SentraEdu" style="width:36px;height:36px;border-radius:11px;object-fit:cover">' +
    '<span class="brand-name"><span style="color:var(--primary)">Sentra</span><span style="color:var(--accent)">Edu</span></span>' +
    "</div>" +
    '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">' +
    '<h1 style="font-size:1.4rem;display:flex;align-items:center;gap:10px">' +
    ic("lock", "filled") +
    " Masuk</h1>" +
    themeBtnHTML() +
    "</div>" +
    '<p style="color:var(--muted-fg);font-size:.9rem;margin:6px 0 18px">Masuk menggunakan akun Anda, atau gunakan tombol login cepat sesuai peran.</p>' +
    '<form id="login-form" novalidate>' +
    '<div class="field"><label for="login-email">Email</label><div class="input-wrap">' +
    '<input type="email" id="login-email" placeholder="nama@sentraedu.id" autocomplete="username" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:10px;font-size:.92rem" />' +
    "</div></div>" +
    '<div class="field"><label for="login-password">Password</label><div class="input-wrap">' +
    '<input type="password" id="login-password" placeholder="••••••••" autocomplete="current-password" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:10px;font-size:.92rem" />' +
    "</div></div>" +
    '<div class="form-error" id="login-error" style="display:none;background:var(--danger-soft);color:var(--danger);border-radius:10px;padding:9px 12px;font-size:.85rem;margin-bottom:12px"></div>' +
    '<button type="submit" class="btn btn-primary" style="width:100%;padding:11px">' +
    ic("login") +
    " Masuk</button>" +
    "</form>" +
    '<div style="display:flex;align-items:center;gap:12px;margin:20px 0 14px;color:var(--muted-fg);font-size:.78rem">' +
    '<span style="flex:1;height:1px;background:var(--border)"></span>atau login cepat sebagai<span style="flex:1;height:1px;background:var(--border)"></span>' +
    "</div>" +
    '<div class="persona-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
    PERSONAS.map(function (p) {
      return (
        '<button type="button" class="persona-btn" data-email="' +
        p.email +
        "\" style=\"display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:12px;transition:all .12s\" onmouseover=\"this.style.borderColor='var(--primary-soft-2)';this.style.background='var(--primary-soft)'\" onmouseout=\"this.style.borderColor='';this.style.background=''\">" +
        '<span style="color:var(--primary);font-size:22px">' +
        ic(p.icon, "filled") +
        "</span>" +
        '<span style="font-weight:700;font-size:.88rem">' +
        p.label +
        "</span>" +
        '<span style="color:var(--muted-fg);font-size:.72rem">' +
        p.desc +
        "</span>" +
        "</button>"
      );
    }).join("") +
    "</div>" +
    "</div>" +
    "</div>";

  const form = document.getElementById("login-form");
  const errBox = document.getElementById("login-error");
  function showError(msg) {
    errBox.textContent = msg;
    errBox.style.display = "block";
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const pw = document.getElementById("login-password").value;
    if (!email || !pw) {
      showError("Email dan password wajib diisi.");
      return;
    }
    const user = doLogin(email, pw);
    if (!user) {
      showError("Email atau password salah.");
      return;
    }
    state.view = "dashboard";
    location.hash = "#/app";
  });
  document.querySelectorAll(".persona-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const db = loadDB();
      const u = db.users.find(function (x) {
        return x.email === btn.dataset.email;
      });
      if (u) {
        doLogin(u.email, u.password);
        state.view = "dashboard";
        location.hash = "#/app";
      }
    });
  });
}

/* ============================================================
   ROUTER & GLOBAL EVENT DELEGATION
   ============================================================ */
function route() {
  const hash = location.hash || "#/login";
  if (hash.indexOf("#/app") === 0) {
    renderApp();
  } else {
    renderLogin();
  }
}

document.addEventListener("click", function (e) {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const fn = Actions[el.dataset.action];
  if (fn) fn(el.dataset.id, el.dataset);
});

/* Filter interaktif: ketik/pilih -> simpan state -> re-render (fokus dijaga) */
document.addEventListener("input", function (e) {
  const el = e.target.closest("[data-filter]");
  if (!el || el.tagName === "SELECT") return;
  const view = el.dataset.view,
    key = el.dataset.filter;
  filters[view] = filters[view] || {};
  filters[view][key] = el.value;
  pg[view] = 1;
  const caret = el.selectionStart || 0;
  reRender();
  const neu = document.querySelector(
    '[data-filter="' + key + '"][data-view="' + view + '"]',
  );
  if (neu) {
    neu.focus();
    try {
      neu.setSelectionRange(caret, caret);
    } catch (e2) {}
  }
});
document.addEventListener("change", function (e) {
  const el = e.target.closest("select[data-filter]");
  if (el) {
    const view = el.dataset.view,
      key = el.dataset.filter;
    filters[view] = filters[view] || {};
    filters[view][key] = el.value;
    pg[view] = 1;
    reRender();
    return;
  }
  // ganti siswa di form lowongan -> isi otomatis koordinat GPS lokasi les
  if (
    e.target &&
    (e.target.id === "f_studentEnrollmentId" ||
      e.target.name === "studentEnrollmentIds") &&
    Actions["job-gps-student"]
  ) {
    Actions["job-gps-student"]();
  }
});

window.addEventListener("hashchange", route);
applyTheme();
route();
