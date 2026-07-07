-- Migration: Materi and SPP Security Improvements
-- Date: 2026-07-07

-- 1. Create table public.materi
CREATE TABLE IF NOT EXISTS public.materi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul TEXT NOT NULL,
  deskripsi TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  kelas_id UUID NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
  mapel_id UUID REFERENCES public.mapel(id) ON DELETE SET NULL,
  guru_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on public.materi
ALTER TABLE public.materi ENABLE ROW LEVEL SECURITY;

-- Grant permissions on public.materi
GRANT SELECT, INSERT, UPDATE, DELETE ON public.materi TO authenticated;
GRANT ALL ON public.materi TO service_role;

-- RLS Policies for public.materi
-- SELECT: Admin, Creator (guru_id), Wali Kelas of the class, or Ortu whose child is in that class
DROP POLICY IF EXISTS "materi_select_related" ON public.materi;
CREATE POLICY "materi_select_related" ON public.materi FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR guru_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.kelas k WHERE k.id = kelas_id AND k.wali_kelas_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.siswa s WHERE s.kelas_id = materi.kelas_id AND s.orang_tua_id = auth.uid())
);

-- WRITE (INSERT, UPDATE, DELETE): Admin, Creator, or Wali Kelas of the class
DROP POLICY IF EXISTS "materi_write_related" ON public.materi;
CREATE POLICY "materi_write_related" ON public.materi FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR guru_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.kelas k WHERE k.id = kelas_id AND k.wali_kelas_id = auth.uid())
) WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR guru_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.kelas k WHERE k.id = kelas_id AND k.wali_kelas_id = auth.uid())
);


-- 2. Trigger function to synchronize profiles.email changes to auth.users.email
CREATE OR REPLACE FUNCTION public.sync_profile_email_to_auth()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE auth.users
    SET email = NEW.email,
        email_confirmed_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Register email sync trigger on public.profiles
DROP TRIGGER IF EXISTS tr_sync_profile_email_to_auth ON public.profiles;
CREATE TRIGGER tr_sync_profile_email_to_auth
AFTER UPDATE OF email ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_email_to_auth();


-- 3. Trigger function to enforce invoice status restrictions for non-admins
CREATE OR REPLACE FUNCTION public.check_invoice_status_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- If the role is NOT admin, prevent setting status to 'lunas' directly
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    IF NEW.status = 'lunas' AND OLD.status IS DISTINCT FROM 'lunas' THEN
      RAISE EXCEPTION 'Hanya admin yang dapat memverifikasi pembayaran tagihan (lunas).';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Register invoice status transition check trigger on public.invoice
DROP TRIGGER IF EXISTS tr_check_invoice_status_update ON public.invoice;
CREATE TRIGGER tr_check_invoice_status_update
BEFORE UPDATE OF status ON public.invoice
FOR EACH ROW
EXECUTE FUNCTION public.check_invoice_status_update();
