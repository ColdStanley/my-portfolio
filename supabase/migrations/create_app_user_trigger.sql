-- Create function to automatically create app_users record when new user signs up
CREATE OR REPLACE FUNCTION public.create_app_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.app_users (id, plan, created_at, updated_at)
  VALUES (NEW.id, 'free', NOW(), NOW());
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If record already exists, do nothing
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_app_user();