-- Function to ensure only 1 active school year
CREATE OR REPLACE FUNCTION public.sync_active_tahun_ajaran()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.aktif = true THEN
    UPDATE public.tahun_ajaran
    SET aktif = false
    WHERE id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before insert or update of aktif
DROP TRIGGER IF EXISTS trigger_single_active_tahun_ajaran ON public.tahun_ajaran;
CREATE TRIGGER trigger_single_active_tahun_ajaran
BEFORE INSERT OR UPDATE OF aktif ON public.tahun_ajaran
FOR EACH ROW
WHEN (NEW.aktif = true)
EXECUTE FUNCTION public.sync_active_tahun_ajaran();
