
# EduIslam Connect — Web App (UI-only, mock data)

Bangun aplikasi lengkap di atas landing page yang sudah ada. Semua halaman fungsional secara visual dengan mock data (localStorage), tanpa backend nyata dulu. Prioritas polish tertinggi: **Orang Tua**. Lovable Cloud diaktifkan di akhir fase agar siap migrasi ke data nyata tanpa refactor besar.

## Prinsip

- Semua route baru di bawah `/app/*`. Landing page `/` tidak disentuh.
- Data mock dipusatkan di `src/mocks/*` + hook `useMockStore` (localStorage-backed) supaya CRUD terasa nyata.
- Role disimpan di `localStorage` (`role: guru | ortu | admin`) + context `AuthProvider`. Route guard sederhana di layout `/app`.
- Design tokens landing page dipakai ulang (Emerald, Navy, Cream, Plus Jakarta Sans). Tambah token dashboard: `--surface`, `--surface-muted`, `--border-soft`, `--success/--warning/--danger/--info`.
- Setiap halaman punya: loading skeleton, empty state, error state, toast, confirm dialog.

## Arsitektur Route

```text
/app/login                    (pilih role: guru / ortu / admin)
/app/forgot-password
/app/reset-password

/app/(layout dgn Sidebar+Topbar per role)
  /app/dashboard              (variasi per role)
  /app/notifikasi
  /app/profil
  /app/pengaturan
  /app/bantuan

  # ORANG TUA (prioritas 1)
  /app/anak                   (list anak)
  /app/anak/$anakId           (dashboard anak)
  /app/anak/$anakId/tugas
  /app/anak/$anakId/tahfidz
  /app/anak/$anakId/nilai
  /app/anak/$anakId/mood
  /app/anak/$anakId/catatan
  /app/spp                    (tagihan + riwayat)
  /app/spp/$invoiceId         (detail + mock pembayaran VA/QRIS/e-wallet)

  # GURU
  /app/kelas
  /app/siswa
  /app/tugas                  (CRUD + upload dummy)
  /app/materi
  /app/tahfidz                (input surah/ayat + status)
  /app/nilai                  (harian/UTS/UAS + publish/draft)
  /app/mood                   (emoji per jam pelajaran + grafik)
  /app/perilaku
  /app/laporan

  # ADMIN
  /app/admin/users            (guru/ortu/siswa dlm tabs)
  /app/admin/kelas
  /app/admin/mapel
  /app/admin/tahun-ajaran
  /app/admin/spp              (master tarif)
  /app/admin/pembayaran       (rekap + filter + export mock)
  /app/admin/pengumuman
  /app/admin/banner
  /app/admin/audit-log
  /app/admin/pengaturan
```

Sidebar dirender berdasarkan role. Guard: kalau tidak ada session di localStorage → redirect ke `/app/login`. Kalau role tidak cocok dengan route → redirect ke `/app/dashboard`.

## Design System Dashboard

- Layout: sidebar collapsible (shadcn `Sidebar`), topbar berisi search global, notifikasi bell, avatar menu, dark mode toggle.
- Cards: `rounded-2xl`, `shadow-soft`, border tipis, background `--surface`.
- Data viz: `recharts` (sudah terpasang) untuk grafik mood, nilai, pendapatan.
- Tables: shadcn `Table` + pagination, sorting, filter, search bar konsisten.
- State: Empty state ilustratif (SVG minimal), skeleton per komponen, error dengan tombol retry.
- Copywriting Indonesia hangat: "Halo, Ustadzah Aisyah 👋", "Belum ada tagihan bulan ini, alhamdulillah.", dll.

## Modul Prioritas (Orang Tua — polish penuh)

1. **Dashboard Anak** — ringkasan hari ini: tugas, mood, target tahfidz, SPP, notifikasi guru, timeline aktivitas.
2. **Tugas Anak** — checklist, upload bukti (mock), komentar ke guru.
3. **Mood Rumah** — pilih emoji + catatan; grafik mingguan sekolah vs rumah.
4. **Tahfidz** — progress bar per juz, riwayat setoran, target.
5. **Nilai & Rapor** — nilai per mapel, grafik trend, tombol Download PDF (mock).
6. **SPP** — daftar tagihan (Lunas/Belum/Terlambat), detail invoice dengan pilihan metode pembayaran (VA, QRIS, e-wallet, kartu). Alur pembayaran: pilih metode → tampilkan instruksi mock → simulasi "Tandai Lunas" → receipt.
7. **Notifikasi & Profil & Pengaturan**.

## Modul Guru (lengkap, fungsional secara UI)

Dashboard, Siswa, Tugas (CRUD lengkap dgn dialog form + Zod), Tahfidz, Nilai (draft/publish), Mood per jam pelajaran, Perilaku, Laporan.

## Modul Admin (lengkap, fungsional secara UI)

Master User (tabs guru/ortu/siswa), Kelas, Mapel, Tahun Ajaran, SPP tarif, Pembayaran (rekap + export mock CSV), Pengumuman, Banner, Audit Log, Pengaturan.

## Detail Teknis

- **Auth mock**: `AuthProvider` di `src/lib/auth/mock-auth.tsx`. Fungsi `signIn(role, remember)`, `signOut()`, `useAuth()`. Simpan ke `localStorage`.
- **Mock store**: `src/mocks/db.ts` dengan seed data (3 anak, 2 kelas, tagihan SPP, mood 30 hari, nilai per mapel, tugas). Hook `useCollection('spp')` mengembalikan `{ items, add, update, remove }` yg sinkron ke localStorage + trigger re-render via `zustand` (add package).
- **Forms**: `react-hook-form` + `zod` untuk semua CRUD.
- **Notifikasi**: sonner toast + halaman `/app/notifikasi` (list mock).
- **Global search**: cmdk (`Command`) berisi shortcut ke halaman + siswa.
- **Dark mode**: `next-themes`-style via `class` di `<html>`, toggle di topbar.
- **Payment mock**: komponen `PaymentMethodPicker` + `MockPaymentInstructions` untuk VA/QRIS/e-wallet/kartu. Tombol "Saya sudah bayar" → set status Lunas + generate receipt page yg bisa diprint.
- **Responsive**: sidebar jadi drawer di mobile, tables → cards di <sm.
- **Aksesibilitas**: fokus ring semantic, aria-label pada icon-only button, kontras WCAG AA.

## Lovable Cloud

Diaktifkan setelah UI selesai supaya user bisa langsung tambahkan real auth + persistence nanti. Untuk fase ini murni mock; tidak ada tabel dibuat. Payment ditunda (mock UI only).

## Struktur Folder Baru

```text
src/
  routes/app/...             # semua route app
  components/app/
    layout/{Sidebar,Topbar,AppShell}.tsx
    common/{PageHeader,EmptyState,DataTable,StatCard,ConfirmDialog}.tsx
    parent/... guru/... admin/...
  lib/auth/mock-auth.tsx
  lib/mock-store.ts
  mocks/
    seed.ts            # data awal
    types.ts
  hooks/use-collection.ts
```

## Deliverable per Iterasi Chat Berikutnya

Karena scope sangat besar, saya akan mengirim 1 pesan build ini yang menghasilkan:

1. Auth mock + layout `/app` + sidebar per role + dashboard 3 role.
2. **Semua** modul Orang Tua (polish penuh + payment mock).
3. Modul Guru lengkap (CRUD fungsional).
4. Modul Admin lengkap (CRUD + rekap pembayaran).
5. Notifikasi, Profil, Pengaturan, Bantuan, Global Search, Dark Mode.
6. Aktifkan Lovable Cloud di akhir (siap untuk fase real backend).

Kalau kepanjangan untuk satu turn, saya potong di batas modul (parent selesai dulu, lalu guru, lalu admin) tanpa meninggalkan link mati.

## Yang TIDAK termasuk

- Backend nyata, RLS, migration (menunggu fase berikutnya setelah Cloud aktif).
- Integrasi payment gateway nyata.
- Email transaksional.
- Kirim notifikasi push.

Setujui untuk mulai build?
