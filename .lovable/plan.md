# Migrasi ke Lovable Cloud — Backend Nyata

Scope-nya besar (30+ modul, 3 role). Rencananya bertahap dalam beberapa turn agar tiap fase bisa diverifikasi build & jalan. Turn ini fokus **Fase 1 & 2** (fondasi + Orang Tua end-to-end). Fase Guru & Admin menyusul di turn berikutnya.

## Fase 1 — Fondasi Cloud & Auth

1. Aktifkan **Lovable Cloud** (Supabase terkelola).
2. **Auth nyata**: email/password + Google (via `lovable.auth.signInWithOAuth`). Ganti `mock-auth.tsx` → wrapper Supabase (`useAuth` API tetap sama supaya komponen tidak refactor besar).
3. Route `/auth` publik + halaman `/reset-password`. Layout `_authenticated` (integration-managed) menggantikan guard manual di `src/routes/app.tsx`.
4. Attach bearer middleware di `src/start.ts`.

## Fase 2 — Skema Database + RLS

Migration tunggal berisi seluruh skema inti (nama disesuaikan dari `src/mocks/types.ts`):

```text
profiles (id=auth.users, nama, avatar_url, phone)
app_role enum: admin | guru | ortu
user_roles (user_id, role) + has_role() SECURITY DEFINER
tahun_ajaran, mapel, kelas (wali_kelas_id → profiles)
siswa (kelas_id, orang_tua_id → profiles, nis, nama, jk, tgl_lahir)
tugas, tugas_submission
tahfidz_setoran
nilai (status draft|published)
mood_entry (source: sekolah|rumah, jam_ke)
perilaku, catatan_guru
spp_tarif, spp_invoice, spp_pembayaran (mock provider)
pengumuman, notifikasi, audit_log
storage bucket: `uploads` (submissions), `avatars` (public)
```

**RLS** (setiap tabel):
- Ortu: SELECT anak-nya sendiri (via `siswa.orang_tua_id = auth.uid()`) & data turunannya.
- Guru: SELECT/INSERT/UPDATE untuk siswa di kelas yang dia wali/ajar.
- Admin: full via `has_role(auth.uid(),'admin')`.
- `GRANT` sesuai konvensi (authenticated + service_role; anon hanya untuk pengumuman publik bila ada).

Trigger `handle_new_user()` untuk auto-buat `profiles`. Seed minimal (tahun ajaran aktif, mapel dasar, 1 admin dari user pertama) via migration.

## Fase 3 — Data Layer

- Ganti `useDB` (zustand+localStorage) → **TanStack Query hooks** per resource: `useSiswa`, `useTugas`, `useSpp`, dll. File `src/lib/api/*.ts` berisi query & mutation Supabase client.
- Loader pattern canonical (`ensureQueryData` + `useSuspenseQuery`) untuk halaman berat.
- Server functions (`createServerFn` + `requireSupabaseAuth`) hanya untuk operasi butuh service role (mis. admin reset password, export CSV pembayaran).

## Fase 4 — Migrasi Halaman Orang Tua (prioritas)

Route parent (dashboard, anak, tugas, tahfidz, nilai, mood, catatan, spp list & detail, notifikasi, profil) diarahkan ke hooks nyata. Upload bukti tugas → Supabase Storage. Pembayaran tetap **mock** (tandai lunas menulis ke `spp_pembayaran` real).

## Fase 5 (turn berikutnya) — Guru & Admin

Setelah Fase 1-4 stabil: migrasi modul Guru (CRUD tugas/nilai/tahfidz/mood/perilaku/laporan) dan Admin (users via Auth Admin API di server fn, master data, rekap pembayaran, pengumuman, audit-log).

## Yang dipertahankan

- Design system, layout, semua komponen UI, routing structure tidak berubah.
- `AuthProvider` API (`useAuth().user/session/signIn/signOut`) tetap sama → minim refactor komponen.
- `Reset Data Demo` diganti jadi "Sign out" (mock reset tidak relevan lagi).

## Yang dibuang

- `src/lib/mock-store.ts`, `src/mocks/seed.ts` (types dipertahankan sebagai referensi kolom).
- Guard manual di `src/routes/app.tsx` → pindah ke `_authenticated` layout.

## Detail Teknis Ringkas

- Google OAuth wajib panggil `supabase--configure_social_auth` di turn yang sama.
- Semua `.functions.ts` yang perlu `supabaseAdmin` → dynamic import di dalam handler.
- Public route (landing `/`) tidak disentuh.
- Setiap route berloader dapat `errorComponent` + `notFoundComponent`.

## Konfirmasi sebelum mulai

Turn ini akan cukup besar. Setuju eksekusi **Fase 1-4** (fondasi + Orang Tua) dalam satu build, lalu Guru & Admin di turn terpisah?
