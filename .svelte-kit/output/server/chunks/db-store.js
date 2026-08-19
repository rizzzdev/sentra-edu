import { w as writable, g as get } from "./index2.js";
const defaultTimestamp = "2026-08-17T08:00:00.000Z";
function createInitialDatabaseSeed() {
  return {
    version: 13,
    seededAt: "2026-08-17",
    educationLevels: [
      {
        id: "lv-tk",
        levelName: "TK",
        description: "Calistung & kecerdasan dasar",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "lv-sd",
        levelName: "SD",
        description: "Pendampingan belajar SD",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "lv-smp",
        levelName: "SMP",
        description: "Persiapan ujian & masuk SMA",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "lv-sma",
        levelName: "SMA",
        description: "Persiapan UTBK / PTN",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "lv-khs",
        levelName: "ALUMNI/KHUSUS",
        description: "Mahasiswa & kursus khusus",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],
    classes: [
      {
        id: "cl-tk-a",
        className: "TK A",
        educationLevelId: "lv-tk",
        baseRatePer90Min: 1e5,
        description: "Kelompok A (usia 4-5 tahun)",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "cl-tk-b",
        className: "TK B",
        educationLevelId: "lv-tk",
        baseRatePer90Min: 1e5,
        description: "Kelompok B (usia 5-6 tahun)",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "cl-sd-1",
        className: "Kelas 1 SD",
        educationLevelId: "lv-sd",
        baseRatePer90Min: 11e4,
        description: "",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "cl-sd-2",
        className: "Kelas 2 SD",
        educationLevelId: "lv-sd",
        baseRatePer90Min: 11e4,
        description: "",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "cl-sd-3",
        className: "Kelas 3 SD",
        educationLevelId: "lv-sd",
        baseRatePer90Min: 11e4,
        description: "",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "cl-sd-4",
        className: "Kelas 4 SD",
        educationLevelId: "lv-sd",
        baseRatePer90Min: 11e4,
        description: "",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "cl-sd-5",
        className: "Kelas 5 SD",
        educationLevelId: "lv-sd",
        baseRatePer90Min: 11e4,
        description: "",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "cl-sd-6",
        className: "Kelas 6 SD",
        educationLevelId: "lv-sd",
        baseRatePer90Min: 11e4,
        description: "Persiapan ujian akhir SD",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "cl-smp-7",
        className: "Kelas 7 SMP",
        educationLevelId: "lv-smp",
        baseRatePer90Min: 125e3,
        description: "",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "cl-smp-8",
        className: "Kelas 8 SMP",
        educationLevelId: "lv-smp",
        baseRatePer90Min: 125e3,
        description: "",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "cl-smp-9",
        className: "Kelas 9 SMP",
        educationLevelId: "lv-smp",
        baseRatePer90Min: 125e3,
        description: "Persiapan ujian & masuk SMA",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "cl-sma-10",
        className: "Kelas 10 SMA",
        educationLevelId: "lv-sma",
        baseRatePer90Min: 14e4,
        description: "",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "cl-sma-11",
        className: "Kelas 11 SMA",
        educationLevelId: "lv-sma",
        baseRatePer90Min: 145e3,
        description: "",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "cl-sma-12",
        className: "Kelas 12 SMA",
        educationLevelId: "lv-sma",
        baseRatePer90Min: 15e4,
        description: "Persiapan UTBK / ujian akhir",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "cl-umum",
        className: "Kelas Umum",
        educationLevelId: "lv-khs",
        baseRatePer90Min: 175e3,
        description: "Kursus khusus / alumni",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],
    subjects: [
      {
        id: "sj-mtk",
        name: "Matematika",
        description: "Matematika dasar hingga lanjutan",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "sj-ing",
        name: "Bahasa Inggris",
        description: "Grammar, speaking & TOEFL",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "sj-fis",
        name: "Fisika",
        description: "Fisika SMP / SMA",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "sj-kim",
        name: "Kimia",
        description: "Kimia SMA",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "sj-bio",
        name: "Biologi",
        description: "Biologi SMA",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "sj-bindo",
        name: "Bahasa Indonesia",
        description: "Bahasa Indonesia & sastra",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],
    packages: [
      {
        id: "pkg-bulanan-private",
        name: "Paket Bulanan Private",
        mode: "PRIVATE",
        period: "BULANAN",
        price: 16e5,
        sessionsPerPeriod: 8,
        maxStudents: 1,
        tentorFee: 15e4,
        description: "Les privat 1 guru 1 siswa, 8 pertemuan per bulan (90 menit/sesi).",
        active: true,
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "pkg-bulanan-kelompok",
        name: "Paket Bulanan Kelompok",
        mode: "KELOMPOK",
        period: "BULANAN",
        price: 9e5,
        sessionsPerPeriod: 8,
        maxStudents: 5,
        tentorFee: 6e4,
        description: "Les kelompok kecil (maks 5 siswa), 8 pertemuan per bulan (90 menit/sesi).",
        active: true,
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "pkg-harian-private",
        name: "Paket Harian Private",
        mode: "PRIVATE",
        period: "HARIAN",
        price: 175e3,
        sessionsPerPeriod: 1,
        maxStudents: 1,
        tentorFee: 125e3,
        description: "Les privat sekali pertemuan (90 menit) — bayar per sesi.",
        active: true,
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "pkg-harian-kelompok",
        name: "Paket Harian Kelompok",
        mode: "KELOMPOK",
        period: "HARIAN",
        price: 1e5,
        sessionsPerPeriod: 1,
        maxStudents: 5,
        tentorFee: 6e4,
        description: "Les kelompok sekali pertemuan (90 menit) — bayar per sesi per siswa.",
        active: true,
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "pkg-intensif-bulanan",
        name: "Paket Intensif UTBK Private (Bulanan)",
        mode: "PRIVATE",
        period: "BULANAN",
        price: 24e5,
        sessionsPerPeriod: 12,
        maxStudents: 1,
        tentorFee: 18e4,
        description: "Intensif persiapan UTBK, 12 pertemuan per bulan (90 menit/sesi).",
        active: true,
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "pkg-intensif-harian",
        name: "Paket Intensif Harian Private (180 menit)",
        mode: "PRIVATE",
        period: "HARIAN",
        price: 35e4,
        sessionsPerPeriod: 1,
        maxStudents: 1,
        tentorFee: 25e4,
        description: "Sesi intensif 180 menit sekali pertemuan — bayar per sesi.",
        active: true,
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
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
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "u-tentor-andi",
        email: "tentor.andi@sentraedu.id",
        password: "tentor123",
        fullName: "Andi Pratama",
        phone: "0812-0000-0004",
        role: "TENTOR",
        education: "S1 Fisika UI",
        experienceYears: 3,
        subjectIds: ["sj-fis", "sj-mtk"],
        levelIds: ["lv-sma", "lv-smp"],
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "u-tentor-dewi",
        email: "tentor.dewi@sentraedu.id",
        password: "tentor123",
        fullName: "Dewi Lestari",
        phone: "0812-0000-0005",
        role: "TENTOR",
        education: "S1 Biologi UGM",
        experienceYears: 4,
        subjectIds: ["sj-bio", "sj-kim"],
        levelIds: ["lv-sma"],
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "u-tentor-bagas",
        email: "tentor.bagas@sentraedu.id",
        password: "tentor123",
        fullName: "Bagas Saputra",
        phone: "0812-0000-0012",
        role: "TENTOR",
        education: "S1 Matematika ITB",
        experienceYears: 2,
        subjectIds: ["sj-mtk"],
        levelIds: ["lv-smp", "lv-sd"],
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "u-student-raka",
        email: "raka@sentraedu.id",
        password: "siswa123",
        fullName: "Raka Pratama",
        phone: "0812-0000-0006",
        role: "STUDENT",
        school: "SMA Negeri 1 Jakarta",
        address: "Jl. Merdeka No. 45, Jakarta Pusat",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "u-wali-raka",
        email: "wali.raka@sentraedu.id",
        password: "wali123",
        fullName: "Bambang Pratama (Wali Raka)",
        phone: "0812-0000-0011",
        role: "WALI_MURID",
        address: "Jl. Merdeka No. 45, Jakarta Pusat",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "u-student-ayu",
        email: "ayu@sentraedu.id",
        password: "siswa123",
        fullName: "Ayu Lestari",
        phone: "0812-0000-0007",
        role: "STUDENT",
        school: "SMP Negeri 3 Bandung",
        address: "Jl. Dago No. 12, Bandung",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "u-wali-ayu",
        email: "wali.ayu@sentraedu.id",
        password: "wali123",
        fullName: "Siti Lestari (Wali Ayu)",
        phone: "0812-0000-0013",
        role: "WALI_MURID",
        address: "Jl. Dago No. 12, Bandung",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],
    enrollments: [
      {
        id: "enr-001",
        studentId: "u-student-raka",
        subjectId: "sj-mtk",
        classId: "cl-sma-12",
        packageId: "pkg-bulanan-private",
        tentorId: "u-tentor-andi",
        scheduleDay: "Senin, Rabu",
        scheduleTime: "16:00 - 17:30",
        status: "ACTIVE",
        address: "Jl. Merdeka No. 45, Jakarta Pusat",
        latitude: -6.175392,
        longitude: 106.827153,
        waliUserId: "u-wali-raka",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "enr-002",
        studentId: "u-student-ayu",
        subjectId: "sj-fis",
        classId: "cl-smp-9",
        packageId: "pkg-bulanan-private",
        tentorId: "u-tentor-andi",
        scheduleDay: "Selasa, Kamis",
        scheduleTime: "15:30 - 17:00",
        status: "ACTIVE",
        address: "Jl. Dago No. 12, Bandung",
        latitude: -6.917464,
        longitude: 107.619123,
        waliUserId: "u-wali-ayu",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],
    jobs: [
      {
        id: "job-101",
        title: "Les Privat Matematika SMA Kelas 12 (Persiapan UTBK)",
        classId: "cl-sma-12",
        subjectId: "sj-mtk",
        jobType: "REGULAR",
        jobMode: "OFFLINE",
        tentorFee: 15e4,
        sessionDurationMinutes: 90,
        scheduleDays: ["Senin", "Rabu"],
        scheduleTime: "16:00",
        studentCount: 1,
        location: "Kebayoran Baru, Jakarta Selatan",
        latitude: -6.2415,
        longitude: 106.7995,
        status: "AVAILABLE",
        assignedTentorId: null,
        studentId: "u-student-raka",
        enrollmentId: "enr-001",
        notes: "Siswa butuh pendalaman materi TPS Kuantitatif dan Matematika Lanjut.",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "job-102",
        title: "Guru Pengganti Fisika SMA Kelas 11 (2 Sesi)",
        classId: "cl-sma-11",
        subjectId: "sj-fis",
        jobType: "TEMPORARY_REPLACEMENT",
        jobMode: "OFFLINE",
        tentorFee: 14e4,
        sessionDurationMinutes: 90,
        scheduleDays: ["Jumat"],
        scheduleTime: "15:00",
        studentCount: 1,
        location: "Menteng, Jakarta Pusat",
        latitude: -6.1956,
        longitude: 106.8378,
        status: "AVAILABLE",
        assignedTentorId: null,
        studentId: null,
        enrollmentId: null,
        notes: "Menggantikan tentor tetap yang sedang cuti.",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "job-103",
        title: "Les Kelompok Biologi SMA Kelas 10 (3 Siswa)",
        classId: "cl-sma-10",
        subjectId: "sj-bio",
        jobType: "REGULAR",
        jobMode: "ONLINE",
        tentorFee: 18e4,
        sessionDurationMinutes: 90,
        scheduleDays: ["Sabtu"],
        scheduleTime: "09:00",
        studentCount: 3,
        location: "Online via Google Meet",
        latitude: null,
        longitude: null,
        status: "ASSIGNED",
        assignedTentorId: "u-tentor-dewi",
        studentId: null,
        enrollmentId: null,
        notes: "Fokus materi Keanekaragaman Hayati dan Ekosistem.",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],
    applications: [
      {
        id: "app-001",
        jobId: "job-101",
        tentorId: "u-tentor-bagas",
        status: "PENDING",
        appliedAt: "2026-08-18T10:00:00.000Z",
        notes: "Saya sangat berpengalaman dalam membimbing UTBK Matematika selama 2 tahun terakhir.",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],
    attendances: [
      {
        id: "att-001",
        enrollmentId: "enr-001",
        tentorId: "u-tentor-andi",
        sessionDate: "2026-08-16",
        startTime: "2026-08-16T16:00:00.000Z",
        endTime: "2026-08-16T17:30:00.000Z",
        topic: "Diferensial dan Turunan Fungsi Aljabar",
        studentNotes: "Raka sudah memahami konsep dasar turunan dan mampu mengerjakan 8 soal latihan mandiri dengan benar.",
        status: "APPROVED",
        latitudeCheckIn: -6.175401,
        longitudeCheckIn: 106.82716,
        isRadiusValid: true,
        proofPhotoUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80",
        studentConfirmed: true,
        studentRating: 5,
        studentFeedback: "Penjelasan kak Andi sangat jelas dan mudah dipahami!",
        reviewNotes: "Validasi GPS radius 12m, foto presensi lengkap.",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "att-002",
        enrollmentId: "enr-001",
        tentorId: "u-tentor-andi",
        sessionDate: "2026-08-18",
        startTime: "2026-08-18T16:00:00.000Z",
        endTime: "2026-08-18T17:30:00.000Z",
        topic: "Aplikasi Turunan: Garis Singgung & Nilai Ekstrim",
        studentNotes: "Siswa mempelajari penentuan titik stasioner dan maksimum/minimum fungsi.",
        status: "SUBMITTED",
        latitudeCheckIn: -6.17539,
        longitudeCheckIn: 106.827155,
        isRadiusValid: true,
        proofPhotoUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&q=80",
        studentConfirmed: true,
        studentRating: 5,
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],
    invoices: [
      {
        id: "inv-001",
        enrollmentId: "enr-001",
        invoiceNumber: "INV/2026/08/001",
        amount: 16e5,
        dueDate: "2026-08-25",
        status: "PAID",
        paidAt: "2026-08-10T14:30:00.000Z",
        paymentProofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80",
        periodMonth: 8,
        periodYear: 2026,
        notes: "Pembayaran SPP Paket Bulanan Private Agustus 2026",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "inv-002",
        enrollmentId: "enr-002",
        invoiceNumber: "INV/2026/08/002",
        amount: 16e5,
        dueDate: "2026-08-25",
        status: "UNPAID",
        paidAt: null,
        paymentProofUrl: null,
        periodMonth: 8,
        periodYear: 2026,
        notes: "Tagihan SPP Belajar Fisika SMP Bulan Agustus 2026",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],
    payrollClaims: [
      {
        id: "pay-001",
        tentorId: "u-tentor-andi",
        claimNumber: "PAY/2026/08/001",
        periodStart: "2026-08-01",
        periodEnd: "2026-08-15",
        totalAmount: 3e5,
        attendanceIds: ["att-001"],
        status: "PAID",
        paidAt: "2026-08-17T11:00:00.000Z",
        transferProofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],
    candidates: [
      {
        id: "cand-001",
        fullName: "Fajar Nugraha",
        email: "fajar.nugraha@gmail.com",
        phone: "0813-9988-7766",
        education: "S1 Kimia UNPAD",
        experienceYears: 2,
        subjectIds: ["sj-kim", "sj-fis"],
        levelIds: ["lv-sma", "lv-smp"],
        cvUrl: "https://sentraedu.id/cv/cand-001.pdf",
        status: "INTERVIEW",
        notes: "IPK 3.82, pengalaman mengajar olimpiade kimia tingkat kabupaten.",
        interviewDate: "2026-08-22T10:00:00.000Z",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: "cand-002",
        fullName: "Nadia Rahmawati",
        email: "nadia.rahma@gmail.com",
        phone: "0812-4455-6677",
        education: "S1 Pendidikan Bahasa Inggris UPI",
        experienceYears: 3,
        subjectIds: ["sj-ing"],
        levelIds: ["lv-sd", "lv-smp", "lv-sma"],
        cvUrl: "https://sentraedu.id/cv/cand-002.pdf",
        status: "MICROTEACHING",
        notes: "Skor TOEFL 610, interaktif dan menyenangkan dalam mengajar anak-anak.",
        interviewDate: "2026-08-20T13:30:00.000Z",
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],
    notifications: [
      {
        id: "notif-001",
        userId: "u-admin",
        title: "Presensi Baru Perlu Verifikasi",
        message: "Tentor Andi Pratama telah menyelesaikan sesi les Diferensial dan menunggu verifikasi.",
        icon: "fact_check",
        read: false,
        createdAt: "2026-08-18T17:35:00.000Z"
      },
      {
        id: "notif-002",
        userId: "u-tentor-andi",
        title: "Honor Sesi Disetujui",
        message: "Klaim honor sebesar Rp 300.000 telah ditransfer oleh admin.",
        icon: "payments",
        read: true,
        createdAt: "2026-08-17T11:05:00.000Z"
      }
    ]
  };
}
let sequenceCounter = 100;
function generateEntityId(prefix = "id") {
  sequenceCounter += 1;
  const timestampPortion = Date.now().toString(36);
  const randomPortion = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestampPortion}-${randomPortion}-${sequenceCounter}`;
}
const DATABASE_STORAGE_KEY = "bms_db_v13";
function loadDatabaseFromStorage() {
  if (typeof window === "undefined") {
    return createInitialDatabaseSeed();
  }
  try {
    const rawData = localStorage.getItem(DATABASE_STORAGE_KEY);
    if (!rawData) {
      const initialSeed = createInitialDatabaseSeed();
      localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify(initialSeed));
      return initialSeed;
    }
    const parsedData = JSON.parse(rawData);
    if (!parsedData.users || !parsedData.jobs) {
      const initialSeed = createInitialDatabaseSeed();
      localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify(initialSeed));
      return initialSeed;
    }
    return parsedData;
  } catch {
    const initialSeed = createInitialDatabaseSeed();
    localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify(initialSeed));
    return initialSeed;
  }
}
function createDatabaseStore() {
  const store = writable(loadDatabaseFromStorage());
  function persistDatabase(updatedDatabase) {
    if (typeof window !== "undefined") {
      localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify(updatedDatabase));
    }
    store.set(updatedDatabase);
  }
  return {
    subscribe: store.subscribe,
    getSnapshot: () => get(store),
    resetToFactoryDefaults: () => {
      const freshSeed = createInitialDatabaseSeed();
      persistDatabase(freshSeed);
      return {
        error: false,
        statusCode: 200,
        message: "Basis data berhasil direset ke pengaturan awal pabrik.",
        data: freshSeed
      };
    },
    importDatabaseJson: (jsonString) => {
      try {
        const parsedDatabase = JSON.parse(jsonString);
        if (!parsedDatabase.users || !parsedDatabase.jobs) {
          return {
            error: true,
            statusCode: 400,
            message: "Format data cadangan JSON tidak valid.",
            data: null
          };
        }
        persistDatabase(parsedDatabase);
        return {
          error: false,
          statusCode: 200,
          message: "Cadangan data berhasil dipulihkan.",
          data: parsedDatabase
        };
      } catch {
        return {
          error: true,
          statusCode: 400,
          message: "Gagal mengurai file JSON cadangan.",
          data: null
        };
      }
    },
    // ----------------------------------------------------
    // NOTIFICATIONS
    // ----------------------------------------------------
    pushNotification: (targetUserId, notificationTitle, notificationMessage, notificationIcon = "notifications") => {
      const currentDb = get(store);
      const newNotification = {
        id: generateEntityId("notif"),
        userId: targetUserId,
        title: notificationTitle,
        message: notificationMessage,
        icon: notificationIcon,
        read: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const updatedNotifications = [newNotification, ...currentDb.notifications || []];
      persistDatabase({ ...currentDb, notifications: updatedNotifications });
    },
    markNotificationAsRead: (notificationId) => {
      const currentDb = get(store);
      const updatedNotifications = (currentDb.notifications || []).map(
        (item) => item.id === notificationId ? { ...item, read: true } : item
      );
      persistDatabase({ ...currentDb, notifications: updatedNotifications });
      return {
        error: false,
        statusCode: 200,
        message: "Notifikasi ditandai sudah dibaca.",
        data: null
      };
    },
    markAllNotificationsAsRead: (targetUserId) => {
      const currentDb = get(store);
      const updatedNotifications = (currentDb.notifications || []).map(
        (item) => item.userId === targetUserId ? { ...item, read: true } : item
      );
      persistDatabase({ ...currentDb, notifications: updatedNotifications });
      return {
        error: false,
        statusCode: 200,
        message: "Semua notifikasi ditandai sudah dibaca.",
        data: null
      };
    },
    // ----------------------------------------------------
    // MASTER DATA: SUBJECTS
    // ----------------------------------------------------
    saveSubject: (subjectPayload) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      if (!subjectPayload.name.trim()) {
        return { error: true, statusCode: 400, message: "Nama mata pelajaran wajib diisi.", data: null };
      }
      if (subjectPayload.id) {
        let updatedSubject = null;
        const updatedSubjects = currentDb.subjects.map((sub) => {
          if (sub.id === subjectPayload.id) {
            updatedSubject = {
              ...sub,
              name: subjectPayload.name.trim(),
              description: subjectPayload.description.trim(),
              updatedAt: nowTimestamp
            };
            return updatedSubject;
          }
          return sub;
        });
        persistDatabase({ ...currentDb, subjects: updatedSubjects });
        return { error: false, statusCode: 200, message: "Mata pelajaran berhasil diperbarui.", data: updatedSubject };
      } else {
        const isDuplicate = currentDb.subjects.some(
          (sub) => sub.deletedAt === null && sub.name.toLowerCase() === subjectPayload.name.trim().toLowerCase()
        );
        if (isDuplicate) {
          return { error: true, statusCode: 409, message: "Nama mata pelajaran sudah terdaftar.", data: null };
        }
        const newSubject = {
          id: generateEntityId("sj"),
          name: subjectPayload.name.trim(),
          description: subjectPayload.description.trim(),
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, subjects: [...currentDb.subjects, newSubject] });
        return { error: false, statusCode: 201, message: "Mata pelajaran baru berhasil ditambahkan.", data: newSubject };
      }
    },
    deleteSubject: (subjectId) => {
      const currentDb = get(store);
      const isUsedInJobs = currentDb.jobs.some((job) => job.deletedAt === null && job.subjectId === subjectId);
      if (isUsedInJobs) {
        return { error: true, statusCode: 400, message: "Mata pelajaran masih digunakan pada lowongan les aktif.", data: null };
      }
      const isUsedInEnrollments = currentDb.enrollments.some(
        (enr) => enr.deletedAt === null && enr.subjectId === subjectId
      );
      if (isUsedInEnrollments) {
        return { error: true, statusCode: 400, message: "Mata pelajaran masih terdaftar pada data siswa aktif.", data: null };
      }
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      const updatedSubjects = currentDb.subjects.map(
        (sub) => sub.id === subjectId ? { ...sub, deletedAt: nowTimestamp, updatedAt: nowTimestamp } : sub
      );
      persistDatabase({ ...currentDb, subjects: updatedSubjects });
      return { error: false, statusCode: 200, message: "Mata pelajaran berhasil dihapus.", data: null };
    },
    // ----------------------------------------------------
    // MASTER DATA: EDUCATION LEVELS & CLASSES
    // ----------------------------------------------------
    saveEducationLevel: (payload) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      if (!payload.levelName.trim()) {
        return { error: true, statusCode: 400, message: "Nama jenjang wajib diisi.", data: null };
      }
      if (payload.id) {
        let updatedLevel = null;
        const updatedList = currentDb.educationLevels.map((item) => {
          if (item.id === payload.id) {
            updatedLevel = {
              ...item,
              levelName: payload.levelName.trim(),
              description: payload.description.trim(),
              updatedAt: nowTimestamp
            };
            return updatedLevel;
          }
          return item;
        });
        persistDatabase({ ...currentDb, educationLevels: updatedList });
        return { error: false, statusCode: 200, message: "Jenjang pendidikan berhasil diperbarui.", data: updatedLevel };
      } else {
        const newLevel = {
          id: generateEntityId("lv"),
          levelName: payload.levelName.trim(),
          description: payload.description.trim(),
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, educationLevels: [...currentDb.educationLevels, newLevel] });
        return { error: false, statusCode: 201, message: "Jenjang pendidikan baru berhasil ditambahkan.", data: newLevel };
      }
    },
    saveClassLevel: (payload) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      if (!payload.className.trim()) {
        return { error: true, statusCode: 400, message: "Nama kelas wajib diisi.", data: null };
      }
      if (payload.id) {
        let updatedClass = null;
        const updatedList = currentDb.classes.map((item) => {
          if (item.id === payload.id) {
            updatedClass = {
              ...item,
              className: payload.className.trim(),
              educationLevelId: payload.educationLevelId,
              baseRatePer90Min: Number(payload.baseRatePer90Min) || 0,
              description: payload.description.trim(),
              updatedAt: nowTimestamp
            };
            return updatedClass;
          }
          return item;
        });
        persistDatabase({ ...currentDb, classes: updatedList });
        return { error: false, statusCode: 200, message: "Tingkat kelas berhasil diperbarui.", data: updatedClass };
      } else {
        const newClass = {
          id: generateEntityId("cl"),
          className: payload.className.trim(),
          educationLevelId: payload.educationLevelId,
          baseRatePer90Min: Number(payload.baseRatePer90Min) || 0,
          description: payload.description.trim(),
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, classes: [...currentDb.classes, newClass] });
        return { error: false, statusCode: 201, message: "Tingkat kelas baru berhasil ditambahkan.", data: newClass };
      }
    },
    deleteClassLevel: (classId) => {
      const currentDb = get(store);
      const isUsedInJobs = currentDb.jobs.some((job) => job.deletedAt === null && job.classId === classId);
      if (isUsedInJobs) {
        return { error: true, statusCode: 400, message: "Kelas masih digunakan pada lowongan les aktif.", data: null };
      }
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      const updatedList = currentDb.classes.map(
        (cls) => cls.id === classId ? { ...cls, deletedAt: nowTimestamp, updatedAt: nowTimestamp } : cls
      );
      persistDatabase({ ...currentDb, classes: updatedList });
      return { error: false, statusCode: 200, message: "Tingkat kelas berhasil dihapus.", data: null };
    },
    // ----------------------------------------------------
    // MASTER DATA: PACKAGES
    // ----------------------------------------------------
    savePackagePlan: (payload) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      if (!payload.name.trim()) {
        return { error: true, statusCode: 400, message: "Nama paket wajib diisi.", data: null };
      }
      if (payload.id) {
        let updatedPackage = null;
        const updatedList = currentDb.packages.map((pkg) => {
          if (pkg.id === payload.id) {
            updatedPackage = {
              ...pkg,
              ...payload,
              price: Number(payload.price) || 0,
              sessionsPerPeriod: Number(payload.sessionsPerPeriod) || 1,
              maxStudents: Number(payload.maxStudents) || 1,
              tentorFee: Number(payload.tentorFee) || 0,
              updatedAt: nowTimestamp
            };
            return updatedPackage;
          }
          return pkg;
        });
        persistDatabase({ ...currentDb, packages: updatedList });
        return { error: false, statusCode: 200, message: "Paket les berhasil diperbarui.", data: updatedPackage };
      } else {
        const newPackage = {
          id: generateEntityId("pkg"),
          ...payload,
          price: Number(payload.price) || 0,
          sessionsPerPeriod: Number(payload.sessionsPerPeriod) || 1,
          maxStudents: Number(payload.maxStudents) || 1,
          tentorFee: Number(payload.tentorFee) || 0,
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, packages: [...currentDb.packages, newPackage] });
        return { error: false, statusCode: 201, message: "Paket les baru berhasil ditambahkan.", data: newPackage };
      }
    },
    // ----------------------------------------------------
    // USERS MANAGEMENT
    // ----------------------------------------------------
    saveUser: (userPayload) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      if (!userPayload.email?.trim() || !userPayload.fullName?.trim()) {
        return { error: true, statusCode: 400, message: "Nama lengkap dan email wajib diisi.", data: null };
      }
      if (userPayload.id) {
        let updatedUser = null;
        const updatedUsers = currentDb.users.map((usr) => {
          if (usr.id === userPayload.id) {
            updatedUser = {
              ...usr,
              ...userPayload,
              updatedAt: nowTimestamp
            };
            return updatedUser;
          }
          return usr;
        });
        persistDatabase({ ...currentDb, users: updatedUsers });
        return { error: false, statusCode: 200, message: "Data pengguna berhasil diperbarui.", data: updatedUser };
      } else {
        const emailExists = currentDb.users.some(
          (usr) => usr.deletedAt === null && usr.email.toLowerCase() === userPayload.email?.trim().toLowerCase()
        );
        if (emailExists) {
          return { error: true, statusCode: 409, message: "Alamat email sudah digunakan oleh akun lain.", data: null };
        }
        const newUser = {
          id: generateEntityId("u"),
          email: userPayload.email.trim(),
          password: userPayload.password || "password123",
          fullName: userPayload.fullName.trim(),
          phone: userPayload.phone || "",
          role: userPayload.role || "STUDENT",
          position: userPayload.position,
          education: userPayload.education,
          experienceYears: userPayload.experienceYears,
          subjectIds: userPayload.subjectIds || [],
          levelIds: userPayload.levelIds || [],
          school: userPayload.school,
          address: userPayload.address,
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, users: [...currentDb.users, newUser] });
        return { error: false, statusCode: 201, message: "Pengguna baru berhasil ditambahkan.", data: newUser };
      }
    },
    deleteUser: (userId) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      const updatedUsers = currentDb.users.map(
        (usr) => usr.id === userId ? { ...usr, deletedAt: nowTimestamp, updatedAt: nowTimestamp } : usr
      );
      persistDatabase({ ...currentDb, users: updatedUsers });
      return { error: false, statusCode: 200, message: "Akun pengguna berhasil dinonaktifkan.", data: null };
    },
    // ----------------------------------------------------
    // JOB MANAGEMENT
    // ----------------------------------------------------
    saveJobPost: (jobPayload) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      if (!jobPayload.id && !jobPayload.title?.trim()) {
        return { error: true, statusCode: 400, message: "Judul lowongan wajib diisi.", data: null };
      }
      if (jobPayload.id) {
        let updatedJob = null;
        const updatedJobs = currentDb.jobs.map((jb) => {
          if (jb.id === jobPayload.id) {
            updatedJob = {
              ...jb,
              ...jobPayload,
              tentorFee: Number(jobPayload.tentorFee) || jb.tentorFee,
              sessionDurationMinutes: Number(jobPayload.sessionDurationMinutes) || jb.sessionDurationMinutes,
              studentCount: Number(jobPayload.studentCount) || jb.studentCount,
              updatedAt: nowTimestamp
            };
            return updatedJob;
          }
          return jb;
        });
        persistDatabase({ ...currentDb, jobs: updatedJobs });
        return { error: false, statusCode: 200, message: "Lowongan les berhasil diperbarui.", data: updatedJob };
      } else {
        const newJob = {
          id: generateEntityId("job"),
          title: (jobPayload.title || "Lowongan Les").trim(),
          classId: jobPayload.classId || "",
          subjectId: jobPayload.subjectId || "",
          jobType: jobPayload.jobType || "REGULAR",
          jobMode: jobPayload.jobMode || "OFFLINE",
          tentorFee: Number(jobPayload.tentorFee) || 12e4,
          sessionDurationMinutes: Number(jobPayload.sessionDurationMinutes) || 90,
          scheduleDays: jobPayload.scheduleDays || ["Senin"],
          scheduleTime: jobPayload.scheduleTime || "16:00",
          studentCount: Number(jobPayload.studentCount) || 1,
          location: jobPayload.location || "Lokasi Siswa",
          latitude: jobPayload.latitude || null,
          longitude: jobPayload.longitude || null,
          status: "AVAILABLE",
          assignedTentorId: null,
          studentId: jobPayload.studentId || null,
          enrollmentId: jobPayload.enrollmentId || null,
          notes: jobPayload.notes || "",
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, jobs: [newJob, ...currentDb.jobs] });
        return { error: false, statusCode: 201, message: "Lowongan les baru berhasil dipublikasikan.", data: newJob };
      }
    },
    assignTentorToJob: (jobId, tentorId) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      let targetJob = null;
      const updatedJobs = currentDb.jobs.map((jb) => {
        if (jb.id === jobId) {
          targetJob = { ...jb, assignedTentorId: tentorId, status: "ASSIGNED", updatedAt: nowTimestamp };
          return targetJob;
        }
        return jb;
      });
      let updatedEnrollments = currentDb.enrollments;
      if (targetJob && targetJob.enrollmentId) {
        updatedEnrollments = currentDb.enrollments.map(
          (enr) => enr.id === targetJob.enrollmentId ? { ...enr, tentorId, status: "ACTIVE", updatedAt: nowTimestamp } : enr
        );
      }
      persistDatabase({ ...currentDb, jobs: updatedJobs, enrollments: updatedEnrollments });
      return { error: false, statusCode: 200, message: "Tentor berhasil ditugaskan ke lowongan ini.", data: targetJob };
    },
    applyToJob: (jobId, tentorId, applicationNotes) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      const existingApp = currentDb.applications.find(
        (app) => app.deletedAt === null && app.jobId === jobId && app.tentorId === tentorId
      );
      if (existingApp) {
        return { error: true, statusCode: 409, message: "Anda sudah pernah melamar pada lowongan ini.", data: null };
      }
      const newApplication = {
        id: generateEntityId("app"),
        jobId,
        tentorId,
        status: "PENDING",
        appliedAt: nowTimestamp,
        notes: applicationNotes || "",
        createdAt: nowTimestamp,
        updatedAt: nowTimestamp,
        deletedAt: null
      };
      persistDatabase({ ...currentDb, applications: [newApplication, ...currentDb.applications] });
      return { error: false, statusCode: 201, message: "Lamaran lowongan les berhasil dikirim.", data: newApplication };
    },
    // ----------------------------------------------------
    // ENROLLMENTS & STUDENTS
    // ----------------------------------------------------
    saveEnrollment: (enrollmentPayload) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      if (enrollmentPayload.id) {
        let updatedEnrollment = null;
        const updatedList = currentDb.enrollments.map((enr) => {
          if (enr.id === enrollmentPayload.id) {
            updatedEnrollment = {
              ...enr,
              ...enrollmentPayload,
              updatedAt: nowTimestamp
            };
            return updatedEnrollment;
          }
          return enr;
        });
        persistDatabase({ ...currentDb, enrollments: updatedList });
        return { error: false, statusCode: 200, message: "Data pendaftaran siswa berhasil diperbarui.", data: updatedEnrollment };
      } else {
        const newEnrollment = {
          id: generateEntityId("enr"),
          studentId: enrollmentPayload.studentId,
          subjectId: enrollmentPayload.subjectId,
          classId: enrollmentPayload.classId,
          packageId: enrollmentPayload.packageId,
          tentorId: enrollmentPayload.tentorId || null,
          scheduleDay: enrollmentPayload.scheduleDay || "Senin, Rabu",
          scheduleTime: enrollmentPayload.scheduleTime || "16:00 - 17:30",
          status: "ACTIVE",
          address: enrollmentPayload.address || "",
          latitude: enrollmentPayload.latitude,
          longitude: enrollmentPayload.longitude,
          waliUserId: enrollmentPayload.waliUserId,
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, enrollments: [newEnrollment, ...currentDb.enrollments] });
        return { error: false, statusCode: 201, message: "Siswa baru berhasil didaftarkan.", data: newEnrollment };
      }
    },
    // ----------------------------------------------------
    // ATTENDANCE MANAGEMENT
    // ----------------------------------------------------
    submitAttendance: (payload) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      if (!payload.topic.trim()) {
        return { error: true, statusCode: 400, message: "Materi/topik yang dipelajari wajib diisi.", data: null };
      }
      const newRecord = {
        id: generateEntityId("att"),
        enrollmentId: payload.enrollmentId,
        tentorId: payload.tentorId,
        sessionDate: payload.sessionDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        topic: payload.topic.trim(),
        studentNotes: payload.studentNotes.trim(),
        status: "SUBMITTED",
        latitudeCheckIn: payload.latitudeCheckIn,
        longitudeCheckIn: payload.longitudeCheckIn,
        isRadiusValid: payload.isRadiusValid,
        proofPhotoUrl: payload.proofPhotoUrl || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80",
        studentConfirmed: false,
        createdAt: nowTimestamp,
        updatedAt: nowTimestamp,
        deletedAt: null
      };
      persistDatabase({ ...currentDb, attendances: [newRecord, ...currentDb.attendances] });
      return { error: false, statusCode: 201, message: "Presensi les berhasil dikirim untuk verifikasi admin.", data: newRecord };
    },
    verifyAttendance: (attendanceId, newStatus, reviewNotes) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      let targetRecord = null;
      const updatedList = currentDb.attendances.map((att) => {
        if (att.id === attendanceId) {
          targetRecord = {
            ...att,
            status: newStatus,
            reviewNotes: reviewNotes || "",
            updatedAt: nowTimestamp
          };
          return targetRecord;
        }
        return att;
      });
      persistDatabase({ ...currentDb, attendances: updatedList });
      return {
        error: false,
        statusCode: 200,
        message: newStatus === "APPROVED" ? "Presensi berhasil diverifikasi dan disetujui." : "Presensi ditolak.",
        data: targetRecord
      };
    },
    // ----------------------------------------------------
    // INVOICES & PAYMENTS
    // ----------------------------------------------------
    createInvoice: (payload) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      const newInvoice = {
        id: generateEntityId("inv"),
        enrollmentId: payload.enrollmentId,
        invoiceNumber: `INV/${payload.periodYear}/${String(payload.periodMonth).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`,
        amount: Number(payload.amount) || 0,
        dueDate: payload.dueDate,
        status: "UNPAID",
        paidAt: null,
        paymentProofUrl: null,
        periodMonth: payload.periodMonth,
        periodYear: payload.periodYear,
        notes: payload.notes || "",
        createdAt: nowTimestamp,
        updatedAt: nowTimestamp,
        deletedAt: null
      };
      persistDatabase({ ...currentDb, invoices: [newInvoice, ...currentDb.invoices] });
      return { error: false, statusCode: 201, message: "Tagihan SPP berhasil diterbitkan.", data: newInvoice };
    },
    confirmInvoicePayment: (invoiceId, proofUrl) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      let targetInvoice = null;
      const updatedList = currentDb.invoices.map((inv) => {
        if (inv.id === invoiceId) {
          targetInvoice = {
            ...inv,
            status: "PAID",
            paidAt: nowTimestamp,
            paymentProofUrl: proofUrl || inv.paymentProofUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80",
            updatedAt: nowTimestamp
          };
          return targetInvoice;
        }
        return inv;
      });
      persistDatabase({ ...currentDb, invoices: updatedList });
      return { error: false, statusCode: 200, message: "Pembayaran tagihan SPP berhasil dikonfirmasi lunas.", data: targetInvoice };
    },
    // ----------------------------------------------------
    // PAYROLL CLAIMS
    // ----------------------------------------------------
    submitPayrollClaim: (payload) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      const newClaim = {
        id: generateEntityId("pay"),
        tentorId: payload.tentorId,
        claimNumber: `PAY/${(/* @__PURE__ */ new Date()).getFullYear()}/${String((/* @__PURE__ */ new Date()).getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`,
        periodStart: payload.periodStart,
        periodEnd: payload.periodEnd,
        totalAmount: payload.totalAmount,
        attendanceIds: payload.attendanceIds,
        status: "REQUESTED",
        paidAt: null,
        transferProofUrl: null,
        createdAt: nowTimestamp,
        updatedAt: nowTimestamp,
        deletedAt: null
      };
      persistDatabase({ ...currentDb, payrollClaims: [newClaim, ...currentDb.payrollClaims] });
      return { error: false, statusCode: 201, message: "Klaim honor berhasil diajukan.", data: newClaim };
    },
    processPayrollPayment: (claimId, transferProofUrl) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      let targetClaim = null;
      const updatedList = currentDb.payrollClaims.map((claim) => {
        if (claim.id === claimId) {
          targetClaim = {
            ...claim,
            status: "PAID",
            paidAt: nowTimestamp,
            transferProofUrl: transferProofUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80",
            updatedAt: nowTimestamp
          };
          return targetClaim;
        }
        return claim;
      });
      persistDatabase({ ...currentDb, payrollClaims: updatedList });
      return { error: false, statusCode: 200, message: "Honor tentor telah berhasil ditransfer dan diselesaikan.", data: targetClaim };
    },
    // ----------------------------------------------------
    // RECRUITMENT CANDIDATES
    // ----------------------------------------------------
    saveCandidate: (payload) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      if (!payload.fullName?.trim() || !payload.email?.trim()) {
        return { error: true, statusCode: 400, message: "Nama kandidat dan email wajib diisi.", data: null };
      }
      if (payload.id) {
        let updatedCand = null;
        const updatedList = currentDb.candidates.map((cand) => {
          if (cand.id === payload.id) {
            updatedCand = {
              ...cand,
              ...payload,
              updatedAt: nowTimestamp
            };
            return updatedCand;
          }
          return cand;
        });
        persistDatabase({ ...currentDb, candidates: updatedList });
        return { error: false, statusCode: 200, message: "Status kandidat berhasil diperbarui.", data: updatedCand };
      } else {
        const newCand = {
          id: generateEntityId("cand"),
          fullName: payload.fullName.trim(),
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          education: payload.education || "S1 Pendidikan",
          experienceYears: Number(payload.experienceYears) || 0,
          subjectIds: payload.subjectIds || [],
          levelIds: payload.levelIds || [],
          cvUrl: payload.cvUrl || "",
          status: payload.status || "REGISTERED",
          notes: payload.notes || "",
          interviewDate: payload.interviewDate,
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
          deletedAt: null
        };
        persistDatabase({ ...currentDb, candidates: [newCand, ...currentDb.candidates] });
        return { error: false, statusCode: 201, message: "Kandidat tentor baru berhasil didaftarkan.", data: newCand };
      }
    },
    convertCandidateToTentorUser: (candidateId) => {
      const currentDb = get(store);
      const targetCandidate = currentDb.candidates.find((cand) => cand.id === candidateId);
      if (!targetCandidate) {
        return { error: true, statusCode: 404, message: "Kandidat tidak ditemukan.", data: null };
      }
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      const newTentorUser = {
        id: generateEntityId("u-tentor"),
        email: targetCandidate.email,
        password: "tentor123",
        fullName: targetCandidate.fullName,
        phone: targetCandidate.phone,
        role: "TENTOR",
        education: targetCandidate.education,
        experienceYears: targetCandidate.experienceYears,
        subjectIds: targetCandidate.subjectIds,
        levelIds: targetCandidate.levelIds,
        createdAt: nowTimestamp,
        updatedAt: nowTimestamp,
        deletedAt: null
      };
      const updatedCandidates = currentDb.candidates.map(
        (cand) => cand.id === candidateId ? { ...cand, status: "ACCEPTED", updatedAt: nowTimestamp } : cand
      );
      persistDatabase({
        ...currentDb,
        users: [...currentDb.users, newTentorUser],
        candidates: updatedCandidates
      });
      return {
        error: false,
        statusCode: 201,
        message: `Kandidat berhasil diterima dan dibuatkan akun tentor (${newTentorUser.email}).`,
        data: newTentorUser
      };
    },
    deleteJob: (jobId) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      const updatedJobs = currentDb.jobs.map(
        (j) => j.id === jobId ? { ...j, deletedAt: nowTimestamp, updatedAt: nowTimestamp } : j
      );
      persistDatabase({ ...currentDb, jobs: updatedJobs });
      return { error: false, statusCode: 200, message: "Lowongan les berhasil dihapus.", data: null };
    },
    deleteEnrollment: (enrollmentId) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      const updatedList = currentDb.enrollments.map(
        (e) => e.id === enrollmentId ? { ...e, deletedAt: nowTimestamp, updatedAt: nowTimestamp } : e
      );
      persistDatabase({ ...currentDb, enrollments: updatedList });
      return { error: false, statusCode: 200, message: "Pendaftaran siswa berhasil dihapus.", data: null };
    },
    savePackage: (pkg) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      let updatedPkg = null;
      const updatedPackages = currentDb.packages.map((p) => {
        if (p.id === pkg.id) {
          updatedPkg = { ...p, ...pkg, updatedAt: nowTimestamp };
          return updatedPkg;
        }
        return p;
      });
      persistDatabase({ ...currentDb, packages: updatedPackages });
      return { error: false, statusCode: 200, message: "Paket les berhasil diperbarui.", data: updatedPkg };
    },
    deletePackage: (packageId) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      const updatedPackages = currentDb.packages.map(
        (p) => p.id === packageId ? { ...p, deletedAt: nowTimestamp, updatedAt: nowTimestamp } : p
      );
      persistDatabase({ ...currentDb, packages: updatedPackages });
      return { error: false, statusCode: 200, message: "Paket les berhasil dihapus.", data: null };
    },
    savePayrollClaim: (claim) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      let updatedClaim = null;
      const updatedList = currentDb.payrollClaims.map((c) => {
        if (c.id === claim.id) {
          updatedClaim = { ...c, ...claim, updatedAt: nowTimestamp };
          return updatedClaim;
        }
        return c;
      });
      persistDatabase({ ...currentDb, payrollClaims: updatedList });
      return { error: false, statusCode: 200, message: "Klaim honor berhasil diperbarui.", data: updatedClaim };
    },
    saveInvoice: (inv) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      let updatedInv = null;
      const updatedList = currentDb.invoices.map((i) => {
        if (i.id === inv.id) {
          updatedInv = { ...i, ...inv, updatedAt: nowTimestamp };
          return updatedInv;
        }
        return i;
      });
      persistDatabase({ ...currentDb, invoices: updatedList });
      return { error: false, statusCode: 200, message: "Tagihan SPP berhasil diperbarui.", data: updatedInv };
    },
    deleteInvoice: (invoiceId) => {
      const currentDb = get(store);
      const nowTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      const updatedList = currentDb.invoices.map(
        (i) => i.id === invoiceId ? { ...i, deletedAt: nowTimestamp, updatedAt: nowTimestamp } : i
      );
      persistDatabase({ ...currentDb, invoices: updatedList });
      return { error: false, statusCode: 200, message: "Tagihan SPP berhasil dihapus.", data: null };
    }
  };
}
const dbStore = createDatabaseStore();
export {
  dbStore as d
};
