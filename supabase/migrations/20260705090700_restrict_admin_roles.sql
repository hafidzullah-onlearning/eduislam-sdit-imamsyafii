-- Restrict handle_new_user trigger to only allow hafidzullah.a@gmail.com as admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role public.app_role := 'ortu';
BEGIN
  IF NEW.email = 'hafidzullah.a@gmail.com' THEN
    v_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, nama, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Downgrade/restorations of other test accounts in database
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 1. admin@sdit.sch.id -> delete admin role, set to ortu
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@sdit.sch.id';
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'ortu');
  END IF;

  -- 2. hafidzullah.belajar@gmail.com -> guru
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'hafidzullah.belajar@gmail.com';
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'guru');
  END IF;

  -- 3. hafidz10amin@gmail.com -> ortu
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'hafidz10amin@gmail.com';
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'ortu');
  END IF;
END $$;
