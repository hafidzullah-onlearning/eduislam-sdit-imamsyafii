import type {
  AuditLog,
  CatatanGuru,
  Invoice,
  Kelas,
  Mapel,
  Mood,
  Nilai,
  Notifikasi,
  Pengumuman,
  Perilaku,
  Siswa,
  Tahfidz,
  Tugas,
  TugasSubmission,
  User,
} from "./types";

const today = new Date();
const dOffset = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const seedUsers: User[] = [
  { id: "u-guru-1", name: "Ustadzah Aisyah Rahman", email: "aisyah@sdit.sch.id", role: "guru", phone: "+62 812-3456-7890" },
  { id: "u-guru-2", name: "Ustadz Ahmad Fauzi", email: "ahmad@sdit.sch.id", role: "guru" },
  { id: "u-ortu-1", name: "Bapak Ridho Nurhadi", email: "ridho@keluarga.id", role: "ortu", phone: "+62 813-1122-3344" },
  { id: "u-ortu-2", name: "Ibu Salma Zahra", email: "salma@keluarga.id", role: "ortu" },
  { id: "u-admin-1", name: "Admin EduIslam Connect", email: "admin@sdit.sch.id", role: "admin" },
];

export const seedKelas: Kelas[] = [
  { id: "k-3a", nama: "3A", tingkat: 3, waliKelasId: "u-guru-1", tahunAjaran: "2025/2026" },
  { id: "k-3b", nama: "3B", tingkat: 3, waliKelasId: "u-guru-2", tahunAjaran: "2025/2026" },
  { id: "k-4a", nama: "4A", tingkat: 4, waliKelasId: "u-guru-1", tahunAjaran: "2025/2026" },
];

export const seedSiswa: Siswa[] = [
  { id: "s-1", nama: "Muhammad Faris Ridho", nis: "24001", kelasId: "k-3a", orangTuaId: "u-ortu-1", jenisKelamin: "L", tanggalLahir: "2016-05-12", status: "aktif" },
  { id: "s-2", nama: "Aisha Nurhadi", nis: "24002", kelasId: "k-3a", orangTuaId: "u-ortu-1", jenisKelamin: "P", tanggalLahir: "2016-08-20", status: "aktif" },
  { id: "s-3", nama: "Yusuf Nurhadi", nis: "24010", kelasId: "k-4a", orangTuaId: "u-ortu-1", jenisKelamin: "L", tanggalLahir: "2015-03-01", status: "aktif" },
  { id: "s-4", nama: "Zahra Salma", nis: "24011", kelasId: "k-3a", orangTuaId: "u-ortu-2", jenisKelamin: "P", tanggalLahir: "2016-11-11", status: "aktif" },
  { id: "s-5", nama: "Umar Aditya", nis: "24012", kelasId: "k-3b", orangTuaId: "u-ortu-2", jenisKelamin: "L", tanggalLahir: "2016-07-04", status: "aktif" },
];

export const seedMapel: Mapel[] = [
  { id: "m-1", nama: "Matematika", kode: "MTK", guruId: "u-guru-1" },
  { id: "m-2", nama: "Bahasa Indonesia", kode: "BIN", guruId: "u-guru-1" },
  { id: "m-3", nama: "Al-Qur'an Hadits", kode: "QH", guruId: "u-guru-2" },
  { id: "m-4", nama: "Aqidah Akhlak", kode: "AA", guruId: "u-guru-2" },
  { id: "m-5", nama: "IPA", kode: "IPA", guruId: "u-guru-1" },
];

export const seedTugas: Tugas[] = [
  {
    id: "t-1",
    judul: "Latihan Perkalian 6 & 7",
    deskripsi: "Kerjakan halaman 42-45 di buku LKS Matematika.",
    mapelId: "m-1",
    kelasId: "k-3a",
    deadline: dOffset(2),
    createdAt: dOffset(-1),
    createdBy: "u-guru-1",
    status: "aktif",
    linkUrl: "https://drive.google.com/example",
  },
  {
    id: "t-2",
    judul: "Menulis Cerita Ramadhan",
    deskripsi: "Tulis pengalaman puasa Ramadhan minimal 1 halaman.",
    mapelId: "m-2",
    kelasId: "k-3a",
    deadline: dOffset(5),
    createdAt: dOffset(-2),
    createdBy: "u-guru-1",
    status: "aktif",
  },
  {
    id: "t-3",
    judul: "Hafalan QS. Al-Fajr ayat 1-10",
    deskripsi: "Setor hafalan hari Kamis.",
    mapelId: "m-3",
    kelasId: "k-3a",
    deadline: dOffset(4),
    createdAt: dOffset(-3),
    createdBy: "u-guru-2",
    status: "aktif",
  },
  {
    id: "t-4",
    judul: "Rangkuman Sistem Pencernaan",
    deskripsi: "Buat mind map di kertas A4.",
    mapelId: "m-5",
    kelasId: "k-4a",
    deadline: dOffset(3),
    createdAt: dOffset(-1),
    createdBy: "u-guru-1",
    status: "aktif",
  },
];

export const seedSubmission: TugasSubmission[] = [
  { id: "sub-1", tugasId: "t-1", siswaId: "s-1", status: "dikerjakan", updatedAt: dOffset(0) },
  { id: "sub-2", tugasId: "t-2", siswaId: "s-1", status: "belum", updatedAt: dOffset(-2) },
  { id: "sub-3", tugasId: "t-3", siswaId: "s-1", status: "selesai", komentarGuru: "Alhamdulillah lancar", updatedAt: dOffset(-1) },
  { id: "sub-4", tugasId: "t-1", siswaId: "s-2", status: "selesai", updatedAt: dOffset(0) },
  { id: "sub-5", tugasId: "t-4", siswaId: "s-3", status: "dikerjakan", updatedAt: dOffset(0) },
];

export const seedTahfidz: Tahfidz[] = [
  { id: "tf-1", siswaId: "s-1", surah: "Al-Fatihah", ayatDari: 1, ayatSampai: 7, target: "Juz 30", status: "lancar", tanggal: dOffset(-10), guruId: "u-guru-2" },
  { id: "tf-2", siswaId: "s-1", surah: "An-Naba", ayatDari: 1, ayatSampai: 20, target: "Juz 30", status: "lancar", tanggal: dOffset(-7), guruId: "u-guru-2" },
  { id: "tf-3", siswaId: "s-1", surah: "An-Naba", ayatDari: 21, ayatSampai: 40, target: "Juz 30", status: "perlu-mengulang", catatan: "Ayat 30-35 perlu diperbaiki", tanggal: dOffset(-3), guruId: "u-guru-2" },
  { id: "tf-4", siswaId: "s-2", surah: "Al-Fatihah", ayatDari: 1, ayatSampai: 7, target: "Juz 30", status: "lancar", tanggal: dOffset(-5), guruId: "u-guru-2" },
  { id: "tf-5", siswaId: "s-3", surah: "Al-Baqarah", ayatDari: 1, ayatSampai: 20, target: "Juz 1", status: "lancar", tanggal: dOffset(-2), guruId: "u-guru-2" },
];

export const seedNilai: Nilai[] = [
  { id: "n-1", siswaId: "s-1", mapelId: "m-1", jenis: "harian", nilai: 88, kkm: 75, status: "published", tanggal: dOffset(-14), guruId: "u-guru-1" },
  { id: "n-2", siswaId: "s-1", mapelId: "m-1", jenis: "uts", nilai: 82, kkm: 75, status: "published", tanggal: dOffset(-30), guruId: "u-guru-1" },
  { id: "n-3", siswaId: "s-1", mapelId: "m-2", jenis: "harian", nilai: 90, kkm: 75, status: "published", tanggal: dOffset(-10), guruId: "u-guru-1" },
  { id: "n-4", siswaId: "s-1", mapelId: "m-3", jenis: "uts", nilai: 95, kkm: 75, status: "published", tanggal: dOffset(-28), guruId: "u-guru-2" },
  { id: "n-5", siswaId: "s-1", mapelId: "m-5", jenis: "harian", nilai: 70, kkm: 75, status: "draft", tanggal: dOffset(-3), guruId: "u-guru-1" },
  { id: "n-6", siswaId: "s-2", mapelId: "m-1", jenis: "harian", nilai: 92, kkm: 75, status: "published", tanggal: dOffset(-14), guruId: "u-guru-1" },
  { id: "n-7", siswaId: "s-3", mapelId: "m-1", jenis: "uts", nilai: 78, kkm: 75, status: "published", tanggal: dOffset(-30), guruId: "u-guru-1" },
];

const moodEmojis = ["senang", "biasa", "bosan", "sedih", "marah"] as const;
export const seedMood: Mood[] = [];
for (let i = 30; i >= 0; i--) {
  for (const siswa of ["s-1", "s-2", "s-3"]) {
    const emoji = moodEmojis[Math.floor(Math.random() * 5)];
    seedMood.push({
      id: `mo-s-${siswa}-${i}`,
      siswaId: siswa,
      emoji,
      sumber: "sekolah",
      jamPelajaran: 1 + Math.floor(Math.random() * 6),
      tanggal: dOffset(-i),
      createdBy: "u-guru-1",
    });
    if (i % 2 === 0) {
      const emoji2 = moodEmojis[Math.floor(Math.random() * 5)];
      seedMood.push({
        id: `mo-r-${siswa}-${i}`,
        siswaId: siswa,
        emoji: emoji2,
        sumber: "rumah",
        tanggal: dOffset(-i),
        createdBy: "u-ortu-1",
        catatan: i % 6 === 0 ? "Setelah mengerjakan PR bersama" : undefined,
      });
    }
  }
}

export const seedPerilaku: Perilaku[] = [
  { id: "p-1", siswaId: "s-1", aspek: "karakter-islami", skor: 5, catatan: "Rajin shalat dhuha", tanggal: dOffset(-3), guruId: "u-guru-2" },
  { id: "p-2", siswaId: "s-1", aspek: "disiplin", skor: 4, tanggal: dOffset(-3), guruId: "u-guru-1" },
  { id: "p-3", siswaId: "s-1", aspek: "keaktifan", skor: 5, tanggal: dOffset(-1), guruId: "u-guru-1" },
];

export const seedInvoice: Invoice[] = [
  { id: "inv-1", siswaId: "s-1", bulan: "2026-05", jenis: "spp", jumlah: 850000, jatuhTempo: dOffset(-30), status: "lunas", metode: "va-bca", dibayarPada: dOffset(-28), referensi: "BCA-8823-991234" },
  { id: "inv-2", siswaId: "s-1", bulan: "2026-06", jenis: "spp", jumlah: 850000, jatuhTempo: dOffset(5), status: "belum-bayar" },
  { id: "inv-3", siswaId: "s-1", bulan: "2026-04", jenis: "kegiatan", jumlah: 250000, jatuhTempo: dOffset(-45), status: "lunas", metode: "qris", dibayarPada: dOffset(-44) },
  { id: "inv-4", siswaId: "s-2", bulan: "2026-06", jenis: "spp", jumlah: 850000, jatuhTempo: dOffset(5), status: "belum-bayar" },
  { id: "inv-5", siswaId: "s-3", bulan: "2026-06", jenis: "spp", jumlah: 900000, jatuhTempo: dOffset(-3), status: "terlambat" },
  { id: "inv-6", siswaId: "s-4", bulan: "2026-06", jenis: "spp", jumlah: 850000, jatuhTempo: dOffset(5), status: "belum-bayar" },
  { id: "inv-7", siswaId: "s-5", bulan: "2026-06", jenis: "spp", jumlah: 850000, jatuhTempo: dOffset(-10), status: "lunas", metode: "gopay", dibayarPada: dOffset(-8) },
];

export const seedNotifikasi: Notifikasi[] = [
  { id: "no-1", userId: "u-ortu-1", role: "ortu", judul: "Tugas baru Matematika", pesan: "Latihan perkalian 6 & 7, deadline 2 hari lagi.", tipe: "tugas", tanggal: dOffset(0), dibaca: false, link: "/app/tugas" },
  { id: "no-2", userId: "u-ortu-1", role: "ortu", judul: "Tagihan SPP Juni 2026", pesan: "Rp 850.000 jatuh tempo dalam 5 hari.", tipe: "spp", tanggal: dOffset(-1), dibaca: false, link: "/app/spp" },
  { id: "no-3", userId: "u-ortu-1", role: "ortu", judul: "Setoran Tahfidz", pesan: "Faris perlu mengulang QS. An-Naba ayat 30-35.", tipe: "tahfidz", tanggal: dOffset(-2), dibaca: true, link: "/app/tahfidz" },
  { id: "no-4", userId: "u-guru-1", role: "guru", judul: "5 tugas menunggu diperiksa", pesan: "Buka menu Tugas untuk memeriksa.", tipe: "tugas", tanggal: dOffset(0), dibaca: false, link: "/app/tugas" },
  { id: "no-5", userId: "u-admin-1", role: "admin", judul: "12 tagihan baru bulan Juni", pesan: "Generate tagihan berhasil.", tipe: "spp", tanggal: dOffset(-1), dibaca: false, link: "/app/admin/pembayaran" },
];

export const seedPengumuman: Pengumuman[] = [
  { id: "pg-1", judul: "Libur Idul Adha", isi: "Sekolah libur tanggal 6-8 Juni 2026.", targetRole: "semua", tanggal: dOffset(-4), createdBy: "u-admin-1" },
  { id: "pg-2", judul: "Rapat Wali Murid", isi: "Diselenggarakan hari Sabtu depan pukul 08.00 WIB.", targetRole: "ortu", tanggal: dOffset(-2), createdBy: "u-admin-1" },
];

export const seedCatatan: CatatanGuru[] = [
  { id: "c-1", siswaId: "s-1", isi: "Faris sangat aktif dalam diskusi kelas hari ini, MasyaAllah.", tanggal: dOffset(-1), guruId: "u-guru-1", tipe: "positif" },
  { id: "c-2", siswaId: "s-1", isi: "Perlu latihan lebih untuk perkalian 7 dan 8.", tanggal: dOffset(-3), guruId: "u-guru-1", tipe: "perlu-perhatian" },
];

export const seedAudit: AuditLog[] = [
  { id: "a-1", userId: "u-admin-1", aksi: "LOGIN", target: "session", tanggal: dOffset(0), ip: "182.16.20.11" },
  { id: "a-2", userId: "u-admin-1", aksi: "CREATE", target: "invoice/inv-6", tanggal: dOffset(-1) },
  { id: "a-3", userId: "u-guru-1", aksi: "UPDATE", target: "nilai/n-1", tanggal: dOffset(-2) },
];

export const seed = {
  users: seedUsers,
  kelas: seedKelas,
  siswa: seedSiswa,
  mapel: seedMapel,
  tugas: seedTugas,
  submissions: seedSubmission,
  tahfidz: seedTahfidz,
  nilai: seedNilai,
  mood: seedMood,
  perilaku: seedPerilaku,
  invoice: seedInvoice,
  notifikasi: seedNotifikasi,
  pengumuman: seedPengumuman,
  catatan: seedCatatan,
  audit: seedAudit,
};

export type SeedShape = typeof seed;
