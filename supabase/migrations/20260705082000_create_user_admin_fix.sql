-- Ensure the pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing functions to allow changing return types or argument types
DROP FUNCTION IF EXISTS public.create_user_admin(UUID, TEXT, TEXT, TEXT, public.app_role);
DROP FUNCTION IF EXISTS public.create_user_admin(UUID, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.delete_user_admin(UUID);

-- Recreate create_user_admin function with security check and correct search_path including extensions
CREATE OR REPLACE FUNCTION public.create_user_admin(
  p_id UUID,
  p_email TEXT,
  p_password TEXT,
  p_nama TEXT,
  p_role public.app_role
) RETURNS VOID AS $$
BEGIN
  -- Security check: only admins can create users
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admin can create users';
  END IF;

  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    p_id,
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', p_nama),
    'authenticated',
    'authenticated'
  );

  -- Update role from default 'ortu' to the requested role
  UPDATE public.user_roles
  SET role = p_role
  WHERE user_id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- Recreate delete_user_admin function with security check
CREATE OR REPLACE FUNCTION public.delete_user_admin(p_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Security check: only admins can delete users
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admin can delete users';
  END IF;

  DELETE FROM auth.users WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke default privileges and grant to authenticated and service_role
REVOKE ALL ON FUNCTION public.create_user_admin(UUID, TEXT, TEXT, TEXT, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_admin(UUID, TEXT, TEXT, TEXT, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.delete_user_admin(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_admin(UUID) TO authenticated, service_role;
