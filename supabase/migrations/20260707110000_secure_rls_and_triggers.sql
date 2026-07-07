-- Migration: Secure RLS and Triggers
-- Date: 2026-07-07
-- Phase 1 Security Hardening

-- 1. Remove insecure email sync trigger
DROP TRIGGER IF EXISTS tr_sync_profile_email_to_auth ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_profile_email_to_auth();

-- 2. Restrict non-admin updates to invoice master details
CREATE OR REPLACE FUNCTION public.check_invoice_fields_update()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- If the user is NOT an admin, enforce that they cannot change key columns
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    IF NEW.id IS DISTINCT FROM OLD.id OR
       NEW.siswa_id IS DISTINCT FROM OLD.siswa_id OR
       NEW.bulan IS DISTINCT FROM OLD.bulan OR
       NEW.jenis IS DISTINCT FROM OLD.jenis OR
       NEW.jumlah IS DISTINCT FROM OLD.jumlah OR
       NEW.jatuh_tempo IS DISTINCT FROM OLD.jatuh_tempo OR
       NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Orang tua tidak diperbolehkan mengubah data master tagihan (nominal, periode, siswa, dll).';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_invoice_fields_update ON public.invoice;
CREATE TRIGGER tr_check_invoice_fields_update
BEFORE UPDATE ON public.invoice
FOR EACH ROW
EXECUTE FUNCTION public.check_invoice_fields_update();


-- 3. Restrict tugas_submission edits by parents
CREATE OR REPLACE FUNCTION public.check_submission_fields_update()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- If the user is NOT an admin and NOT the teacher/guru of this student, check constraints
  IF NOT public.has_role(auth.uid(), 'admin') AND NOT public.guru_of_siswa(OLD.siswa_id) THEN
    -- Ortu cannot modify komentar_guru
    IF NEW.komentar_guru IS DISTINCT FROM OLD.komentar_guru THEN
      RAISE EXCEPTION 'Orang tua tidak diperbolehkan menulis atau mengubah komentar guru.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_submission_fields_update ON public.tugas_submission;
CREATE TRIGGER tr_check_submission_fields_update
BEFORE UPDATE ON public.tugas_submission
FOR EACH ROW
EXECUTE FUNCTION public.check_submission_fields_update();


-- 4. Secure Audit Log Mechanism
-- Create secure RPC function for logging activity
CREATE OR REPLACE FUNCTION public.log_activity(
  p_aksi TEXT,
  p_target TEXT
) RETURNS VOID SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.audit_log (user_id, aksi, target, ip, tanggal)
  VALUES (
    auth.uid(),
    p_aksi,
    p_target,
    inet_client_addr()::text,
    now()
  );
END;
$$ LANGUAGE plpgsql;

-- Revoke default execute rights and grant explicitly to authenticated users and service_role
REVOKE ALL ON FUNCTION public.log_activity(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_activity(TEXT, TEXT) TO authenticated, service_role;

-- Drop insecure direct insert policy on audit_log so it can only be populated via log_activity RPC
DROP POLICY IF EXISTS "audit_auth_insert" ON public.audit_log;
