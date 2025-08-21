-- Create registration_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
        CREATE TYPE public.registration_status AS ENUM ('pending', 'confirmed', 'paid', 'cancelled', 'checked_in');
    END IF;
END $$;

-- Add new columns to registrations table for admin functionality
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS mercado_pago_payment_id TEXT;

-- Add status column only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'status') THEN
        ALTER TABLE public.registrations ADD COLUMN status registration_status DEFAULT 'pending';
    END IF;
END $$;

-- Create function to generate unique QR codes
CREATE OR REPLACE FUNCTION public.generate_qr_code()
RETURNS TEXT AS $$
BEGIN
    RETURN 'QR_' || upper(encode(gen_random_bytes(16), 'hex'));
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate QR codes
CREATE OR REPLACE FUNCTION public.auto_generate_qr_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.qr_code IS NULL THEN
        NEW.qr_code := generate_qr_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for QR code generation (drop if exists first)
DROP TRIGGER IF EXISTS trigger_auto_generate_qr_code ON public.registrations;
CREATE TRIGGER trigger_auto_generate_qr_code
    BEFORE INSERT ON public.registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_qr_code();

-- Create a view for admin statistics
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT 
    COUNT(*) as total_registrations,
    COUNT(*) FILTER (WHERE status = 'paid') as paid_registrations,
    COUNT(*) FILTER (WHERE checked_in = true) as checked_in_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_registrations
FROM public.registrations;