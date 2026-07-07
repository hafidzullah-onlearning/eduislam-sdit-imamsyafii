export type Role = "guru" | "ortu" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
}

export interface Kelas {
  id: string;
  nama: string; // "3A"
  tingkat: number; // 3
  waliKelasId: string;
  tahunAjaran: string;
}

export interface Siswa {
  id: string;
  nama: string;
  nis: string;
  kelasId: string;
  orangTuaId: string;
  jenisKelamin: "L" | "P";
  tanggalLahir: string;
  avatar?: string;
  status: "aktif" | "nonaktif";
}

export interface Mapel {
  id: string;
  nama: string;
  kode: string;
  guruId: string;
}

export interface Tugas {
  id: string;
  judul: string;
  deskripsi: string;
  mapelId: string;
  kelasId: string;
  deadline: string;
  attachmentUrl?: string;
  linkUrl?: string;
  createdAt: string;
  createdBy: string; // guruId
  status: "aktif" | "selesai" | "arsip";
}

export interface TugasSubmission {
  id: string;
  tugasId: string;
  siswaId: string;
  status: "belum" | "dikerjakan" | "diperiksa" | "selesai";
  buktiUrl?: string;
  komentarOrtu?: string;
  komentarGuru?: string;
  updatedAt: string;
}

export interface Tahfidz {
  id: string;
  siswaId: string;
  surah: string;
  ayatDari: number;
  ayatSampai: number;
  target: string; // juz atau surah target
  status: "lancar" | "perlu-mengulang" | "belum-dinilai";
  catatan?: string;
  tanggal: string;
  guruId: string;
}

export interface Nilai {
  id: string;
  siswaId: string;
  mapelId: string;
  jenis: "harian" | "uts" | "uas" | "tugas";
  nilai: number;
  kkm: number;
  status: "draft" | "published";
  tanggal: string;
  guruId: string;
  catatan?: string;
}

export type MoodEmoji = "senang" | "biasa" | "bosan" | "sedih" | "marah";

export interface Mood {
  id: string;
  siswaId: string;
  emoji: MoodEmoji;
  catatan?: string;
  sumber: "sekolah" | "rumah";
  jamPelajaran?: number; // 1-8 utk sekolah
  tanggal: string;
  createdBy: string;
}

export interface Perilaku {
  id: string;
  siswaId: string;
  aspek: "karakter-islami" | "disiplin" | "keaktifan" | "kerjasama";
  skor: number; // 1-5
  catatan?: string;
  tanggal: string;
  guruId: string;
}

export type InvoiceStatus = "belum-bayar" | "menunggu" | "lunas" | "terlambat";
export type PaymentMethod = "va-bca" | "va-mandiri" | "qris" | "gopay" | "ovo" | "dana" | "kartu-kredit";

export interface Invoice {
  id: string;
  siswaId: string;
  bulan: string; // "2026-06"
  jenis: "spp" | "buku" | "seragam" | "kegiatan";
  jumlah: number;
  jatuhTempo: string;
  status: InvoiceStatus;
  metode?: PaymentMethod;
  dibayarPada?: string;
  referensi?: string;
}

export interface Notifikasi {
  id: string;
  userId: string; // penerima (bisa role)
  role?: Role;
  judul: string;
  pesan: string;
  tipe: "tugas" | "mood" | "nilai" | "tahfidz" | "spp" | "info";
  tanggal: string;
  dibaca: boolean;
  link?: string;
}

export interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  targetRole: Role | "semua";
  tanggal: string;
  createdBy: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  aksi: string;
  target: string;
  tanggal: string;
  ip?: string;
}

export interface CatatanGuru {
  id: string;
  siswaId: string;
  isi: string;
  tanggal: string;
  guruId: string;
  tipe: "positif" | "perlu-perhatian" | "info";
}

export interface TahunAjaran {
  id: string;
  nama: string;
  aktif: boolean;
}

export interface SppTarif {
  id: string;
  tingkat: number;
  jumlah: number;
  tahunAjaranId: string;
}

export interface Materi {
  id: string;
  judul: string;
  deskripsi: string;
  linkUrl: string;
  kelasId: string;
  mapelId: string;
  guruId: string;
  createdAt: string;
}

