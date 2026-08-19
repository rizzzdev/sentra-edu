import type { DatabaseSchema } from '$lib/shared/types/common.types';

const defaultTimestamp = '2026-08-17T08:00:00.000Z';

export function createInitialDatabaseSeed(): DatabaseSchema {
  return {
    version: 14,
    seededAt: '2026-08-20',

    // ── Master Data ──────────────────────────────────────────
    educationLevels: [
      {
        id: 'lv-tk',
        levelName: 'TK',
        description: 'Calistung & kecerdasan dasar',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'lv-sd',
        levelName: 'SD',
        description: 'Pendampingan belajar SD',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'lv-smp',
        levelName: 'SMP',
        description: 'Persiapan ujian & masuk SMA',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'lv-sma',
        levelName: 'SMA',
        description: 'Persiapan UTBK / PTN',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'lv-khs',
        levelName: 'ALUMNI/KHUSUS',
        description: 'Mahasiswa & kursus khusus',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],

    classes: [
      {
        id: 'cl-sd-1',
        className: 'Kelas 1 SD',
        educationLevelId: 'lv-sd',
        baseRatePer90Min: 110000,
        description: '',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'cl-sd-6',
        className: 'Kelas 6 SD',
        educationLevelId: 'lv-sd',
        baseRatePer90Min: 110000,
        description: 'Persiapan ujian akhir SD',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'cl-smp-7',
        className: 'Kelas 7 SMP',
        educationLevelId: 'lv-smp',
        baseRatePer90Min: 125000,
        description: '',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'cl-smp-9',
        className: 'Kelas 9 SMP',
        educationLevelId: 'lv-smp',
        baseRatePer90Min: 125000,
        description: 'Persiapan ujian & masuk SMA',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'cl-sma-10',
        className: 'Kelas 10 SMA',
        educationLevelId: 'lv-sma',
        baseRatePer90Min: 140000,
        description: '',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'cl-sma-12',
        className: 'Kelas 12 SMA',
        educationLevelId: 'lv-sma',
        baseRatePer90Min: 150000,
        description: 'Persiapan UTBK / ujian akhir',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],

    subjects: [
      {
        id: 'sj-mtk',
        name: 'Matematika',
        description: 'Matematika dasar hingga lanjutan',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'sj-ing',
        name: 'Bahasa Inggris',
        description: 'Grammar, speaking & TOEFL',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'sj-fis',
        name: 'Fisika',
        description: 'Fisika SMP / SMA',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'sj-kim',
        name: 'Kimia',
        description: 'Kimia SMA',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'sj-bio',
        name: 'Biologi',
        description: 'Biologi SMA',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'sj-bindo',
        name: 'Bahasa Indonesia',
        description: 'Bahasa Indonesia & sastra',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],

    packages: [
      {
        id: 'pkg-bulanan-private',
        name: 'Paket Bulanan Private',
        mode: 'PRIVATE',
        period: 'BULANAN',
        price: 1600000,
        sessionsPerPeriod: 8,
        maxStudents: 1,
        tentorFee: 150000,
        description: 'Les privat 1 guru 1 siswa, 8 pertemuan per bulan (90 menit/sesi).',
        active: true,
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'pkg-bulanan-kelompok',
        name: 'Paket Bulanan Kelompok',
        mode: 'KELOMPOK',
        period: 'BULANAN',
        price: 900000,
        sessionsPerPeriod: 8,
        maxStudents: 5,
        tentorFee: 60000,
        description: 'Les kelompok kecil (maks 5 siswa), 8 pertemuan per bulan (90 menit/sesi).',
        active: true,
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'pkg-harian-private',
        name: 'Paket Harian Private',
        mode: 'PRIVATE',
        period: 'HARIAN',
        price: 175000,
        sessionsPerPeriod: 1,
        maxStudents: 1,
        tentorFee: 125000,
        description: 'Les privat sekali pertemuan (90 menit) — bayar per sesi.',
        active: true,
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      },
      {
        id: 'pkg-intensif-bulanan',
        name: 'Paket Intensif UTBK Private (Bulanan)',
        mode: 'PRIVATE',
        period: 'BULANAN',
        price: 2400000,
        sessionsPerPeriod: 12,
        maxStudents: 1,
        tentorFee: 180000,
        description: 'Intensif persiapan UTBK, 12 pertemuan per bulan (90 menit/sesi).',
        active: true,
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],

    // ── Hanya 1 Akun Admin ──────────────────────────────────
    users: [
      {
        id: 'u-admin',
        email: 'admin@sentraedu.id',
        password: 'admin123',
        fullName: 'Admin Pusat',
        phone: '0812-0000-0001',
        role: 'SUPER_ADMIN',
        position: 'Manajer Operasional Pusat',
        createdAt: defaultTimestamp,
        updatedAt: defaultTimestamp,
        deletedAt: null
      }
    ],

    // ── Data Operasional Kosong (isi lewat flow testing) ────
    enrollments: [],
    jobs: [],
    applications: [],
    attendances: [],
    invoices: [],
    payrollClaims: [],
    candidates: [],
    notifications: [],
    magicLinks: []
  };
}
