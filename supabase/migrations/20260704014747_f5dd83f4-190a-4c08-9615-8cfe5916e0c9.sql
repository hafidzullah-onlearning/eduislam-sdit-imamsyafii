
CREATE TYPE public.app_role AS ENUM ('admin', 'guru', 'ortu');
CREATE TYPE public.jenis_kelamin AS ENUM ('L', 'P');
CREATE TYPE public.tugas_status AS ENUM ('aktif', 'selesai', 'arsip');
CREATE TYPE public.submission_status AS ENUM ('belum', 'dikerjakan', 'diperiksa', 'selesai');
CREATE TYPE public.tahfidz_status AS ENUM ('lancar', 'perlu-mengulang', 'belum-dinilai');
CREATE TYPE public.nilai_jenis AS ENUM ('harian', 'uts', 'uas', 'tugas');
CREATE TYPE public.nilai_status AS ENUM ('draft', 'published');
CREATE TYPE public.mood_emoji AS ENUM ('senang', 'biasa', 'bosan', 'sedih', 'marah');
CREATE TYPE public.mood_sumber AS ENUM ('sekolah', 'rumah');
CREATE TYPE public.perilaku_aspek AS ENUM ('karakter-islami', 'disiplin', 'keaktifan', 'kerjasama');
CREATE TYPE public.invoice_status AS ENUM ('belum-bayar', 'menunggu', 'lunas', 'terlambat');
CREATE TYPE public.invoice_jenis AS ENUM ('spp', 'buku', 'seragam', 'kegiatan');
CREATE TYPE public.payment_method AS ENUM ('va-bca', 'va-mandiri', 'qris', 'gopay', 'ovo', 'dana', 'kartu-kredit');
CREATE TYPE public.notif_tipe AS ENUM ('tugas', 'mood', 'nilai', 'tahfidz', 'spp', 'info');
CREATE TYPE public.target_role AS ENUM ('admin', 'guru', 'ortu', 'semua');
CREATE TYPE public.catatan_tipe AS ENUM ('positif', 'perlu-perhatian', 'info');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.app_role LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.user_roles WHERE user_id = auth.uid()
       ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'guru' THEN 2 ELSE 3 END LIMIT 1 $$;

CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_insert_self_or_admin" ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.tahun_ajaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL UNIQUE,
  aktif BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tahun_ajaran TO authenticated;
GRANT ALL ON public.tahun_ajaran TO service_role;
ALTER TABLE public.tahun_ajaran ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ta_read_all_auth" ON public.tahun_ajaran FOR SELECT TO authenticated USING (true);
CREATE POLICY "ta_admin_write" ON public.tahun_ajaran FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.mapel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  kode TEXT NOT NULL UNIQUE,
  guru_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mapel TO authenticated;
GRANT ALL ON public.mapel TO service_role;
ALTER TABLE public.mapel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mapel_read_all_auth" ON public.mapel FOR SELECT TO authenticated USING (true);
CREATE POLICY "mapel_admin_write" ON public.mapel FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.kelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  tingkat INT NOT NULL,
  wali_kelas_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tahun_ajaran_id UUID REFERENCES public.tahun_ajaran(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.kelas TO authenticated;
GRANT ALL ON public.kelas TO service_role;
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kelas_read_all_auth" ON public.kelas FOR SELECT TO authenticated USING (true);
CREATE POLICY "kelas_admin_write" ON public.kelas FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.siswa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  nis TEXT NOT NULL UNIQUE,
  kelas_id UUID REFERENCES public.kelas(id) ON DELETE SET NULL,
  orang_tua_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  jenis_kelamin public.jenis_kelamin NOT NULL DEFAULT 'L',
  tanggal_lahir DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_siswa_orang_tua ON public.siswa(orang_tua_id);
CREATE INDEX idx_siswa_kelas ON public.siswa(kelas_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.siswa TO authenticated;
GRANT ALL ON public.siswa TO service_role;
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.guru_of_siswa(_siswa_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.siswa s
    JOIN public.kelas k ON k.id = s.kelas_id
    WHERE s.id = _siswa_id AND k.wali_kelas_id = auth.uid()
  )
$$;

CREATE POLICY "siswa_select_related" ON public.siswa FOR SELECT TO authenticated
USING (orang_tua_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'guru'));
CREATE POLICY "siswa_admin_write" ON public.siswa FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.tugas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul TEXT NOT NULL,
  deskripsi TEXT DEFAULT '',
  mapel_id UUID REFERENCES public.mapel(id) ON DELETE SET NULL,
  kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
  deadline TIMESTAMPTZ,
  attachment_url TEXT,
  link_url TEXT,
  status public.tugas_status NOT NULL DEFAULT 'aktif',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tugas TO authenticated;
GRANT ALL ON public.tugas TO service_role;
ALTER TABLE public.tugas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tugas_select_related" ON public.tugas FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (SELECT 1 FROM public.kelas k WHERE k.id = kelas_id AND k.wali_kelas_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.siswa s WHERE s.kelas_id = tugas.kelas_id AND s.orang_tua_id = auth.uid())
);
CREATE POLICY "tugas_guru_write" ON public.tugas FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.kelas k WHERE k.id = kelas_id AND k.wali_kelas_id = auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.kelas k WHERE k.id = kelas_id AND k.wali_kelas_id = auth.uid()));

CREATE TABLE public.tugas_submission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tugas_id UUID NOT NULL REFERENCES public.tugas(id) ON DELETE CASCADE,
  siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  status public.submission_status NOT NULL DEFAULT 'belum',
  bukti_url TEXT,
  komentar_ortu TEXT,
  komentar_guru TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tugas_id, siswa_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tugas_submission TO authenticated;
GRANT ALL ON public.tugas_submission TO service_role;
ALTER TABLE public.tugas_submission ENABLE ROW LEVEL SECURITY;
CREATE POLICY "submission_select_related" ON public.tugas_submission FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.guru_of_siswa(siswa_id)
  OR EXISTS (SELECT 1 FROM public.siswa s WHERE s.id = siswa_id AND s.orang_tua_id = auth.uid())
);
CREATE POLICY "submission_write_related" ON public.tugas_submission FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.guru_of_siswa(siswa_id)
  OR EXISTS (SELECT 1 FROM public.siswa s WHERE s.id = siswa_id AND s.orang_tua_id = auth.uid())
) WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.guru_of_siswa(siswa_id)
  OR EXISTS (SELECT 1 FROM public.siswa s WHERE s.id = siswa_id AND s.orang_tua_id = auth.uid())
);

CREATE TABLE public.tahfidz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  surah TEXT NOT NULL,
  ayat_dari INT NOT NULL,
  ayat_sampai INT NOT NULL,
  target TEXT,
  status public.tahfidz_status NOT NULL DEFAULT 'belum-dinilai',
  catatan TEXT,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  guru_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tahfidz TO authenticated;
GRANT ALL ON public.tahfidz TO service_role;
ALTER TABLE public.tahfidz ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tahfidz_select_related" ON public.tahfidz FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.guru_of_siswa(siswa_id)
  OR EXISTS (SELECT 1 FROM public.siswa s WHERE s.id = siswa_id AND s.orang_tua_id = auth.uid())
);
CREATE POLICY "tahfidz_write" ON public.tahfidz FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.guru_of_siswa(siswa_id))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.guru_of_siswa(siswa_id));

CREATE TABLE public.nilai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES public.mapel(id) ON DELETE SET NULL,
  jenis public.nilai_jenis NOT NULL,
  nilai NUMERIC(5,2) NOT NULL,
  kkm NUMERIC(5,2) NOT NULL DEFAULT 75,
  status public.nilai_status NOT NULL DEFAULT 'draft',
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  catatan TEXT,
  guru_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nilai TO authenticated;
GRANT ALL ON public.nilai TO service_role;
ALTER TABLE public.nilai ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nilai_select_related" ON public.nilai FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.guru_of_siswa(siswa_id)
  OR (status = 'published' AND EXISTS (SELECT 1 FROM public.siswa s WHERE s.id = siswa_id AND s.orang_tua_id = auth.uid()))
);
CREATE POLICY "nilai_write" ON public.nilai FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.guru_of_siswa(siswa_id))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.guru_of_siswa(siswa_id));

CREATE TABLE public.mood (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  emoji public.mood_emoji NOT NULL,
  catatan TEXT,
  sumber public.mood_sumber NOT NULL,
  jam_pelajaran INT,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mood TO authenticated;
GRANT ALL ON public.mood TO service_role;
ALTER TABLE public.mood ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mood_select_related" ON public.mood FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.guru_of_siswa(siswa_id)
  OR EXISTS (SELECT 1 FROM public.siswa s WHERE s.id = siswa_id AND s.orang_tua_id = auth.uid())
);
CREATE POLICY "mood_write_related" ON public.mood FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.guru_of_siswa(siswa_id)
  OR (sumber = 'rumah' AND EXISTS (SELECT 1 FROM public.siswa s WHERE s.id = siswa_id AND s.orang_tua_id = auth.uid()))
) WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR public.guru_of_siswa(siswa_id)
  OR (sumber = 'rumah' AND EXISTS (SELECT 1 FROM public.siswa s WHERE s.id = siswa_id AND s.orang_tua_id = auth.uid()))
);

CREATE TABLE public.perilaku (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  aspek public.perilaku_aspek NOT NULL,
  skor INT NOT NULL CHECK (skor BETWEEN 1 AND 5),
  catatan TEXT,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  guru_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.perilaku TO authenticated;
GRANT ALL ON public.perilaku TO service_role;
ALTER TABLE public.perilaku ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perilaku_select_related" ON public.perilaku FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.guru_of_siswa(siswa_id)
  OR EXISTS (SELECT 1 FROM public.siswa s WHERE s.id = siswa_id AND s.orang_tua_id = auth.uid())
);
CREATE POLICY "perilaku_write" ON public.perilaku FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.guru_of_siswa(siswa_id))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.guru_of_siswa(siswa_id));

CREATE TABLE public.catatan_guru (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  isi TEXT NOT NULL,
  tipe public.catatan_tipe NOT NULL DEFAULT 'info',
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  guru_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catatan_guru TO authenticated;
GRANT ALL ON public.catatan_guru TO service_role;
ALTER TABLE public.catatan_guru ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catatan_select_related" ON public.catatan_guru FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.guru_of_siswa(siswa_id)
  OR EXISTS (SELECT 1 FROM public.siswa s WHERE s.id = siswa_id AND s.orang_tua_id = auth.uid())
);
CREATE POLICY "catatan_write" ON public.catatan_guru FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.guru_of_siswa(siswa_id))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.guru_of_siswa(siswa_id));

CREATE TABLE public.spp_tarif (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tingkat INT NOT NULL,
  jumlah NUMERIC(12,2) NOT NULL,
  tahun_ajaran_id UUID REFERENCES public.tahun_ajaran(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.spp_tarif TO authenticated;
GRANT ALL ON public.spp_tarif TO service_role;
ALTER TABLE public.spp_tarif ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tarif_read_all" ON public.spp_tarif FOR SELECT TO authenticated USING (true);
CREATE POLICY "tarif_admin_write" ON public.spp_tarif FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.invoice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  bulan TEXT NOT NULL,
  jenis public.invoice_jenis NOT NULL DEFAULT 'spp',
  jumlah NUMERIC(12,2) NOT NULL,
  jatuh_tempo DATE NOT NULL,
  status public.invoice_status NOT NULL DEFAULT 'belum-bayar',
  metode public.payment_method,
  dibayar_pada TIMESTAMPTZ,
  referensi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoice_siswa ON public.invoice(siswa_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice TO authenticated;
GRANT ALL ON public.invoice TO service_role;
ALTER TABLE public.invoice ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice_select_related" ON public.invoice FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (SELECT 1 FROM public.siswa s WHERE s.id = siswa_id AND s.orang_tua_id = auth.uid())
);
CREATE POLICY "invoice_ortu_pay" ON public.invoice FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.siswa s WHERE s.id = siswa_id AND s.orang_tua_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.siswa s WHERE s.id = siswa_id AND s.orang_tua_id = auth.uid()));
CREATE POLICY "invoice_admin_write" ON public.invoice FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.notifikasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  pesan TEXT NOT NULL,
  tipe public.notif_tipe NOT NULL DEFAULT 'info',
  dibaca BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  tanggal TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_user ON public.notifikasi(user_id, dibaca);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifikasi TO authenticated;
GRANT ALL ON public.notifikasi TO service_role;
ALTER TABLE public.notifikasi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_own" ON public.notifikasi FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.pengumuman (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul TEXT NOT NULL,
  isi TEXT NOT NULL,
  target_role public.target_role NOT NULL DEFAULT 'semua',
  tanggal TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);
GRANT SELECT ON public.pengumuman TO authenticated;
GRANT ALL ON public.pengumuman TO service_role;
ALTER TABLE public.pengumuman ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pengumuman_read_targeted" ON public.pengumuman FOR SELECT TO authenticated
USING (
  target_role = 'semua'
  OR public.has_role(auth.uid(), 'admin')
  OR (target_role = 'guru' AND public.has_role(auth.uid(), 'guru'))
  OR (target_role = 'ortu' AND public.has_role(auth.uid(), 'ortu'))
);
CREATE POLICY "pengumuman_admin_write" ON public.pengumuman FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  aksi TEXT NOT NULL,
  target TEXT,
  ip TEXT,
  tanggal TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_admin_read" ON public.audit_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "audit_auth_insert" ON public.audit_log FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'ortu')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
