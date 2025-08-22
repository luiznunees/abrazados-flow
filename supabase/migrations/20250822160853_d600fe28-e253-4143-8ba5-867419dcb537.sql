-- Enable pgcrypto in the correct schema used by Supabase
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Recreate generate_qr_code to ensure it can access gen_random_bytes via the extensions schema
CREATE OR REPLACE FUNCTION public.generate_qr_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public, extensions'
AS $function$
BEGIN
    RETURN 'QR_' || upper(encode(gen_random_bytes(16), 'hex'));
END;
$function$;

-- Ensure the auto_generate_qr_code function exists (keeps current logic)
CREATE OR REPLACE FUNCTION public.auto_generate_qr_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.qr_code IS NULL THEN
        NEW.qr_code := generate_qr_code();
    END IF;
    RETURN NEW;
END;
$function$;

-- Add trigger to auto-populate qr_code on registrations insert if it doesn't exist already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_qr_code_before_insert'
  ) THEN
    CREATE TRIGGER set_qr_code_before_insert
    BEFORE INSERT ON public.registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_qr_code();
  END IF;
END $$;