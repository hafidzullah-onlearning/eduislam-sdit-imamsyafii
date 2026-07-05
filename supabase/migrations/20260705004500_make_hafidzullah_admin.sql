-- Update handle_new_user function to automatically assign 'admin' role to hafidzullah.a@gmail.com
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

-- Make existing user hafidzullah.a@gmail.com an admin if they already exist in auth.users
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'hafidzullah.a@gmail.com';
  IF v_user_id IS NOT NULL THEN
    -- Delete existing roles if any to avoid conflicts
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    -- Insert admin role
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin');
  END IF;
END $$;
