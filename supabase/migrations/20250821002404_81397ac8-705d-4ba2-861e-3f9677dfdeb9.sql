-- Add new columns to registrations table for admin functionality
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Update payment_status enum to be more comprehensive
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
        CREATE TYPE public.registration_status AS ENUM ('pending', 'confirmed', 'paid', 'cancelled', 'checked_in');
    END IF;
END $$;

-- Update registrations table to use the new enum
ALTER TABLE public.registrations 
ALTER COLUMN status TYPE registration_status USING status::registration_status;

-- Add mercado_pago_payment_id for API integration
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS mercado_pago_payment_id TEXT;

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

-- Create trigger for QR code generation
DROP TRIGGER IF EXISTS trigger_auto_generate_qr_code ON public.registrations;
CREATE TRIGGER trigger_auto_generate_qr_code
    BEFORE INSERT ON public.registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_qr_code();

-- Create admin role check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- For now, return true - you'll implement proper admin auth later
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for registrations
CREATE POLICY "Admins can manage all registrations" ON public.registrations
FOR ALL
USING (public.is_admin());

-- Create a view for admin statistics
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT 
    COUNT(*) as total_registrations,
    COUNT(*) FILTER (WHERE status = 'paid') as paid_registrations,
    COUNT(*) FILTER (WHERE checked_in = true) as checked_in_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_registrations
FROM public.registrations;