-- Function to handle auth signup -> client sync
CREATE OR REPLACE FUNCTION public.handle_new_user_to_client()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.clients (full_name, email)
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email
    )
    ON CONFLICT (email) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync on new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_to_client();
